const sqlite3 = require('sqlite3').verbose();

// Open database connection
const db = new sqlite3.Database('./database_updated.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the updated SQLite database.');
    
    // Create tables (if they do not exist)
    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId TEXT,
        teacher TEXT,
        comment TEXT,
        timestamp TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId TEXT UNIQUE,
        prompt TEXT
      )
    `, () => {
      // Insert initial data for feedback
      db.get("SELECT COUNT(*) AS count FROM feedback", (err, row) => {
        if (row.count === 0) { // Insert data if the table is empty
          const initialData = [
            ['A123', 'Mr. Smith', 'Excellent work!', '2024-11-01T10:15:30Z'],
            ['A123', 'Mr. Smith', 'Needs improvement in analysis.', '2024-11-02T11:00:00Z'],
            ['A123', 'Ms. Johnson', 'Good progress, keep it up!', '2024-11-01T10:45:30Z']
          ];

          const insertQuery = `
            INSERT INTO feedback (assignmentId, teacher, comment, timestamp)
            VALUES (?, ?, ?, ?)
          `;

          initialData.forEach(data => {
            db.run(insertQuery, data);
          });

          console.log('Initial feedback data inserted into the updated database.'); 
        }
      });

      // Insert initial data for prompts
      db.get("SELECT COUNT(*) AS count FROM prompts", (err, row) => {
        if (row.count === 0) { // Insert data if the table is empty
          const initialPrompts = [
            ['A123', 'Initial prompt for assignment A123']
          ];

          const insertPromptQuery = `
            INSERT INTO prompts (assignmentId, prompt)
            VALUES (?, ?)
          `;

          initialPrompts.forEach(data => {
            db.run(insertPromptQuery, data);
          });

          console.log('Initial prompt data inserted into the updated database.');
        }
      });
    });
  }
});

module.exports = db; 