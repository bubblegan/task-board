import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { toPos } = req.body;

    const board = await prisma.board.findUnique({
      where: { id: Number(id) },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
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

      res.status(201).json({ message: "Board moved successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating board" });
    }
  }
}
