import { User } from '@prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import {
  getAc,
  permissionDenied,
  recordNotFound,
} from '../../../middleware/utils';
import {
  findUserByDodId,
  findUserById,
  UserWithRole,
} from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

enum EUserResources {
  MEMBER_TRACKING_ITEMS = 'membertrackingitems',
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
  TRACKING_ITEMS = 'trackingitems',
}

async function userSlugHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const {
    query: { slug, include },
    method,
  } = req;

  const userId = slug[0];
  const resource = slug[1];

  const includesQuery = Array.isArray(include)
    ? include
    : include !== undefined
    ? [include]
    : undefined;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission =
        userId !== req.user.id
          ? ac.can(req.user.role.name).readAny(EResource.USER)
          : ac.can(req.user.role.name).readOwn(EResource.USER);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      let includeConfig: Record<string, boolean> = {};

      if (resource === EUserResources.MEMBER_TRACKING_ITEMS) {
        includeConfig = { withMemberTrackingItems: true };

        if (includesQuery) {
          includesQuery.forEach((includeQuery) => {
            if (includeQuery === EUserResources.MEMBER_TRACKING_RECORDS) {
              includeConfig = {
                ...includeConfig,
                withMemberTrackingRecords: true,
              };
            }

            if (includeQuery == EUserResources.TRACKING_ITEMS) {
              includeConfig = { ...includeConfig, withTrackingItems: true };
            }
          });
        }
      } else {
        return recordNotFound(res);
      }
      const user = await findUserById(userId, includeConfig);

      if (!user) {
        return recordNotFound(res);
      }

      res.status(200).json(user);
      break;
    }

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(userSlugHandler, findUserByDodId);
