import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchBoardData, moveBoardApi, moveTaskApi } from "@/lib/query-fn";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { Active, DataRef, Over } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { BoardColumn, Column, ColumnDragData } from "./board-column";
import { BoardContainer } from "./board-container";
import { type Task, TaskCard } from "./task-card";
import { TaskDragData } from "./task-card";

type DraggableData = ColumnDragData | TaskDragData;

function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

export function BoardList() {
  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoardData,
  });

  const { toast } = useToast();

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const moveTask = useMutation({
    mutationFn: moveTaskApi,
    onSuccess: () => {
      toast({
        description: "Task moved",
      });
    },
    onError: () => {
      toast({
        description: "Failed to move task",
      });
    },
  });

  const moveBoard = useMutation({
    mutationFn: moveBoardApi,
    onSuccess: () => {
      toast({
        description: "Board moved",
      });
    },
    onError: () => {
      toast({
        description: "Failed to move board",
      });
    },
  });

  useEffect(() => {
    const taskList: Task[] = [];
    const boardList: Column[] = [];

    if (boardData) {
      boardData.forEach((board) => {
        boardList.push({
          id: "board-" + board.id,
          boardId: board.id,
          title: board.title,
        });

        board.Task.forEach((task) => {
          taskList.push({
            id: "task-" + task.id,
            columnId: "board-" + task.boardId,
            taskId: task.id,
            boardId: task.boardId,
            title: task.title,
            description: task.description,
          });
        });
      });
    }

    setColumns(boardList);
    setTasks(taskList);
  }, [boardData]);

  useEffect(() => {
    if (window) {
      setShowOverlay(true);
    }
  }, []);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;
    const isTaskColumn = activeData?.type === "Task";

    if (isTaskColumn) {
      const board_id = columns.find((col) => col.id === activeData?.task.columnId)?.boardId;

      if (board_id !== undefined) {
        moveTask.mutate({
          taskId: activeData?.task.taskId,
          boardId: board_id,
          toPos: activeData?.sortable.index,
        });
      }
      return;
    }

    if (activeId === overId) return;

    const isActiveAColumn = activeData?.type === "Column";

    if (!isActiveAColumn) return;

    const fromPos = columns.findIndex((col) => col.id === activeId);
    const toPos = columns.findIndex((col) => col.id === overId);

    const movedColumns = arrayMove(columns, fromPos, toPos);
    const boardId = active.data.current?.column.boardId;

    setColumns(movedColumns);

    if (boardId !== undefined) {
      moveBoard.mutate({
        boardId: boardId,
        toPos: toPos,
      });
    }
    return;
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
          activeTask.columnId = overTask.columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.columnId = overId.toString();
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
      <BoardContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <BoardColumn key={col.id} column={col} tasks={tasks.filter((task) => task.columnId === col.id)} />
          ))}
        </SortableContext>
      </BoardContainer>
      {showOverlay &&
        "document" in window &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <BoardColumn
                isOverlay
                column={activeColumn}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
