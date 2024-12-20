import { Prisma } from "@prisma/client";
import { z } from "zod";

export type BoardWithTasks = Prisma.BoardGetPayload<{
  include: {
    Task: true; // Include the Task relation
  };
}>;

export const boardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "please fill in the title" })
    .max(255, { message: "max length is 255 characters" }),
  id: z.number().optional(),
});

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "please fill in the title" })
    .max(255, { message: "max length is 255 characters" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "please fill in the description" })
    .max(3000, { message: "max length is 3000 characters" }),
  boardId: z.number(),
  id: z.number().optional(),
});

export const moveTaskSchema = z.object({
  boardId: z.number(),
  toPos: z.number(),
});

export const moveBoardSchema = z.object({
  toPos: z.number(),
});

export const sortBoardSchema = z.object({
  boardId: z.number(),
  toPos: z.number(),
});

export const orderSchema = z.object({
  order: z.enum(["title", "createdAt"]),
  dir: z.enum(["asc", "desc"]),
});

export const taskIdSchema = z.coerce.number();
export const boardIdSchema = z.coerce.number();

export type TaskInput = z.infer<typeof taskSchema>;
export type BoardInput = z.infer<typeof boardSchema>;
