import { AccessControl } from "accesscontrol";
import { NextApiRequest } from "next";
import { UserDTO } from "../../../../../middleware/types";

export type NextAPIRequestWithAuthorization<T> = NextApiRequest & {
  user: T
}

export type NextApiResponseWithAuthorization<T> = NextApiRequest & {
  user: T
}