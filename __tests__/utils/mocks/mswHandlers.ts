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
<<<<<<< HEAD
        role: {
          id: '123',
          name: ERole.MEMBER,
        },
=======
        role: { id: 22, name: ERole.MEMBER },
>>>>>>> 7bc8a539ad4567363c274fdb6cece59826be85a8
      })
    );
  }),

  rest.get('/api/grants', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(grants));
  }),
];
