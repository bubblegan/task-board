import { BoardForm, BoardFormAtom } from "@/components/board-form";
import { BoardList } from "@/components/board-list";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { TaskForm, TaskFormAtom } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useAtom } from "jotai";

export default function Home() {
  const [, setBoardFormValue] = useAtom(BoardFormAtom);
  const [, setTaskFormValue] = useAtom(TaskFormAtom);

  return (
    <div className={`items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 flex flex-col`}>
      <div className="flex flex-row gap-2">
        <Button onClick={() => setBoardFormValue({ isOpen: true, board: undefined })} className="btn-primary">
          Create Board
        </Button>
        <Button onClick={() => setTaskFormValue({ isOpen: true, task: undefined })} className="btn-primary">
          Create Task
        </Button>
      </div>
      <BoardList />
      <BoardForm />
      <ConfirmationDialog />
      <TaskForm />
      <Toaster />
    </div>
  );
}
