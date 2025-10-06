const express = require('express');

const router = express.Router();

const logger = require('../utils/logger');
const {
  initiateCall,
  sendOneClickSms,
  sendPushNotification,
  getCapabilities,
} = require('../services/telephonyService');

router.get('/capabilities', (_req, res) => {
  res.json(getCapabilities());
});

router.post('/call', async (req, res) => {
  try {
    const result = await initiateCall(req.body || {});
    res.status(202).json({ message: 'Call initiated', result });
  } catch (error) {
    logger.error('Failed to initiate voice call:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post('/sms', async (req, res) => {
  try {
    const result = await sendOneClickSms(req.body || {});
    res.status(202).json({ message: 'SMS request accepted', result });
  } catch (error) {
    logger.error('Failed to send one-click SMS:', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post('/push', async (req, res) => {
  try {
    const result = await sendPushNotification(req.body || {});
    res.status(202).json({ message: 'Push notification request accepted', result });
  } catch (error) {
    logger.error('Failed to send push notification:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
