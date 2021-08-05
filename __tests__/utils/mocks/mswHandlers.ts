import { rest } from 'msw';
import { EUri } from '../../../src/types/global';
import { bobJones, grants } from './fixtures';

export const handlers = [
  rest.get(EUri.LOGIN, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(bobJones));
  }),

  rest.get(EUri.PERMISSIONS, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ grants }));
  }),
  rest.get(EUri.TRACKING_ITEMS, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ trackingItems: [] }));
  }),
  rest.get(EUri.USERS + '*/membertrackingitems', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),
];
