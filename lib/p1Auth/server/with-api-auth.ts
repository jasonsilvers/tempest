import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { readdirSync } from "node:fs";
import { assertCtx } from "../utils/with-page-auth-factory";
import {
  DBQueryFunctionToReturnUser,
  NextAPIRequestWithAuthorization,
} from "./types/types";
import { jwtParser } from "./utils/jwtUtils";

function notAuthenticated(res: NextApiResponse) {
  return res.status(401).json({
    error: "Not Authenticated",
    description: "You are not authenticated",
  });
}

const withApiAuth = <T extends unknown>(
  handler: NextApiHandler,
  getUserCallback: DBQueryFunctionToReturnUser,
) => async (req: NextAPIRequestWithAuthorization<T>, res: NextApiResponse) => {
  const jwtDiscriminator = process.env.P1_AUTH_JWT_KEY_DESCRIMINATOR;
  assertCtx({ req, res });

  //get JWT
  //Parse JWT
  const jwt = await jwtParser(req, res);

  // return 401 if no JWT
  if (!jwt) notAuthenticated(res);

  //pull jwtDiscrimnator from JWT
  const query = jwt[jwtDiscriminator];

  //call function to get user passed in as argument
  const user = await getUserCallback(query);

  //if no user return 401
  if (!user) notAuthenticated(res);

  req.user = user;
  
  return handler(req, res);
};

export default withApiAuth;
