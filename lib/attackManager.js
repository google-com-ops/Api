const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');
const { EventEmitter } = require('events');

class AttackManager extends EventEmitter {
  constructor() {
    super();
    this.activeAttacks = new Map();
    this.maxConcurrent = 5;
    this.processQueue = [];
    this.stats = {
      totalAttacks: 0,
      successfulAttacks: 0,
      failedAttacks: 0
    };
    
    // Cleanup setiap 1 menit
    setInterval(() => this.cleanup(), 60000);
  }

  canStartAttack() {
    return this.activeAttacks.size < this.maxConcurrent;
  }

  addAttack(attackId, process) {
    this.activeAttacks.set(attackId, {
      process,
      startTime: Date.now(),
      status: 'running',
      method: null
    });
    this.stats.totalAttacks++;
    this.emit('attackStarted', attackId);
  }

  removeAttack(attackId) {
    if (this.activeAttacks.has(attackId)) {
      const attack = this.activeAttacks.get(attackId);
      if (attack.process && !attack.process.killed) {
        attack.process.kill('SIGTERM');
      }
      this.activeAttacks.delete(attackId);
      this.emit('attackStopped', attackId);
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
        startTime: attack.startTime,
        status: attack.status,
        method: attack.method,
        uptime: Date.now() - attack.startTime
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
        }
      }
    }
  }

  executeAttack(scriptName, attackId, params, timeout = 60000) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'scripts', `${scriptName}.js`);
      
      if (!fs.existsSync(scriptPath)) {
        return reject(new Error(`Script ${scriptName} tidak ditemukan`));
      }

      const child = fork(scriptPath, params, {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        detached: false,
        windowsHide: true,
        env: { ...process.env, NODE_ENV: 'production' }
      });

      const timer = setTimeout(() => {
        if (child && !child.killed) {
          child.kill('SIGTERM');
          this.removeAttack(attackId);
          this.stats.failedAttacks++;
          reject(new Error('Attack timeout'));
        }
      }, timeout);

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      child.on('message', (message) => {
        if (message.type === 'progress') {
          this.emit('progress', attackId, message.data);
        } else if (message.type === 'stats') {
          this.emit('stats', attackId, message.data);
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
            attackId: attackId
          });
        } else {
          this.stats.failedAttacks++;
          reject(new Error(`Script exited with code ${code}: ${stderrData}`));
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
      }

      this.addAttack(attackId, child);
    });
  }

  getStats() {
    return {
      ...this.stats,
      activeAttacks: this.getActiveCount(),
      maxConcurrent: this.maxConcurrent,
      available: this.canStartAttack()
    };
  }
}

module.exports = AttackManager;
