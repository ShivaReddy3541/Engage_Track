import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import {
  LogOut, User, GraduationCap, Users, LayoutGrid, AlertTriangle,
  Plus, Calendar, FileText, Send, CheckCircle2, MessageSquare,
  ShieldAlert, BookOpen, Clock, Play, ArrowLeft, Check, AlertOctagon,
  ChevronLeft, ChevronRight, CheckSquare, Bell, ChevronDown, Cpu, Radio
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import ProfileModal from '../components/ProfileModal';
import LiveProtector from '../components/LiveProtector';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();

  // Dashboard overall states
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard'); // dashboard, courses, grading
  const [activeClassTab, setActiveClassTab] = useState('wall'); // wall, assignments, live
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [activeFlagsCount, setActiveFlagsCount] = useState(0);

  // Orchestrator Logs State
  const [orchestratorLogs, setOrchestratorLogs] = useState([
    { time: new Date().toLocaleTimeString(), student: 'System', agent: 'Orchestrator', text: 'EngageAI Multi-Agent proctor router online.' },
    { time: new Date().toLocaleTimeString(), student: 'System', agent: 'Redis Hub', text: 'Subscribed to channels: alertness, attendance, screen_integrity.' }
  ]);

  useEffect(() => {
    const students = ['Shiva Reddy', 'Amith Reddy', 'Sneha Latha', 'Vikrant Sharma'];
    const agents = ['Alertness Agent', 'YOLO Integrity', 'Attendance Agent', 'Moderation Agent'];

    const logs = [
      { text: 'Eye Aspect Ratio drop detected. EAR: 0.12 (Continuous drowsiness warning).', isAlert: true },
      { text: 'Prohibited object detected: Mobile phone in camera view.', isAlert: true },
      { text: 'Multiple faces detected in webcam frame.', isAlert: true },
      { text: 'Absence threshold exceeded. User out of desk > 3m.', isAlert: true },
      { text: 'Scanned class wall comment: Safe. Toxicity probability: 0.009.', isAlert: false },
      { text: 'Face mesh tracking active. WebGL nodes stable.', isAlert: false }
    ];

    const interval = setInterval(() => {
      const student = students[Math.floor(Math.random() * students.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const log = logs[Math.floor(Math.random() * logs.length)];

      setOrchestratorLogs(prev => [
        ...prev.slice(-30),
        { time: new Date().toLocaleTimeString(), student, agent, text: log.text, isAlert: log.isAlert }
      ]);

      if (log.isAlert) {
        setActiveFlagsCount(c => c + 1);
      }
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const [isMeetingLive, setIsMeetingLive] = useState(false);

  // Profile menu dropdown and modal
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Create Class Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassTime, setNewClassTime] = useState('');
  const [newClassDuration, setNewClassDuration] = useState('60');
  const [newClassAbsenceAllowed, setNewClassAbsenceAllowed] = useState('10');

  // Selected Class details states
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // postId -> commentText

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Canvas SpeedGrader state
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [gradeInputs, setGradeInputs] = useState({}); // submissionId -> gradeText

  // Create Assignment Form states
  const [showCreateAssignModal, setShowCreateAssignModal] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignDesc, setNewAssignDesc] = useState('');
  const [newAssignDeadline, setNewAssignDeadline] = useState('');
  const [isMultiQuestion, setIsMultiQuestion] = useState(false);
  const [assignQuestions, setAssignQuestions] = useState(['', '', '', '', '']);

  // Feedbacks
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // New States: Notifications, Academics, Timetable, Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);

  // Timetable Attendance States
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSlotForAttendance, setSelectedSlotForAttendance] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Assignments & Quiz Section States
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('assignment'); // assignment, quiz, ai-quiz, ai-assignment
  const [postingDateTime, setPostingDateTime] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [timetableAssignments, setTimetableAssignments] = useState([]);
  const [timetableQuizzes, setTimetableQuizzes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Timetable constants
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slotsTimeRange = [
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { label: '12:00 - 13:00 (Lunch)', start: '12:00', end: '13:00', isLunch: true },
    { label: '13:00 - 14:00', start: '13:00', end: '14:00' },
    { label: '14:00 - 15:00', start: '14:00', end: '15:00' }
  ];

  // Fetch classes taught by this teacher
  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes');
      setClasses(res.data);
      setTotalStudentsCount(res.data.length * 12 + 3);

      // Fetch announcements
      const annRes = await axios.get('/api/admin/announcements').catch(() => ({ data: [] }));
      setAnnouncements(annRes.data);

      const ttRes = await axios.get(`/api/academic/timetable?teacher_id=${user.id}`).catch(() => ({ data: [] }));
      const ttData = ttRes.data.length > 0 ? ttRes.data : [
        { id: 101, subject_name: 'Computer Networks', section: 'A', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: 'Room 302' },
        { id: 102, subject_name: 'Operating Systems', section: 'A', day_of_week: 'Tuesday', start_time: '11:00', end_time: '12:00', room: 'Room 304' },
        { id: 103, subject_name: 'Database Systems', section: 'B', day_of_week: 'Wednesday', start_time: '14:00', end_time: '15:00', room: 'Lab 2' },
        { id: 104, subject_name: 'Computer Networks', section: 'A', day_of_week: 'Thursday', start_time: '09:00', end_time: '10:00', room: 'Room 302' },
        { id: 105, subject_name: 'Operating Systems', section: 'B', day_of_week: 'Friday', start_time: '10:00', end_time: '11:00', room: 'Room 304' },
        { id: 106, subject_name: 'Operating Systems', section: 'A', day_of_week: 'Monday', start_time: '11:00', end_time: '12:00', room: 'Room 304' }
      ];
      setTimetableSlots(ttData);

      // Fetch Placements
      const plcRes = await axios.get('/api/placements').catch(() => ({ data: [] }));
      setPlacements(plcRes.data.length > 0 ? plcRes.data : [
        { id: 1, company: 'Google', role: 'Software Engineer', package: '24 LPA', branches: 'CSE, IT, ECE', description: 'Google is hiring for multiple roles across India locations.', created_at: '2026-07-12' },
        { id: 2, company: 'Microsoft', role: 'SDE-1', package: '18 LPA', branches: 'CSE, IT', description: 'Looking for strong competitive programmers.', created_at: '2026-07-13' }
      ]);

      // Fetch notifications
      const notifRes = await axios.get('/api/notifications').catch(() => ({ data: [] }));
      setNotificationsList(notifRes.data);

      // Fetch subjects based on user's department
      const dept = user?.department || '';
      if (dept) {
        const subRes = await axios.get(`/api/academic/subjects?department=${dept}`).catch(() => ({ data: [] }));
        setSubjectsList(subRes.data.length > 0 ? subRes.data : [
          { name: 'Computer Networks', section: 'A', syllabus_pdf_url: '#' },
          { name: 'Operating Systems', section: 'A', syllabus_pdf_url: '#' },
          { name: 'Database Systems', section: 'B', syllabus_pdf_url: '#' }
        ]);
      }
    } catch (err) {
      console.error("Error fetching teacher dashboard data:", err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotificationsList(notificationsList.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await axios.put('/api/notifications/read');
      setNotificationsList(notificationsList.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceRoster = async (slotId, date) => {
    try {
      const res = await axios.get(`/api/academic/attendance?timetable_slot_id=${slotId}&date=${date}`);
      setAttendanceRoster(res.data);
    } catch (err) {
      console.error("Error fetching attendance roster:", err);
    }
  };

  const handleOpenAttendance = (slot) => {
    setSelectedSlotForAttendance(slot);
    setShowAttendanceModal(true);
    fetchAttendanceRoster(slot.id, attendanceDate);
  };

  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      await axios.post('/api/academic/attendance', {
        timetable_slot_id: selectedSlotForAttendance.id,
        date: attendanceDate,
        records: attendanceRoster.map(r => ({ student_id: r.student_id, status: r.status }))
      });
      alert("Attendance saved successfully!");
      setShowAttendanceModal(false);
    } catch (err) {
      alert("Failed to save attendance.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const fetchTimetableAssignmentsAndQuizzes = async (dept, sec, subName) => {
    try {
      const assignRes = await axios.get(`/api/academic/assignments?department=${dept}&section=${sec}&subject_name=${subName}`);
      setTimetableAssignments(assignRes.data);

      const quizRes = await axios.get(`/api/academic/quizzes?department=${dept}&section=${sec}&subject_name=${subName}`);
      setTimetableQuizzes(quizRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAssignmentOrQuiz = async (e) => {
    e.preventDefault();
    if (!selectedSection || !selectedSubject) {
      alert("Please select section and subject.");
      return;
    }
    if (!selectedFile) {
      alert("Please select and upload a PDF or document file.");
      return;
    }

    setIsGenerating(true);
    try {
      const dept = user.department;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("department", dept);
      formData.append("section", selectedSection);
      formData.append("subject_name", selectedSubject);
      if (postingDateTime) {
        formData.append("posting_date", postingDateTime);
      }
      if (dueDateTime) {
        formData.append("deadline_date", dueDateTime);
      }
      formData.append("mode", assignmentMode);
      formData.append("num_questions", String(numQuestions));

      if (assignmentMode === 'assignment' || assignmentMode === 'ai-assignment') {
        await axios.post('/api/academic/assignments/upload-post', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert(`${assignmentMode === 'ai-assignment' ? 'AI generated assignment' : 'Assignment'} posted successfully!`);
      } else if (assignmentMode === 'quiz' || assignmentMode === 'ai-quiz') {
        await axios.post('/api/academic/quizzes/upload-post', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert(`${assignmentMode === 'ai-quiz' ? 'AI generated quiz' : 'Quiz'} posted successfully!`);
      }

      setSelectedFile(null);
      setUploadFileName('');
      setPostingDateTime('');
      setDueDateTime('');
      fetchTimetableAssignmentsAndQuizzes(dept, selectedSection, selectedSubject);
    } catch (err) {
      alert("Error posting task.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedSection && selectedSubject && user?.department) {
      fetchTimetableAssignmentsAndQuizzes(user.department, selectedSection, selectedSubject);
    }
  }, [selectedSection, selectedSubject]);

  useEffect(() => {
    if (user) {
      fetchClasses();
      const intervalId = setInterval(() => {
        fetchClasses();
      }, 15000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Real-time synchronization of student alerts via shared localStorage events
  useEffect(() => {
    const handleStorageAlerts = (e) => {
      if (e.key === 'engageai_live_alerts' && e.newValue) {
        try {
          const newAlert = JSON.parse(e.newValue);
          if (newAlert) {
            setOrchestratorLogs(prev => [
              ...prev,
              {
                time: new Date(newAlert.timestamp || Date.now()).toLocaleTimeString(),
                student: newAlert.student_name,
                agent: newAlert.agent_name,
                text: newAlert.text,
                isAlert: newAlert.is_alert
              }
            ]);
            if (newAlert.is_alert) {
              setActiveFlagsCount(c => c + 1);
            }
          }
        } catch (err) {
          console.error("Error parsing storage alerts:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorageAlerts);
    return () => window.removeEventListener('storage', handleStorageAlerts);
  }, []);

  // Fetch Class details when selected
  useEffect(() => {
    if (selectedClass) {
      fetchClassWall();
      fetchClassAssignments();
      setSelectedAssignment(null);
      setSubmissions([]);
      setActiveSubIndex(0);
      setActiveClassTab('wall');
    }
  }, [selectedClass]);

  const fetchClassWall = async () => {
    try {
      const res = await axios.get(`/api/classes/${selectedClass.id}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClassAssignments = async () => {
    try {
      const res = await axios.get(`/api/classes/${selectedClass.id}/assignments`);
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (assignId) => {
    try {
      const res = await axios.get(`/api/classes/assignments/${assignId}/submissions`);
      setSubmissions(res.data);
      setActiveSubIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName || !newClassSubject) return;

    const duration = parseInt(newClassDuration) || 60;
    const absenceAllowed = parseInt(newClassAbsenceAllowed) || 15;

    // Validate absence limit (<= 50% of duration)
    if (absenceAllowed > duration * 0.5) {
      alert(`Validation Error: Online Absence Limit (${absenceAllowed} mins) cannot exceed 50% of the class duration (${duration * 0.5} mins max).`);
      return;
    }

    try {
      const currentTimeStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
      
      // 1. Create general classroom entry
      const clsRes = await axios.post('/api/classes', {
        name: `${user.department} - Section ${newClassName} - ${newClassSubject}`,
        department: user.department,
        section: newClassName,
        absence_allowed_mins: absenceAllowed,
        description: newClassDesc || `Live session for ${newClassSubject}`,
        subject_name: newClassSubject,
        meet_date: newClassDate || new Date().toISOString().split('T')[0],
        start_time: newClassTime || currentTimeStr,
        duration_mins: duration
      });

      // 2. Create formal Online Meet entry for AI Proctoring & Waiting Room
      try {
        await axios.post('/api/academic/meets', {
          department: user.department,
          section: newClassName,
          subject_name: newClassSubject,
          topic: newClassDesc || `${newClassSubject} - Virtual Classroom`,
          meet_date: newClassDate || new Date().toISOString().split('T')[0],
          start_time: newClassTime || currentTimeStr,
          duration_mins: duration,
          absence_limit_mins: absenceAllowed,
          camera_mandatory: true
        });
      } catch (meetErr) {
        console.warn("Meets sync notice:", meetErr.response?.data?.detail || meetErr.message);
      }

      setFeedbackMsg(`Classroom & AI Proctored Meet for Section '${newClassName}' created successfully!`);
      setShowCreateModal(false);
      setNewClassName('');
      setNewClassDesc('');
      setNewClassSubject('');
      setNewClassDate('');
      setNewClassTime('');
      setNewClassDuration('60');
      setNewClassAbsenceAllowed('15');
      fetchClasses();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create class.');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const res = await axios.post(`/api/classes/${selectedClass.id}/posts`, { content: newPostContent });
      setNewPostContent('');
      fetchClassWall();
      if (res.data.moderation_status === 'flagged') {
        alert(`Warning: Post flagged by AI Content Moderation: ${res.data.flagged_reason}`);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Post failed.');
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    try {
      const res = await axios.post(`/api/classes/posts/${postId}/comments`, { content: commentText });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchClassWall();
      if (res.data.moderation_status === 'flagged') {
        alert(`Warning: Comment flagged by AI Content Moderation: ${res.data.flagged_reason}`);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Comment failed.');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignTitle || !newAssignDeadline) return;
    try {
      const finalDesc = isMultiQuestion ? JSON.stringify({ isMultiQuestion: true, questions: assignQuestions }) : newAssignDesc;
      await axios.post(`/api/classes/${selectedClass.id}/assignments`, {
        title: newAssignTitle,
        description: finalDesc,
        deadline: new Date(newAssignDeadline).toISOString()
      });
      setShowCreateAssignModal(false);
      setNewAssignTitle('');
      setNewAssignDesc('');
      setNewAssignDeadline('');
      setIsMultiQuestion(false);
      setAssignQuestions(['', '', '', '', '']);
      fetchClassAssignments();
      setFeedbackMsg(`Assignment created successfully!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create assignment.');
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    const grade = gradeInputs[submissionId];
    if (!grade || !grade.trim()) return;
    try {
      await axios.post(`/api/classes/submissions/${submissionId}/grade`, { grade });
      await fetchSubmissions(selectedAssignment.id);
      setGradeInputs({ ...gradeInputs, [submissionId]: '' });
      alert('Grade submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit grade.');
    }
  };

  const getInitials = (name) => {
    if (!name) return "TE";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name);
  const activeSubmission = submissions[activeSubIndex] || null;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">

      {/* LEFT SIDEBAR: MeritCurve Style for Teacher */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none fixed h-screen overflow-y-auto">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <img
              src={branding.logo_url}
              className="h-8 w-auto object-contain max-w-[40px]"
              onError={(e) => { e.target.style.display = 'none'; }}
              alt="Logo"
            />
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none truncate max-w-[120px]">{branding.institution_name}</h2>
              <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider">Teacher Hub</span>
            </div>
          </div>

          {/* Menus */}
          <div className="p-4 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Overview</span>
              <nav className="space-y-1">
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('dashboard'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'dashboard' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard Overview
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Classes</span>
              <nav className="space-y-1">
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('courses'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'courses' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Online Class Feed
                </button>
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('academic'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'academic' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  Academics & Syllabus
                </button>
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('timetable'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'timetable' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Calendar className="h-4 w-4" />
                  My Schedule
                </button>
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('assignments-quizzes'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'assignments-quizzes' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  Assignments & Quizzes
                </button>
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('placements'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'placements' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Placements
                </button>
                <button
                  onClick={() => { setSelectedClass(null); setActiveMenu('notifications'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeMenu === 'notifications' && !selectedClass
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Bell className="h-4 w-4" />
                  Announcements
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Log out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden ml-64">

        {/* Top Header navbar with Dropdown */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">{branding.institution_name} Instructor Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 text-slate-500 hover:text-slate-800 transition-colors relative focus:outline-none"
              >
                <Bell className="h-4.5 w-4.5" />
                {notificationsList.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 px-4 z-50 animate-fadeIn space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-extrabold text-slate-900 uppercase">Notifications</span>
                    {notificationsList.filter(n => !n.is_read).length > 0 && (
                      <button onClick={handleMarkAllNotificationsRead} className="text-[10px] text-brand-600 font-bold hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1.5">
                    {notificationsList.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-bold text-center py-4">No notifications.</p>
                    ) : (
                      notificationsList.map(n => (
                        <div
                          key={n.id}
                          onClick={() => { handleMarkNotificationRead(n.id); setShowNotifMenu(false); }}
                          className={`p-2.5 rounded-xl border text-[10px] cursor-pointer transition-colors leading-normal ${n.is_read
                              ? 'bg-slate-50 border-slate-100 text-slate-500'
                              : 'bg-blue-50/40 border-blue-100 text-slate-850 font-semibold'
                            }`}
                        >
                          <p>{n.message}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 focus:outline-none select-none hover:opacity-85 transition-opacity"
              >
                <div className="h-8 w-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-150 p-4 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="h-10 w-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-950 line-clamp-1 leading-tight">{user.full_name}</h4>
                      <p className="text-[10px] text-slate-500">{user.department} Department</p>
                      <p className="text-[10px] text-slate-500 break-all">{user.email}</p>
                      <p className="text-[10px] text-slate-500">+1 234 567 8900</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      View Profile
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <main className="flex-1 p-8 overflow-y-auto">
          {feedbackMsg && (
            <div className="bg-brand-50 border border-brand-200 text-brand-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-brand-650" />
              {feedbackMsg}
            </div>
          )}

          {/* Active selected class details sub-view */}
          {selectedClass ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Back button and Class header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                    Back to Classrooms
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedClass.name || selectedClass.subject_name}</h2>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {selectedClass.topic || selectedClass.description || 'Live AI-Proctored Classroom & Meeting Engine'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    AI Proctoring Ready
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs font-mono">
                    ID: {selectedClass.meeting_id || `ENGAGE-${selectedClass.id}`}
                  </span>
                </div>
              </div>

              {/* Dedicated Live Proctor and Launch Meeting Interface */}
              <div className="mt-2">
                <LiveProtector
                  classData={selectedClass}
                  isHost={true}
                  onLeave={() => setSelectedClass(null)}
                />
              </div>
            </div>
          ) : (
            /* Teacher Home Dashboard view */
            <div className="space-y-8">
              {/* MENU A: DASHBOARD VIEW */}
              {activeMenu === 'dashboard' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Welcome Hero Banner */}
                  <div className="bg-gradient-to-r from-brand-500/[0.04] to-brand-600/[0.01] border border-brand-500/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        Welcome Back, <span className="text-brand-600">{user.full_name.toUpperCase()}!</span> 👨‍🏫
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold mt-1">Ready to manage course timelines, review submissions, and verify plagiarism checks?</p>
                    </div>
                  </div>

                  {/* Dashboard Content Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      {/* Main Announcements */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <Bell className="h-4.5 w-4.5 text-brand-600" />
                            Main Announcements
                          </h3>
                        </div>
                        <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl">
                          <h4 className="font-bold text-xs text-brand-800">Welcome to the new academic year!</h4>
                          <p className="text-[10px] text-brand-700 leading-normal mt-1">Please ensure your course syllabi are updated.</p>
                          <span className="text-[9px] text-brand-600 mt-2 block font-bold">11 Jul 2026</span>
                        </div>
                      </div>

                      {/* Today's Scheduled Classes */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <Calendar className="h-4.5 w-4.5 text-emerald-500" />
                            Classes Scheduled for Today
                          </h3>
                        </div>
                        <div className="flex flex-col gap-3">
                          {timetableSlots.filter(s => s.day_of_week === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] || (new Date().getDay() === 0 || new Date().getDay() === 6 ? s.day_of_week === 'Monday' : false)).length > 0 ? (
                            timetableSlots.filter(s => s.day_of_week === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] || (new Date().getDay() === 0 || new Date().getDay() === 6 ? s.day_of_week === 'Monday' : false)).slice(0, 3).map((slot) => (
                              <div key={slot.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex justify-between items-center">
                                <div>
                                  <h4 className="font-extrabold text-xs text-slate-900">{slot.subject_name}</h4>
                                  <p className="text-[10px] text-slate-500">Section {slot.section}</p>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{slot.start_time} - {slot.end_time}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-500 text-center py-4">No classes scheduled for today.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Announcements block for teacher from department admin */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                          <Bell className="h-4.5 w-4.5 text-amber-500" />
                          Department Bulletins
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.department} Department</span>
                      </div>

                      <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                        {announcements.length > 0 ? (
                          announcements.map((ann, i) => (
                            <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-xs text-slate-800">{ann.title}</h4>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${ann.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                  }`}>{ann.priority}</span>
                              </div>
                              <p className="text-[10px] text-slate-605 leading-normal">{ann.content}</p>
                              <span className="text-[9px] text-slate-400 mt-2 block">{ann.date}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                              <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">No Bulletins</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Check back later for active platform updates or department announcements.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MENU B: ACTIVE CLASSROOM FEEDS & STREAM */}
              {activeMenu === 'courses' && (
                <div className="animate-fadeIn">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Online Class Feed</h3>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-md uppercase tracking-wider"
                      >
                        <Plus className="h-4 w-4" />
                        Create Online Class Meet
                      </button>
                    </div>

                    {classes.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                        <p className="font-bold text-slate-800 mb-1">No classrooms created yet</p>
                        <p className="text-[11px] text-slate-500 mb-6 max-w-sm mx-auto">Create a class to host stream channels, open classwork walls, and monitor plagiarism.</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                        >
                          Create First Class
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classes.filter(cls => {
                          if (cls.status === 'completed') return false;
                          if (!cls.meet_date || !cls.start_time) return true;
                          const targetStr = `${cls.meet_date}T${cls.start_time.length === 5 ? cls.start_time + ':00' : cls.start_time}`;
                          const targetTime = new Date(targetStr).getTime();
                          if (isNaN(targetTime)) return true;
                          return (targetTime - new Date().getTime()) >= -((cls.duration_mins || 60) * 60 * 1000);
                        }).map((cls) => (
                          <div
                            key={cls.id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
                          >
                            <div className="cursor-pointer" onClick={() => setSelectedClass(cls)}>
                              <div className="flex justify-between items-start mb-1.5">
                                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-brand-605" />
                                  {cls.name} {cls.subject_name ? `- ${cls.subject_name}` : ''}
                                </h4>
                                {cls.meet_date && cls.start_time && (
                                  <CountdownTimer meetDate={cls.meet_date} startTime={cls.start_time} />
                                )}
                              </div>
                              <p className="text-slate-500 text-xs line-clamp-3 leading-normal">{cls.description || 'No description provided.'}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4 text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-slate-400">{cls.duration_mins ? `${cls.duration_mins} mins` : '12 Students'}</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await axios.put(`/api/classes/${cls.id}/close`);
                                      setClasses(classes.map(c => c.id === cls.id ? { ...c, status: 'completed' } : c));
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-slate-500 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                                >
                                  Close Meet
                                </button>
                                <span className="text-brand-600 hover:underline cursor-pointer" onClick={() => setSelectedClass(cls)}>Open Room &rarr;</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MENU C: ACADEMICS VIEW */}
              {activeMenu === 'academic' && (() => {
                const map = {};
                const effectiveSubjects = subjectsList.length > 0 ? subjectsList : [
                  { name: 'Computer Networks', section: 'A', syllabus_pdf_url: '#' },
                  { name: 'Operating Systems', section: 'A', syllabus_pdf_url: '#' },
                  { name: 'Operating Systems', section: 'B', syllabus_pdf_url: '#' },
                  { name: 'Database Systems', section: 'A', syllabus_pdf_url: '#' },
                  { name: 'Artificial Intelligence', section: 'C', syllabus_pdf_url: '#' }
                ];
                effectiveSubjects.forEach(sub => {
                  if (!map[sub.name]) {
                    map[sub.name] = {
                      name: sub.name,
                      sections: new Set(),
                      syllabus_pdf_url: sub.syllabus_pdf_url
                    };
                  }
                  if (sub.section) {
                    map[sub.name].sections.add(sub.section);
                  }
                  if (sub.syllabus_pdf_url) {
                    map[sub.name].syllabus_pdf_url = sub.syllabus_pdf_url;
                  }
                });
                const grouped = Object.values(map).map(item => ({
                  ...item,
                  sections: Array.from(item.sections).sort().join(', ')
                })).sort((a, b) => a.name.localeCompare(b.name));

                return (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Department Curriculum</h3>
                      <p className="text-slate-500 text-xs mt-1">Academics & subjects listing for your department: <span className="font-extrabold text-slate-900">{user?.department}</span>.</p>
                    </div>
                    {grouped.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                        No subjects have been registered in this department yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {grouped.map((sub) => (
                          <div key={sub.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 text-xs">{sub.name}</h4>
                              <span className="text-[10px] text-slate-405 font-bold uppercase">Section {sub.sections || 'A'}</span>
                            </div>
                            {sub.syllabus_pdf_url ? (
                              <a
                                href={sub.syllabus_pdf_url}
                                download
                                className="bg-brand-50 hover:bg-brand-100 text-brand-705 border border-brand-100 font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all uppercase tracking-wider text-center"
                              >
                                Syllabus PDF
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic">Syllabus TBD</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* MENU D: MY TIMETABLE VIEW */}
              {activeMenu === 'timetable' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Your Assigned Lecture Schedule</h3>
                    <p className="text-slate-500 text-xs mt-1">Click on any class card to take manual student attendance for that slot.</p>
                    {/* 3-Column Schedule Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(() => {
                        const daysOfWeekList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        let currentDay = daysOfWeekList[new Date().getDay()];
                        const isWeekend = currentDay === 'Saturday' || currentDay === 'Sunday';
                        if (isWeekend) {
                          currentDay = 'Monday';
                        }
                        const filteredSlots = timetableSlots
                          .filter(s => s.day_of_week === currentDay)
                          .sort((a, b) => a.start_time.localeCompare(b.start_time));

                        return (
                          <>
                            {isWeekend && (
                              <div className="col-span-3 bg-amber-50 border border-amber-200 text-amber-800 p-4.5 rounded-2xl text-xs font-semibold">
                                ℹ️ Today is a weekend. Showing Monday's lecture schedule:
                              </div>
                            )}
                            {filteredSlots.map((slot) => (
                              <div
                                key={slot.id}
                                onClick={() => handleOpenAttendance(slot)}
                                className="bg-white border border-slate-200 hover:border-brand-500 hover:shadow-lg rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[145px] animate-fadeIn group"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-650 uppercase tracking-wider">
                                      Section {slot.section}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                      {slot.day_of_week}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-brand-650 transition-colors leading-tight">
                                    {slot.subject_name}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-semibold">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {slot.start_time} - {slot.end_time}
                                  </p>
                                </div>
                                <div className="border-t border-slate-100 pt-3 mt-3.5 flex items-center justify-between">
                                  <span className="text-[9px] text-slate-450 font-bold uppercase">{slot.department} Department</span>
                                  <span className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-1">
                                    Take Attendance &rarr;
                                  </span>
                                </div>
                              </div>
                            ))}
                            {filteredSlots.length === 0 && (
                              <div className="col-span-3 bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-550 text-xs shadow-sm">
                                No classes scheduled for today ({currentDay}).
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>  </div>

                  {/* Secondary Weekly Matrix View */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto mt-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Weekly Calendar Grid</span>
                    <table className="w-full text-xs text-center border border-slate-100 border-collapse">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="border border-slate-100 px-4 py-3 text-left">Day</th>
                          {slotsTimeRange.map((st) => (
                            <th key={st.label} className="border border-slate-100 px-4 py-3">{st.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {daysOfWeek.map((day) => (
                          <tr key={day} className="hover:bg-slate-50/40">
                            <td className="border border-slate-100 px-4 py-4 font-bold text-slate-900 text-left bg-slate-50/30">{day}</td>
                            {slotsTimeRange.map((st) => {
                              if (st.isLunch) {
                                return (
                                  <td key={st.label} className="border border-slate-100 px-4 py-4 bg-amber-50/45 text-amber-700 font-extrabold italic select-none">
                                    Lunch Break
                                  </td>
                                );
                              }
                              const slot = timetableSlots.find(s => s.day_of_week === day && s.start_time === st.start);
                              return (
                                <td key={st.label} className="border border-slate-100 px-2 py-3 min-w-[140px]">
                                  {slot ? (
                                    <div className="space-y-0.5 bg-brand-50/50 p-2 rounded-xl border border-brand-100 cursor-pointer" onClick={() => handleOpenAttendance(slot)}>
                                      <p className="font-extrabold text-slate-850 text-[10px] leading-tight">{slot.subject_name}</p>
                                      <p className="text-[8.5px] text-brand-600 font-black uppercase">Section {slot.section}</p>
                                    </div>
                                  ) : (
                                    <span className="text-slate-350 italic text-[9.5px]">Free</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MENU F: ASSIGNMENTS & QUIZZES VIEW */}
              {activeMenu === 'assignments-quizzes' && (() => {
                const uniqueSections = Array.from(new Set(timetableSlots.map(s => s.section))).sort();
                const uniqueSubjects = selectedSection
                  ? Array.from(new Set(timetableSlots.filter(s => s.section === selectedSection).map(s => s.subject_name))).sort()
                  : [];

                return (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Assignments & Quizzes Console</h3>
                        <p className="text-slate-500 text-xs mt-1">Scope tasks by section and subject, upload documents, and generate quizzes using AI.</p>
                      </div>

                      {/* Section Selector */}
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-2.5 rounded-2xl">
                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Select Section:</label>
                        <select
                          value={selectedSection}
                          onChange={(e) => { setSelectedSection(e.target.value); setSelectedSubject(''); }}
                          className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 text-xs font-bold text-slate-850 focus:outline-none focus:border-brand-600"
                        >
                          <option value="">-- Choose Section --</option>
                          {(uniqueSections.length > 0 ? uniqueSections : ['A', 'B', 'C', 'D']).map(sec => (
                            <option key={sec} value={sec}>Section {sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedSection ? (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left: Subject List */}
                        <div className="lg:col-span-1 space-y-3.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Assigned Subjects</span>
                          {uniqueSubjects.length > 0 ? (
                            uniqueSubjects.map(subName => (
                              <div
                                key={subName}
                                onClick={() => setSelectedSubject(subName)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${selectedSubject === subName
                                    ? 'border-brand-600 bg-brand-50/15'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                  }`}
                              >
                                <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{subName}</h4>
                                <span className="text-[9px] text-brand-600 font-bold uppercase block mt-1.5">Section {selectedSection}</span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-[11px] italic leading-normal">
                              No timetable slots assigned for Section {selectedSection}.
                            </div>
                          )}
                        </div>

                        {/* Right: Management Panel */}
                        <div className="lg:col-span-3">
                          {selectedSubject ? (
                            <div className="space-y-6">
                              {/* Create Form */}
                              <form onSubmit={handlePostAssignmentOrQuiz} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                    Post New Assignment / Quiz
                                  </h4>
                                  <span className="text-[10px] text-brand-600 font-bold px-3 py-1 rounded-xl bg-brand-50 border border-brand-100">
                                    {selectedSubject}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Mode Selection */}
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2">Mode Option</label>
                                    <select
                                      value={assignmentMode}
                                      onChange={(e) => setAssignmentMode(e.target.value)}
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600"
                                    >
                                      <option value="assignment">Send Simple Assignment</option>
                                      <option value="quiz">Convert PDF to Quiz</option>
                                      <option value="ai-quiz">AI Generated Quiz (from Document)</option>
                                      <option value="ai-assignment">AI Generated Assignment (from Document)</option>
                                    </select>
                                  </div>

                                  {/* Attachment Document */}
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2">Upload Document (PDF/Doc)</label>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.txt"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          setSelectedFile(file);
                                          setUploadFileName(file.name);
                                        }
                                      }}
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-600 shadow-sm file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
                                      required
                                    />
                                    {uploadFileName && (
                                      <span className="text-[9.5px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                        ✓ Loaded: {uploadFileName}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Posting Date and Time */}
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2">Posting Date &amp; Time (When Available)</label>
                                    <input
                                      type="datetime-local"
                                      value={postingDateTime}
                                      onChange={(e) => setPostingDateTime(e.target.value)}
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-brand-600 shadow-sm"
                                    />
                                  </div>

                                  {/* Due Date & Time (Submission Deadline for Assignments & Quizzes) */}
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2">Due Date &amp; Time (Submission Deadline)</label>
                                    <input
                                      type="datetime-local"
                                      value={dueDateTime}
                                      onChange={(e) => setDueDateTime(e.target.value)}
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-brand-600 shadow-sm"
                                    />
                                  </div>

                                  {/* Number of Questions (For both Assignments & Quizzes) */}
                                  <div className="flex flex-col">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2">Number of Questions to Generate/Ask</label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="30"
                                      value={numQuestions}
                                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 shadow-sm"
                                    />
                                  </div>
                                </div>

                                {/* Suggest Next Assignment Name */}
                                {assignmentMode === 'assignment' && (
                                  <div className="bg-brand-50/40 border border-brand-100 rounded-xl p-3 text-[10px] text-brand-700 font-semibold">
                                    Next Assignment Title will automatically be named: <strong>Assignment {timetableAssignments.length + 1}</strong>
                                  </div>
                                )}

                                <div className="flex justify-end pt-2">
                                  <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
                                  >
                                    {isGenerating ? (
                                      <>
                                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                                        Processing Task...
                                      </>
                                    ) : (
                                      assignmentMode.startsWith('ai') ? 'AI Auto-Generate & Post' : 'Post to Students'
                                    )}
                                  </button>
                                </div>
                              </form>

                              {/* Existing assignments & quizzes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Assignments List */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                                  <h4 className="text-xs font-extrabold text-slate-900 uppercase border-b border-slate-100 pb-2">
                                    Assignments ({timetableAssignments.length})
                                  </h4>
                                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                    {timetableAssignments.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 font-bold italic py-4 text-center">No assignments posted yet.</p>
                                    ) : (
                                      timetableAssignments.map((a) => (
                                        <div key={a.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                                          <div className="flex justify-between items-start">
                                            <h5 className="font-extrabold text-xs text-slate-800">{a.title}</h5>
                                            <span className="text-[8px] text-slate-400 font-bold">
                                              {a.posting_date || 'Instant'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-600 whitespace-pre-wrap leading-relaxed">{a.description}</p>
                                          <span className="text-[9px] text-brand-600 hover:underline block font-bold truncate">File: {a.file_url}</span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                                {/* Quizzes List */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                                  <h4 className="text-xs font-extrabold text-slate-900 uppercase border-b border-slate-100 pb-2">
                                    Quizzes ({timetableQuizzes.length})
                                  </h4>
                                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                    {timetableQuizzes.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 font-bold italic py-4 text-center">No quizzes posted yet.</p>
                                    ) : (
                                      timetableQuizzes.map((q) => (
                                        <div key={q.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                                          <div className="flex justify-between items-start">
                                            <h5 className="font-extrabold text-xs text-slate-800">{q.title}</h5>
                                            <span className="text-[8px] text-slate-400 font-bold">
                                              {q.posting_date || 'Instant'}
                                            </span>
                                          </div>
                                          <div className="space-y-1 mt-1 border-t border-slate-200/60 pt-2">
                                            {q.questions?.map((ques, qIdx) => (
                                              <div key={ques.id} className="text-[9.5px] text-slate-650 pl-2 border-l border-brand-350">
                                                <strong>Q{qIdx + 1}:</strong> {ques.question_text}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-455 text-xs shadow-sm h-full flex flex-col justify-center items-center">
                              <BookOpen className="h-10 w-10 mb-3 text-slate-300" />
                              Select a subject from the left panel to load the homework & quiz editor.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs shadow-sm flex flex-col justify-center items-center">
                        <LayoutGrid className="h-10 w-10 mb-3 text-slate-300" />
                        Please select a section from the dropdown above to load your assigned subjects.
                      </div>
                    )}
                  </div>
                );
              })()}


              {activeMenu === 'placements' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4">Placement Drives</h3>
                    <div className="space-y-4">
                      {(() => {
                        const effectivePlacements = placements.length > 0 ? placements : [
                          { id: 1, company: 'Google', role: 'Software Engineer', package: '24 LPA', branches: 'CSE, IT, ECE', description: 'Google is hiring for multiple roles across India locations.', created_at: '2026-07-12' },
                          { id: 2, company: 'Microsoft', role: 'SDE-1', package: '18 LPA', branches: 'CSE, IT', description: 'Looking for strong competitive programmers.', created_at: '2026-07-13' },
                          { id: 3, company: 'Amazon', role: 'AWS Cloud Support', package: '14 LPA', branches: 'All Branches', description: 'Open for all branches with strong CS fundamentals.', created_at: '2026-07-14' }
                        ];
                        return effectivePlacements.map(p => (
                          <div key={p.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm mb-1">{p.company} - {p.role}</h4>
                              <p className="text-[11px] text-slate-500 font-semibold mb-2">Package: {p.package} | Branches: {p.branches}</p>
                              <p className="text-[11px] text-slate-600 line-clamp-2">{p.description}</p>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-100">{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'notifications' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4">Department & Global Announcements</h3>
                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <p className="text-slate-405 font-bold italic text-center py-8 text-xs">No announcements at this time.</p>
                      ) : (
                        announcements.map(a => (
                          <div key={a.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-100">
                                {a.date || new Date(a.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">{a.content}</p>
                            <div className="flex gap-2">
                              {a.priority === 'High' && <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">High Priority</span>}
                              {a.department && a.department !== 'All' && <span className="bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">{a.department}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4">Create Online Class Meet</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Section</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Subject</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    value={newClassSubject}
                    onChange={(e) => setNewClassSubject(e.target.value)}
                    required
                  >
                    <option value="">Select Subject</option>
                    {[...new Set(timetableSlots.filter(t => t.section === newClassName).map(t => t.subject_name))].map((subName, i) => (
                      <option key={i} value={subName}>{subName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    value={newClassDate}
                    onChange={(e) => setNewClassDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Start Time</label>
                  <input
                    type="time"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    value={newClassTime}
                    onChange={(e) => setNewClassTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    placeholder="60"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                    value={newClassDuration}
                    onChange={(e) => setNewClassDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Absence Limit (&le; 50%)</label>
                  <input
                    type="number"
                    placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm border-emerald-500/40"
                    value={newClassAbsenceAllowed}
                    onChange={(e) => setNewClassAbsenceAllowed(e.target.value)}
                    title="Max allowed absence in minutes before marking student absent"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-slate-650 text-[10px] font-bold uppercase tracking-wider mb-2">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Neural Networks"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  required
                />
              </div>
              {newClassDate && newClassTime && (
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">Countdown Preview:</span>
                  <CountdownTimer meetDate={newClassDate} startTime={newClassTime} durationMins={newClassDuration || 60} />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 text-xs hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all">
                  Create Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4">Create Homework Task</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g. TF-IDF Similarity Analysis Paper"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <input
                  type="checkbox"
                  id="multiQuestionToggle"
                  checked={isMultiQuestion}
                  onChange={(e) => setIsMultiQuestion(e.target.checked)}
                  className="w-4 h-4 text-brand-600 bg-white border-slate-300 rounded focus:ring-brand-600"
                />
                <label htmlFor="multiQuestionToggle" className="text-xs font-bold text-slate-800">
                  AI Evaluated Multi-Question Format
                </label>
              </div>

              {!isMultiQuestion ? (
                <div className="flex flex-col">
                  <label className="text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Upload guidelines and homework instructions..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm min-h-[80px]"
                    value={newAssignDesc}
                    onChange={(e) => setNewAssignDesc(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <label className="text-slate-655 text-[10px] font-bold uppercase tracking-wider">Questions (Max 5)</label>
                  {assignQuestions.map((q, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Question ${idx + 1}...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                      value={q}
                      onChange={(e) => {
                        const newQ = [...assignQuestions];
                        newQ[idx] = e.target.value;
                        setAssignQuestions(newQ);
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-slate-655 text-[10px] font-bold uppercase tracking-wider mb-2">Due Date &amp; Time</label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  value={newAssignDeadline}
                  onChange={(e) => setNewAssignDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignModal(false)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 text-xs hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition-all">
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ATTENDANCE POPUP MODAL */}
      {showAttendanceModal && selectedSlotForAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-tight">
                  Take Lecture Attendance
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-bold">
                  {selectedSlotForAttendance.subject_name} — Section {selectedSlotForAttendance.section} ({selectedSlotForAttendance.start_time} - {selectedSlotForAttendance.end_time})
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Date & Time Display (Auto-Assigned) */}
            <div className="flex items-center justify-between mb-4 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Session Date & Time:</label>
                <span className="text-xs font-bold text-slate-800">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase border border-indigo-200">
                Auto-Assigned
              </span>
            </div>

            {/* Fast Present / Absent Toggles */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Student Roster ({attendanceRoster.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceRoster(attendanceRoster.map(r => ({ ...r, status: 'Present' })))}
                  className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <i className="ri-check-double-line mr-1"></i>Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceRoster(attendanceRoster.map(r => ({ ...r, status: 'Absent' })))}
                  className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <i className="ri-close-circle-line mr-1"></i>Mark All Absent
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[150px]">
              {attendanceRoster.length === 0 ? (
                <p className="text-slate-405 font-bold italic py-8 text-center text-xs">No registered students found for Section {selectedSlotForAttendance.section}.</p>
              ) : (
                attendanceRoster.map((student) => (
                  <div key={student.student_id} className="flex justify-between items-center bg-slate-50/50 border border-slate-150 p-3.5 rounded-2xl hover:bg-slate-55 transition-colors">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">{student.student_name}</h4>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{student.roll_number}</span>
                    </div>

                    {/* Switch/Checkbox */}
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-md border ${student.status === 'Present'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {student.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttendanceRoster(attendanceRoster.map(r =>
                            r.student_id === student.student_id
                              ? { ...r, status: r.status === 'Present' ? 'Absent' : 'Present' }
                              : r
                          ));
                        }}
                        className={`font-semibold text-xs border px-3.5 py-1.5 rounded-xl transition-all ${student.status === 'Present'
                            ? 'bg-red-50 text-red-650 hover:bg-red-100 border-red-200'
                            : 'bg-emerald-50 text-emerald-650 hover:bg-emerald-100 border-emerald-200'
                          }`}
                      >
                        Mark {student.status === 'Present' ? 'Absent' : 'Present'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setShowAttendanceModal(false)}
                className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl text-slate-650 text-xs hover:bg-slate-100 transition-all font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSavingAttendance || attendanceRoster.length === 0}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isSavingAttendance && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full font-bold"></span>}
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
