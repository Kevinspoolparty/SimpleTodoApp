import type { Todo } from "#lib/types/Todo.js";
import type { TodoRow } from "#lib/types/TodoRow.ts";
import db from "./db";

/* prepared statements for DB transactions */
const getAllTodosStatement = db.prepare(`
    select id, description, inactive, archived
    from todos
    order by id;`
);
const getAllActiveTodosStatement = db.prepare(`
    select id, description, inactive, archived
    from todos
    where archived = 0
    order by id;`
);
const getTodoByIdStatement = db.prepare(`
    select id, description, inactive, archived
    from todos
    where id = ?`
);
const addTodoStatement = db.prepare(`
    insert into todos (description)
    values (?)
`);
const deleteTodoStatement = db.prepare(`
    delete from todos
    where id = ?;`
);
const updateTodoStatement = db.prepare(`
    update todos
    set inactive = coalesce(?, inactive), 
        archived = coalesce(?, archived)
    where id = ?;`
);

/**
 * Transforms a todo-object from the DB into a todo-object for use in the frontend
 * @param row To-do-row from DB
 * @returns To-do object for frontend
 */
export function rowToTodo(row: TodoRow): Todo {
    const todo: Todo = {
        id: row.id,
        description: row.description,
        inactive: Boolean(row.inactive),
        archived: Boolean(row.archived)
    }

    return todo;
}

/**
 * Returns all todos if not stated differently
 * @param includeArchived determines if returned todos should include archived ones
 */
export function listTodos(includeArchived = false): Todo[] {
    let dbTodos: TodoRow[];
    if (includeArchived) {
        dbTodos = getAllTodosStatement.all() as TodoRow[];
    } else {
        dbTodos = getAllActiveTodosStatement.all() as TodoRow[];
    }

    return dbTodos.map(rowToTodo);
}

/**
 * Fetches a Todo from DB based on ID
 * @param id the todo's ID
 */
export function getTodo(id: number): Todo | undefined {
    const dbTodo = getTodoByIdStatement.get(id) as TodoRow | undefined;
    
    if (dbTodo) {
        return rowToTodo(dbTodo);
    }
    return undefined;
}

/**
 * Inserts a new todo into DB based on the given description
 * @param description the new todo's description
 */
export function createTodo(description: string): Todo {
    const result = addTodoStatement.run(description);
    const newTodo: Todo = {
        id: Number(result.lastInsertRowid),
        description: description,
        inactive: false,
        archived: false
    }

    return newTodo;
}

/**
 * Deletes a given todo from DB
 * @param id the Todo's ID
 */
export function deleteTodo(id: number): boolean {
    const result = deleteTodoStatement.run(id);
    return result.changes > 0;
}

/**
 * Update a given Todo-item
 * @param id the to-be-updated todo's ID
 * @param changes determines whether Todo should be archived or put inactive
 * @returns the updated Todo
 */
export function updateTodo(
    id: number, 
    changes: { inactive?: boolean, archived?: boolean }): Todo | undefined 
{
    const result = updateTodoStatement.run(
        boolToDbValue(changes.inactive), 
        boolToDbValue(changes.archived), 
        id
    );

    if (result.changes > 0) {
        return getTodo(id);
    } else {
        return undefined;
    }
}

/**
 * Turns a boolean/undefined into as sqlite-compatible value
 */
function boolToDbValue(value?: boolean) {
    if (value === undefined) {
        return null;
    } else {
        return Number(value);
    }
}