const logger = require('../utils/logger');
const { processMediaMessage } = require('./mediaHandler');

const processWebhookPayload = async (payload) => {
  if (!payload || !payload.object) {
    logger.warn('Webhook payload does not contain an object property.');
    return;
  }

  const entries = payload.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];

    for (const change of changes) {
      const value = change.value || {};
      const waId = value.contacts?.[0]?.wa_id || value.statuses?.[0]?.recipient_id;
      const messages = value.messages || [];

      if (!Array.isArray(messages) || messages.length === 0) {
        logger.debug('No messages found in webhook change payload.');
        continue;
      }

      const results = await Promise.allSettled(
        messages.map((message) =>
          processMediaMessage({
            message,
            waId,
          }),
        ),
      );

      results.forEach((result) => {
        if (result.status === 'rejected') {
          logger.error('Failed to process message media:', result.reason);
        }
      });
    }
  }
};

module.exports = {
  processWebhookPayload,
};
