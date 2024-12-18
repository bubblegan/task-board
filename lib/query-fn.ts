import { BoardWithTasks } from "./types";

export async function fetchBoardData(): Promise<BoardWithTasks[]> {
  const response = await fetch("/api/boards");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}
