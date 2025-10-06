require('dotenv').config();

const logger = require('./utils/logger');

const config = {
  port: Number.parseInt(process.env.PORT || '8080', 10),
  facebook: {
    accessToken: process.env.TOKEN || process.env.WHATSAPP_TOKEN,
    verifyToken: process.env.VERIFY_TOKEN || process.env.MYTOKEN,
    apiVersion: process.env.GRAPH_API_VERSION || 'v18.0',
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET || process.env.S3_BUCKET,
    region: process.env.AWS_S3_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_AccKEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SecAccKEY,
    basePrefix: process.env.AWS_S3_BASE_PREFIX || '',
  },
  telephony: {
    baseUrl: process.env.TELEPHONY_BASE_URL || '',
    apiKey: process.env.TELEPHONY_API_KEY || '',
    defaultCallerId: process.env.TELEPHONY_DEFAULT_CALLER_ID || '',
    smsSenderId: process.env.TELEPHONY_SMS_SENDER_ID || '',
    simSlot: process.env.TELEPHONY_SIM_SLOT || 'sim1',
    statusWebhookUrl: process.env.TELEPHONY_STATUS_WEBHOOK_URL || '',
    recordingWebhookUrl: process.env.TELEPHONY_RECORDING_WEBHOOK_URL || '',
    timeout: (() => {
      const raw = process.env.TELEPHONY_TIMEOUT;
      const parsed = Number.parseInt(raw || '10000', 10);
      return Number.isNaN(parsed) ? 10000 : parsed;
    })(),
    push: {
      baseUrl: process.env.NOTIFICATION_BASE_URL || process.env.TELEPHONY_BASE_URL || '',
      apiKey: process.env.NOTIFICATION_API_KEY || process.env.TELEPHONY_API_KEY || '',
      defaultChannel: process.env.NOTIFICATION_DEFAULT_CHANNEL || 'general',
      endpoint: process.env.NOTIFICATION_PUSH_ENDPOINT || '/notifications/push',
    },
  },
};

const requiredEnv = [
  ['TOKEN or WHATSAPP_TOKEN', config.facebook.accessToken],
  ['VERIFY_TOKEN or MYTOKEN', config.facebook.verifyToken],
  ['AWS_S3_BUCKET or S3_BUCKET', config.s3.bucket],
  ['AWS_S3_REGION/AWS_REGION/AWS_DEFAULT_REGION', config.s3.region],
  ['AWS_ACCESS_KEY_ID or S3_AccKEY', config.s3.accessKeyId],
  ['AWS_SECRET_ACCESS_KEY or S3_SecAccKEY', config.s3.secretAccessKey],
];

requiredEnv.forEach(([name, value]) => {
  if (!value) {
    logger.warn(`Environment variable ${name} is not set. The server may not function as expected.`);
  }
});

if (!config.telephony.baseUrl || !config.telephony.apiKey) {
  logger.info(
    'Telephony provider credentials are not fully configured. The telephony module will operate in simulation mode.',
  );
}

module.exports = config;
