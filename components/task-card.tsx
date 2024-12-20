import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { truncateText } from "@/lib/truncate-text";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { Grip } from "lucide-react";
import { TaskFormAtom } from "./task-form";

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string;
  taskId: number;
  boardId: number;
  dueDate: Date | undefined;
}

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const [, setValue] = useAtom(TaskFormAtom);

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("cursor-pointer", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() =>
        setValue({
          isOpen: true,
          task: {
            title: task.title,
            id: task.taskId,
            boardId: task.boardId,
            description: task.description,
            dueDate: task.dueDate,
          },
        })
      }
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}>
      <CardHeader className="px-3 py-3 justify-between flex flex-row items-center border-b-2 border-secondary relative w-full">
        {truncateText(task.title, 30)}
        <Button {...attributes} {...listeners} className="cursor-grab" variant="ghost" size="icon">
          <Grip />
        </Button>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        {truncateText(task.description, 500)}
      </CardContent>
      {task.dueDate && (
        <CardFooter className="px-3 pb-3 flex flex-row-reverse">
          <div className="border p-0.5 px-3 rounded">
            <p className="text-sm">Due on {format(task.dueDate, "dd MMM yyyy")}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
