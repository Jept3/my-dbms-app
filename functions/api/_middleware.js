// JW Schedule Meetings - Complete Backend API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
        { type: 'execute', stmt: { sql, args: args || [] } },
        { type: 'close' }
      ]
    })
  });

  if (!response.ok) throw new Error(`Database error: ${response.statusText}`);
  
  const result = await response.json();
  return result.results[0].response;
}

function parseRows(result) {
  if (!result.result || !result.result.rows) return [];
  return result.result.rows.map(row => {
    const obj = {};
    result.result.cols.forEach((col, i) => {
      obj[col.name] = row[i].value;
    });
    return obj;
  });
}

async function initializeDatabase(env) {
  // People table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      category TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, [], env);

  // Cycles table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS schedule_cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, [], env);

  // Meetings table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS schedule_meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_id INTEGER NOT NULL,
      meeting_date TEXT NOT NULL,
      sequence_no INTEGER,
      week_title TEXT,
      week_reading TEXT,
      opening_song_no TEXT,
      opening_song_title TEXT,
      middle_song_no TEXT,
      middle_song_title TEXT,
      closing_song_no TEXT,
      closing_song_title TEXT,
      kayamanan_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cycle_id) REFERENCES schedule_cycles(id)
    )
  `, [], env);

  // Slot definitions (for assignments)
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS slot_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      active INTEGER DEFAULT 1
    )
  `, [], env);

  // Insert default slots if not exists
  const slots = [
    ['chairman', 'Chairman'],
    ['opening_prayer', 'Opening Prayer'],
    ['closing_prayer', 'Closing Prayer'],
    ['kayamanan', 'Kayamanan Part 1'],
    ['hiyas', 'Espirituwal na Hiyas'],
    ['bible_reading', 'Bible Reading'],
    ['cbs_reader_phar', 'CBS Reader Paragraph'],
    ['cbs_reader_bible', 'CBS Reader Bible']
  ];

  for (const [key, label] of slots) {
    await executeSQL(`INSERT OR IGNORE INTO slot_definitions (slot_key, label) VALUES (?, ?)`, [key, label], env);
  }

  // Assignments table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS meeting_slot_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      slot_id INTEGER NOT NULL,
      person_id INTEGER,
      part_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES schedule_meetings(id),
      FOREIGN KEY (slot_id) REFERENCES slot_definitions(id),
      FOREIGN KEY (person_id) REFERENCES persons(id)
    )
  `, [], env);

  // MM rows
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS meeting_ministry_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      part_no TEXT,
      part_title TEXT,
      publisher_id INTEGER,
      householder_id INTEGER,
      FOREIGN KEY (meeting_id) REFERENCES schedule_meetings(id),
      FOREIGN KEY (publisher_id) REFERENCES persons(id),
      FOREIGN KEY (householder_id) REFERENCES persons(id)
    )
  `, [], env);

  // PBK rows
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS meeting_pbk_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      part_no TEXT,
      part_title TEXT,
      speaker_id INTEGER,
      FOREIGN KEY (meeting_id) REFERENCES schedule_meetings(id),
      FOREIGN KEY (speaker_id) REFERENCES persons(id)
    )
  `, [], env);
}

// ========== PEOPLE ==========

async function getPeople(env) {
  const result = await executeSQL('SELECT * FROM persons WHERE active=1 ORDER BY full_name ASC', [], env);
  return new Response(JSON.stringify(parseRows(result)), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createPerson(request, env) {
  const { full_name, category } = await request.json();
  await executeSQL('INSERT INTO persons (full_name, category) VALUES (?, ?)', [full_name, category], env);
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deletePerson(id, env) {
  await executeSQL('UPDATE persons SET active=0 WHERE id=?', [id], env);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ========== CYCLES ==========

async function getCycles(env) {
  const result = await executeSQL('SELECT * FROM schedule_cycles ORDER BY id DESC', [], env);
  return new Response(JSON.stringify(parseRows(result)), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createCycle(request, env) {
  const { title, start_date, end_date } = await request.json();
  
  // Create cycle
  await executeSQL('INSERT INTO schedule_cycles (title, start_date, end_date) VALUES (?, ?, ?)', 
    [title, start_date, end_date], env);
  
  // Get cycle ID
  const cycleResult = await executeSQL('SELECT last_insert_rowid() as id', [], env);
  const cycleId = parseRows(cycleResult)[0].id;
  
  // Generate Thursdays
  const start = new Date(start_date);
  const end = new Date(end_date);
  let current = new Date(start);
  let sequence = 1;
  
  // Find first Thursday
  while (current.getDay() !== 4) {
    current.setDate(current.getDate() + 1);
  }
  
  // Generate all Thursdays
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    await executeSQL(
      'INSERT INTO schedule_meetings (cycle_id, meeting_date, sequence_no) VALUES (?, ?, ?)',
      [cycleId, dateStr, sequence],
      env
    );
    current.setDate(current.getDate() + 7);
    sequence++;
  }
  
  return new Response(JSON.stringify({ success: true, cycle_id: cycleId }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteCycle(id, env) {
  // Delete MM rows
  await executeSQL('DELETE FROM meeting_ministry_rows WHERE meeting_id IN (SELECT id FROM schedule_meetings WHERE cycle_id=?)', [id], env);
  // Delete PBK rows
  await executeSQL('DELETE FROM meeting_pbk_rows WHERE meeting_id IN (SELECT id FROM schedule_meetings WHERE cycle_id=?)', [id], env);
  // Delete assignments
  await executeSQL('DELETE FROM meeting_slot_assignments WHERE meeting_id IN (SELECT id FROM schedule_meetings WHERE cycle_id=?)', [id], env);
  // Delete meetings
  await executeSQL('DELETE FROM schedule_meetings WHERE cycle_id=?', [id], env);
  // Delete cycle
  await executeSQL('DELETE FROM schedule_cycles WHERE id=?', [id], env);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getCycleMeetings(cycleId, env) {
  const result = await executeSQL('SELECT * FROM schedule_meetings WHERE cycle_id=? ORDER BY meeting_date ASC', [cycleId], env);
  return new Response(JSON.stringify(parseRows(result)), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ========== MEETINGS ==========

async function getMeetingDetails(meetingId, env) {
  // Get meeting
  const meetingResult = await executeSQL('SELECT * FROM schedule_meetings WHERE id=?', [meetingId], env);
  const meeting = parseRows(meetingResult)[0];
  
  // Get assignments
  const assignmentsResult = await executeSQL(`
    SELECT sa.*, sd.slot_key 
    FROM meeting_slot_assignments sa
    JOIN slot_definitions sd ON sd.id = sa.slot_id
    WHERE sa.meeting_id=?
  `, [meetingId], env);
  const assignments = parseRows(assignmentsResult);
  
  const assignmentMap = {};
  assignments.forEach(a => {
    assignmentMap[a.slot_key] = a.person_id;
    if (a.slot_key === 'kayamanan') assignmentMap.kayamanan_title = a.part_title;
  });
  
  // Get MM rows
  const mmResult = await executeSQL('SELECT * FROM meeting_ministry_rows WHERE meeting_id=? ORDER BY sort_order ASC', [meetingId], env);
  const mm_rows = parseRows(mmResult);
  
  // Get PBK rows
  const pbkResult = await executeSQL('SELECT * FROM meeting_pbk_rows WHERE meeting_id=? ORDER BY sort_order ASC', [meetingId], env);
  const pbk_rows = parseRows(pbkResult);
  
  return new Response(JSON.stringify({ meeting, assignments: assignmentMap, mm_rows, pbk_rows }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateMeeting(request, meetingId, env) {
  const data = await request.json();
  const fields = [];
  const values = [];
  
  Object.keys(data).forEach(key => {
    fields.push(`${key}=?`);
    values.push(data[key]);
  });
  
  if (fields.length > 0) {
    values.push(meetingId);
    await executeSQL(`UPDATE schedule_meetings SET ${fields.join(', ')} WHERE id=?`, values, env);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function saveMeetingAssignment(request, meetingId, env) {
  const { slot_key, person_id, part_title } = await request.json();
  
  // Get slot ID
  const slotResult = await executeSQL('SELECT id FROM slot_definitions WHERE slot_key=?', [slot_key], env);
  const slots = parseRows(slotResult);
  if (slots.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid slot' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const slotId = slots[0].id;
  
  // Delete existing
  await executeSQL('DELETE FROM meeting_slot_assignments WHERE meeting_id=? AND slot_id=?', [meetingId, slotId], env);
  
  // Insert new
  if (person_id) {
    await executeSQL(
      'INSERT INTO meeting_slot_assignments (meeting_id, slot_id, person_id, part_title) VALUES (?, ?, ?, ?)',
      [meetingId, slotId, person_id, part_title || null],
      env
    );
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ========== MM ROWS ==========

async function createMMRow(request, meetingId, env) {
  const { part_no, part_title, publisher_id, householder_id } = await request.json();
  
  // Get max sort order
  const maxResult = await executeSQL('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM meeting_ministry_rows WHERE meeting_id=?', [meetingId], env);
  const maxOrder = parseRows(maxResult)[0].max_order;
  
  await executeSQL(
    'INSERT INTO meeting_ministry_rows (meeting_id, sort_order, part_no, part_title, publisher_id, householder_id) VALUES (?, ?, ?, ?, ?, ?)',
    [meetingId, maxOrder + 1, part_no, part_title, publisher_id, householder_id],
    env
  );
  
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateMMRow(request, rowId, env) {
  const { part_no, part_title, publisher_id, householder_id } = await request.json();
  await executeSQL(
    'UPDATE meeting_ministry_rows SET part_no=?, part_title=?, publisher_id=?, householder_id=? WHERE id=?',
    [part_no, part_title, publisher_id, householder_id, rowId],
    env
  );
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deleteMMRow(rowId, env) {
  await executeSQL('DELETE FROM meeting_ministry_rows WHERE id=?', [rowId], env);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ========== PBK ROWS ==========

async function createPBKRow(request, meetingId, env) {
  const { part_no, part_title, speaker_id } = await request.json();
  
  const maxResult = await executeSQL('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM meeting_pbk_rows WHERE meeting_id=?', [meetingId], env);
  const maxOrder = parseRows(maxResult)[0].max_order;
  
  await executeSQL(
    'INSERT INTO meeting_pbk_rows (meeting_id, sort_order, part_no, part_title, speaker_id) VALUES (?, ?, ?, ?, ?)',
    [meetingId, maxOrder + 1, part_no, part_title, speaker_id],
    env
  );
  
  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updatePBKRow(request, rowId, env) {
  const { part_no, part_title, speaker_id } = await request.json();
  await executeSQL(
    'UPDATE meeting_pbk_rows SET part_no=?, part_title=?, speaker_id=? WHERE id=?',
    [part_no, part_title, speaker_id, rowId],
    env
  );
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function deletePBKRow(rowId, env) {
  await executeSQL('DELETE FROM meeting_pbk_rows WHERE id=?', [rowId], env);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ========== MAIN ROUTER ==========

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    await initializeDatabase(env);

    // PEOPLE
    if (path === '/api/people' && request.method === 'GET') return await getPeople(env);
    if (path === '/api/people' && request.method === 'POST') return await createPerson(request, env);
    if (path.match(/^\/api\/people\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deletePerson(id, env);
    }

    // CYCLES
    if (path === '/api/cycles' && request.method === 'GET') return await getCycles(env);
    if (path === '/api/cycles' && request.method === 'POST') return await createCycle(request, env);
    if (path.match(/^\/api\/cycles\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteCycle(id, env);
    }
    if (path.match(/^\/api\/cycles\/\d+\/meetings$/)) {
      const id = path.split('/')[3];
      return await getCycleMeetings(id, env);
    }

    // MEETINGS
    if (path.match(/^\/api\/meetings\/\d+$/) && request.method === 'GET') {
      const id = path.split('/')[3];
      return await getMeetingDetails(id, env);
    }
    if (path.match(/^\/api\/meetings\/\d+$/) && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updateMeeting(request, id, env);
    }
    if (path.match(/^\/api\/meetings\/\d+\/assignments$/)) {
      const id = path.split('/')[3];
      return await saveMeetingAssignment(request, id, env);
    }

    // MM ROWS
    if (path.match(/^\/api\/meetings\/\d+\/mm-rows$/)) {
      const id = path.split('/')[3];
      return await createMMRow(request, id, env);
    }
    if (path.match(/^\/api\/mm-rows\/\d+$/) && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updateMMRow(request, id, env);
    }
    if (path.match(/^\/api\/mm-rows\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deleteMMRow(id, env);
    }

    // PBK ROWS
    if (path.match(/^\/api\/meetings\/\d+\/pbk-rows$/)) {
      const id = path.split('/')[3];
      return await createPBKRow(request, id, env);
    }
    if (path.match(/^\/api\/pbk-rows\/\d+$/) && request.method === 'PUT') {
      const id = path.split('/')[3];
      return await updatePBKRow(request, id, env);
    }
    if (path.match(/^\/api\/pbk-rows\/\d+$/) && request.method === 'DELETE') {
      const id = path.split('/')[3];
      return await deletePBKRow(id, env);
    }

    return null;

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
