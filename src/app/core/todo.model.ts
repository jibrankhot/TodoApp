export interface Todo {

    id: number;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: any;
    completed: boolean;
}