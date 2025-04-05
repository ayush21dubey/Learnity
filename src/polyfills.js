// Polyfill for process
if (typeof process === 'undefined') {
  global.process = require('process/browser');
}

// Create a safe process object
const safeProcess = {
  env: process.env || {},
  platform: 'browser',
  stdout: {
    isTTY: false,
    write: function() {},
    end: function() {}
  },
  stderr: {
    isTTY: false,
    write: function() {},
    end: function() {}
  },
  stdin: {
    isTTY: false,
    on: function() {},
    setEncoding: function() {}
  }
};

// Merge with existing process object
Object.assign(process, safeProcess);

// Ensure NODE_ENV is set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
} 