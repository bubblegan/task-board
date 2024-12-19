import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { boardId, toPos } = req.body;
    const taskId = Number(id);

    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      return res.status(404).json({ error: "Task not found)" });
    }

    const fromPos = currentTask?.position;
    const isCrossBoard = boardId !== currentTask.boardId;

    try {
      if (!isCrossBoard) {
        const isMovingDown = toPos > fromPos;
        await prisma.$transaction(async (tx) => {
          if (isMovingDown) {
            await tx.task.updateMany({
              where: {
                position: {
                  gt: fromPos,
                  lte: toPos,
                },
                boardId,
              },
              data: {
                position: {
                  decrement: 1,
                },
              },
            });
          } else {
            await tx.task.updateMany({
              where: {
                position: {
                  gte: toPos,
                  lt: fromPos,
                },
                boardId,
              },
              data: {
                position: {
                  increment: 1,
                },
              },
            });
          }

          await tx.task.update({
            where: { id: taskId },
            data: { position: toPos },
          });
        });
      } else {
        await prisma.$transaction(async (tx) => {
          // fromPosition and above all decrease by 1
          await tx.task.updateMany({
            where: {
              position: {
                gt: fromPos,
              },
              boardId: currentTask.boardId,
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });

          // toPosition and above all increase by 1
          await tx.task.updateMany({
            where: {
              position: {
                gte: toPos,
              },
              boardId: boardId,
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });

          await tx.task.update({
            where: { id: taskId },
            data: { position: toPos, boardId },
          });
        });
      }
      res.status(201).json({ message: "Task moved successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error creating board" });
    }
  }
}
