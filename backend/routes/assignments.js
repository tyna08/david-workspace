const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET all assignments
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all assignments');
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET assignments for a specific subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const subject = req.params.subject;
    console.log('Fetching assignments for subject:', subject);
    
    const assignments = await Assignment.find({ subject }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments by subject:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET single assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// POST new assignment (create)
router.post('/', async (req, res) => {
  try {
    console.log('Creating new assignment:', req.body);
    
    const newAssignment = new Assignment({
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
      dueDate: req.body.dueDate,
      attachments: req.body.attachments || [],
      status: 'pending',
      submissions: []
    });
    
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT submit assignment (student submission)
router.put('/:id/submit', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    const submission = {
      studentId: req.body.studentId || 'student1',
      submittedAt: new Date(),
      content: req.body.content,
      files: req.body.files || [],
      grade: null
    };
    
    assignment.submissions.push(submission);
    assignment.status = 'submitted';
    
    const updatedAssignment = await assignment.save();
    console.log('Assignment submitted:', updatedAssignment);
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;