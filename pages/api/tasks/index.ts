import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const validation = taskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { title, description, boardId } = validation.data;

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
