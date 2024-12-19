import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const user = await prisma.user.create({
        data: {
          username: "demo",
          password: "demo",
        },
      });
      res.status(201).json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating user" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
