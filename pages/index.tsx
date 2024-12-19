import { BoardForm, BoardFormAtom } from "@/components/board-form";
import { BoardList } from "@/components/board-list";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { TaskForm, TaskFormAtom } from "@/components/task-form";
import { ThemeSelect } from "@/components/theme-select";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { fetchBoardData } from "@/lib/query-fn";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

export default function Home() {
  const [, setBoardFormValue] = useAtom(BoardFormAtom);
  const [, setTaskFormValue] = useAtom(TaskFormAtom);

  const { data: boardData } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoardData,
  });

  return (
    <div className={`min-h-screen md:p-20 p-6 gap-8 flex flex-col`}>
      <div className="flex justify-between w-full flex-row">
        <div className="flex flex-row gap-2">
          <Button
            onClick={() => setBoardFormValue({ isOpen: true, board: undefined })}
            className="btn-primary">
            Create Board
          </Button>
          <Button
            disabled={!boardData || boardData?.length === 0}
            onClick={() => setTaskFormValue({ isOpen: true, task: undefined })}
            className="btn-primary">
            Create Task
          </Button>
        </div>
        <ThemeSelect />
      </div>
      <BoardList />
      <BoardForm />
      <ConfirmationDialog />
      <TaskForm />
      <Toaster />
    </div>
  );
}
