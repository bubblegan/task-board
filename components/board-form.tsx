import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { atom, useAtom } from "jotai";
import { SubmitHandler, useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ConfirmationDialogAtom } from "./confirmation-dialog";
import { boardSchema } from "@/lib/types";

type BoardFormInput = {
  title: string;
  id?: number;
};

export const BoardFormAtom = atom<{
  isOpen: boolean;
  board?: BoardFormInput;
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
    mutationFn: (data: BoardFormInput) => {
      return fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Board created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const updateBoard = useMutation({
    mutationFn: (data: BoardFormInput) => {
      return fetch(`/api/boards/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Board updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const deleteBoard = useMutation({
    mutationFn: (data: { id: number }) => {
      return fetch(`/api/boards/${data.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        description: "Board deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boardData"] });
      setConfirmationDialog({ isOpen: false });
      setValue({ board: undefined, isOpen: false });
    },
  });

  const onSubmit: SubmitHandler<BoardFormInput> = (data) => {
    if (board) {
      updateBoard.mutate({
        title: data.title.toLocaleLowerCase(),
        id: board.id,
      });
    } else {
      createBoard.mutate({
        title: data.title.toLocaleLowerCase(),
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setValue({ board: undefined, isOpen: open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{board ? "Update" : "Create"} Board</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="text-primary">
                Title
              </label>
              <Input
                className="mt-1 text-primary"
                {...form.register("title")}
              />
            </div>
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
                    message:
                      "Deleting this board will delete all its task as well.",
                    onConfirm: () => {
                      deleteBoard.mutate({ id: Number(board?.id) });
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
