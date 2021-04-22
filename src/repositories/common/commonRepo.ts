import axios from 'axios';
import { IPerson } from './types';
import { P1_JWT } from '@tron/nextjs-auth-p1';

const RESOURCE = 'person';

/*eslint-disable */
// Ignore any for args because they can literally be any....
function withErrorHandling<T extends (...args: any[]) => any>(
  func: T
): (...funcArgs: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args): Promise<ReturnType<T>> => {
    try {
      return await func(...args);
    } catch (e) {
      throw new Error('There was an error making the request');
    }
  };
}
/*eslint-enable */

async function createPersonFromJwt_(jwt: P1_JWT) {
  const COMMON_API_URL = process.env.COMMON_API_URL;
  const newCommonUser = {
    firstName: jwt.given_name,
    lastName: jwt.family_name,
    email: jwt.email,
    dodid: jwt.dod_id,
    rank: 'Amn',
    branch: 'USAF',
  };

  const response = await axios.post<IPerson, { data: IPerson }>(
    `${COMMON_API_URL}/${RESOURCE}`,
    newCommonUser
  );

  return response.data;
}

async function getPersons_() {
  const COMMON_API_URL = process.env.COMMON_API_URL;

  const response = await axios.get<string, { data: IPerson[] }>(
    `${COMMON_API_URL}/${RESOURCE}`
  );

  return response.data;
}

const getPersons = withErrorHandling(getPersons_);

async function getPersonFromCommonApi(queryString) {
  const people = await getPersons();
  if (!people) {
    return null;
  }
  return people.find((person) => person.dodid === queryString);
}

const createPersonFromJwt = withErrorHandling(createPersonFromJwt_);

export { createPersonFromJwt, getPersons, getPersonFromCommonApi };
