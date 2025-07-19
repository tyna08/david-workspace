import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  User, 
  BookOpen, 
  Plus, 
  Send, 
  Calculator, 
  Globe, 
  Beaker, 
  Atom, 
  Heart, 
  Book,  // Changed from BookText
  Scroll, 
  ChevronLeft, 
  GraduationCap, 
  Play, 
  Keyboard, 
  Clock as Timer,  // Use Clock as Timer
  Image,
  LogOut  
} from 'lucide-react';

// Add this after your other imports
const API_URL = 'http://localhost:5001/api';

const CollaborationPlatform = ({ user, onLogout }) => {
  const [userRole, setUserRole] = useState(user?.role || 'student');
  const [currentView, setCurrentView] = useState('subjects'); // 'subjects', 'subject-detail', 'click-to-learn', or 'typing-test'
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const subjects = [
    { id: 'maths', name: 'Mathematics', icon: Calculator, color: 'bg-blue-500' },
    { id: 'english', name: 'English Language', icon: Book, color: 'bg-green-500' },  // Changed from BookText
    { id: 'history', name: 'History', icon: Scroll, color: 'bg-yellow-500' },
    { id: 'geography', name: 'Geography', icon: Globe, color: 'bg-indigo-500' },
    { id: 'biology', name: 'Biology', icon: Heart, color: 'bg-emerald-500' },
    { id: 'chemistry', name: 'Chemistry', icon: Beaker, color: 'bg-purple-500' },
    { id: 'physics', name: 'Physics', icon: Atom, color: 'bg-red-500' }
  ];

  const bbcBitesizeLinks = {
    maths: 'https://www.bbc.co.uk/bitesize/subjects/zqhs34j',
    english: 'https://www.bbc.co.uk/bitesize/subjects/z3kw2hv',
    history: 'https://www.bbc.co.uk/bitesize/subjects/zj26n39',
    geography: 'https://www.bbc.co.uk/bitesize/subjects/zrw76sg',
    biology: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p',
    chemistry: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p',
    physics: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p',
    science: 'https://www.bbc.co.uk/bitesize/subjects/zng4d2p'
  };

  const [assignments, setAssignments] = useState([]);
  
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    subject: '',
    attachments: []
  });
  
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentSubmission, setStudentSubmission] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const tutorFileInputRef = useRef(null);

  // Fetch assignments from backend when component loads
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`${API_URL}/assignments`);
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        // If backend is not running, use some default data
        setAssignments([
          {
            id: 1,
            subject: 'maths',
            title: 'Algebra Problem Set 1',
            description: 'Solve the quadratic equations in the attached worksheet',
            dueDate: '2025-07-24',
            status: 'pending',
            attachments: ['algebra_worksheet.pdf'],
            submissions: []
          },
          {
            id: 2,
            subject: 'english',
            title: 'Essay: Climate Change',
            description: 'Write a 500-word essay on the impacts of climate change',
            dueDate: '2025-07-28',
            status: 'submitted',
            attachments: [],
            submissions: [{
              studentId: 'student1',
              submittedAt: '2025-07-15',
              files: ['climate_essay.docx'],
              grade: null
            }]
          },
          {
            id: 3,
            subject: 'english',
            title: 'Shakespeare Analysis',
            description: 'Write a character analysis of Hamlet (750 words)',
            dueDate: '2025-07-30',
            status: 'pending',
            attachments: ['hamlet_guide.pdf'],
            submissions: []
          },
          {
            id: 4,
            subject: 'biology',
            title: 'Cell Structure Lab Report',
            description: 'Complete the lab report on plant and animal cell structures',
            dueDate: '2025-07-25',
            status: 'pending',
            attachments: ['lab_template.docx'],
            submissions: []
          },
          {
            id: 5,
            subject: 'biology',
            title: 'Photosynthesis Diagram',
            description: 'Create a detailed diagram showing the process of photosynthesis',
            dueDate: '2025-07-26',
            status: 'pending',
            attachments: [],
            submissions: []
          }
        ]);
      }
    };
    
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async () => {
    if (newAssignment.title && newAssignment.description && newAssignment.dueDate && newAssignment.subject) {
      try {
        const response = await fetch(`${API_URL}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAssignment),
        });
        
        if (response.ok) {
          const createdAssignment = await response.json();
          setAssignments([...assignments, createdAssignment]);
          setNewAssignment({ ...newAssignment, title: '', description: '', dueDate: '', attachments: [] });
          setShowNewAssignment(false);
          if (tutorFileInputRef.current) {
            tutorFileInputRef.current.value = '';
          }
        } else {
          console.error('Failed to create assignment');
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
        // Fallback for when backend is not running
        const assignment = {
          id: assignments.length + 1,
          ...newAssignment,
          status: 'pending',
          submissions: []
        };
        setAssignments([...assignments, assignment]);
        setNewAssignment({ ...newAssignment, title: '', description: '', dueDate: '', attachments: [] });
        setShowNewAssignment(false);
        if (tutorFileInputRef.current) {
          tutorFileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (studentSubmission || uploadedFile) {
      try {
        const response = await fetch(`${API_URL}/assignments/${assignmentId}/submit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: 'current-student',
            content: studentSubmission,
            files: uploadedFile ? [uploadedFile.name] : []
          }),
        });
        
        if (response.ok) {
          const updatedAssignment = await response.json();
          
          // Update local state - handle both MongoDB _id and regular id
          setAssignments(assignments.map(a => 
            (a._id === assignmentId || a.id === assignmentId) ? updatedAssignment : a
          ));
          
          setStudentSubmission('');
          setUploadedFile(null);
          setSelectedAssignment(null);
          setIsDragging(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        } else {
          console.error('Failed to submit assignment');
        }
      } catch (error) {
        console.error('Error submitting assignment:', error);
        // Fallback for when backend is not running
        setAssignments(assignments.map(a => {
          if (a._id === assignmentId || a.id === assignmentId) {
            return {
              ...a,
              status: 'submitted',
              submissions: [...a.submissions, {
                studentId: 'current-student',
                submittedAt: new Date().toISOString().split('T')[0],
                files: uploadedFile ? [uploadedFile.name] : ['submission.txt'],
                content: studentSubmission,
                grade: null
              }]
            };
          }
          return a;
        }));
        setStudentSubmission('');
        setUploadedFile(null);
        setSelectedAssignment(null);
        setIsDragging(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  const getSubjectAssignments = (subjectId) => {
    return assignments.filter(a => a.subject === subjectId);
  };

  const getSubjectStats = (subjectId) => {
    const subjectAssignments = getSubjectAssignments(subjectId);
    return {
      total: subjectAssignments.length,
      completed: subjectAssignments.filter(a => a.status === 'submitted').length,
      pending: subjectAssignments.filter(a => a.status === 'pending').length
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Validate file type and size
    const validTypes = {
      'application/pdf': true,
      'application/msword': true,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
      'image/jpeg': true,
      'image/png': true
    };
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes[file.type]) {
      alert('Invalid file type. Please upload a PDF, DOC, DOCX, JPG, or PNG file.');
      return;
    }
    
    if (file.size > maxSize) {
      alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 10MB limit.`);
      return;
    }
    
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      file: file
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const navigateToSubject = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject-detail');
  };

  const navigateToClickToLearn = () => {
    setCurrentView('click-to-learn');
  };

  const navigateToTypingTest = () => {
    setCurrentView('typing-test');
  };

  const navigateBack = () => {
    setCurrentView('subjects');
    setSelectedSubject(null);
    setSelectedAssignment(null);
    setStudentSubmission('');
    setUploadedFile(null);
    setShowSuccessMessage(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to safely render icon
  const renderIcon = (IconComponent, className) => {
    if (!IconComponent) return null;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">David Nwokoloh Learning Workspace</h1>
            </div>
            
           {/* Role Switcher */}
<div className="flex items-center space-x-4">
  {user?.role === 'admin' && (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setUserRole('tutor')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          userRole === 'tutor' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Tutor View
      </button>
      <button
        onClick={() => setUserRole('student')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          userRole === 'student' 
            ? 'bg-white text-indigo-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Student View
      </button>
    </div>
  )}
  <div className="flex items-center space-x-3">
    <div className="flex items-center">
      <User className="h-5 w-5 text-gray-400 mr-2" />
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">{user?.name || (userRole === 'tutor' ? 'Mr Raj' : 'The Lord is my Strength')}</p>
        <p className="text-xs text-gray-500 capitalize">{userRole}</p>
      </div>
    </div>
    <button
      onClick={onLogout}
      className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </button>
  </div>
</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'subjects' ? (
          /* Subject Grid View */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userRole === 'student' ? 'My Subjects' : 'Subject Management'}
              </h2>
              <p className="text-gray-600">
                {userRole === 'student' 
                  ? 'Select a subject to view and complete your assignments' 
                  : 'Select a subject to upload homework assignments and view student submissions'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Click to Learn Card - Only for Students */}
              {userRole === 'student' && (
                <div
                  onClick={navigateToClickToLearn}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="h-32 flex items-center justify-center">
                    <div className="text-center">
                      <GraduationCap className="h-16 w-16 text-white mx-auto mb-2" />
                      <Play className="h-8 w-8 text-white mx-auto" />
                    </div>
                  </div>
                  <div className="p-4 bg-white bg-opacity-95">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Click to Learn</h3>
                    <p className="text-sm text-gray-600">Access BBC Bitesize & Oak Academy resources</p>
                    <div className="mt-2 flex items-center text-sm text-purple-600">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>Interactive Learning</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Your Typing Skills Card - Only for Students */}
              {userRole === 'student' && (
                <div
                  onClick={navigateToTypingTest}
                  className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  <div className="h-32 flex items-center justify-center">
                    <div className="text-center">
                      <Keyboard className="h-16 w-16 text-white mx-auto mb-2" />
                      <Timer className="h-8 w-8 text-white mx-auto" />
                    </div>
                  </div>
                  <div className="p-4 bg-white bg-opacity-95">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Your Typing Skills</h3>
                    <p className="text-sm text-gray-600">Improve speed and accuracy</p>
                    <div className="mt-2 flex items-center text-sm text-cyan-600">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span>Practice Typing</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject Cards */}
              {subjects.map((subject) => {
                const stats = getSubjectStats(subject.id);
                const Icon = subject.icon;
                
                return (
                  <div
                    key={subject.id}
                    onClick={() => navigateToSubject(subject)}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className={`h-32 ${subject.color} flex items-center justify-center`}>
                      {renderIcon(Icon, "h-16 w-16 text-white")}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Assignments:</span>
                          <span className="font-medium text-gray-900">{stats.total}</span>
                        </div>
                        {userRole === 'student' ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Completed:</span>
                              <span className="font-medium text-green-600">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Pending:</span>
                              <span className="font-medium text-yellow-600">{stats.pending}</span>
                            </div>
                            {stats.pending > 0 && (
                              <div className="mt-2 text-center">
                                <span className="inline-flex items-center text-xs text-indigo-600">
                                  <Upload className="h-3 w-3 mr-1" />
                                  Click to submit assignments
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Submitted:</span>
                              <span className="font-medium text-green-600">{stats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Awaiting:</span>
                              <span className="font-medium text-yellow-600">{stats.pending}</span>
                            </div>
                            {stats.completed > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="flex items-center text-xs text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span>Click to view submissions</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {userRole === 'tutor' && stats.completed > 0 && (
                        <div className="mt-3 flex items-center justify-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {stats.completed} new submission{stats.completed > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Stats */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {userRole === 'student' ? 'Overall Progress' : 'Assignment Overview'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{assignments.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {assignments.filter(a => a.status === 'submitted').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {userRole === 'student' ? 'Completed' : 'With Submissions'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {assignments.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {userRole === 'student' ? 'Pending' : 'Awaiting Submissions'}
                  </div>
                </div>
              </div>
              {userRole === 'tutor' && (
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-sm text-gray-600">
                    Click on any subject to upload new assignments or view student submissions
                  </p>
                </div>
              )}
              {userRole === 'student' && assignments.filter(a => a.status === 'pending').length > 0 && (
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-sm text-gray-600">
                    Click on any subject to view and submit your pending assignments
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'click-to-learn' ? (
          /* Click to Learn View */
          <div>
            {/* Back Navigation */}
            <button
              onClick={navigateBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Subjects
            </button>

            <div className="mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg mr-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Click to Learn - Online Resources</h2>
                  <p className="text-gray-600">
                    Access BBC Bitesize and Oak National Academy for interactive lessons
                  </p>
                </div>
              </div>
            </div>

            {/* BBC Bitesize Resources */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <ExternalLink className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">BBC Bitesize Resources</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Access free, curriculum-aligned content for KS3 students in England from BBC Bitesize.
                  </p>
                </div>
              </div>
            </div>

            {/* BBC Bitesize Resources */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">BBC Bitesize KS3</h3>
              <p className="text-gray-600 mb-4">Interactive lessons, videos, and quizzes by subject</p>
            </div>

            {/* Subject Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <div key={subject.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className={`h-24 ${subject.color} flex items-center justify-center rounded-t-lg`}>
                      {renderIcon(Icon, "h-12 w-12 text-white")}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Interactive lessons, videos, and practice questions
                      </p>
                      <a
                        href={bbcBitesizeLinks[subject.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full justify-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </a>
                    </div>
                  </div>
                );
              })}

              {/* Additional Resources Card */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center rounded-t-lg">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All KS3 Subjects</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Explore all available subjects and resources
                  </p>
                  <a
                    href="https://www.bbc.co.uk/bitesize/levels/z4kw2hv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse All
                  </a>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">BBC Bitesize Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                    <Play className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Video Lessons</h4>
                  <p className="text-sm text-gray-600 mt-1">Engaging video content</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Practice Tests</h4>
                  <p className="text-sm text-gray-600 mt-1">Self-assessment quizzes</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Study Guides</h4>
                  <p className="text-sm text-gray-600 mt-1">Comprehensive notes</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Exam Prep</h4>
                  <p className="text-sm text-gray-600 mt-1">Past papers & tips</p>
                </div>
              </div>
            </div>

            {/* Oak National Academy Section */}
            <div className="mt-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Oak National Academy</h3>
                <p className="text-gray-600">Additional free resources and lesson plans</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg mr-4">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 text-lg">Oak National Academy</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Free online classroom and resource hub created by teachers for teachers. Access thousands of curriculum-aligned video lessons, worksheets and quizzes.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white bg-opacity-70 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Complete lesson plans with videos</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Downloadable worksheets and resources</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Aligned with National Curriculum</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white bg-opacity-70 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Subjects Include:</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>All core subjects (Maths, English, Science)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Foundation subjects (History, Geography, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                        <span>Specialist content and SEND resources</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <a
                  href="https://www.thenational.academy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto justify-center font-medium"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Visit Oak National Academy
                </a>
              </div>
            </div>
          </div>
        ) : currentView === 'typing-test' ? (
          /* Typing Test View */
          <div>
            {/* Back Navigation */}
            <button
              onClick={navigateBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Subjects
            </button>

            <div className="mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-lg mr-4">
                  <Keyboard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Test Your Typing Skills</h2>
                  <p className="text-gray-600">
                    Practice typing to improve your speed and accuracy for assignments
                  </p>
                </div>
              </div>
            </div>

            {/* Typing Test Information */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Keyboard className="h-5 w-5 text-cyan-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-cyan-900">Why Typing Skills Matter</h3>
                  <p className="text-sm text-cyan-700 mt-1">
                    Good typing skills help you complete assignments faster, take better notes, and communicate more effectively in your studies.
                  </p>
                </div>
              </div>
            </div>

            {/* Typing Test Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Typing.com */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Typing.com</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Free typing lessons, tests, and games for all skill levels
                  </p>
                  <a
                    href="https://www.typing.com/student/typing-test/1-minute"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full justify-center"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Take 1-Minute Test
                  </a>
                </div>
              </div>

              {/* 10FastFingers */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">10FastFingers</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Popular typing speed test with multiplayer competitions
                  </p>
                  <a
                    href="https://10fastfingers.com/typing-test/english"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full justify-center"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Start Speed Test
                  </a>
                </div>
              </div>

              {/* Keybr.com */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Keybr.com</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Smart typing practice that adapts to your skill level
                  </p>
                  <a
                    href="https://www.keybr.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Practice Now
                  </a>
                </div>
              </div>

              {/* TypeRacer */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TypeRacer</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Race against others while improving your typing speed
                  </p>
                  <a
                    href="https://play.typeracer.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Race
                  </a>
                </div>
              </div>

              {/* Typing Club */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TypingClub</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    School-friendly typing program with progress tracking
                  </p>
                  <a
                    href="https://www.typingclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors w-full justify-center"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning
                  </a>
                </div>
              </div>

              {/* Ratatype */}
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="h-24 bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center rounded-t-lg">
                  <Keyboard className="h-12 w-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ratatype</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Free typing tutor with certificates upon completion
                  </p>
                  <a
                    href="https://www.ratatype.com/typing-test/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors w-full justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test & Certify
                  </a>
                </div>
              </div>
            </div>

            {/* Typing Tips Section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typing Tips for Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Proper Technique</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Keep fingers on home row keys (ASDF and JKL;)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Use all 10 fingers, not just index fingers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Look at the screen, not the keyboard</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Practice Goals</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Timer className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      <span>Beginner: 20-30 words per minute (WPM)</span>
                    </li>
                    <li className="flex items-start">
                      <Timer className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      <span>Intermediate: 40-50 WPM</span>
                    </li>
                    <li className="flex items-start">
                      <Timer className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                      <span>Advanced: 60+ WPM with 95%+ accuracy</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Pro Tip:</strong> Practice for 10-15 minutes daily rather than long sessions. 
                  Consistency is key to improving your typing speed and accuracy!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Subject Detail View */
          <div>
            {/* Back Navigation */}
            <button
              onClick={navigateBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Subjects
            </button>

            {selectedSubject && (
              <div className="mb-6">
                <div className="flex items-center">
                  <div className={`${selectedSubject.color} p-3 rounded-lg mr-4`}>
                    {renderIcon(selectedSubject.icon, "h-8 w-8 text-white")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h2>
                    <p className="text-gray-600">
                      {userRole === 'student' 
                        ? 'View and complete your assignments' 
                        : 'Upload new assignments and review student submissions'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userRole === 'tutor' 
                          ? `${selectedSubject?.name} Assignments & Submissions`
                          : `${selectedSubject?.name} Assignments`}
                      </h3>
                      {userRole === 'tutor' && (
                        <button
                          onClick={() => {
                            setNewAssignment({...newAssignment, subject: selectedSubject.id});
                            setShowNewAssignment(true);
                          }}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Assignment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tutor Instructions */}
                  {userRole === 'tutor' && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                      <p className="text-sm text-blue-800">
                        <strong>Tutor Actions:</strong> Click "New Assignment" to upload homework for students. 
                        Click "View Submissions" on any assignment to review completed work.
                      </p>
                    </div>
                  )}

                  {/* Student Instructions */}
                  {userRole === 'student' && (
                    <div className="px-6 py-3 bg-green-50 border-b border-green-100">
                      <p className="text-sm text-green-800">
                        <strong>Student Actions:</strong> Click "Submit" on any assignment to upload your completed work. 
                        You can type your answer, click to browse files, or drag and drop files directly (PDF, DOC, JPG, PNG up to 10MB).
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {showSuccessMessage && userRole === 'student' && (
                    <div className="px-6 py-3 bg-green-50 border-b border-green-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-sm text-green-800">
                          <strong>Success!</strong> Your assignment has been submitted successfully.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* New Assignment Form */}
                  {showNewAssignment && userRole === 'tutor' && (
                    <div className="p-6 bg-gray-50 border-b">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Create New {selectedSubject?.name} Assignment
                      </h4>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Assignment Title"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <textarea
                          placeholder="Assignment Description"
                          value={newAssignment.description}
                          onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                        />
                        <input
                          type="date"
                          value={newAssignment.dueDate}
                          onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex items-center space-x-4">
                          <input
                            ref={tutorFileInputRef}
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setNewAssignment({
                                  ...newAssignment, 
                                  attachments: [file.name]
                                });
                              }
                            }}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                          />
                          <button 
                            onClick={() => tutorFileInputRef.current?.click()}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Attach Files
                          </button>
                          {newAssignment.attachments.length > 0 && (
                            <span className="text-sm text-gray-600">
                              <FileText className="h-4 w-4 inline mr-1" />
                              {newAssignment.attachments[0]}
                            </span>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCreateAssignment}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Create
                            </button>
                            <button
                              onClick={() => {
                                setShowNewAssignment(false);
                                setNewAssignment({ ...newAssignment, title: '', description: '', dueDate: '', attachments: [] });
                                if (tutorFileInputRef.current) {
                                  tutorFileInputRef.current.value = '';
                                }
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assignments List */}
                  <div className="divide-y">
                    {getSubjectAssignments(selectedSubject?.id).map((assignment) => (
                      <div key={assignment._id || assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-md font-medium text-gray-900">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            <div className="flex items-center mt-3 space-x-4">
                              <span className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                              {assignment.attachments.length > 0 && (
                                <span className="flex items-center text-sm text-gray-500">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {assignment.attachments.length} attachment(s)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {userRole === 'tutor' ? (
                              <div className="text-right">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  assignment.submissions.length > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {assignment.submissions.length > 0 ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {assignment.submissions.length} Submitted
                                      {assignment.submissions.some(s => s.files[0] !== 'submission.txt') && (
                                        <FileText className="h-3 w-3 ml-1" />
                                      )}
                                    </>
                                  ) : (
                                    'Awaiting Submissions'
                                  )}
                                </span>
                                {assignment.submissions.length > 0 && (
                                  <button className="mt-2 block text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                    View Submissions →
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div>
                                {assignment.status === 'submitted' ? (
                                  <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Submitted
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {assignment.submissions[0]?.submittedAt && new Date(assignment.submissions[0].submittedAt).toLocaleDateString()}
                                      {assignment.submissions[0]?.files[0] !== 'submission.txt' && (
                                        <span className="ml-2">
                                          {assignment.submissions[0]?.files[0]?.toLowerCase().match(/\.(jpg|jpeg|png)$/i) ? (
                                            <Image className="h-3 w-3 inline mr-1" />
                                          ) : (
                                            <FileText className="h-3 w-3 inline mr-1" />
                                          )}
                                          File attached
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectedAssignment(assignment)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Submit
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {getSubjectAssignments(selectedSubject?.id).length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        {userRole === 'tutor' 
                          ? 'No assignments yet. Click "New Assignment" to upload homework for students.'
                          : 'No assignments yet for this subject. Check back later!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Submission Modal */}
                {selectedAssignment && userRole === 'student' && (
                  <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Submit: {selectedAssignment.title}
                    </h4>
                    
                    {/* Submission Options */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2 font-medium">Choose how to submit your assignment:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center text-gray-600">
                          <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Type your answer below</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Upload className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm">Upload a file (PDF, DOC, Image)</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">You can use either or both methods</p>
                    </div>

                    <textarea
                      placeholder={uploadedFile ? "Optional: Add additional notes or comments..." : "Type your answer here, or use the upload button below to submit a file..."}
                      value={studentSubmission}
                      onChange={(e) => setStudentSubmission(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 mb-4"
                    />
                    
                    {/* File Upload Section */}
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                      />
                      <div 
                        onClick={triggerFileUpload}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
                          isDragging 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-600">
                          {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                      </div>
                      {uploadedFile && (
                        <div className="mt-2 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            {uploadedFile.type.includes('image') ? (
                              <Image className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <FileText className="h-5 w-5 text-green-600 mr-2" />
                            )}
                            <div>
                              <span className="text-sm text-green-800 font-medium">{uploadedFile.name}</span>
                              <span className="text-xs text-green-600 ml-2">({uploadedFile.size})</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setUploadedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Make sure to review your work before submitting
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSubmitAssignment(selectedAssignment._id || selectedAssignment.id)}
                          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={!studentSubmission && !uploadedFile}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAssignment(null);
                            setStudentSubmission('');
                            setUploadedFile(null);
                            setIsDragging(false);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Sidebar */}
              <div className="lg:col-span-1">
                {/* Subject Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    {userRole === 'tutor' 
                      ? `${selectedSubject?.name} Assignment Status` 
                      : `${selectedSubject?.name} Progress`}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Assignments</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getSubjectAssignments(selectedSubject?.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {userRole === 'tutor' ? 'With Submissions' : 'Completed'}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {getSubjectAssignments(selectedSubject?.id).filter(a => a.status === 'submitted').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {userRole === 'tutor' ? 'Awaiting Submissions' : 'Pending'}
                      </span>
                      <span className="text-sm font-medium text-yellow-600">
                        {getSubjectAssignments(selectedSubject?.id).filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar - Only for Students */}
                  {userRole === 'student' && (
                    <>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                getSubjectAssignments(selectedSubject?.id).length > 0
                                  ? (getSubjectAssignments(selectedSubject?.id).filter(a => a.status === 'submitted').length / 
                                    getSubjectAssignments(selectedSubject?.id).length) * 100
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {Math.round(
                            getSubjectAssignments(selectedSubject?.id).length > 0
                              ? (getSubjectAssignments(selectedSubject?.id).filter(a => a.status === 'submitted').length / 
                                getSubjectAssignments(selectedSubject?.id).length) * 100
                              : 0
                          )}% Complete
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    {userRole === 'tutor' ? 'Recent Submissions' : 'Recent Activity'}
                  </h3>
                  <div className="space-y-3">
                    {getSubjectAssignments(selectedSubject?.id)
                      .filter(a => a.submissions.length > 0)
                      .slice(0, 3)
                      .map((assignment) => (
                        <div key={assignment._id || assignment.id} className="text-sm">
                          <p className="font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-gray-500">
                            {userRole === 'tutor' 
                              ? `${assignment.submissions.length} student(s) submitted`
                              : `Submitted on ${new Date(assignment.submissions[0].submittedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))}
                    {getSubjectAssignments(selectedSubject?.id).filter(a => a.submissions.length > 0).length === 0 && (
                      <p className="text-sm text-gray-500">
                        {userRole === 'tutor' ? 'No submissions yet' : 'No recent activity'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPlatform;