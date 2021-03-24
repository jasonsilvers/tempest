import { NextApiResponse } from "next";
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from "@tron/nextjs-auth-p1";
import { getUser, UserWithRole } from "../../../prisma/repositories/user";
import prisma from "../../../prisma/prisma";
import { getAcList } from "../../../middleware/utils";
import { Resource } from "../../../types/global";

const grants = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse
) => {
  const ac = await getAcList();

  const permission = ac
    .can(req.user.role.accessControlName)
    .read(Resource.TRAINING_RECORD);

  if (permission.granted) {
    res.statusCode = 200;
    const records = await prisma.trainingRecord.findMany();
    res.json(records);
  } else {
    res.status(403).json("You dont have permission");
  }
};

export default withApiAuth(grants, getUser);
