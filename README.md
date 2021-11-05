This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Commit Checklist

1. npm run t - 100% passing/No Failing Tests
2. npm run lint - No errors or warning
3. npm run cypress:run - 100% passing
4. npm run build - clean build

## Testing With MSW

Mock Service Worker (MSW) is a network api mock where we define what is returned by a particular endpoint. When using MSW in your unit tests keep in mind that fetch (which is implemented on browsers) is not inside the node environment running the tests. But due to the nature of next we can not simply add a fetch polyfill to jest.config 🙁. MSW has been set up globally for all tests but needs to be tailored per test.

#### Setting up MSW per test

1. Add fetch polyfill
   - `import 'whatwg-fetch'`
2. Add server and rest from ./testutils/mocks/msw
   - `import {server, rest} from '../testutils/mocks/msw'`
3. BeforeAll, AfterEach and AfterAll setup
   - Recommended to add snippets below for these
4. Use `server.use(rest.get())` to set up the returned value for an api

##### Before All

```ts
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
```

##### After All

```ts
afterAll(() => {
  server.close();
});
```

##### After Each

```ts
afterEach(() => {
  server.resetHandlers();
});
```

##### Server Use Example

```ts
server.use(
  rest.get('/api/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ name: 'bob' }));
  })
);
```

## Testing With ReactQuery

React Query is a library for fetching, caching and updating server data on the client.

### Gotchas

- React Query does not automatically update it's cache when doing a mutation
  There are two ways to update the cache after a mutation

  1. Optimistically
  2. Invalidate a portion of the cache

  What this means for testing is YOU MUST OVERRIDE THE MSW MOCK with the new expected data.

## Husky

- Before first use run:
  ```
  npm run prepare
  ```

## Test Docker Image Locally

1. docker build .
2. docker run _image_name_
3. Check file directory

```
docker run -it image_name sh
```
