import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import verifySignature from '../utils/Crypto';
import { PermissionError } from './withErrorHandling';

const signatureRequired = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!verifySignature(req.headers, req.body)) {
      // signature does not match so unauthorized
      throw new PermissionError();
    }

    return handler(req, res);
  };
};

export default signatureRequired;
