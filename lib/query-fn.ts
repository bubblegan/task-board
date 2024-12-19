import { BoardInput, BoardWithTasks, TaskInput } from "./types";

export async function fetchBoardData(): Promise<BoardWithTasks[]> {
  const response = await fetch("/api/boards");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function moveBoardApi(data: { boardId: number; toPos: number }) {
  return fetch(`/api/boards/${data.boardId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ toPos: data.toPos }),
  });
}

export async function sortBoardApi(data: {
  order: "title" | "createdAt";
  dir: "asc" | "desc";
  boardId: number;
}) {
  return fetch(`/api/boards/${data.boardId}/sort`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function createBoardApi(data: BoardInput) {
  return fetch("/api/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteBoardApi(data: { id: number }) {
  return fetch(`/api/boards/${data.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateBoardApi(data: BoardInput) {
  return fetch(`/api/boards/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function createTaskApi(data: TaskInput) {
  return fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateTaskApi(data: TaskInput) {
  return fetch(`/api/tasks/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteTaskApi(data: { id: number }) {
  return fetch(`/api/tasks/${data.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function moveTaskApi(data: {
  taskId: number;
  boardId: number;
  toPos: number;
}) {
  return fetch(`/api/tasks/${data.taskId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardId: data.boardId, toPos: data.toPos }),
  });
}
