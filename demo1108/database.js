const sqlite3 = require('sqlite3').verbose();

// 打开数据库连接
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // 创建表（如果尚未创建）
    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId TEXT,
        teacher TEXT,
        comment TEXT,
        timestamp TEXT
      )
    `, () => {
      // 插入初始数据
      db.get("SELECT COUNT(*) AS count FROM feedback", (err, row) => {
        console.log('row:', row);
        if (row.count === 0) { // 表为空时插入数据
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

          console.log('Initial data inserted into the database.'); 
        }
      });
    });
  }
});

module.exports = db;
