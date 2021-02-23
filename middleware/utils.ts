import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import jwt from "jsonwebtoken";
import cors from "./cors";

const dev = process.env.NODE_ENV === "development";

const jwtInterceptor = (handler: NextApiHandler) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log(req.headers);

  if (dev) {
    await cors(req, res);
    console.log("you are in development");

    req.headers.authorization;
  }

  //decode jwt
  //look up user in database
  //attach role and permission to request

  return handler(req, res);
};

export default jwtInterceptor;
