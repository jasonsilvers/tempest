import { IncomingHttpHeaders } from 'http';
import verifySignature, { getSignature } from '../../src/utils/crypto';
import crypto from 'crypto-js';

// can not wrap the process.env assignment in a before all here due to using it's value at a global scope level
const secret = '123';
process.env.COMMON_API_SUB_SECRET = secret;
const message = { test: 'message as JSON Body' };
const hash = crypto.HmacSHA256(JSON.stringify(message), secret).toString(crypto.enc.Base64);

// delete the env after this test suite runs
afterAll(() => {
  delete process.env.COMMON_API_SUB_SECRET;
});

test('should verify the correct signature', () => {
  const headers: IncomingHttpHeaders = {
    ['x-webhook-signature']: hash,
  } as IncomingHttpHeaders;

  expect(verifySignature(headers, message)).toBeTruthy();
});

test('should return false for no x-webhook-signature', () => {
  const headers: IncomingHttpHeaders = {} as IncomingHttpHeaders;

  expect(verifySignature(headers, message)).toBeFalsy();
});

test('should return false for mis matched signature', () => {
  const hashWithDifferentSecret = crypto.HmacSHA256(JSON.stringify(message), 'hadkfjhkk').toString(crypto.enc.Base64);

  const headers: IncomingHttpHeaders = {
    ['x-webhook-signature']: hashWithDifferentSecret,
  } as IncomingHttpHeaders;

  expect(verifySignature(headers, message)).toBeFalsy();
});

test('should return false for mis matched signature bad message body', () => {
  const hashWithDifferentSecret = crypto.HmacSHA256(JSON.stringify(message), secret).toString(crypto.enc.Base64);

  const headers: IncomingHttpHeaders = {
    ['x-webhook-signature']: hashWithDifferentSecret,
  } as IncomingHttpHeaders;

  const badMessage = { test: 'message as JSON Body modified' };

  expect(verifySignature(headers, badMessage)).toBeFalsy();
});

test('should return correct signature', () => {
  expect(getSignature(message)).toBe(hash);
});
