import { LogEventType } from '@prisma/client';
import { DBQueryFunctionToReturnUser, NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import type { NextApiHandler, NextApiResponse } from 'next';
import { LoggedInUser } from '../repositories/userRepo';
import { logFactory } from '../utils/logger';

// by wrapping every api route with this middleware,
// we can use helper methods that throw: ex if the user did not give a primary key
// the error bubbles up to this handler that sends the encoded error message as a response
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly name: string;

  constructor({ status, body }: { status: number; body: unknown }) {
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

export class TempestError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(status: number, message: string) {
    super('TempestError');
    this.status = status;
    this.name = 'TempestError';
    this.message = message;
  }
}

export class MethodNotFoundError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(message: string) {
    super('Method Not Found Error');
    this.status = 405;
    this.name = 'MethodNotFound';
    this.message = message;
  }
}

export const withErrorHandling =
  (handler: NextApiHandler, withLogging = true) =>
  async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
    const log = logFactory(req.user);

    try {
      if (withLogging) {
        log.persist(LogEventType.API_ACCESS, `URI: ${req.url} Method: ${req.method}`);
      }
      await handler(req, res);
    } catch (e) {
      if (e.name === 'ApiError') {
        log.error(e);
        return res.status(500).send('server error');
      }

      if (e.name === 'PermissionError') {
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        return res.status(403).send({ message: 'You do not have the appropriate permissions' });
      }

      if (e.name === 'TempestError') {
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        return res.status(e.status).json({ message: e.message });
      }

      if (e.name === 'MethodNotFound') {
        log.persist(LogEventType.METHOD_NOT_ALLOWED, `Method: ${e.message}`);
        return res.status(e.status).json({ message: 'Method Not Found' });
      }

      log.trace(`caught error: ${500} ${e}`);
      return res.status(500).send(e.body);
    }
  };

export function withErrorHandlingAndAuthorization(
  func: NextApiHandler,
  getUserFunc: DBQueryFunctionToReturnUser,
  withLogging = true
) {
  return withApiAuth(withErrorHandling(func, withLogging), getUserFunc);
}
