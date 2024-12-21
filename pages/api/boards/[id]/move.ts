import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { boardIdSchema, moveBoardSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idValidation = boardIdSchema.safeParse(id);
  if (idValidation.error) {
    return res.status(404).json({ error: "Task not found)" });
  }
  const boardId = idValidation.data;

  if (req.method === "PATCH") {
    const bodyValidation = moveBoardSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(500).json({ message: "Validation error", error: bodyValidation.error.errors });
    }

    const { toPos } = bodyValidation.data;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const fromPos = board?.position;

    try {
      const isMovingDown = toPos > fromPos;
      await prisma.$transaction(async (tx) => {
        if (isMovingDown) {
          await tx.board.updateMany({
            where: {
              position: {
                gt: fromPos,
                lte: toPos,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        } else {
          await tx.board.updateMany({
            where: {
              position: {
                gte: toPos,
                lt: fromPos,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }

        await tx.board.update({
          where: { id: Number(id) },
          data: { position: toPos },
        });
      });

      return res.status(201).json({ message: "Board moved successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error creating board", error });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
