class Logger {
  info(...args) {
    console.log(...args);
  }

  error(...args) {
    console.error(...args);
  }

  warn(...args) {
    console.warn(...args);
  }
}

module.exports = new Logger(); 