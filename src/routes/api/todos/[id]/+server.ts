import { deleteTodo, updateTodo } from "#lib/server/todos.js";
import type { RequestHandler } from "./$types";

/**
 * Delete to-do from DB
 */
export const DELETE: RequestHandler = ({ params }) => {
    const id = parseId(params.id);
    if (id === null) {
        return returnInvalidId();
    }

    const changeSuccesful = deleteTodo(id);
    if (changeSuccesful) {
        return Response.json(null, { status: 204 });
    }
    return returnNotFoundTodo();
}

/**
 * Mark to-do as inactive or archived in DB
 */
export const PATCH: RequestHandler = async ({ params, request }) => {
    const todoId = parseId(params.id);
    if (todoId === null) {
        return returnInvalidId();
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Body must be valid JSON.' }, { status: 400 });
    }
    if (typeof body !== 'object' || body === null) {
        return Response.json({ error: 'Body must be an object.' }, { status: 400 });
    }
    
    const { inactive, archived } = body as Record<string, unknown>;
    if (!isOptionalBool(inactive) || !isOptionalBool(archived) ||
        (inactive === undefined && archived === undefined)) {
        return Response.json(
            { error: 'Provide "inactive" and/or "archived" as booleans.' },
            { status: 400 }
        );
    }

    const updated = updateTodo(todoId, {
        inactive: inactive as boolean | undefined,
        archived: archived as boolean | undefined
    });

    if (updated) {
        return Response.json(updated);
    }
    return returnNotFoundTodo();
}

/**
 * Parses given ID from URL into number
 */
function parseId(input: string): number | null {
    const id = Number(input);
    
    if (Number.isInteger(id) && id > 0) {
        return id;
    }
    return null;
}

function returnInvalidId() {
    return Response.json({ error: 'Invalid ID' }, { status: 400 });
}

function returnNotFoundTodo() {
    return Response.json({error: 'Todo not found' }, { status: 404 });
}

function isOptionalBool(input: unknown) {
    return input === undefined || typeof(input) === 'boolean';
}