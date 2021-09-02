import axios from 'axios';
import { IPerson } from './types';
import { P1_JWT } from '@tron/nextjs-auth-p1';
import { withErrorHandling } from '../utils';

const RESOURCE = 'person';
const getCommonURL = () => process.env.COMMON_API_URL;

async function createPersonFromJwt_(jwt: P1_JWT) {
  const response = await axios.post<IPerson, { data: IPerson }>(`${getCommonURL()}/${RESOURCE}/person-jwt`, jwt);

  return response.data;
}

async function getPersonFromCommonApi_(query: string) {
  let response;

  try {
    response = await axios.post<string, { data: IPerson }>(`${getCommonURL()}/${RESOURCE}/find`, {
      findType: 'DODID',
      value: query,
    });
  } catch (error) {
    if (error.response.status === 404) {
      return null;
    }

    throw new Error('There was an error finding the user account in common api');
  }

  return response.data;
}

const getPersonFromCommonApi = withErrorHandling(getPersonFromCommonApi_);

const createPersonFromJwt = withErrorHandling(createPersonFromJwt_);

export { createPersonFromJwt, getPersonFromCommonApi };
