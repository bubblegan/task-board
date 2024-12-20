import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { boardIdSchema, orderSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idValidation = boardIdSchema.safeParse(id);
  if (idValidation.error) {
    return res.status(404).json({ error: "Board not found)" });
  }
  const boardId = idValidation.data;

  if (req.method === "PATCH") {
    const bodyValidation = orderSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(500).json({ errors: bodyValidation.error.errors });
    }
    const { order, dir } = bodyValidation.data;

    try {
      if (order === "title" || order === "createdAt") {
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
        res.status(201).json({ message: "Ordered successfully" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating board" });
    }
  }
}
