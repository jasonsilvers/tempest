import { NextAPIRequestWithAuthorization } from '../types/types';
import Cors from 'cors';
import initMiddleware from '../../../../../middleware/init-middleware';
import { NextApiResponse } from 'next';
import jwt_decode from 'jwt-decode';

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);

const dev = process.env.NODE_ENV === 'development';

export interface P1JWT {
  dodid: string;
  given_name: string;
  name: string;
  email: string;
  preferred_username: string;
  usercertificate: string;
}

const explodeJWT = (jwt: string): P1JWT => {
  const decodedJwt: P1JWT = jwt_decode(jwt);
  const dodid = decodedJwt.usercertificate.split('.').slice(-1)[0];

  return {
    ...decodedJwt,
    dodid,
  };
};

export const jwtParser = async <T>(
  req: NextAPIRequestWithAuthorization<T>,
  res: NextApiResponse
) => {
  // Need this if we use the JWT Proxy tool...
  if (dev) {
    await cors(req, res);
  }

  const jwt = req.headers.authorization?.split(' ')[1];

  const jwtObj = explodeJWT(jwt);

  return jwtObj;
};
