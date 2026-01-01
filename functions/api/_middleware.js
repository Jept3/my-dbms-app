// Cloudflare Pages Functions Middleware
// This handles all API requests

import { createClient } from '@libsql/client/web';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleRequest(request, env) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Turso client
  const db = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  // Initialize database table
  await initializeDatabase(db);

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Route requests
    if (path === '/api/tasks' && request.method === 'GET') {
      return await getTasks(db);
    }
    
    if (path === '/api/tasks' && request.method === 'POST') {
      return await createTask(db, request);
    }
    
    if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updateTask(db, request, id);
    }
    
    if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteTask(db, id);
    }

    // If no route matches, return null to pass through
    return null;

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Initialize database table
async function initializeDatabase(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Get all tasks
async function getTasks(db) {
  const result = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
  
  return new Response(JSON.stringify(result.rows), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Create new task
async function createTask(db, request) {
  const { title, description, status } = await request.json();
  
  if (!title) {
    return new Response(JSON.stringify({ error: 'Title is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await db.execute({
    sql: 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
    args: [title, description || '', status || 'pending'],
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Update task
async function updateTask(db, request, id) {
  const { title, description, status } = await request.json();
  
  if (!title) {
    return new Response(JSON.stringify({ error: 'Title is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await db.execute({
    sql: 'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [title, description || '', status || 'pending', id],
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Delete task
async function deleteTask(db, id) {
  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Export the handler
export async function onRequest(context) {
  return await handleRequest(context.request, context.env);
}
