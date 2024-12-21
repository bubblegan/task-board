import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { boardIdSchema, orderSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idValidation = boardIdSchema.safeParse(id);
  if (idValidation.error) {
    return res.status(404).json({ message: "Board not found)" });
  }
  const boardId = idValidation.data;

  if (req.method === "PATCH") {
    const bodyValidation = orderSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(500).json({ message: "Validation error", error: bodyValidation.error.errors });
    }
    const { order, dir } = bodyValidation.data;

    try {
      if (order === "title" || order === "dueDate") {
        const tasks = await prisma.task.findMany({
          orderBy: { [order]: dir },
          where: { boardId },
        });
        const updates = tasks.map((task, index) =>
          prisma.task.update({
            where: { id: task.id },
            data: { position: index },
          })
        );
        await Promise.all(updates);
        return res.status(201).json({ message: "Ordered successfully" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error creating board", error });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
