const axios = require('axios');
const { facebook } = require('../config');

const buildGraphUrl = (path) => `https://graph.facebook.com/${facebook.apiVersion}/${path}`;

const getAuthHeaders = () => {
  if (!facebook.accessToken) {
    throw new Error('WhatsApp Cloud API access token is not configured.');
  }

  return {
    Authorization: `Bearer ${facebook.accessToken}`,
  };
};

const fetchMediaMetadata = async (mediaId) => {
  const url = buildGraphUrl(mediaId);
  const { data } = await axios.get(url, {
    headers: getAuthHeaders(),
  });

  return data;
};

const downloadMediaContent = async (mediaUrl, mimeType) => {
  const response = await axios.get(mediaUrl, {
    headers: {
      ...getAuthHeaders(),
      ...(mimeType ? { 'Content-Type': mimeType } : {}),
    },
    responseType: 'arraybuffer',
  });

  return Buffer.from(response.data, 'binary');
};

module.exports = {
  fetchMediaMetadata,
  downloadMediaContent,
};
