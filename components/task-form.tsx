import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { fetchBoardData } from "@/lib/query-fn";
import { useEffect, useMemo } from "react";
import { atom, useAtom } from "jotai";
import { toast } from "@/hooks/use-toast";
import { ConfirmationDialogAtom } from "./confirmation-dialog";

type TaskFormInput = {
  id?: number;
  title?: string;
  description?: string;
  boardId?: number;
};

export const TaskFormAtom = atom<{
  isOpen: boolean;
  task?: TaskFormInput;
}>({
  isOpen: false,
  task: undefined,
});

export function TaskForm() {
  const [value, setValue] = useAtom(TaskFormAtom);
  const [, setConfirmationDialog] = useAtom(ConfirmationDialogAtom);

  const queryClient = useQueryClient();

  const { isOpen, task } = value;

  const form = useForm<TaskFormInput>();

  useEffect(() => {
    form.reset({
      title: task?.title,
      description: task?.description,
      boardId: task?.boardId,
      id: task?.id,
    });
  }, [task, form]);

  const { data } = useQuery({
    queryKey: ["boardData"],
    queryFn: fetchBoardData,
  });

  const boardList = useMemo(() => {
    if (!data) return [];
    return data.map((board) => {
      return {
        title: board.title,
        id: board.id,
      };
    });
  }, [data]);

  const createTask = useMutation({
    mutationFn: (data: TaskFormInput) => {
      return fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ task: undefined, isOpen: false });
    },
  });

  const updateTask = useMutation({
    mutationFn: (data: TaskFormInput) => {
      return fetch(`/api/tasks/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ task: undefined, isOpen: false });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (data: { id: number }) => {
      return fetch(`/api/tasks/${data.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Task delete successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setConfirmationDialog({ isOpen: false });
      setValue({ task: undefined, isOpen: false });
    },
  });

  const onSubmit: SubmitHandler<TaskFormInput> = (data) => {
    if (task?.id) {
      updateTask.mutate({
        title: data.title,
        description: data.description,
        boardId: Number(data.boardId),
        id: data.id,
      });
    } else {
      createTask.mutate({
        title: data.title,
        description: data.description,
        boardId: Number(data.boardId),
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setValue({ task: undefined, isOpen: open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.id ? "Update" : "Create"} Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="task title here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Board</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {boardList.map((board) => (
                        <SelectItem key={board.id} value={board.id.toString()}>
                          {board.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full flex-row-reverse gap-2">
              <Button className="w-fit" type="submit">
                Submit
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmationDialog({
                    isOpen: true,
                    title: "Delete Board",
                    message: "Delete this board will affect its task.",
                    onConfirm: () => {
                      deleteTask.mutate({ id: Number(task?.id) });
                    },
                  });
                }}
                variant={"destructive"}
                className="w-fit"
              >
                Delete
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
