const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3: s3Config } = require('../config');
const logger = require('../utils/logger');

let cachedClient;

const getClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.region) {
    throw new Error('AWS credentials are not fully configured.');
  }

  cachedClient = new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });

  return cachedClient;
};

const buildKey = (key) => {
  if (!s3Config.basePrefix) {
    return key;
  }

  const prefix = s3Config.basePrefix.endsWith('/') ? s3Config.basePrefix : `${s3Config.basePrefix}/`;
  return `${prefix}${key}`;
};

const uploadMedia = async ({ key, body, contentType }) => {
  if (!s3Config.bucket) {
    throw new Error('AWS S3 bucket is not configured.');
  }

  const objectKey = buildKey(key);

  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });

  await getClient().send(command);
  logger.info(`Uploaded media to s3://${s3Config.bucket}/${objectKey}`);

  return objectKey;
};

module.exports = {
  uploadMedia,
};
