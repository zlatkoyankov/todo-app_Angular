import { Priority } from "./priority.model";

export interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    category: string;
    priority: Priority;
    createdAt: Date;
    tags: string[];
    completedAt?: Date;
    modifiedAt?: Date;
    dueDate?: Date;
}