import http from 'http';
import queryString from 'query-string';
import listen from 'test-listen';
import fetch from 'isomorphic-unfetch';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { userJWT } from './mocks/mockJwt';
import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import 'setimmediate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiHandler = (req: NextApiRequestWithAuthorization<any, any>, res: NextApiResponse<any>) => Promise<void>;

async function createNextApiServer(handler: ApiHandler) {
  let server: http.Server;
  const url = await listen(
    (server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, 'http://nextjstesttool/');
      const urlSplit = reqUrl.pathname.split('/');
      const id = urlSplit[3];
      const slug = urlSplit.slice(3, urlSplit.length);
      const queryParams = queryString.parse(reqUrl.search);
      apiResolver(req, res, { slug, id, ...queryParams }, handler, undefined, false);
    }))
  );

  return { url, server };
}

type METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

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

      urlParams = urlSplit.length > 1 ? urlSplit[1] : urlSplit[0];
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
      : { Authorization: `Bearer` };

    const base = urlParams.charAt[0] === '?' ? '/api/whocares' : '/api/whocares/';

    const response = await fetch(url + base + urlParams, {
      headers: {
        'Content-Type': 'application/json',
        ...authorization,
        ...customHeaders,
      },
      method,
      body: JSON.stringify(body),
    });
    status = response.status;
    if (status === 204) {
      data = null;
    } else {
      data = await response.json();
    }
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
      customHeaders,
    }: {
      //refactor to type
      withJwt?: boolean;
      urlId?: string | number;
      urlSlug?: string;
      customHeaders?: { [key: string]: unknown };
    } = {}
  ) => {
    return baseTestNextApi(handler, {
      withJwt,
      urlId,
      urlSlug,
      method: 'GET',
      customHeaders,
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

  patch: (
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
      method: 'PATCH',
    });
  },
};

export { testNextApi };
