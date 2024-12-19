import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createTaskApi, deleteTaskApi, fetchBoardData, updateTaskApi } from "@/lib/query-fn";
import { TaskInput, taskSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmationDialogAtom } from "./confirmation-dialog";

export const TaskFormAtom = atom<{
  isOpen: boolean;
  task?: TaskInput;
}>({
  isOpen: false,
  task: undefined,
});

export function TaskForm() {
  const [value, setValue] = useAtom(TaskFormAtom);
  const [, setConfirmationDialog] = useAtom(ConfirmationDialogAtom);

  const queryClient = useQueryClient();

  const { isOpen, task } = value;

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
  });

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
    mutationFn: createTaskApi,
    onSuccess: () => {
      toast({
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ task: undefined, isOpen: false });
    },
    onError: () => {
      toast({
        description: "Failed to create task",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: updateTaskApi,
    onSuccess: () => {
      toast({
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ task: undefined, isOpen: false });
    },
    onError: () => {
      toast({
        description: "Failed to update task",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      toast({
        description: "Task delete successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setConfirmationDialog({ isOpen: false });
      setValue({ task: undefined, isOpen: false });
    },
    onError: () => {
      toast({
        description: "Failed to delete task",
      });
    },
  });

  const onSubmit: SubmitHandler<TaskInput> = (data) => {
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
    <Dialog open={isOpen} onOpenChange={(open) => setValue({ task: undefined, isOpen: open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task?.id !== undefined ? "Update" : "Create"} Task</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                className="w-fit">
                Delete
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
