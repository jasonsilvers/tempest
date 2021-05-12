import http from 'http';
import queryString from 'query-string';
import listen from 'test-listen';
import fetch from 'isomorphic-unfetch';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import { userJWT } from './mocks/mockJwt';
import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';

type ApiHandler = (
  req: NextApiRequestWithAuthorization<unknown, unknown>,
  res: NextApiResponse<unknown>
) => Promise<void>;

async function createNextApiServer(handler: ApiHandler) {
  let server: http.Server;
  const url = await listen(
    (server = http.createServer((req, res) => {
      const urlSplit = req.url.split('/');
      const id = urlSplit[3];
      const slug = urlSplit.slice(3, urlSplit.length);
      const urlQuery = req.url.split('?')[1];
      const queryParams = queryString.parse(urlQuery, {
        arrayFormat: 'bracket',
      });
      apiResolver(
        req,
        res,
        { slug, id, ...queryParams },
        handler,
        undefined,
        false
      );
    }))
  );

  return { url, server };
}

type METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE';

const baseTestNextApi = async (
  handler: ApiHandler,
  {
    withJwt = true,
    urlId,
    urlSlug,
    method = 'GET',
    body,
    customHeaders = {},
  }: {
    withJwt?: boolean;
    urlId?: string | number;
    urlSlug?: string;
    method?: METHOD;
    body?: Record<string, unknown>;
    customHeaders?: { [key: string]: unknown };
  } = {}
) => {
  let serverRef: http.Server;
  let status: number;
  let data: Record<string, unknown>;
  try {
    if (urlId && urlSlug) {
      throw new Error('Must pass only a urlID or urlSlug');
    }

    let urlParams = '';

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
          Authorization: `Bearer ${userJWT}`,
        }
      : {};

    const response = await fetch(url + '/api/whocares' + urlParams, {
      headers: {
        'Content-Type': 'application/json',
        ...authorization,
        ...customHeaders,
      },
      method,
      body: JSON.stringify(body),
    });
    status = response.status;
    data = await response.json();
  } catch (error) {
    data = { message: error };
  } finally {
    serverRef?.close();
  }

  return { status, data };
};

const testNextApi = {
  get: (
    handler: ApiHandler,
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
    handler: ApiHandler,
    {
      body,
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      body: Record<string, unknown>;
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
    handler: ApiHandler,
    {
      body,
      withJwt = true,
      urlId,
      urlSlug,
      customHeaders = {},
    }: {
      body: Record<string, unknown>;
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
      customHeaders?: { [key: string]: unknown };
    }
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'POST',
      body,
      customHeaders,
    });
  },

  delete: (
    handler: ApiHandler,
    {
      withJwt = true,
      urlId,
      urlSlug,
    }: {
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
    } = {}
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
