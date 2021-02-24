import { AccessControl } from "accesscontrol";
import { NextApiRequest } from "next";

export type NextAPIRequestWithAuthorization = NextApiRequest & {
  ac: AccessControl
}

export type P1Token = {
  usercertificate: string
}