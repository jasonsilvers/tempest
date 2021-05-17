import { rest } from 'msw';

export const handlers = [
  rest.get('/api/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ firstName: 'bob' }));
  }),
];
