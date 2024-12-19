import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { title, description, boardId } = req.body;
    try {
      const totalOnBoard = await prisma.task.count({
        where: {
          boardId,
        },
      });

      const newBoard = await prisma.task.create({
        data: {
          title,
          description,
          userId: 1,
          boardId,
          position: totalOnBoard,
        },
      });

      res.status(201).json(newBoard);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating task" });
    }
  }
}
