import { User } from "@prisma/client";
import { NextApiRequestWithAuthorization, withApiAuth } from "@tron/nextjs-auth-p1";
import { NextApiResponse } from "next";
import { findUserByDodId, getUsers } from "../../prisma/repositories/user";

export const usersApiHandler = async (
    req: NextApiRequestWithAuthorization<User>,
    res: NextApiResponse
  ) => {
    const {method} = req
    switch (method) {
      case 'GET': {
        const users = await getUsers()
        res.json(users)
        break;
      }
  
      // Disallow all methods except POST
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  };
  
  export default withApiAuth(usersApiHandler, findUserByDodId);