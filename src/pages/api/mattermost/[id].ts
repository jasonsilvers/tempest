import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { MattermostWebhookResponse, sendMessage } from '../../../repositories/mattermost/mattermostRepo';
import { LoggedInUser, findUserByDodId } from '../../../repositories/userRepo';
import { EResource } from '../../../types/global';

const mattermostHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const {
    method,
    query: { id },
  } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }

  if (id !== 'send') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).createAny(EResource.MATTERMOST);

  if (!permission.granted) {
    return permissionDenied(res);
  }

  let call: AxiosResponse<MattermostWebhookResponse>;

  try {
    call = await sendMessage('@test.user', 'Hello world');
  } catch (error) {
    return res.status(500).json({ message: 'There was an error sending a notification' });
  }

  res.status(200).json({ message: call.data });
};

export default withTempestHandlers(mattermostHandler, findUserByDodId);
