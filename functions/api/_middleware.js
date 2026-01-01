// Cloudflare Pages Functions - JW Schedule Meetings API
// This handles all database operations using Turso's HTTP API

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

// Initialize database tables
async function initializeDatabase(env) {
  // Members table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      roles TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, [], env);
  
  // Meetings table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      theme TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, [], env);
  
  // Assignments table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      part TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id),
      FOREIGN KEY (member_id) REFERENCES members(id)
    )
  `, [], env);
}

// ============= MEMBERS =============

async function getMembers(env) {
  const result = await executeSQL('SELECT * FROM members ORDER BY name ASC', [], env);
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

async function createMember(request, env) {
  const { name, gender, roles } = await request.json();
  
  if (!name || !gender) {
    return new Response(JSON.stringify({ error: 'Name and gender are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'INSERT INTO members (name, gender, roles) VALUES (?, ?, ?)',
    [name, gender, roles || '[]'],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateMember(request, id, env) {
  const { name, gender, roles } = await request.json();
  
  if (!name || !gender) {
    return new Response(JSON.stringify({ error: 'Name and gender are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'UPDATE members SET name = ?, gender = ?, roles = ? WHERE id = ?',
    [name, gender, roles || '[]', id],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteMember(id, env) {
  // Also delete all assignments for this member
  await executeSQL('DELETE FROM assignments WHERE member_id = ?', [id], env);
  await executeSQL('DELETE FROM members WHERE id = ?', [id], env);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============= MEETINGS =============

async function getMeetings(env) {
  const result = await executeSQL('SELECT * FROM meetings ORDER BY date DESC', [], env);
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

async function createMeeting(request, env) {
  const { date, type, theme, notes } = await request.json();
  
  if (!date || !type) {
    return new Response(JSON.stringify({ error: 'Date and type are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'INSERT INTO meetings (date, type, theme, notes) VALUES (?, ?, ?, ?)',
    [date, type, theme || '', notes || ''],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteMeeting(id, env) {
  // Also delete all assignments for this meeting
  await executeSQL('DELETE FROM assignments WHERE meeting_id = ?', [id], env);
  await executeSQL('DELETE FROM meetings WHERE id = ?', [id], env);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============= ASSIGNMENTS =============

async function getAssignments(env) {
  const result = await executeSQL('SELECT * FROM assignments ORDER BY created_at DESC', [], env);
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

async function createAssignment(request, env) {
  const { meeting_id, member_id, part, details } = await request.json();
  
  if (!meeting_id || !member_id || !part) {
    return new Response(JSON.stringify({ error: 'Meeting, member, and part are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await executeSQL(
    'INSERT INTO assignments (meeting_id, member_id, part, details) VALUES (?, ?, ?, ?)',
    [meeting_id, member_id, part, details || ''],
    env
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteAssignment(id, env) {
  await executeSQL('DELETE FROM assignments WHERE id = ?', [id], env);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============= MAIN HANDLER =============

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

    // MEMBERS routes
    if (path === '/api/members' && request.method === 'GET') {
      return await getMembers(env);
    }
    if (path === '/api/members' && request.method === 'POST') {
      return await createMember(request, env);
    }
    if (path.match(/^\/api\/members\/\d+$/) && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updateMember(request, id, env);
    }
    if (path.match(/^\/api\/members\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteMember(id, env);
    }

    // MEETINGS routes
    if (path === '/api/meetings' && request.method === 'GET') {
      return await getMeetings(env);
    }
    if (path === '/api/meetings' && request.method === 'POST') {
      return await createMeeting(request, env);
    }
    if (path.match(/^\/api\/meetings\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteMeeting(id, env);
    }

    // ASSIGNMENTS routes
    if (path === '/api/assignments' && request.method === 'GET') {
      return await getAssignments(env);
    }
    if (path === '/api/assignments' && request.method === 'POST') {
      return await createAssignment(request, env);
    }
    if (path.match(/^\/api\/assignments\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteAssignment(id, env);
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
