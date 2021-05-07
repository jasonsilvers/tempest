import http from 'http';
import queryString from 'query-string';
import listen from 'test-listen';
import { NextApiHandler } from 'next';
import fetch from 'isomorphic-unfetch';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import { userJWT } from './mocks/mockJwt';

async function createNextApiServer(handler: any) {
  let server: http.Server;
  let url: string;

  url = await listen(
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
  let status: any;
  let data: any;
  try {
    if (urlId && urlSlug) {
      throw new Error('Must pass only a urlID or urlSlug');
    }

    let urlParams: string = '';

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
