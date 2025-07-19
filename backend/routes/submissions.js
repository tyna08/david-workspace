const express = require('express');
const router = express.Router();

// This will store submissions separately if needed
let submissions = [];

// GET all submissions
router.get('/', (req, res) => {
  res.json(submissions);
});

// GET submissions by student
router.get('/student/:studentId', (req, res) => {
  const studentSubmissions = submissions.filter(
    sub => sub.studentId === req.params.studentId
  );
  res.json(studentSubmissions);
});

// POST new submission
router.post('/', (req, res) => {
  const newSubmission = {
    id: submissions.length + 1,
    assignmentId: req.body.assignmentId,
    studentId: req.body.studentId,
    content: req.body.content,
    files: req.body.files || [],
    submittedAt: new Date().toISOString(),
    grade: null
  };
  
  submissions.push(newSubmission);
  res.status(201).json(newSubmission);
});

module.exports = router;
