const axios = require('axios');
const { randomUUID } = require('crypto');

const { telephony } = require('../config');
const logger = require('../utils/logger');

const sanitizeBaseUrl = (url) => (url ? url.replace(/\/+$/, '') : '');

const buildHeaders = (apiKey) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  return headers;
};

const telephonyClient = telephony.baseUrl
  ? axios.create({
      baseURL: sanitizeBaseUrl(telephony.baseUrl),
      timeout: telephony.timeout,
      headers: buildHeaders(telephony.apiKey),
    })
  : null;

const pushClient = telephony.push?.baseUrl
  ? axios.create({
      baseURL: sanitizeBaseUrl(telephony.push.baseUrl),
      timeout: telephony.timeout,
      headers: buildHeaders(telephony.push.apiKey),
    })
  : telephonyClient;

const removeEmptyFields = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

const simulateProviderResponse = (action, payload) => {
  const id = randomUUID();
  logger.warn(`Telephony provider not configured. Simulating ${action}.`, { payload });
  return {
    id,
    status: 'simulated',
    action,
    payload,
    simulated: true,
  };
};

const handleProviderError = (operation, error) => {
  if (error.response) {
    const { status, data } = error.response;
    const responseMessage =
      (typeof data === 'string' && data) || data?.message || JSON.stringify(data || {});
    logger.error(`Telephony provider error during ${operation}:`, status, responseMessage);
    throw new Error(`Telephony provider error (${status}) during ${operation}: ${responseMessage}`);
  }

  logger.error(`Telephony provider request failed during ${operation}:`, error.message);
  throw new Error(`Unable to ${operation}: ${error.message}`);
};

const initiateCall = async ({ to, from, record = false, metadata = {} }) => {
  if (!to) {
    throw new Error('Field "to" is required to place a call.');
  }

  const callerId = from || telephony.defaultCallerId;

  if (!callerId) {
    throw new Error(
      'A caller ID is required. Provide "from" in the request body or set TELEPHONY_DEFAULT_CALLER_ID.',
    );
  }

  const payload = removeEmptyFields({
    to,
    from: callerId,
    record,
    simSlot: telephony.simSlot,
    metadata,
    statusWebhookUrl: telephony.statusWebhookUrl,
    recordingWebhookUrl: record ? telephony.recordingWebhookUrl : undefined,
  });

  if (!telephonyClient) {
    return simulateProviderResponse('voice call', payload);
  }

  try {
    const { data } = await telephonyClient.post('/calls', payload);
    return data;
  } catch (error) {
    handleProviderError('initiate a call', error);
  }

  return null;
};

const sendOneClickSms = async ({ to, message, senderId, metadata = {} }) => {
  if (!to) {
    throw new Error('Field "to" is required to send an SMS.');
  }

  if (!message) {
    throw new Error('Field "message" is required to send an SMS.');
  }

  const payload = removeEmptyFields({
    to,
    message,
    senderId: senderId || telephony.smsSenderId,
    metadata,
  });

  if (!telephonyClient) {
    return simulateProviderResponse('one-click SMS', payload);
  }

  try {
    const { data } = await telephonyClient.post('/messages/sms', payload);
    return data;
  } catch (error) {
    handleProviderError('send an SMS', error);
  }

  return null;
};

const sendPushNotification = async ({ to, title, body, data = {}, channel }) => {
  if (!to) {
    throw new Error('Field "to" is required to send a push notification.');
  }

  if (!title) {
    throw new Error('Field "title" is required to send a push notification.');
  }

  if (!body) {
    throw new Error('Field "body" is required to send a push notification.');
  }

  const payload = removeEmptyFields({
    to,
    title,
    body,
    data,
    channel: channel || telephony.push?.defaultChannel,
  });

  const client = pushClient;

  if (!client) {
    return simulateProviderResponse('push notification', payload);
  }

  try {
    const { data: response } = await client.post(telephony.push?.endpoint || '/notifications/push', payload);
    return response;
  } catch (error) {
    handleProviderError('send a push notification', error);
  }

  return null;
};

const getCapabilities = () => ({
  call: Boolean(telephony.baseUrl && telephony.apiKey),
  sms: Boolean(telephony.baseUrl && telephony.apiKey),
  push: Boolean((telephony.push && telephony.push.baseUrl && telephony.push.apiKey) || (telephony.baseUrl && telephony.apiKey)),
  simulationMode: !telephony.baseUrl || !telephony.apiKey,
  simSlot: telephony.simSlot,
  recordingWebhookConfigured: Boolean(telephony.recordingWebhookUrl),
});

module.exports = {
  initiateCall,
  sendOneClickSms,
  sendPushNotification,
  getCapabilities,
};
