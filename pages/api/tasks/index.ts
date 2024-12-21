import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const validation = taskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }
    const { title, description, boardId, dueDate } = validation.data;

    try {
      const totalOnBoard = await prisma.task.count({
        where: {
          boardId,
        },
      });

      const task = await prisma.task.create({
        data: {
          title,
          description,
          userId: 1,
          boardId,
          dueDate,
          position: totalOnBoard,
        },
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Error creating task", error });
    }
  }
}
