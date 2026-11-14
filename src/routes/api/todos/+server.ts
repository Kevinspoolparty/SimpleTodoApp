import type { RequestHandler } from "./$types";
import { createTodo, listTodos } from '#lib/server/todos.js';

// TODO: write endpoints like I would normally (export async function [...]) if possible

/**
 * Fetch all currently saved to-dos from DB
 */
export const GET: RequestHandler = () => {
    const toDos = listTodos();
    
    return Response.json(toDos, { status: 200 });
};

/**
 * Add a new to-do to DB
 */
export const POST: RequestHandler = async ({ request }) => {
    let body: unknown;
    try {
        body = await request.json();
    }
    catch {
        return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (
        typeof body !== 'object' || body === null ||
        !('description' in body) || typeof body.description !== 'string' ||
        !body.description.trim()
    ) {
        return Response.json(
            {error: 'A description is required' }, 
            { status: 400 }
        );
    }

    const descriptionText = body.description.trim();
    const resultTodo = createTodo(descriptionText);
    return Response.json(resultTodo, { status: 201 });
};