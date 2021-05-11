import { NextApiRequest, NextApiResponse } from 'next';
import signatureRequired from '../../src/middleware/signatureRequired';
import { getSignature } from '../../src/utils/Crypto';
import testNextApi from '../utils/NextAPIUtils';

process.env.COMMON_API_SUB_SECRET = '123';

test('should call handler passed', async () => {
  const handler = jest.fn((req: NextApiRequest, res: NextApiResponse) => {
    res.statusCode = 200;
    res.json('Good');
    return;
  });
  const body = { personIds: ['123456789012111314151617181920'] };
  const hash = getSignature(body);

  await testNextApi.post(signatureRequired(handler), {
    body,
    customHeaders: { 'x-webhook-signature': hash },
  });
  expect(handler).toBeCalledTimes(1);
});

test('should not call the handler', async () => {
  const handler = jest.fn(() => {
    return;
  });
  const body = { personIds: ['123456789012111314151617181920'] };
  const hash = getSignature(body);

  const { status } = await testNextApi.post(signatureRequired(handler), {
    body,
    // hash is different than what is expected based on the secret of 123 and the body then we shouldn't call the handler
    customHeaders: { 'x-webhook-signature': hash + 1 },
  });
  expect(handler).toBeCalledTimes(0);
  expect(status).toBe(401);
});
