import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { taskIdSchema, taskSchema } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idValidation = taskIdSchema.safeParse(id);

  if (idValidation.error) {
    return res.status(404).json({ error: "Task not found)" });
  }

  const taskId = idValidation.data;

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
      res.status(500).json({ message: "Error deleting task", error });
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

      const validation = taskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(500).json({ errors: validation.error.errors });
      }
      const { title, description, boardId, dueDate } = validation.data;

      // board change move position
      if (boardId !== currentTask.boardId) {
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
            where: { id: boardId },
          });

          await prisma.task.update({
            data: {
              title,
              boardId,
              description,
              dueDate,
              position: boardCount,
            },
            where: { id: taskId },
          });
        });
      } else {
        await prisma.task.update({
          data: {
            title,
            boardId,
            description,
            dueDate,
          },
          where: { id: taskId },
        });
      }

      res.status(201).json({ message: "Task updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting board", error });
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
