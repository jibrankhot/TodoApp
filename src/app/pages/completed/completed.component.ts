import { Component, OnInit } from '@angular/core';
import { TodoService } from 'src/app/core/todo.service';
import { Todo } from 'src/app/core/todo.model';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss']
})
export class CompletedComponent implements OnInit {
  completedTodos: Todo[] = [];

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.completedTodos = this.todoService.getCompletedTodos();
  }
}
