import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createTaskApi, deleteTaskApi, fetchBoardData, updateTaskApi } from "@/lib/query-fn";
import { TaskInput, taskSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { atom, useAtom } from "jotai";
import { CalendarIcon, Loader2 } from "lucide-react";
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

const defaultFormValues = {
  title: "",
  description: "",
  boardId: undefined,
  dueDate: undefined,
};

export function TaskForm() {
  const [value, setValue] = useAtom(TaskFormAtom);
  const [, setConfirmationDialog] = useAtom(ConfirmationDialogAtom);

  const queryClient = useQueryClient();

  const { isOpen, task } = value;

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaultFormValues,
  });

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

  // set default value for board
  useEffect(() => {
    if (form.getValues("boardId") === undefined && boardList.length > 0) {
      form.setValue("boardId", boardList[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardList]);

  useEffect(() => {
    if (task?.id !== undefined) {
      form.reset({
        title: task?.title,
        description: task?.description,
        boardId: task?.boardId || boardList[0]?.id,
        dueDate: task?.dueDate,
        id: task?.id,
      });
    } else {
      form.setValue("dueDate", undefined);
      if (task?.boardId && !isNaN(task?.boardId)) {
        form.setValue("boardId", task.boardId);
      }
    }
  }, [task, form, boardList]);

  const createTask = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      toast({
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      form.reset(defaultFormValues);
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
      form.reset(defaultFormValues);
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
        dueDate: data.dueDate,
        id: data.id,
      });
    } else {
      createTask.mutate({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        boardId: Number(data.boardId),
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        form.reset({
          title: "",
          description: "",
          boardId: boardList[0]?.id,
          dueDate: undefined,
        });
        setValue({ task: undefined, isOpen: open });
      }}>
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
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={field.value?.toString()}>
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
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>This field is optional.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full flex-row-reverse gap-2">
              <Button disabled={createTask.isPending || updateTask.isPending} className="w-fit" type="submit">
                {(createTask.isPending || updateTask.isPending) && <Loader2 className="animate-spin" />}{" "}
                Submit
              </Button>
              {task?.id !== undefined && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmationDialog({
                      isOpen: true,
                      title: "Delete Task",
                      message: "Deleting the current task.",
                      onConfirm: () => {
                        deleteTask.mutate({ id: Number(task?.id) });
                      },
                    });
                  }}
                  variant={"destructive"}
                  className="w-fit">
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
