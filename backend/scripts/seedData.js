require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await Assignment.deleteMany({});
    
    // Insert initial assignments
    const assignments = [
      {
        subject: 'maths',
        title: 'Algebra Problem Set 1',
        description: 'Solve the quadratic equations in the attached worksheet',
        dueDate: new Date('2025-07-24'),
        status: 'pending',
        attachments: ['algebra_worksheet.pdf'],
        submissions: []
      },
      {
        subject: 'english',
        title: 'Essay: Climate Change',
        description: 'Write a 500-word essay on the impacts of climate change',
        dueDate: new Date('2025-07-28'),
        status: 'submitted',
        attachments: [],
        submissions: [{
          studentId: 'student1',
          submittedAt: new Date('2025-07-15'),
          files: ['climate_essay.docx'],
          grade: null
        }]
      },
      {
        subject: 'english',
        title: 'Shakespeare Analysis',
        description: 'Write a character analysis of Hamlet (750 words)',
        dueDate: new Date('2025-07-30'),
        status: 'pending',
        attachments: ['hamlet_guide.pdf'],
        submissions: []
      },
      {
        subject: 'biology',
        title: 'Cell Structure Lab Report',
        description: 'Complete the lab report on plant and animal cell structures',
        dueDate: new Date('2025-07-25'),
        status: 'pending',
        attachments: ['lab_template.docx'],
        submissions: []
      },
      {
        subject: 'biology',
        title: 'Photosynthesis Diagram',
        description: 'Create a detailed diagram showing the process of photosynthesis',
        dueDate: new Date('2025-07-26'),
        status: 'pending',
        attachments: [],
        submissions: []
      }
    ];
    
    await Assignment.insertMany(assignments);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();