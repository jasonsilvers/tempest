// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Cars, Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponse<Cars[]>) => {
  res.statusCode = 200;

  console.log('test')
  const cars = await prisma.cars.findMany();

  res.json(cars);
};