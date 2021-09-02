import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { User } from '@prisma/client';
import { findUserById, updateTempestUserFromCommonApi } from '../../../repositories/userRepo';
import { IncomingHttpHeaders } from 'http';
import signatureRequired from '../../../middleware/signatureRequired';
import { getPersonFromCommonApi } from '../../../repositories/common/commonRepo';

/** Subscription end point for Common api
 * How common API works
 * Tempest has a subscription to PERSON_CHANGE
 * When Common API data changes for Person
 * Common API will send a POST to this handler with a message
 *
 * @body -> message
 * personIds : array
 * eventCount : number
 * eventType : common api enum -> PERSON_CHANGE
 */
export const userSubscriptionHandler = async (
  req: NextApiRequestWithAuthorization<User, User>,
  res: NextApiResponse
) => {
  const {
    body: message,
  }: {
    body: { personIds: string[]; eventCount: number };
    method?: string;
    headers: IncomingHttpHeaders;
  } = req;

  message.personIds.forEach(async (id) => {
    const tempestUser = await findUserById(id);
    if (!tempestUser) {
      return;
    }

    const person = await getPersonFromCommonApi(id);

    updateTempestUserFromCommonApi(person, tempestUser);
  });

  res.statusCode = 202;
  res.json({ message: 'Got It' });
};

export default signatureRequired(userSubscriptionHandler);
