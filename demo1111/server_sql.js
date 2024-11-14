const fs = require('fs');
const express = require('express');
const db = require('./database'); // Import the database connection
const app = express();
app.use(express.json());
const PORT = 3000; // Use a different port to avoid conflict with the original server

app.use(express.static('public')); // Serve static files from the 'public' folder

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

// Mock function to simulate generating a comment from a prompt
function generateCommentFromPrompt(prompt) {
  // Replace this with actual model integration
  return `Generated comment based on prompt: ${prompt}`;
}

// Endpoint to update the prompt and generate a new comment
app.post('/update-prompt', (req, res) => {
  const { assignmentId, prompt } = req.body;

  if (!assignmentId || !prompt) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  // Simulate generating a new comment based on the updated prompt
  const newComment = `Generated comment based on prompt: ${prompt}`;

  // Respond with the new comment
  res.json({ assignment_id: assignmentId, new_comment: newComment });
});

// Endpoint to get assignment details
app.get('/get-assignment/:assignmentId', (req, res) => {
  const assignmentId = req.params.assignmentId;

  db.get('SELECT * FROM assignments WHERE assignmentId = ?', [assignmentId], (err, row) => {
    if (err) {
      console.error('Error fetching assignment:', err.message);
      res.status(500).json({ error: 'Failed to fetch assignment' });
    } else if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  });
});

// Endpoint to save the updated prompt and comment
app.post('/save-prompt', (req, res) => {
  const { assignmentId, prompt, comment } = req.body;

  if (!assignmentId || !prompt || !comment) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const updateQuery = `
    UPDATE assignments
    SET prompt = ?, comment = ?, timestamp = ?
    WHERE assignmentId = ?
  `;

  db.run(updateQuery, [prompt, comment, new Date().toISOString(), assignmentId], function(err) {
    if (err) {
      console.error('Error updating assignment:', err.message);
      return res.status(500).json({ error: 'Failed to update assignment' });
    }

    // Print the updated database content for debugging
    db.all('SELECT * FROM assignments', (err, rows) => {
      if (err) {
        console.error('Error fetching assignments:', err.message);
      } else {
        console.log('Current database content:', rows);
      }
    });

    res.json({ message: 'Prompt and comment saved successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 