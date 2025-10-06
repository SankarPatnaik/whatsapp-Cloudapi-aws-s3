const path = require('path');
const { extension } = require('mime-types');
const logger = require('../utils/logger');
const { fetchMediaMetadata, downloadMediaContent } = require('./whatsappMediaClient');
const { uploadMedia } = require('./s3Uploader');

const MEDIA_FOLDERS = {
  image: 'images',
  video: 'videos',
  document: 'documents',
  audio: 'audio',
};

const extractMediaInfo = (message) => {
  const { type } = message;

  if (!Object.prototype.hasOwnProperty.call(MEDIA_FOLDERS, type)) {
    return null;
  }

  const mediaPayload = message[type];

  if (!mediaPayload || !mediaPayload.id) {
    return null;
  }

  return {
    type,
    id: mediaPayload.id,
    filename: mediaPayload.filename,
  };
};

const sanitizeFileName = (value) => {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_');
};

const buildFileKey = ({ waId, mediaType, fileName, mimeType, mediaId }) => {
  const folder = MEDIA_FOLDERS[mediaType];
  const extensionFromMime = mimeType ? extension(mimeType) : null;
  const fallbackExtension = fileName ? path.extname(fileName).replace('.', '') : null;
  const safeExtension = extensionFromMime || fallbackExtension || 'bin';

  const baseName = fileName
    ? sanitizeFileName(path.parse(fileName).name)
    : `${mediaType}_${mediaId}`;

  const safeBaseName = sanitizeFileName(baseName) || `${mediaType}_${mediaId}`;

  return `${waId}/${folder}/${safeBaseName}.${safeExtension}`;
};

const processMediaMessage = async ({ message, waId }) => {
  const mediaInfo = extractMediaInfo(message);

  if (!mediaInfo) {
    logger.debug('Skipping unsupported message type', message.type);
    return;
  }

  if (!waId) {
    logger.warn('Skipping media message because sender WA ID is missing.');
    return;
  }

  const { id: mediaId, type: mediaType, filename } = mediaInfo;

  logger.info(`Processing ${mediaType} message ${mediaId} from ${waId}`);

  const metadata = await fetchMediaMetadata(mediaId);

  if (!metadata || !metadata.url) {
    throw new Error(`Unable to retrieve download URL for media ${mediaId}`);
  }

  const mimeType = metadata.mime_type;
  const mediaBuffer = await downloadMediaContent(metadata.url, mimeType);
  const objectKey = buildFileKey({
    waId,
    mediaType,
    fileName: filename || metadata.filename,
    mimeType,
    mediaId,
  });

  await uploadMedia({
    key: objectKey,
    body: mediaBuffer,
    contentType: mimeType,
  });
};

module.exports = {
  processMediaMessage,
};
