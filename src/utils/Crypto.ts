import crypto from 'crypto-js';
import { IncomingHttpHeaders } from 'http';
import { JSONObject } from 'superjson/dist/types';

export const getSignature = (message: JSONObject) => {
  const secret = process.env.COMMON_API_SUB_SECRET;
  return crypto
    .HmacSHA256(JSON.stringify(message), secret)
    .toString(crypto.enc.Base64);
};

const verifySignature = (headers: IncomingHttpHeaders, message: JSONObject) => {
  const signature: string = headers['x-webhook-signature'] as string;

  // declare all common api subscriptions must have a secret
  if (!signature) {
    return false;
  }

  // crypto check that the signature from the request matches the know has given the secret we have on hand
  const verifiedSignature = getSignature(message);

  if (!(signature === verifiedSignature)) {
    return false;
  }
  return true;
};

export default verifySignature;
