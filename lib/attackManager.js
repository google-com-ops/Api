const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

class AttackManager extends EventEmitter {
  constructor() {
    super();
    this.activeAttacks = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_ATTACKS) || 3;
    this.processQueue = [];
    this.stats = {
      totalAttacks: 0,
      successfulAttacks: 0,
      failedAttacks: 0,
      totalRequests: 0,
      totalErrors: 0
    };
    
    // Cleanup setiap 30 detik untuk Node.js 24
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
    
    // Handle process exit
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  canStartAttack() {
    return this.activeAttacks.size < this.maxConcurrent;
  }

  getQueueLength() {
    return this.processQueue.length;
  }

  addAttack(attackId, process) {
    this.activeAttacks.set(attackId, {
      process,
      startTime: Date.now(),
      status: 'running',
      method: null,
      pid: process.pid
    });
    this.stats.totalAttacks++;
    this.emit('attackStarted', { attackId, timestamp: Date.now() });
  }

  removeAttack(attackId) {
    if (this.activeAttacks.has(attackId)) {
      const attack = this.activeAttacks.get(attackId);
      
      try {
        if (attack.process && !attack.process.killed) {
          attack.process.kill('SIGTERM');
          
          // Force kill setelah 5 detik
          setTimeout(() => {
            if (!attack.process.killed) {
              attack.process.kill('SIGKILL');
            }
          }, 5000);
        }
      } catch (error) {
        console.error(`Error killing process ${attackId}:`, error);
      }
      
      this.activeAttacks.delete(attackId);
      this.emit('attackStopped', { 
        attackId, 
        duration: Date.now() - attack.startTime,
        timestamp: Date.now() 
      });
      return true;
    }
    return false;
  }

  getActiveCount() {
    return this.activeAttacks.size;
  }

  getAttackInfo(attackId) {
    return this.activeAttacks.get(attackId);
  }

  getAllAttacks() {
    const attacks = [];
    for (const [id, attack] of this.activeAttacks.entries()) {
      attacks.push({
        id,
        startTime: new Date(attack.startTime).toISOString(),
        status: attack.status,
        method: attack.method,
        uptime: Date.now() - attack.startTime,
        pid: attack.pid
      });
    }
    return attacks;
  }

  cleanup() {
    const now = Date.now();
    for (const [id, attack] of this.activeAttacks.entries()) {
      // Hapus jika process sudah mati atau sudah lebih dari 10 menit
      if (attack.process.exitCode !== null || (now - attack.startTime) > 600000) {
        this.removeAttack(id);
        if (attack.process.exitCode !== 0 && attack.process.exitCode !== null) {
          this.stats.failedAttacks++;
        } else {
          this.stats.successfulAttacks++;
        }
      }
    }
  }

  async executeAttack(scriptName, attackId, params, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'scripts', `${scriptName}.js`);
      
      if (!fs.existsSync(scriptPath)) {
        return reject(new Error(`Script ${scriptName} tidak ditemukan`));
      }

      // Parameter validation untuk Node.js 24
      const validatedParams = params.map(param => {
        if (typeof param === 'string' && param.length > 1000) {
          return param.substring(0, 1000);
        }
        return param;
      });

      const child = fork(scriptPath, validatedParams, {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        detached: false,
        windowsHide: true,
        execArgv: ['--max-old-space-size=512'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          UV_THREADPOOL_SIZE: '4'
        }
      });

      const timer = setTimeout(() => {
        if (child && !child.killed) {
          child.kill('SIGTERM');
          this.removeAttack(attackId);
          this.stats.failedAttacks++;
          reject(new Error('Attack timeout'));
        }
      }, Math.min(timeout, 120000)); // Max timeout 2 menit

      let stdoutData = '';
      let stderrData = '';

      child.stdout?.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('message', (message) => {
        if (message.type === 'progress') {
          this.emit('progress', { attackId, data: message.data });
        } else if (message.type === 'stats') {
          if (message.data?.totalRequests) {
            this.stats.totalRequests += message.data.totalRequests;
          }
          if (message.data?.totalErrors) {
            this.stats.totalErrors += message.data.totalErrors;
          }
          this.emit('stats', { attackId, data: message.data });
        }
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        this.removeAttack(attackId);

        if (code === 0 || signal === 'SIGTERM') {
          this.stats.successfulAttacks++;
          resolve({
            success: true,
            output: stdoutData,
            attackId: attackId,
            code: code,
            signal: signal
          });
        } else {
          this.stats.failedAttacks++;
          reject(new Error(`Script exited with code ${code}: ${stderrData.substring(0, 500)}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        this.removeAttack(attackId);
        this.stats.failedAttacks++;
        reject(error);
      });

      // Set method untuk attack
      if (this.activeAttacks.has(attackId)) {
        this.activeAttacks.get(attackId).method = scriptName;
      } else {
        this.addAttack(attackId, child);
      }
    });
  }

  getStats() {
    const activeAttacks = this.getAllAttacks();
    
    return {
      ...this.stats,
      activeAttacks: this.getActiveCount(),
      maxConcurrent: this.maxConcurrent,
      available: this.canStartAttack(),
      queueLength: this.getQueueLength(),
      activeAttackDetails: activeAttacks.map(attack => ({
        id: attack.id,
        method: attack.method,
        uptime: attack.uptime,
        status: attack.status
      }))
    };
  }

  shutdown() {
    console.log('Shutting down AttackManager...');
    clearInterval(this.cleanupInterval);
    
    // Stop semua attack
    for (const [id] of this.activeAttacks.entries()) {
      this.removeAttack(id);
    }
    
    // Tunggu semua process selesai
    setTimeout(() => {
      console.log('AttackManager shutdown complete');
      process.exit(0);
    }, 5000);
  }

  // Cleanup on destruction
  destroy() {
    this.shutdown();
  }
}

module.exports = AttackManager;
