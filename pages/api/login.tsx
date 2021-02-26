
import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { NextAPIRequestWithAuthorization, UserDTO } from "../../middleware/types";
import jwtInterceptor from "../../middleware/utils";

 const login = async (req: NextAPIRequestWithAuthorization, res: NextApiResponse<UserDTO>) => {
  res.statusCode = 200;

  res.json(req.user);
};

export default jwtInterceptor(login)