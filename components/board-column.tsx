import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { sortBoardApi } from "@/lib/query-fn";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { useAtom } from "jotai";
import { ArrowDownWideNarrow, Grip, Plus } from "lucide-react";
import { BoardFormAtom } from "./board-form";
import { Task, TaskCard } from "./task-card";
import { TaskFormAtom } from "./task-form";

export interface Column {
  id: string;
  title: string;
  boardId: number;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const queryClient = useQueryClient();

  const [, setValue] = useAtom(BoardFormAtom);
  const [, setTaskFormValue] = useAtom(TaskFormAtom);
  const { toast } = useToast();

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "h-[500px] max-h-[500px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  const sortBoard = useMutation({
    mutationFn: sortBoardApi,
    onSuccess: () => {
      toast({
        description: "Board sorted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}>
      <CardHeader className="p-2 font-semibold border-b-2 flex flex-row justify-between items-center">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className=" p-1 text-primary/50 h-auto cursor-grab">
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <Grip />
        </Button>
        <p
          onClick={() =>
            setValue({
              isOpen: true,
              board: { id: column.boardId, title: column.title },
            })
          }
          className="cursor-pointer">
          {column.title}
        </p>
        <div className="flex flex-row">
          <Button
            onClick={() => {
              setTaskFormValue({
                isOpen: true,
                task: { boardId: column.boardId, title: "", description: "" },
              });
            }}
            variant={"ghost"}
            size="icon">
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={() => {
                  setTaskFormValue({
                    isOpen: true,
                    task: {
                      boardId: column.boardId,
                      title: "",
                      description: "",
                    },
                  });
                }}
                variant={"ghost"}
                size="icon">
                <ArrowDownWideNarrow />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  sortBoard.mutate({
                    order: "title",
                    dir: "asc",
                    boardId: column.boardId,
                  })
                }>
                Title Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  sortBoard.mutate({
                    order: "title",
                    dir: "desc",
                    boardId: column.boardId,
                  })
                }>
                Title Descending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  sortBoard.mutate({
                    order: "createdAt",
                    dir: "asc",
                    boardId: column.boardId,
                  })
                }>
                Created At Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  sortBoard.mutate({
                    order: "createdAt",
                    dir: "desc",
                    boardId: column.boardId,
                  })
                }>
                Created At Descending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
