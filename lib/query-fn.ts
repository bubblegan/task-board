import { BoardInput, BoardWithTasks, TaskInput } from "./types";

export async function fetchBoardData(): Promise<BoardWithTasks[]> {
  const response = await fetch("/api/boards");
  if (!response.ok) {
    throw new Error("Error on fetching");
  }
  return response.json();
}

export async function moveBoardApi(data: { boardId: number; toPos: number }) {
  const response = await fetch(`/api/boards/${data.boardId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ toPos: data.toPos }),
  });

  if (!response.ok) {
    throw new Error("Error on moving board");
  }
  return response.json();
}

export async function sortBoardApi(data: {
  order: "title" | "dueDate";
  dir: "asc" | "desc";
  boardId: number;
}) {
  const response = await fetch(`/api/boards/${data.boardId}/sort`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on sorting board");
  }
  return response.json();
}

export async function createBoardApi(data: BoardInput) {
  const response = await fetch("/api/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on creating board");
  }
  return response.json();
}

export async function deleteBoardApi(data: { id: number }) {
  const response = await fetch(`/api/boards/${data.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on delete board");
  }
  return response.json();
}

export async function updateBoardApi(data: BoardInput) {
  const response = await fetch(`/api/boards/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on update board");
  }
  return response.json();
}

export async function createTaskApi(data: TaskInput) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Error on create task");
  }
  return response.json();
}

export async function updateTaskApi(data: TaskInput) {
  const response = await fetch(`/api/tasks/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on update task");
  }
  return response.json();
}

export async function deleteTaskApi(data: { id: number }) {
  const response = await fetch(`/api/tasks/${data.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error on delete task");
  }
  return response.json();
}

export async function moveTaskApi(data: { taskId: number; boardId: number; toPos: number }) {
  const response = await fetch(`/api/tasks/${data.taskId}/move`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardId: data.boardId, toPos: data.toPos }),
  });

  if (!response.ok) {
    throw new Error("Error on moving task");
  }
  return response.json();
}
