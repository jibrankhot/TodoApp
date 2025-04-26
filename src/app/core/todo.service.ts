import { Injectable } from '@angular/core';
import { Todo } from './todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private todos: Todo[] = [];

  constructor() {
    const savedTodos = localStorage.getItem('todos');
    this.todos = savedTodos ? JSON.parse(savedTodos) : [];
  }

  getTodos(): Todo[] {
    return this.todos;
  }

  getCompletedTodos(): Todo[] {
    return this.todos.filter(todo => todo.completed);
  }

  addTodo(todo: Todo): void {
    this.todos.push(todo);
    this.saveToLocalStorage();
  }

  updateTodo(updatedTodo: Todo): void {
    const index = this.todos.findIndex(t => t.id === updatedTodo.id);
    if (index > -1) {
      this.todos[index] = updatedTodo;
      this.saveToLocalStorage();
    }
  }

  deleteTodo(id: number): void {
    
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}
