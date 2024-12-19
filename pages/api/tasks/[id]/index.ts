import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const taskId = Number(id);

  if (req.method === "DELETE") {
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      return res.status(404).json({ error: "Task not found)" });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.task.updateMany({
          where: {
            position: {
              gt: currentTask.position,
            },
            boardId: currentTask.boardId,
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });

        await prisma.task.delete({
          where: { id: taskId },
        });
      });

      res.status(201).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error deleting task" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const currentTask = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!currentTask) {
        return res.status(404).json({ error: "Task not found)" });
      }

      // board change move position
      if (req.body.boardId !== currentTask.boardId) {
        await prisma.$transaction(async (tx) => {
          // fromPosition and above all decrease by 1
          await tx.task.updateMany({
            where: {
              position: {
                gt: currentTask.position,
              },
              boardId: currentTask.boardId,
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });

          const boardCount = await prisma.board.count({
            where: { id: req.body.boardId },
          });

          await prisma.task.update({
            data: {
              title: req.body.title,
              boardId: req.body.boardId,
              description: req.body.description,
              position: boardCount,
            },
            where: { id: taskId },
          });
        });
      } else {
        await prisma.task.update({
          data: {
            title: req.body.title,
            boardId: req.body.boardId,
            description: req.body.description,
          },
          where: { id: taskId },
        });
      }

      res.status(201).json({ message: "Task updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting board", error });
    }
  }
}
