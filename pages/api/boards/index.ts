import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log(result);

  if (req.method === "GET") {
    try {
      const board = await prisma.board.findMany({
        include: {
          Task: {
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      });
      res.status(201).json(board);
    } catch (error) {
      res.status(500).json({ error, message: "Error fetching board" });
    }
  }

  if (req.method === "POST") {
    const { title } = req.body;
    try {
      const totalBoard = await prisma.board.count();
      const newBoard = await prisma.board.create({
        data: {
          title,
          userId: 1,
          position: totalBoard,
        },
      });
      res.status(201).json(newBoard);
    } catch (error) {
      res.status(500).json({ error, message: "Error creating board" });
    }
  }
}
