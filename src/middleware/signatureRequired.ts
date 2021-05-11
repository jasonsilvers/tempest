import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import verifySignature from '../utils/Crypto';
import { unauthorized } from './utils';

const signatureRequired = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!verifySignature(req.headers, req.body)) {
      // signature does not match so unauthorized
      unauthorized(res);
      return;
    }

    return handler(req, res);
  };
};

export default signatureRequired;
