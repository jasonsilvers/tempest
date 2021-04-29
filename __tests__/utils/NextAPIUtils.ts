import http from 'http';
import listen from 'test-listen';
import { NextApiHandler } from 'next';
import fetch from 'isomorphic-unfetch';
import { apiResolver } from 'next/dist/next-server/server/api-utils';

async function createNextApiServer(handler: any) {
  let server: http.Server;
  let url: string;

  url = await listen(
    (server = http.createServer((req, res) => {
      const urlSplit = req.url.split('/');
      const id = urlSplit[3];
      const slug = urlSplit.slice(3, urlSplit.length);
      apiResolver(req, res, { slug, id }, handler, undefined, false);
    }))
  );

  return { url, server };
}

type METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE';

const baseTestNextApi = async (
  handler: any,
  {
    withJwt = true,
    urlId,
    urlSlug,
    method = 'GET',
    body,
  }: {
    withJwt?: boolean;
    urlId?: string | number;
    urlSlug?: string;
    method?: METHOD;
    body?: any;
  } = {}
) => {
  let serverRef: http.Server;
  try {
    if (urlId && urlSlug) {
      throw new Error('Must pass only a urlID or urlSlug');
    }

    let urlParams: string;

    if (urlId) {
      urlId = urlId.toString();
      const urlSplit = urlId.split('/');
      if (urlSplit.length > 1) {
        throw new Error('urlId should be a single param. Use urlSlug instead');
      }

      urlParams = urlId;
    }

    if (urlSlug) {
      urlParams = urlSlug;
    }

    const { url, server } = await createNextApiServer(handler);
    serverRef = server;

    const authorization = withJwt
      ? {
          Authorization:
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1OTkwNTMwOTUsImlhdCI6MTU5OTA1MjE5NSwiYXV0aF90aW1lIjoxNTk5MDUxMjQ1LCJqdGkiOiI3NjExNmU0Mi05ZWY4LTQ4NWItYjA5MS00NGJkNTQxOTliNzkiLCJpc3MiOiJodHRwczovL2xvZ2luLmRzb3AuaW8vYXV0aC9yZWFsbXMvYmFieS15b2RhIiwiYXVkIjoiaWw0XzE5MWY4MzZiLWVjNTAtNDgxOS1iYTEwLTFhZmFhNWI5OTYwMF9taXNzaW9uLXdpZG93Iiwic3ViIjoiMTU3NWFiMjMtMmZhNC00NTAzLTlhMjktZWU2MTJlNWZlN2EwIiwidHlwIjoiSUQiLCJhenAiOiJpbDRfMTkxZjgzNmItZWM1MC00ODE5LWJhMTAtMWFmYWE1Yjk5NjAwX21pc3Npb24td2lkb3ciLCJub25jZSI6InZ0QVlSYXdCMlU5RGhGMHhDMTJxa05GYm5PZ2NhMjhBcVZkdDd3Nl96NmMiLCJzZXNzaW9uX3N0YXRlIjoiMzM4OTQwYzYtNzM2NC00ZGYwLTk5YzItODc4Y2ExZmIyMjRjIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cC1zaW1wbGUiOlsiSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIkltcGFjdCBMZXZlbCA0IEF1dGhvcml6ZWQiLCJJbXBhY3QgTGV2ZWwgNSBBdXRob3JpemVkIl0sInByZWZlcnJlZF91c2VybmFtZSI6Impha2UuYS5qb25lcyIsImdpdmVuX25hbWUiOiJKYWtlIiwiYWN0aXZlY2FjIjoiIiwiYWZmaWxpYXRpb24iOiJVU0FGIiwiZ3JvdXAtZnVsbCI6WyIvSW1wYWN0IExldmVsIDIgQXV0aG9yaXplZCIsIi9JbXBhY3QgTGV2ZWwgNCBBdXRob3JpemVkIiwiL0ltcGFjdCBMZXZlbCA1IEF1dGhvcml6ZWQiXSwib3JnYW5pemF0aW9uIjoiVVNBRiIsIm5hbWUiOiJKYWtlIEFsZnJlZCBKb25lcyIsInVzZXJjZXJ0aWZpY2F0ZSI6IkpPTkVTLkpBS0UuQUxGUkVELjIyMjMzMzIyMjEiLCJyYW5rIjoiU0dUIiwiZmFtaWx5X25hbWUiOiJKb25lcyIsImVtYWlsIjoiampAZ21haWwuY29tIn0.rzFHnM2dtPJaKtrm1EhvnpO3jaqi1_DqUBJBR5nBvpI',
        }
      : {};

    const response = await fetch(url + '/api/whocares/' + urlParams, {
      headers: {
        'Content-Type': 'application/json',
        ...authorization,
      },
      method,
      body: JSON.stringify(body),
    });
    const status = response.status;

    const data = await response.json();

    return { data, status };
  } catch (error) {
    if (error.type === 'invalid-json') {
      console.error('You must pass an object in your API response');
    }

    console.error(error);
  } finally {
    serverRef?.close();
  }
};

let testNextApi = {
  get: (
    handler: any,
    {
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      //refactor to type
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
    } = {}
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'GET',
    });
  },

  put: (
    handler: any,
    {
      body,
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      body: any;
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
    }
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'PUT',
      body,
    });
  },

  post: (
    handler: any,
    {
      body,
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      body: any;
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
    }
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'POST',
      body,
    });
  },

  delete: (
    handler: any,
    {
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
    }
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'DELETE',
    });
  },
};

export default testNextApi;
