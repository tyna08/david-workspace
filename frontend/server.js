const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let assignments = [];

app.get('/api/assignments', (req, res) => {
  res.json(assignments);
});

app.post('/api/assignments', (req, res) => {
  const assignment = { id: Date.now(), ...req.body, status: 'pending', submissions: [] };
  assignments.push(assignment);
  res.json(assignment);
});

app.put('/api/assignments/:id/submit', (req, res) => {
  const assignment = assignments.find(a => a.id === parseInt(req.params.id));
  if (assignment) {
    assignment.status = 'submitted';
    assignment.submissions.push(req.body);
    res.json(assignment);
  } else {
    res.status(404).json({ error: 'Assignment not found' });
  }
});

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});