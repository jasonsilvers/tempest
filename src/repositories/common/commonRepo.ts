import axios from 'axios';
import { IPerson } from './types';
import { P1_JWT } from '@tron/nextjs-auth-p1';

const RESOURCE = 'person';
const getCommonURL = () => process.env.COMMON_API_URL;

/*eslint-disable */
// Ignore any for args because they can literally be any....
function withErrorHandling<T extends (...args: any[]) => any>(
  func: T
): (...funcArgs: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args): Promise<ReturnType<T>> => {
    try {
      return await func(...args);
    } catch (e) {
      if (process.env.ERROR_DEBUG === 'TRUE') {
        throw new Error(e + '  ' + func.name + '  ' + getCommonURL() + ' - There was an error making the request');
      } else {
        throw new Error('There was an error making the request');
      }
    }
  };
}
/*eslint-enable */

async function createPersonFromJwt_(jwt: P1_JWT) {
  const response = await axios.post<IPerson, { data: IPerson }>(`${getCommonURL()}/${RESOURCE}/person-jwt`, jwt);

  return response.data;
}

async function getPersons_() {
  const response = await axios.get<string, { data: IPerson[] }>(`${getCommonURL()}/${RESOURCE}`);
  return response.data;
}

const getPersons = withErrorHandling(getPersons_);

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

async function getPersonFromCommonApiById(id: string) {
  const person = await axios.get<string, { data: IPerson }>(`${getCommonURL()}/${RESOURCE}/${id}`);

  return person.data;
}
const getPersonFromCommonApi = withErrorHandling(getPersonFromCommonApi_);

const createPersonFromJwt = withErrorHandling(createPersonFromJwt_);

export { createPersonFromJwt, getPersons, getPersonFromCommonApi, getPersonFromCommonApiById };
