/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { createTodo, getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  if (!USER_ID) {
    return <UserWarning />;
  }

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setError('');

    getTodos()
      .then(setTodos)
      .catch(() => setError('Unable to load todos'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setError('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  const handleAddTodo = () => {
    if (!newTodoTitle.trim()) {
      setError('Title should not be empty');

      return;
    }

    setError('');

    const newTodo = {
      userId: USER_ID,
      title: newTodoTitle.trim(),
      completed: false,
    };

    createTodo(newTodo)
      .then(createdTodo => {
        setTodos([...todos, createdTodo]);
        setNewTodoTitle('');
      })
      .catch(() => setError('Failed to create todo'));
  };

  const itemsLeft = todos.filter(todo => !todo.completed).length;

  const visibleTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={`todoapp__toggle-all ${todos.every(todo => todo.completed) && todos.length > 0 ? 'active' : ''}`}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleAddTodo}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={e => setNewTodoTitle(e.target.value)}
              disabled={isLoading}
            />
          </form>
        </header>

        {visibleTodos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            {visibleTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={`todo ${todo.completed ? 'completed' : ''}`}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {itemsLeft} {itemsLeft === 1 ? 'item' : 'items'} left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={e => {
                  e.preventDefault();
                  setFilter('all');
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={e => {
                  e.preventDefault();
                  setFilter('active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={e => {
                  e.preventDefault();
                  setFilter('completed');
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${error ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError('')}
        />
        {error}
      </div>
    </div>
  );
};
