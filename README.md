## Getting Started

First download ModHeader - https://modheader.com/modheader

Add Authorization request header for localhost. JWTs for development can be found in cypress/fixtures/jwt.ts

Setup and run the development server:

```bash
npm run install
npm run createDevDatabase
npm run db:reset
npm run dev
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

# SUPER IMPORTANT!! if you forget to close the server it will cause unrelated tests to FAIL!

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
  ('/api/login',
  (req, res, ctx) => {
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

1. Change .env.production database URL and replace localhost with host.docker.internal
2. docker build .
3. docker run -p 8081:8080 _image_name_
4. Check file directory
5. http://localhost:8081

```
docker run -it image_name sh
```

## Seed staging database

```
"seed": "node ./src/prisma/seed.js"
```

## Seed dev

```
"seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} src/prisma/seed.ts"
```

# Run Analyze Tools

## Webpack analyzer

## Duplicate Library

```
ANALYZE=true npm run build
```

## Problems with GPG

```
export GPG_TTY=$(tty)
```

## Steps to take if tests are failling in pipeline and not in Dev

1. Delete Node modules
2. Stop database in docker
3. run npm ci
4. run npm run unit:test

## NPM I

Do an NPM ci locally so it doenst rewrite the package lock every time.

when need to run force resolutions

run npm i
run npm run force-resolutions
