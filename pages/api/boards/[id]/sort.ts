import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { order, dir } = req.body;
    try {
      if (order === "title" || order === "createdAt") {
        const tasks = await prisma.task.findMany({
          orderBy: { [order]: dir },
          where: { boardId: Number(id) },
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
