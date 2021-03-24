import { AccessControl } from "accesscontrol";
import prisma from "../prisma/prisma";

export async function getAcList() {
  const grants = await prisma.grant.findMany({
    select: { action: true, attributes: true, resource: true, role: true },
  });

  return new AccessControl(grants)

}