import { User } from "@prisma/client";
import { AccessControl } from "accesscontrol";
import { NextApiRequest } from "next";

export type NextAPIRequestWithAuthorization = NextApiRequest & {
  accessControl: AccessControl
  user: UserDTO
}

export type P1Token = {
  usercertificate: string
}

export type Grant = {
  role: string,
  resource: string,
  action: string,
  attributes: string
}

export type UserDTO = User & {
  grants: Grant[]
}