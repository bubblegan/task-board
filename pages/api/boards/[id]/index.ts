import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const boardId = Number(id);

  if (req.method === "DELETE") {
    const currentBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!currentBoard) {
      return res.status(404).json({ error: "Board not found)" });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.board.updateMany({
          where: {
            position: {
              gt: currentBoard.position,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });

        await prisma.board.delete({
          where: { id: boardId },
        });
      });

      res.status(201).json({ message: "Board deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting board", error });
    }
  }

  if (req.method === "PATCH") {
    try {
      await prisma.board.update({
        data: {
          title: req.body.title,
        },
        where: { id: boardId },
      });

      res.status(201).json({ message: "Board updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting board", error });
    }
  }
}
