const fs = require('fs');
const express = require('express');
const db = require('./database'); // Import the database connection
const app = express();
app.use(express.json());
const PORT = 3000;

app.use(express.static('public')); // Serve static files from the 'public' folder

// Endpoint to retrieve feedback for a specific assignment, grouped by teacher and sorted by timestamp
app.get('/get-feedback/:assignmentId', (req, res) => {
  const assignmentId = req.params.assignmentId;
  console.log(`Fetching feedback for assignment ID: ${assignmentId}`);
  console.log('db:', db);

  // SQL query to get the latest teacher feedback for a specific assignment
  const query = `
    SELECT teacher, comment, timestamp
    FROM feedback
    WHERE assignmentId = ?
    AND timestamp = (
      SELECT MAX(timestamp)
      FROM feedback AS sub
      WHERE sub.teacher = feedback.teacher
      AND sub.assignmentId = feedback.assignmentId
    )
    ORDER BY teacher
  `;

  db.all(query, [assignmentId], (err, rows) => {
    if (err) {
      console.error("Error fetching feedback:", err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }

    // Group feedback by teacher, with the latest comment
    const feedback = rows.reduce((acc, row) => {
      acc[row.teacher] = {
        comment: row.comment,
        timestamp: row.timestamp
      };
      return acc;
    }, {});

    res.json({ assignment_id: assignmentId, feedback });
  });
});

// Endpoint to save updated feedback for a specific assignment and teacher
app.post('/update-feedback', (req, res) => {
  const newData = req.body;
  console.log('Received data for update:', newData);

  if (!newData.assignment_id || !newData.feedback || typeof newData.feedback !== 'object') {
    return res.status(400).json({ error: "Invalid data format" });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    Object.entries(newData.feedback).forEach(([teacher, comments]) => {
      const insertQuery = `
        INSERT INTO feedback (assignmentId, teacher, comment, timestamp)
        VALUES (?, ?, ?, ?)
      `;
      const updateQuery = `
        UPDATE feedback
        SET comment = ?, timestamp = ?
        WHERE assignmentId = ? AND teacher = ? AND comment = ?
      `;

      // Ensure comments is an array
      if (!Array.isArray(comments)) {
        comments = [comments];
      }

      comments.forEach(comment => {
        const { comment: commentText, timestamp } = comment;

        // Check if the comment already exists
        db.get(`
          SELECT comment
          FROM feedback
          WHERE assignmentId = ? AND teacher = ?
          ORDER BY timestamp DESC
          LIMIT 1
        `, [newData.assignment_id, teacher], (err, row) => {
          if (err) {
            console.error("Error checking feedback:", err.message);
            return;
          }

          if (row && row.comment === commentText) {
            // Comment text is the same, do nothing
            console.log(`No changes for ${teacher}'s comment.`);
          } else {
            // Comment text is different, update or insert
            if (row) {
              // Update the comment and timestamp of the existing comment
              db.run(updateQuery, [
                commentText,
                new Date().toISOString(),
                newData.assignment_id,
                teacher,
                row.comment
              ], (err) => {
                if (err) console.error("Error updating feedback:", err.message);
              });
            } else {
              // Insert the new comment
              db.run(insertQuery, [
                newData.assignment_id,
                teacher,
                commentText,
                new Date().toISOString()
              ], (err) => {
                if (err) console.error("Error inserting feedback:", err.message);
              });
            }
          }
        });
      });
    });

    db.run('COMMIT', (commitErr) => {
      if (commitErr) {
        console.error("Transaction commit error:", commitErr.message);
        res.status(500).json({ error: 'Failed to save data' });
      } else {
        // Fetch and display the complete database
        db.all('SELECT * FROM feedback', (err, rows) => {
          if (err) {
            console.error("Error fetching complete database:", err.message);
          } else {
            console.log("Complete database:", rows);
          }
        });
        res.json({ message: 'Data updated successfully' });
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});