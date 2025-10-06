const express = require('express');
const router = express.Router();

const { facebook } = require('../config');
const logger = require('../utils/logger');
const { processWebhookPayload } = require('../services/webhookService');

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === facebook.verifyToken) {
    logger.info('Webhook verified successfully.');
    res.status(200).send(challenge);
    return;
  }

  logger.warn('Webhook verification failed.');
  res.sendStatus(403);
});

router.post('/', async (req, res) => {
  try {
    await processWebhookPayload(req.body);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Failed to process webhook payload:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
