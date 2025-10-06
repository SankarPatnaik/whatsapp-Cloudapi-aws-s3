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

module.exports = config;
