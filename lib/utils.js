const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Utils {
  static loadProxies() {
    try {
      const proxyPath = path.join(__dirname, '../assets/proxy.txt');
      if (fs.existsSync(proxyPath)) {
        const content = fs.readFileSync(proxyPath, 'utf8');
        return content.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [host, port] = line.trim().split(':');
            return { host, port: parseInt(port) };
          });
      }
      return [];
    } catch (error) {
      console.error('Error loading proxies:', error);
      return [];
    }
  }

  static loadUserAgents() {
    try {
      const uaPath = path.join(__dirname, '../assets/ua.txt');
      if (fs.existsSync(uaPath)) {
        const content = fs.readFileSync(uaPath, 'utf8');
        return content.split('\n').filter(line => line.trim());
      }
      
      // Default user agents jika file tidak ada
      return [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      ];
    } catch (error) {
      console.error('Error loading user agents:', error);
      return [];
    }
  }

  static generateRandomString(length = 10) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static parseUrl(target) {
    try {
      const url = new URL(target);
      return {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname || '/',
        protocol: url.protocol.slice(0, -1),
        origin: url.origin
      };
    } catch (error) {
      throw new Error(`Invalid URL: ${target}`);
    }
  }

  static validateTarget(target) {
    if (!target) return false;
    try {
      new URL(target);
      return true;
    } catch {
      return false;
    }
  }

  static getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = Utils;
