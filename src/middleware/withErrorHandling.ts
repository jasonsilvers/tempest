/*
 * @jest-environment node
 */

import { ELogEventType } from '../const/enums';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import type { NextApiHandler, NextApiResponse } from 'next';
import { LoggedInUser } from '../repositories/userRepo';
import { logFactory } from '../lib/logger';

// by wrapping every api route with this middleware,
// we can use helper methods that throw: ex if the user did not give a primary key
// the error bubbles up to this handler that sends the encoded error message as a response

export class NotFoundError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(message?: string) {
    super('ApiError');
    this.status = 404;
    this.message = message ?? 'The requested entity could not be found';
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(message?: string) {
    super('BadRequestError');
    this.status = 400;
    this.name = 'BadRequestError';
    this.message = message ?? 'The URI provided is malformed';
  }
}

export class PermissionError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(message?: string) {
    super('PermissionError');
    this.status = 403;
    this.name = 'PermissionError';

    this.message = message ?? 'You do not have permission to perform this action';
  }
}

export class MethodNotAllowedError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(message?: string) {
    super('Method Not Found');
    this.status = 405;
    this.name = 'MethodNotFound';
    this.message = message ?? 'Method Not Found';
  }
}
export class AppError extends Error {
  readonly status: number;
  readonly name: string;
  readonly message: string;

  constructor(status: number, message: string) {
    super('App Error');
    this.status = status;
    this.name = 'App Error';
    this.message = message;
  }
}

export const withErrorHandling =
  (handler: NextApiHandler, withLogging = true) =>
  async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
    const log = logFactory(req.user);

    try {
      if (withLogging) {
        log.persist(ELogEventType.API_ACCESS, `URI: ${req.url} Method: ${req.method}`);
      }
      await handler(req, res);
    } catch (e) {
      if (e instanceof NotFoundError) {
        log.error(e);
        return res.status(404).send({ message: e.message });
      }

      if (e instanceof PermissionError) {
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        log.persist(ELogEventType.UNAUTHORIZED, `Req url: ${req.url}, Req method: ${req.method}`);
        return res.status(403).send({ message: e.message });
      }

      if (e instanceof MethodNotAllowedError) {
        log.persist(ELogEventType.METHOD_NOT_ALLOWED, `Method: ${e.message}`);
        return res.status(e.status).json({ message: e.message });
      }
      if (e instanceof AppError) {
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        return res.status(e.status).json({ message: e.message });
      }

      if (e instanceof BadRequestError) {
        log.warn(`Error in ${req.url} for ${req.method} -- Error: ${e}`);
        return res.status(e.status).json({ message: e.message });
      }

      log.trace(`caught error: ${500} ${e}`);
      return res.status(500).json({ message: 'There was an internal server error' });
    }
  };
