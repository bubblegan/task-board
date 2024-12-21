import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { boardIdSchema, boardSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const idValidation = boardIdSchema.safeParse(id);
  if (idValidation.error) {
    return res.status(404).json({ message: "Board not found)" });
  }
  const boardId = idValidation.data;

  if (req.method === "DELETE") {
    const currentBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!currentBoard) {
      return res.status(404).json({ message: "Board not found)" });
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

      return res.status(201).json({ message: "Board deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting board", error });
    }
  }

  if (req.method === "PATCH") {
    const validation = boardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(500).json({ errors: validation.error.errors });
    }
    const { title } = validation.data;

    try {
      await prisma.board.update({
        data: {
          title,
        },
        where: { id: boardId },
      });

      return res.status(201).json({ message: "Board updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting board", error });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
