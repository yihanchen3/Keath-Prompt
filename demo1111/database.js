const sqlite3 = require('sqlite3').verbose();

// Open database connection
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the updated SQLite database.');
    
    // Create tables (if they do not exist)
    db.run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId TEXT,
        assignmentContent TEXT,
        prompt TEXT,
        comment TEXT,
        timestamp TEXT
      )
    `, () => {
      // Insert initial data for assignments
      db.get("SELECT COUNT(*) AS count FROM assignments", (err, row) => {
        if (row.count === 0) { // Insert data if the table is empty
          const initialAssignments = [
            ['A123', 'Large Language Models (LLMs) are a type of artificial intelligence model designed to understand and generate human language. They are trained on vast amounts of text data and can perform a variety of language tasks, such as translation, summarization, and conversation. LLMs have applications in numerous fields, including customer service, content creation, and education.', 'Initial prompt for assignment A123', 'Initial comment based on the prompt', new Date().toISOString()]
          ];

          const insertAssignmentQuery = `
            INSERT INTO assignments (assignmentId, assignmentContent, prompt, comment, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `;

          initialAssignments.forEach(data => {
            db.run(insertAssignmentQuery, data);
          });

          console.log('Initial assignment data inserted into the updated database.');
        }
      });
    });
  }
});

module.exports = db; 