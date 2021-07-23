import { rest } from 'msw';
import { bobJones, grants } from './fixtures';

export const handlers = [
  rest.get('/api/login', (req, res, ctx) => {
    console.log(`is logging in`);

    return res(ctx.status(200), ctx.json(bobJones));
  }),

  rest.get('/api/grants', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ grants }));
  }),
  rest.get('/api/trackingitems', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ trackingItems: [] }));
  }),
  rest.get('/api/users/*/membertrackingitems', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
];
