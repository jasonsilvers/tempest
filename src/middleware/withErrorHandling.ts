import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import type { NextApiHandler, NextApiResponse } from 'next';
import { LoggedInUser } from '../repositories/userRepo';
import { logFactory } from '../utils/logger';

// by wrapping every api route with this middleware,
// we can use helper methods that throw: ex if the user did not give a primary key
// the error bubbles up to this handler that sends the encoded error message as a response
export class ApiError extends Error {
  readonly status: number;
  readonly body: any;
  readonly name: string;

  constructor({ status, body }: { status: number; body: any }) {
    super('ApiError');
    this.status = status;
    this.body = body;
    this.name = 'ApiError';
  }
}

export class PermissionError extends Error {
  readonly status: number;
  readonly name: string;

  constructor() {
    super('PermissionError');
    this.status = 403;
    this.name = 'PermissionError';
  }
}

export const withErrorHandling =
  (handler: NextApiHandler) => async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (e) {
      const log = logFactory(req.user);
      if (e.name === 'ApiError') {
        log.trace(e);
        log.error(e);
        return res.status(500).send('server error');
      }

      if (e.name === 'PermissionError') {
        log.trace(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        return res.status(403).send({ message: 'You do not have the appropriate permissions' });
      }

      log.error(`caught error: ${e.status} ${e.body}`);
      return res.status(e.status).send(e.body);
    }
  };

export function withErrorHandlingAndAuthorization(func: NextApiHandler, getUserFunc: any) {
  return withApiAuth(withErrorHandling(func), getUserFunc);
}
