import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDndContext } from "@dnd-kit/core";
import { cva } from "class-variance-authority";

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva("px-2 md:px-0 flex lg:justify-center pb-4", {
    variants: {
      dragging: {
        default: "snap-x snap-mandatory",
        active: "snap-none",
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}>
      <div className="flex gap-4 items-center flex-row justify-center">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
