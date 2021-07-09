// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './mswHandlers';
import { rest } from 'msw';

// This configures a request mocking server with the given request handlers.
const server = setupServer(...handlers);

export { server, rest };
