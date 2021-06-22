import { rest } from 'msw';
import { ERole } from '../../../src/types/global';
import { grants } from './fixtures';

export const handlers = [
  rest.get('/api/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '123',
        firstName: 'bob',
        lastName: 'jones',
        role: {
          id: '123',
          name: ERole.MEMBER,
        },
      })
    );
  }),

  rest.get('/api/grants', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(grants));
  }),
];
