import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createBoardApi, deleteBoardApi, updateBoardApi } from "@/lib/query-fn";
import { BoardInput, boardSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmationDialogAtom } from "./confirmation-dialog";

export const BoardFormAtom = atom<{
  isOpen: boolean;
  board?: BoardInput;
}>({
  isOpen: false,
  board: undefined,
});

export function BoardForm() {
  const [value, setValue] = useAtom(BoardFormAtom);
  const [, setConfirmationDialog] = useAtom(ConfirmationDialogAtom);
  const queryClient = useQueryClient();

  const { toast } = useToast();
  const { isOpen, board } = value;

  const form = useForm<z.infer<typeof boardSchema>>({
    resolver: zodResolver(boardSchema),
  });

  useEffect(() => {
    form.reset({
      title: board?.title,
    });
  }, [board, form]);

  const createBoard = useMutation({
    mutationFn: createBoardApi,
    onSuccess: () => {
      toast({
        description: "Board created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const updateBoard = useMutation({
    mutationFn: updateBoardApi,
    onSuccess: () => {
      toast({
        description: "Board updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const deleteBoard = useMutation({
    mutationFn: deleteBoardApi,
    onSuccess: () => {
      toast({
        description: "Board deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setConfirmationDialog({ isOpen: false });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const onSubmit: SubmitHandler<BoardInput> = (data) => {
    if (board && board?.id !== undefined) {
      updateBoard.mutate({
        title: data.title,
        id: board.id,
      });
    } else {
      createBoard.mutate({
        title: data.title,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setValue({ board: undefined, isOpen: open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{board ? "Update" : "Create"} Board</DialogTitle>
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
                    <Input placeholder="board title here" {...field} />
                  </FormControl>
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
                    title: "Delete board",
                    message: "Deleting this board will delete all its task as well.",
                    onConfirm: () => {
                      if (board?.id !== undefined) {
                        deleteBoard.mutate({ id: board?.id });
                      }
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
