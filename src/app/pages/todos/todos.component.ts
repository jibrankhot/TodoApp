import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Todo } from 'src/app/core/todo.model';
import { TodoService } from 'src/app/core/todo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component'

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit {
  @ViewChild('titleInput') titleInput!: ElementRef;
  todoForm!: FormGroup;
  todos: Todo[] = [];
  selectedStatus: string = ''; // Initialize the status filter
  selectedDate: Date | null = null; // Initialize the date filter
  searchText: string = '';
  editMode: boolean = false;
  editingTodoId: number | null = null;
  filter: 'all' | 'completed' | 'pending' = 'all';

  constructor(
    private fb: FormBuilder,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos);
    }
    this.initForm();
    this.loadTodos();
  }

  initForm(): void {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['']
    });
  }

  trackByTodoId(index: number, todo: Todo): number {
    return todo.id;
  }

  resetFilters() {
    this.searchText = '';  // Clears the search text
    this.selectedStatus = '';  // Resets the status filter
    this.selectedDate = null;  // Clears the date filter
  }


  loadTodos(): void {
    this.todos = this.todoService.getTodos();
  }

  saveTodosToLocalStorage(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  addTodo(): void {
    if (this.todoForm.invalid) return;

    const formValue = this.todoForm.value;

    if (this.editMode && this.editingTodoId !== null) {
      // Editing existing task
      const index = this.todos.findIndex(t => t.id === this.editingTodoId);
      if (index > -1) {
        this.todos[index] = {
          ...this.todos[index],
          ...formValue,
        };
        this.showSnackbar('Task updated successfully!');
      }
      this.editMode = false;
      this.editingTodoId = null;
    } else {
      // Adding new task
      const newTodo = {
        id: Date.now(),
        ...formValue,
        completed: false,
      };
      this.todos.push(newTodo);
      this.showSnackbar('Task added successfully!');
      this.saveTodosToLocalStorage();
    }

    this.todoForm.reset();
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editingTodoId = null;
    this.todoForm.reset();
  }


  editTodo(todo: any): void {
    this.editMode = true;
    this.editingTodoId = todo.id;

    this.todoForm.patchValue({
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
    });
    setTimeout(() => {
      this.titleInput.nativeElement.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }


  markComplete(todo: Todo): void {
    todo.completed = true;
    this.todoService.updateTodo(todo);
    this.loadTodos();
    this.showSnackbar('Task marked as complete!');
    this.saveTodosToLocalStorage();
  }

  deleteTodo(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todoService.deleteTodo(id);
        this.loadTodos();
        this.showSnackbar('Task deleted!');
        this.saveTodosToLocalStorage();
      }
    });

  }


  confirmClearAll() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Clear All Tasks?',
        message: 'Are you sure you want to remove all tasks? This cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.todos = [];
        this.saveTodosToLocalStorage();
        this.showSnackbar('All tasks cleared!');
      }
    });
  }


  setFilter(value: 'all' | 'completed' | 'pending') {
    this.filter = value;
  }

  sortOrder: 'asc' | 'desc' = 'asc';

  setSortOrder(order: 'asc' | 'desc') {
    this.sortOrder = order;
  }

  filteredTodos() {
    return this.todos
      .filter(todo => {
        // Filter by status
        const matchesFilter =
          this.filter === 'all' ||
          (this.filter === 'completed' && todo.completed) ||
          (this.filter === 'pending' && !todo.completed);

        // Filter by search text
        const matchesSearch =
          !this.searchText ||
          todo.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
          todo.description?.toLowerCase().includes(this.searchText.toLowerCase());

        // Filter by selected due date
        const matchesDate =
          !this.selectedDate ||
          (todo.dueDate && new Date(todo.dueDate).toLocaleDateString() === new Date(this.selectedDate).toLocaleDateString());

        return matchesFilter && matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;

        return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }


  showSnackbar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

}
