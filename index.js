const express = require('express');
const bodyParser = require('body-parser');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const webhookRouter = require('./src/routes/webhook');
const telephonyRouter = require('./src/routes/telephony');

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/webhook', webhookRouter);
app.use('/telephony', telephonyRouter);

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error occurred:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`Server listening on port ${config.port}`);
});
