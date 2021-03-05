
import { Post, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextAPIRequestWithAuthorization } from "../../lib/p1Auth/client/server/types/types";
import prisma from "../../lib/prisma";
import { UserDTO } from "../../middleware/types";
import jwtInterceptor from "../../middleware/utils";

 const login = async (req: NextAPIRequestWithAuthorization<UserDTO>, res: NextApiResponse<UserDTO>) => {
  res.statusCode = 200;

  res.json(req.user);
};

export default jwtInterceptor(login)