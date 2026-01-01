// Cloudflare Pages Functions - Turso Database API
// This handles all API requests using Turso's HTTP API

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Execute SQL query using Turso HTTP API
async function executeSQL(sql, args, env) {
  const dbUrl = env.TURSO_DATABASE_URL.replace('libsql://', 'https://');
  const url = `${dbUrl}/v2/pipeline`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.TURSO_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql,
            args: args || []
          }
        },
        {
          type: 'close'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Database error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.results[0].response;
}

// Initialize database
async function initializeDatabase(env) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await executeSQL(createTableSQL, [], env);
}

// Get all tasks
async function getTasks(env) {
  const result = await executeSQL('SELECT * FROM tasks ORDER BY created_at DESC', [], env);
  const rows = result.result.rows.map(row => {
    const obj = {};
    result.result.cols.forEach((col, i) => {
      obj[col.name] = row[i].value;
    });
    return obj;
  });
  
  return new Response(JSON.stringify(rows), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Create new task
async function createTask(request, env) {
  const { title, description, status } = await request.json();
  
  if (!title) {
    return new Response(JSON.stringify({ error: 'Title is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
    [title, description || '', status || 'pending'],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Update task
async function updateTask(request, id, env) {
  const { title, description, status } = await request.json();
  
  if (!title) {
    return new Response(JSON.stringify({ error: 'Title is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description || '', status || 'pending', id],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Delete task
async function deleteTask(id, env) {
  await executeSQL('DELETE FROM tasks WHERE id = ?', [id], env);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Main request handler
export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Initialize database on first request
    await initializeDatabase(env);

    // Route requests
    if (path === '/api/tasks' && request.method === 'GET') {
      return await getTasks(env);
    }
    
    if (path === '/api/tasks' && request.method === 'POST') {
      return await createTask(request, env);
    }
    
    if (path.startsWith('/api/tasks/') && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updateTask(request, id, env);
    }
    
    if (path.startsWith('/api/tasks/') && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteTask(id, env);
    }

    // If no route matches, pass through
    return null;

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
