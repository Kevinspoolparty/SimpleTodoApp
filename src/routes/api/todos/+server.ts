import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import db from '#lib/server/db.ts';
import type { Todo } from '#lib/types/todo.ts';

const getTodos = db.prepare(`
    SELECT id, description, inactive
    FROM todos
    ORDER BY id
`);

export const GET: RequestHandler = () => {
    const rows = getTodos.all() as Todo[];
    const todos = rows.map(todo => ({
        ...todo,
        inactive: Boolean(todo.inactive)
    }));

    // TODO: replace with no longer deprecated package
    return json(todos);
};

export const POST: RequestHandler = async ({ request }) => {
    const body: unknown = await request.json();

    if (
        typeof body !== 'object' ||
        body === null ||
        !('description' in body) ||
        typeof body.description !== 'string' ||
        !body.description.trim()
    ) {
        return json(
            { error: 'A description is required.' },
            { status: 400 }
        );
    }

    const descriptionText = body.description.trim();

    const result = db.prepare(`
        INSERT INTO todos (description, inactive)
        VALUES (?, ?)
    `).run(descriptionText, 0);

    const todo: Todo = {
        id: Number(result.lastInsertRowid),
        description: descriptionText,
        inactive: false
    };

    // TODO: replace with non-deprecated package
    return json(todo, { status: 201 }); 
};

// TODO: add patch and delete endpoints for updating and deleting todos