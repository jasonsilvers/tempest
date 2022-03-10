import { P1_JWT } from '@tron/nextjs-auth-p1';
import jwt_decode from 'jwt-decode';
import { NextApiRequest } from 'next';

export const explodeJWT = (jwt: string): P1_JWT => {
  const decodedJwt: P1_JWT = jwt_decode(jwt);

  if (!decodedJwt.usercertificate) {
    throw new Error('No user certificate, please contact P1 Admin');
  }

  const dod_id = decodedJwt.usercertificate.split('.').slice(-1)[0];

  return {
    ...decodedJwt,
    dod_id,
  };
};

export const jwtParser = (req: NextApiRequest): P1_JWT | null => {
  if (!req.headers.authorization) {
    throw new Error('Authorization header not set, please contact P1 Admin');
  }

  const jwtString = req.headers.authorization?.split(' ')[1];

  if (!jwtString) return null;

  return explodeJWT(jwtString);
};
