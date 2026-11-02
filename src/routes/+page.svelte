<script lang="ts">
	import type { Todo } from "#lib/types/todo.ts";
	import { onMount } from "svelte";

    let todos: Todo[] = $state([]); 

    let error: string = $state('');
    let appReady: boolean = $state(false);
    let backgroundProcess: boolean = $state(false);

    // input fields
    let todoInputField: string = $state('');

    /**
     * Initial loading of To-do-objects
     */
    onMount(async () => {
        try {
            const fetchedTodos = await fetch('/api/todos');

            if (!fetchedTodos.ok) {
                throw new Error('Could not load todos.');
            }

            todos = await fetchedTodos.json();
        } catch {
            error = 'Failed to load todos.';
        } finally {
            appReady = true;
        }
    });

    /**
     * Removes a given todo from the list and the DB
     * @param todo
     */
    function removeTodo(todo: Todo) {
        todos = todos.filter(t => t.id !== todo.id);

        // TODO: add new endpoint for this
    }

    /**
     * Adds a new todo to the list and the DB
     */
    async function addTodo() {
        const description = todoInputField.trim();

        if (!description || backgroundProcess) return;

        backgroundProcess = true;
        error = '';

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ description })
            });

            if (!response.ok) {
                throw new Error('Could not add todo.');
            }

            const todo: Todo = await response.json();

            todos = [...todos, todo];
            todoInputField = '';
        } catch {
            error = 'Failed to add todo.';
        } finally {
            backgroundProcess = false;
        }
    }

    /**
     * 
     * @param todo
     */
    async function checkOffTodo(todo: Todo) {
        // TODO: add new endpoint for this
    }
</script>

<svelte:head>
    <title>To-do tracker</title>
</svelte:head>

<main>
    {#if error}
        <p class="error">{error}</p>
    {/if}

    {#if appReady}
        <h1>To-do tracker</h1>

        {#each todos as todo (todo.id)}
            <div class="todo-div">
                <input 
                    type="checkbox" 
                    bind:checked={todo.inactive} 
                    aria-label="Mark {todo.description} inactive"
                    onclick={async () => {
                        await checkOffTodo(todo);
                    }}
                />
                <p>{todo.description}</p>
                <button onclick={() => {
                    removeTodo(todo);}
                }
                >Remove</button>
            </div>  
        {/each}

        <hr />

        <div class="todo-input">
            <input type="text" bind:value={todoInputField} placeholder="New To-do" />
            <button disabled={backgroundProcess} onclick={async () => {
                await addTodo();
            }}>Add To-do</button>
        </div>
    {:else}
        <p>Loading...</p>
    {/if}
</main>

<style>
    /* TODO: add spacing between the different parts */
    .todo-div {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .todo-div p {
        flex: 1;
    }
</style>
