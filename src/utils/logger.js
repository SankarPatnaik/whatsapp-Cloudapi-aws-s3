const formatMessage = (level, messages) => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}]`, level, ...messages];
};

const createLogger = () => ({
  info: (...messages) => console.log(...formatMessage('INFO', messages)),
  warn: (...messages) => console.warn(...formatMessage('WARN', messages)),
  error: (...messages) => console.error(...formatMessage('ERROR', messages)),
  debug: (...messages) => {
    if (process.env.DEBUG === 'true') {
      console.debug(...formatMessage('DEBUG', messages));
    }
  },
});

module.exports = createLogger();
