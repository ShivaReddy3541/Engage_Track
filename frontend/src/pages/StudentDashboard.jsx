import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { 
  LogOut, User, GraduationCap, LayoutGrid, CheckCircle2,
  Calendar, FileText, Send, Video, ShieldAlert, AlertTriangle, MessageSquare, Play,
  Download, Clock, Check, ChevronRight, Briefcase, Award, Zap, Bell, CheckSquare, Search, Lock, ChevronDown,
  BarChart2, TrendingUp, TrendingDown, PlayCircle, BookOpen, ListTodo, Edit3, Users
} from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import ProfileModal from '../components/ProfileModal';
import LiveProtector from '../components/LiveProtector';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  
  // Dashboard Overall States
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [allUpcomingAssignments, setAllUpcomingAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [joiningClass, setJoiningClass] = useState(null);
  
  // Sidebar Navigation Menu state
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeClassTab, setActiveClassTab] = useState('wall'); 
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Modal States
  const [authModalClass, setAuthModalClass] = useState(null);
  const [authRollNo, setAuthRollNo] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Meet Auth Modal States
  const [meetAuthModal, setMeetAuthModal] = useState(null);
  const [meetAuthEmail, setMeetAuthEmail] = useState('');
  const [meetAuthPassword, setMeetAuthPassword] = useState('');

  // Assignments & Quizzes Menu States
  const [activeSubTab, setActiveSubTab] = useState('ongoing');
  const [selectedAssignForSubmit, setSelectedAssignForSubmit] = useState(null);
  const [submitText, setSubmitText] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [selectedQuizToAttempt, setSelectedQuizToAttempt] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  
  // Profile dropdown menu state and modal
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeMeets, setActiveMeets] = useState([]);

  // Class Wall States
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); 

  // Assignment States
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [mySubmissions, setMySubmissions] = useState({}); 

  // Announcements and Fees
  const [announcements, setAnnouncements] = useState([]);
  const [studentFee, setStudentFee] = useState(null);

  // New States: Notifications, Academics, Timetable
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [academicAssignments, setAcademicAssignments] = useState([]);
  const [academicQuizzes, setAcademicQuizzes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

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

  // Feedback Messages
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Dashboard Enhancements
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedRecordedSession, setSelectedRecordedSession] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLeaderboardData([
      { id: 1, name: 'S. Amith Reddy', score: 98.4, trend: 'up', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amith' },
      { id: 2, name: 'P. Sneha Latha', score: 95.2, trend: 'same', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
      { id: 3, name: user?.full_name || 'You', score: 92.1, trend: 'up', isUser: true, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}` },
      { id: 4, name: 'K. Vikrant Sharma', score: 89.0, trend: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikrant' },
      { id: 5, name: 'M. Sandeep Kumar', score: 87.5, trend: 'up', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sandeep' },
      { id: 6, name: 'R. Anjali Devi', score: 85.3, trend: 'same', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali' },
      { id: 7, name: 'T. Rahul Verma', score: 82.8, trend: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' }
    ]);
  }, [user]);

  useEffect(() => {
    if (activeMenu === 'leaderboard') {
      const interval = setInterval(() => {
        setLeaderboardData(prev => {
          let newData = prev.map(student => {
            const change = (Math.random() - 0.5) * 0.8; 
            const newScore = Math.min(100, Math.max(0, student.score + change));
            return {
              ...student,
              score: Number(newScore.toFixed(1)),
              trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'same'
            };
          });
          return newData.sort((a, b) => b.score - a.score);
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [activeMenu]);

  // Handlers for active class sub-view
  const fetchClassWall = async () => {
    try {
      const res = await axios.get(`/api/classes/${selectedClass.id}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyJoin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');
    try {
      await axios.post(`/api/classes/${authModalClass.id}/verify-join`, {
        roll_no: authRollNo,
        password: authPassword
      });
      setSelectedClass(authModalClass);
      setAuthModalClass(null);
      setAuthRollNo('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyMeetJoin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');
    try {
      // Use existing login endpoint to verify email and password
      await axios.post('/api/auth/login', {
        email: meetAuthEmail,
        password: meetAuthPassword
      });
      
      // If success, allow join
      setSelectedClass(meetAuthModal);
      setMeetAuthModal(null);
      setMeetAuthEmail('');
      setMeetAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchClassAssignments = async () => {
    try {
      const res = await axios.get(`/api/classes/${selectedClass.id}/assignments`);
      setAssignments(res.data);
      res.data.forEach(async (assign) => {
        try {
          const subRes = await axios.get(`/api/classes/assignments/${assign.id}/submissions`);
          if (subRes.data.length > 0) {
            setMySubmissions(prev => ({ ...prev, [assign.id]: subRes.data[0] }));
          }
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (classId, className) => {
    try {
      setJoiningClass(classId);
      await axios.post(`/api/classes/${classId}/enroll`);
      setFeedbackMsg(`Successfully enrolled in '${className}'!`);
      fetchEnrolledClasses();
      fetchAvailableClasses();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Enrollment failed.');
    } finally {
      setJoiningClass(null);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      await axios.post(`/api/classes/${selectedClass.id}/posts`, { content: newPostContent });
      setNewPostContent('');
      fetchClassWall();
    } catch (err) {
      alert('Post failed.');
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    try {
      await axios.post(`/api/classes/posts/${postId}/comments`, { content: commentText });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchClassWall();
    } catch (err) {
      alert('Comment failed.');
    }
  };

  const fetchEnrolledClasses = async () => {
    try {
      const res = await axios.get('/api/classes');
      setEnrolledClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const res = await axios.get('/api/classes/all-available');
      setAvailableClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentDashboardData = async () => {
    try {
      const annRes = await axios.get('/api/admin/announcements').catch(() => ({ data: [] }));
      setAnnouncements(annRes.data);

      const feeRes = await axios.get('/api/admin/fees').catch(() => ({ data: [] }));
      const myFee = feeRes.data.find(f => f.student_id === user?.id);
      if (myFee) {
        setStudentFee(myFee);
      }

      const notifRes = await axios.get('/api/notifications').catch(() => ({ data: [] }));
      setNotificationsList(notifRes.data);

      const dept = user?.department || '';
      const sec = user?.section || '';
      if (dept) {
        const subRes = await axios.get(`/api/academic/subjects?department=${dept}&section=${sec}`).catch(() => ({ data: [] }));
        setSubjectsList(subRes.data);
        const ttRes = await axios.get(`/api/academic/timetable?department=${dept}&section=${sec}`).catch(() => ({ data: [] }));
        setTimetableSlots(ttRes.data);

        const assignRes = await axios.get('/api/academic/student/assignments').catch(() => ({ data: [] }));
        setAcademicAssignments(assignRes.data);
        const quizRes = await axios.get('/api/academic/student/quizzes').catch(() => ({ data: [] }));
        setAcademicQuizzes(quizRes.data);
        const submissionRes = await axios.get('/api/academic/student/submissions').catch(() => ({ data: [] }));
        const classSubRes = await axios.get('/api/classes/assignments/student/my-submissions').catch(() => ({ data: [] }));
        const subMap = {};
        submissionRes.data.forEach(sub => {
          subMap[sub.assignment_id] = sub;
          subMap[`academic-${sub.assignment_id}`] = sub;
        });
        classSubRes.data.forEach(sub => {
          subMap[sub.assignment_id] = sub;
          subMap[`class-${sub.assignment_id}`] = sub;
        });
        setMySubmissions(prev => ({ ...prev, ...subMap }));

        const meetsRes = await axios.get('/api/academic/meets').catch(() => ({ data: [] }));
        setActiveMeets(meetsRes.data || []);

        const plcRes = await axios.get('/api/admin/placements').catch(() => ({ data: [] }));
        setPlacements(plcRes.data);
        const attRes = await axios.get('/api/academic/student/attendance').catch(() => ({ data: [] }));
        setAttendanceHistory(attRes.data);
      }
    } catch (err) {
      console.error(err);
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

  const fetchAllAssignments = async () => {
    try {
      const promises = enrolledClasses.map(cls => axios.get(`/api/classes/${cls.id}/assignments`));
      const results = await Promise.all(promises);
      let list = [];
      results.forEach((res, index) => {
        const className = enrolledClasses[index].name;
        res.data.forEach(assign => {
          list.push({ ...assign, className, source: 'class' });
        });
      });
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setAllUpcomingAssignments(list);
    } catch (err) {
      console.error("Error fetching all assignments:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentDashboardData();
      fetchEnrolledClasses();
      fetchAvailableClasses();
      
      const intervalId = setInterval(() => {
        fetchStudentDashboardData();
        fetchEnrolledClasses();
        fetchAvailableClasses();
      }, 15000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    if (enrolledClasses.length > 0 || user) {
      fetchAllAssignments();
    }
  }, [enrolledClasses, academicAssignments]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassWall();
      fetchClassAssignments();
      setSelectedAssignment(null);
      setActiveClassTab('wall');
    }
  }, [selectedClass]);

  const filteredCatalogClasses = availableClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.description && cls.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const mergedAssignments = [
    ...academicAssignments.map(a => ({ ...a, className: a.subject_name || `Section ${a.section || user?.section}`, source: 'academic' })),
    ...allUpcomingAssignments
  ];

  const upcomingAssignments = mergedAssignments.filter(a => !mySubmissions[a.id] && !(a.source && mySubmissions[`${a.source}-${a.id}`]) && a.posting_date && new Date(a.posting_date) > currentTime);
  const upcomingQuizzes = academicQuizzes.filter(q => !q.attempt && q.posting_date && new Date(q.posting_date) > currentTime);

  const completedAssignments = mergedAssignments.filter(a => mySubmissions[a.id] || (a.source && mySubmissions[`${a.source}-${a.id}`]));
  const completedQuizzes = academicQuizzes.filter(q => q.attempt);

  const ongoingAssignments = mergedAssignments.filter(a => {
    const isPosted = !a.posting_date || new Date(a.posting_date) <= currentTime;
    const isPastDeadline = a.deadline && new Date(a.deadline) < currentTime;
    const isSubmitted = !!(mySubmissions[a.id] || (a.source && mySubmissions[`${a.source}-${a.id}`]));
    return isPosted && !isPastDeadline && !isSubmitted;
  });
  const ongoingQuizzes = academicQuizzes.filter(q => {
    const isPosted = !q.posting_date || new Date(q.posting_date) <= currentTime;
    const isPastDeadline = q.deadline && new Date(q.deadline) < currentTime;
    const isAttempted = !!q.attempt;
    return isPosted && !isPastDeadline && !isAttempted;
  });

  const upcomingList = [
    ...upcomingAssignments.map(a => ({ ...a, type: 'assignment' })),
    ...upcomingQuizzes.map(q => ({ ...q, type: 'quiz' }))
  ];

  const ongoingList = [
    ...ongoingAssignments.map(a => ({ ...a, type: 'assignment' })),
    ...ongoingQuizzes.map(q => ({ ...q, type: 'quiz' }))
  ];

  const completedList = [
    ...completedAssignments.map(a => ({ ...a, type: 'assignment', status: 'Completed', score: mySubmissions[a.id]?.score, feedback: mySubmissions[a.id]?.feedback })),
    ...completedQuizzes.map(q => ({ ...q, type: 'quiz', status: 'Completed', score: q.attempt?.score, totalQuestions: q.attempt?.total_questions, completedAt: q.attempt?.completed_at }))
  ];

  const currentList = activeSubTab === 'upcoming' ? upcomingList : activeSubTab === 'ongoing' ? ongoingList : completedList;

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitText.trim()) return;
    setIsSubmittingAssign(true);
    try {
      if (selectedAssignForSubmit.source === 'class') {
        await axios.post(`/api/classes/assignments/${selectedAssignForSubmit.id}/submissions`, {
          submission_text: submitText
        });
      } else {
        const formData = new FormData();
        formData.append("submission_text", submitText);
        await axios.post(`/api/academic/student/assignments/${selectedAssignForSubmit.id}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert("Assignment submitted successfully!");
      setSubmitText('');
      setSelectedAssignForSubmit(null);
      fetchStudentDashboardData();
      fetchAllAssignments();
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setIsSubmittingQuiz(true);
    try {
      const res = await axios.post(`/api/academic/student/quizzes/${selectedQuizToAttempt.id}/submit`, quizAnswers);
      alert(`Quiz submitted! Score: ${res.data.score}/${res.data.total_questions}`);
      setSelectedQuizToAttempt(null);
      setQuizAnswers({});
      fetchStudentDashboardData();
    } catch (err) {
      alert("Quiz submission failed.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const initials = getInitials(user?.full_name);

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">
      
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none overflow-y-auto">
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <img src={branding.logo_url} className="h-8 w-auto object-contain max-w-[40px]" onError={(e) => { e.target.style.display = 'none'; }} alt="Logo" />
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none truncate max-w-[120px]">{branding.institution_name}</h2>
              <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider">Student Hub</span>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Overview</span>
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                  { id: 'report', label: 'Overall Report', icon: BarChart2 },
                  { id: 'leaderboard', label: 'Student Leaderboard', icon: TrendingUp }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedClass(null); setActiveMenu(item.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeMenu === item.id && !selectedClass
                        ? 'bg-brand-50 text-brand-600' 
                        : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Learning</span>
              <nav className="space-y-1">
                {[
                  { id: 'assignments', label: 'Assignments', icon: ListTodo },
                  { id: 'browse', label: 'Browse Classes', icon: Search },
                  { id: 'academic', label: 'Academics', icon: BookOpen },
                  { id: 'timetable', label: 'Timetable', icon: Calendar },
                  { id: 'sessions', label: 'Online Meets', icon: Clock }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedClass(null); setActiveMenu(item.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeMenu === item.id && !selectedClass
                        ? 'bg-brand-50 text-brand-600' 
                        : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Student Center</span>
              <nav className="space-y-1">
                {[
                  { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
                  { id: 'announcements', label: 'Announcements', icon: Bell },
                  { id: 'placements', label: 'Placements', icon: Briefcase }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedClass(null); setActiveMenu(item.id); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      activeMenu === item.id && !selectedClass
                        ? 'bg-brand-50 text-brand-600' 
                        : 'text-slate-655 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">{branding.institution_name} Portal</span>
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
                          className={`p-2.5 rounded-xl border text-[10px] cursor-pointer transition-colors leading-normal ${
                            n.is_read 
                              ? 'bg-slate-50 border-slate-100 text-slate-500' 
                              : 'bg-blue-50/40 border-blue-100 text-slate-850 font-semibold'
                          }`}
                        >
                          <p>{n.message}</p>
                          <span className="text-[8px] text-slate-400 block mt-1">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
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

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-150 p-4 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="h-10 w-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-955 line-clamp-1 leading-tight">{user.full_name}</h4>
                      <span className="text-[10px] text-slate-500 break-all">{user.email}</span>
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

        <main className="flex-1 p-8 overflow-y-auto">
          {feedbackMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {feedbackMsg}
            </div>
          )}

          {selectedClass ? (
            <div className="mt-4">
              <LiveProtector 
                classData={selectedClass} 
                isHost={false} 
                onLeave={() => setSelectedClass(null)} 
              />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
              
              {/* DASHBOARD TAB */}
              {activeMenu === 'dashboard' && (
                <div className="space-y-6 animate-fadeIn">
                  {(() => {
                    const now = new Date();
                    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const combinedLiveMeets = [
                      ...activeMeets.filter(m => !user?.section || m.section === user?.section).map(m => ({ ...m, name: m.topic || m.subject_name || 'Online Meet', source: 'meet' })),
                      ...enrolledClasses.filter(c => c.meet_date && c.start_time).map(c => ({ ...c, source: 'class' }))
                    ].filter(c => c.status !== 'completed' && c.status !== 'closed' && c.is_active !== false);

                    const upcomingMeets = combinedLiveMeets.filter(c => {
                      if (c.meet_date < todayStr) return false;
                      if (!c.start_time) return true;
                      
                      const [hours, mins] = (c.start_time || '00:00').split(':').map(Number);
                      const startTime = new Date(now);
                      startTime.setHours(hours, mins, 0, 0);
                      const duration = parseInt(c.duration_mins) || 60;
                      const endTime = new Date(startTime.getTime() + duration * 60000);
                      
                      return (c.meet_date === todayStr && now < endTime) || c.meet_date > todayStr;
                    }).sort((a, b) => {
                      if (a.meet_date !== b.meet_date) return (a.meet_date || '').localeCompare(b.meet_date || '');
                      return (a.start_time || '').localeCompare(b.start_time || '');
                    });

                    if (upcomingMeets.length > 0) {
                      const nextMeet = upcomingMeets[0];
                      return (
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg">Upcoming Online Class: {nextMeet.name}</h3>
                              <p className="text-emerald-100 text-xs font-semibold">
                                Scheduled for {nextMeet.meet_date} {nextMeet.start_time ? `at ${nextMeet.start_time}` : ''}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveMenu('sessions')}
                            className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-sm"
                          >
                            View Sessions
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="bg-gradient-to-br from-brand-600 to-indigo-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-black tracking-tight mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h2>
                      <p className="text-brand-100 text-xs font-semibold max-w-md leading-relaxed">
                        Stay updated with your latest assignments, upcoming classes, and announcements.
                      </p>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 pointer-events-none"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveMenu('announcements')}>
                      <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Bell className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Announcements</h4>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{announcements.length} New</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dept Points</h4>
                        <p className="text-xl font-black text-slate-900 mt-0.5">350</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveMenu('sessions')}>
                      <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Today's Classes</h4>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{enrolledClasses.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNMENTS OVERVIEW SECTION */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-brand-600"/> Assignments Overview
                      </h3>
                      <button onClick={() => setActiveMenu('assignments')} className="text-[10px] font-bold text-brand-600 uppercase tracking-wider hover:underline">View All &rarr;</button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Upcoming */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="h-4 w-4"/> Upcoming ({upcomingList.length})</h4>
                        <div className="space-y-3">
                          {upcomingList.length > 0 ? (
                            upcomingList.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-amber-700 bg-amber-50 border border-amber-200 mb-1.5 inline-block">
                                    {item.className || item.subject_name || `Section ${item.section || user?.section}`}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h5>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-semibold text-slate-500">{item.posting_date ? `Post: ${item.posting_date}` : 'Upcoming'}</span>
                                  <button onClick={() => { setActiveMenu('assignments'); setActiveSubTab('upcoming'); }} className="font-bold text-brand-600 hover:underline">View &rarr;</button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                              No upcoming assignments.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ongoing */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2"><Edit3 className="h-4 w-4"/> Ongoing ({ongoingList.length})</h4>
                        <div className="space-y-3">
                          {ongoingList.length > 0 ? (
                            ongoingList.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-blue-700 bg-blue-50 border border-blue-200 mb-1.5 inline-block">
                                    {item.className || item.subject_name || `Section ${item.section || user?.section}`}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h5>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-semibold text-slate-500">{item.deadline ? `Due: ${item.deadline.split('T')[0]}` : 'Active'}</span>
                                  <button onClick={() => { setActiveMenu('assignments'); setActiveSubTab('ongoing'); setSelectedAssignForSubmit(item); }} className="font-bold text-blue-600 hover:underline">Submit &rarr;</button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                              No ongoing assignments.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Completed */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Completed ({completedList.length})</h4>
                        <div className="space-y-3">
                          {completedList.length > 0 ? (
                            completedList.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm opacity-85 flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200 mb-1.5 inline-block">
                                    {item.className || item.subject_name || `Section ${item.section || user?.section}`}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900 line-clamp-1 line-through">{item.title}</h5>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-emerald-600">{item.score ? `Graded: ${item.score}` : 'Submitted'}</span>
                                  <span className="text-slate-400 font-semibold">Done</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                              No completed work yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ASSIGNMENTS TAB */}
              {activeMenu === 'assignments' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <ListTodo className="h-5 w-5 text-brand-600"/> All Assignments & Work
                      </h3>
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                        <button 
                          onClick={() => setActiveSubTab('upcoming')} 
                          className={`px-3.5 py-1.5 rounded-lg transition-all ${activeSubTab === 'upcoming' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Upcoming ({upcomingList.length})
                        </button>
                        <button 
                          onClick={() => setActiveSubTab('ongoing')} 
                          className={`px-3.5 py-1.5 rounded-lg transition-all ${activeSubTab === 'ongoing' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Ongoing ({ongoingList.length})
                        </button>
                        <button 
                          onClick={() => setActiveSubTab('completed')} 
                          className={`px-3.5 py-1.5 rounded-lg transition-all ${activeSubTab === 'completed' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                          Completed ({completedList.length})
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentList.length > 0 ? (
                        currentList.map((task, i) => (
                          <div key={i} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 border border-slate-200 p-5 rounded-2xl gap-4 hover:shadow-sm transition-all">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-blue-700 bg-blue-100 border border-blue-200 inline-block`}>
                                  {task.className || task.subject_name || `Section ${task.section || user?.section}`}
                                </span>
                                {task.type === 'quiz' && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-purple-700 bg-purple-100 border border-purple-200">
                                    Quiz
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                              <p className="text-xs text-slate-500 font-semibold mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                {task.posting_date && <span className="text-slate-600">Available: {task.posting_date}</span>}
                                {task.deadline && <span className="text-amber-700 font-bold">Due: {new Date(task.deadline).toLocaleString()}</span>}
                                {!task.posting_date && !task.deadline && <span>Active Work</span>}
                              </p>
                              {task.instructions && <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-white p-2.5 rounded-xl border border-slate-150">{task.instructions}</p>}
                              {task.feedback && (
                                <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                                  <strong>Teacher/AI Feedback:</strong> {task.feedback}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {activeSubTab === 'completed' ? (
                                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4"/> {task.score ? `Graded: ${task.score}` : 'Submitted'}
                                </span>
                              ) : activeSubTab === 'upcoming' ? (
                                <span className="px-4 py-2 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl">
                                  Not Yet Active
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    if (task.type === 'quiz') {
                                      setSelectedQuizToAttempt(task);
                                    } else {
                                      setSelectedAssignForSubmit(task);
                                    }
                                  }}
                                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                                >
                                  {task.type === 'quiz' ? 'Start Quiz' : 'Answer Assignment'} &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <ListTodo className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 font-semibold">No {activeSubTab} assignments found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMICS TAB */}
              {activeMenu === 'academic' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand-600"/> My Curriculum & Syllabus</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { name: 'Computer Networks', credits: 4, type: 'Core' },
                        { name: 'Operating Systems', credits: 4, type: 'Core' },
                        { name: 'Database Systems', credits: 3, type: 'Core' },
                        { name: 'Cloud Computing', credits: 3, type: 'Elective' }
                      ].map((sub, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{sub.type}</span>
                            <span className="text-[10px] font-bold text-brand-600">{sub.credits} Credits</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mb-4">{sub.name}</h4>
                          <button className="w-full py-2 bg-slate-50 group-hover:bg-brand-50 group-hover:text-brand-600 text-slate-600 text-xs font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                            <Download className="h-3.5 w-3.5" /> Download Syllabus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TIMETABLE TAB */}
              {activeMenu === 'timetable' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2"><Calendar className="h-5 w-5 text-brand-600"/> Weekly Schedule</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">Section {user?.section || 'A'}</span>
                    </div>
                    <div className="space-y-3">
                      {daysOfWeek.map((day, i) => {
                        const daySlots = timetableSlots.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                        if (daySlots.length === 0) return null;
                        return (
                          <div key={i} className="flex flex-col md:flex-row gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                            <div className="w-24 shrink-0 flex items-center md:border-r border-slate-200 md:pr-4">
                              <span className="font-black text-slate-800 uppercase tracking-wide text-xs">{day}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {daySlots.map((cls, j) => (
                                <div key={j} className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                  <span className="text-[10px] font-bold text-brand-600 mb-1 block">{cls.start_time} - {cls.end_time}</span>
                                  <h5 className="font-bold text-slate-900 text-xs">{cls.subject_name}</h5>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{cls.teacher_name || 'TBA'}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {timetableSlots.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm font-semibold">
                          No timetable slots scheduled for your section yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeMenu === 'attendance' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
                    <CheckSquare className="h-12 w-12 text-brand-600 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 mb-1">My Attendance Report</h3>
                    <p className="text-xs text-slate-500 font-semibold mb-8">Maintain above 75% to be eligible for finals.</p>
                    
                    <div className="flex justify-center mb-8">
                      <div className="relative h-48 w-48 flex items-center justify-center rounded-full bg-emerald-50 border-[12px] border-emerald-500 shadow-inner">
                        <div className="text-center">
                          <span className="text-4xl font-black text-emerald-700">94%</span>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 mt-1">Overall</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      {[
                        { name: 'Computer Networks', p: 95 },
                        { name: 'Operating Systems', p: 88 },
                        { name: 'Database Systems', p: 100 }
                      ].map((sub, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-xs">{sub.name}</span>
                          <span className={`font-black text-sm ${sub.p >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{sub.p}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS TAB */}
              {activeMenu === 'announcements' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Bell className="h-5 w-5 text-brand-600"/> Official Announcements</h3>
                    <div className="space-y-4">
                      {[
                        { title: 'Mid-Term Examination Schedule Released', date: 'Oct 12, 2026', sender: 'Exam Branch', type: 'Critical' },
                        { title: 'Guest Lecture on AI next Friday', date: 'Oct 10, 2026', sender: 'CS Department', type: 'Event' }
                      ].map((ann, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex gap-4">
                          <div className="h-10 w-10 shrink-0 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${ann.type === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{ann.type}</span>
                              <span className="text-[10px] font-bold text-slate-400">{ann.date} • {ann.sender}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-2">{ann.title}</h4>
                            <button className="text-[10px] font-bold text-brand-600 hover:underline uppercase tracking-wider">Read Full Notice &rarr;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PLACEMENTS TAB */}
              {activeMenu === 'placements' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2"><Briefcase className="h-5 w-5 text-brand-600"/> Placement Drives</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[
                        { company: 'Google', role: 'Software Engineer', pkg: '24 LPA', deadline: 'Oct 20, 2026' },
                        { company: 'Microsoft', role: 'SDE-1', pkg: '18 LPA', deadline: 'Oct 25, 2026' }
                      ].map((job, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-brand-300 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xl">{job.company.charAt(0)}</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">{job.company}</h4>
                                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{job.role}</p>
                              </div>
                            </div>
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-lg">{job.pkg}</span>
                          </div>
                          <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Closes: {job.deadline}</span>
                            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 font-medium leading-relaxed">
                              <strong>Instructions:</strong> Please prepare thoroughly on core CS topics (DSA, OS, DBMS). Read the JD carefully. Ensure you are well-dressed in formal uniform on the day of the drive. Maintain strict discipline.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 bg-brand-50 border border-brand-100 rounded-2xl p-6">
                      <h4 className="font-bold text-brand-800 text-sm mb-2">General Placement Guidelines</h4>
                      <ul className="list-disc list-inside text-xs text-brand-700 space-y-1">
                        <li>Maintain a minimum CGPA as prescribed by the companies.</li>
                        <li>Update your resume and get it verified by the placement cell.</li>
                        <li>Attend all pre-placement talks and mock interviews.</li>
                        <li>Strictly adhere to the college uniform and grooming standards.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SESSIONS TAB */}
              {activeMenu === 'sessions' && (() => {
                const combinedLiveMeets = [
                  ...activeMeets.filter(m => !user?.section || m.section === user?.section).map(m => ({ ...m, name: m.topic || m.subject_name || 'Online Meet', source: 'meet' })),
                  ...enrolledClasses.filter(c => c.meet_date && c.start_time).map(c => ({ ...c, source: 'class' }))
                ].filter(c => c.status !== 'completed' && c.status !== 'closed' && c.is_active !== false && c.name !== 'Interactive Class Meeting');

                return (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2"><Video className="h-5 w-5 text-brand-600"/> Live Online Sessions</h3>
                    {combinedLiveMeets.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                        <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Video className="h-6 w-6 text-slate-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 mb-1">No Active Sessions</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">Your teachers have not scheduled any live online classes for this time.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {combinedLiveMeets.map(meet => (
                          <div 
                            key={meet.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 line-clamp-1">
                                <BookOpen className="h-5 w-5 text-brand-605" />
                                {meet.name || meet.subject_name || 'Online Class'}
                              </h4>
                              {meet.meet_date && meet.start_time && (
                                <CountdownTimer meetDate={meet.meet_date} startTime={meet.start_time} durationMins={meet.duration_mins || 60} />
                              )}
                            </div>
                            <p className="text-slate-500 text-xs line-clamp-2 leading-normal">{meet.topic || meet.description || 'Live online instruction session.'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Section {meet.section || user?.section || 'A'}</p>
                            
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4 text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-slate-400">{meet.duration_mins ? `${meet.duration_mins} mins` : 'Live Class'}</span>
                              {(() => {
                                if (!meet.meet_date || !meet.start_time) {
                                  return (
                                    <button onClick={() => setMeetAuthModal(meet)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Join Meet &rarr;
                                    </button>
                                  );
                                }
                                const targetTime = new Date(`${meet.meet_date}T${meet.start_time.length === 5 ? meet.start_time + ':00' : meet.start_time}`).getTime();
                                const diff = targetTime - Date.now();
                                const durationMs = (meet.duration_mins || 60) * 60 * 1000;
                                const canJoin = diff <= 5 * 60 * 1000 && diff >= -durationMs;
                                return canJoin ? (
                                  <button onClick={() => setMeetAuthModal(meet)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Join Meet &rarr;
                                  </button>
                                ) : (
                                  <span className="text-slate-400 font-medium">Available 5 mins before</span>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* BROWSE TAB */}
              {activeMenu === 'browse' && (() => {
                const recordedSessions = [
                  ...activeMeets.filter(m => m.recording_url || m.status === 'ended').map(m => ({
                    id: m.meeting_id || m.id,
                    name: m.topic || m.subject_name || 'Online Meet Recording',
                    department: m.department || user?.department || 'CSE',
                    section: m.section || user?.section || 'A',
                    duration_mins: m.duration_mins || 60,
                    date: m.meet_date || 'Recent',
                    recording_url: m.recording_url || `https://engageai.edu/recordings/${m.meeting_id || m.id}.mp4`
                  }))
                ];
                return (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Search className="h-5 w-5 text-brand-600"/> Browse Previous Recorded Sessions
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold">{recordedSessions.length} Recorded Sessions Available</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recordedSessions.map(rec => (
                        <div key={rec.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                          <div>
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                              <PlayCircle className="h-12 w-12 text-slate-400 group-hover:text-brand-500 group-hover:scale-110 transition-all z-10 cursor-pointer" onClick={() => window.open(rec.recording_url, '_blank')} />
                              <div className="absolute top-2 left-2 bg-brand-600/90 px-2 py-0.5 rounded text-[9px] text-white font-bold backdrop-blur-sm">
                                RECORDED
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold backdrop-blur-sm">
                                {rec.duration_mins}:00
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                                <span>{rec.department} • Sec {rec.section}</span>
                                <span>{rec.date}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{rec.name}</h4>
                            </div>
                          </div>
                          <div className="px-4 pb-4">
                            <button 
                              onClick={() => window.open(rec.recording_url, '_blank')}
                              className="w-full py-2 bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" /> Watch Recording
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* LEADERBOARD TAB */}
              {activeMenu === 'leaderboard' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-brand-600 to-indigo-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 mb-2">
                        <TrendingUp className="h-6 w-6 text-brand-200" />
                        Live Student Leaderboard
                      </h2>
                      <p className="text-brand-100 text-xs font-semibold max-w-lg leading-relaxed">
                        Real-time performance rankings based on academic scores, assignments, and class participation. Keep pushing to reach the top!
                      </p>
                    </div>
                    <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="px-6 py-4 w-20 text-center">Rank</th>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4 text-center w-32">Trend</th>
                          <th className="px-6 py-4 text-right w-32">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboardData.map((student, index) => (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-center">
                              {index === 0 ? <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-700 font-black text-sm">1</span> :
                               index === 1 ? <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-600 font-black text-sm">2</span> :
                               index === 2 ? <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-800 font-black text-sm">3</span> :
                               <span className="text-slate-400 font-bold text-sm">{index + 1}</span>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={student.avatar} alt={student.name} className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200" />
                                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {student.trend === 'up' ? <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto" /> :
                               student.trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500 mx-auto" /> :
                               <span className="text-slate-300 font-bold">-</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-black text-slate-900 text-sm">{student.score.toFixed(1)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OVERALL REPORT TAB */}
              {activeMenu === 'report' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><BarChart2 className="h-6 w-6 text-brand-600"/> My Academic Report</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 text-center">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">Current CGPA</span>
                        <span className="text-3xl font-black text-brand-900">8.42</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Global Rank</span>
                        <span className="text-3xl font-black text-emerald-900">4</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Assignments Done</span>
                        <span className="text-3xl font-black text-blue-900">24/26</span>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-center">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">Activeness Score</span>
                        <span className="text-3xl font-black text-purple-900">92%</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Semester Performance</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Semester 1 */}
                        <div className="border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                          <h4 className="font-bold text-slate-900 text-sm mb-4">Semester 1</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">SGPA</span>
                              <span className="font-bold text-slate-800">8.10</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Credits Cleared</span>
                              <span className="font-bold text-slate-800">22/22</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Attendance</span>
                              <span className="font-bold text-slate-800">85%</span>
                            </div>
                          </div>
                        </div>

                        {/* Semester 2 */}
                        <div className="border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                          <h4 className="font-bold text-slate-900 text-sm mb-4">Semester 2</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">SGPA</span>
                              <span className="font-bold text-slate-800">8.65</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Credits Cleared</span>
                              <span className="font-bold text-slate-800">24/24</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Attendance</span>
                              <span className="font-bold text-slate-800">91%</span>
                            </div>
                          </div>
                        </div>

                        {/* Semester 3 (Current) */}
                        <div className="border border-brand-200 bg-brand-50/30 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-brand-900 text-sm">Semester 3</h4>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-600 bg-brand-100 px-2 py-0.5 rounded">Current</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-semibold">Mid-Term Est.</span>
                              <span className="font-bold text-slate-900">8.80</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-semibold">Assignments</span>
                              <span className="font-bold text-slate-900">9/10</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-semibold">Attendance</span>
                              <span className="font-bold text-emerald-600">96%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Auth Modal */}
      {authModalClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 animate-scaleIn">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-600" />
              Authentication Required
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Please enter your Roll Number and Password to join the live session for <b>{authModalClass.name}</b>.
            </p>
            
            {authError && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 border border-red-100">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyJoin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Roll Number</label>
                <input
                  type="text"
                  required
                  value={authRollNo}
                  onChange={(e) => setAuthRollNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. 26CS001"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalClass(null);
                    setAuthError('');
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-2.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  {isVerifying ? 'Verifying...' : 'Join Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meet Auth Modal */}
      {meetAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 animate-scaleIn">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" />
              Join Live Class
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Please verify your identity with your <b>Email and Password</b> to join the live session for <b>{meetAuthModal.topic || meetAuthModal.subject_name}</b>.
            </p>
            
            {authError && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl mb-4 border border-red-100">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyMeetJoin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  value={meetAuthEmail}
                  onChange={(e) => setMeetAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  value={meetAuthPassword}
                  onChange={(e) => setMeetAuthPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMeetAuthModal(null);
                    setAuthError('');
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {selectedAssignForSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight mb-4">Submit Assignment</h3>
            <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">General Instructions & Academic Integrity</h4>
              </div>
              <ul className="text-xs text-amber-800 font-medium space-y-1 pl-5 list-disc">
                <li><strong>Do not copy from others:</strong> Plagiarism is strictly prohibited and monitored.</li>
                <li><strong>Copy-paste is disabled:</strong> All answers must be typed manually to maintain originality.</li>
                <li><strong>Minimum length requirement:</strong> Minimum 200 words per answer required for complete evaluation.</li>
              </ul>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formDataObj = new FormData(e.target);
              let finalSubmitText = submitText;
              
              const qList = (() => {
                if (!selectedAssignForSubmit || !selectedAssignForSubmit.description) return ["Please provide your detailed submission below based on the attached document."];
                try {
                  const parsed = JSON.parse(selectedAssignForSubmit.description);
                  if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                    return parsed.questions;
                  }
                } catch(err) {}
                const lines = selectedAssignForSubmit.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const extracted = [];
                lines.forEach(l => {
                  const match = l.match(/^(?:Q?\d+[\.:\)\]]|\bQuestion\s+\d+[\.:\)\]]?)\s+(.+)$/i);
                  if (match) extracted.push(match[1]);
                });
                if (extracted.length > 0) return extracted;
                return [selectedAssignForSubmit.description.replace(/^{.*}$/s, "Provide your complete answer below based on the attached document and guidelines.")];
              })();

              const answers = qList.map((q, idx) => ({
                question: typeof q === 'string' ? q.replace(/^\d+[\.:]\s*/, '') : `Question ${idx+1}`,
                answer: formDataObj.get(`q_${idx}`) || submitText || ''
              }));
              finalSubmitText = JSON.stringify(answers, null, 2);

              setIsSubmittingAssign(true);
              const formData = new FormData();
              formData.append("submission_text", finalSubmitText);
              
              const endpoint = selectedAssignForSubmit.className 
                ? `/api/classes/${selectedAssignForSubmit.class_id || 1}/submissions` 
                : `/api/academic/student/assignments/${selectedAssignForSubmit.id}/submit`;
                
              axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              }).then(res => {
                alert("Assignment submitted successfully!");
                setSelectedAssignForSubmit(null);
                setSubmitText('');
                fetchStudentDashboardData();
                fetchAllAssignments();
              }).catch(err => {
                alert(err.response?.data?.detail || "Submission failed.");
              }).finally(() => {
                setIsSubmittingAssign(false);
              });
            }} className="space-y-4">
              
              {(() => {
                const qList = (() => {
                  if (!selectedAssignForSubmit || !selectedAssignForSubmit.description) return ["Please provide your detailed submission below based on the attached document."];
                  try {
                    const parsed = JSON.parse(selectedAssignForSubmit.description);
                    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                      return parsed.questions;
                    }
                  } catch(err) {}
                  const lines = selectedAssignForSubmit.description.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                  const extracted = [];
                  lines.forEach(l => {
                    const match = l.match(/^(?:Q?\d+[\.:\)\]]|\bQuestion\s+\d+[\.:\)\]]?)\s+(.+)$/i);
                    if (match) extracted.push(match[1]);
                  });
                  if (extracted.length > 0) return extracted;
                  return [selectedAssignForSubmit.description.replace(/^{.*}$/s, "Provide your complete answer below based on the attached document and guidelines.")];
                })();

                return (
                  <div className="space-y-4">
                    {qList.map((q, idx) => {
                      const cleanQ = typeof q === 'string' ? q.replace(/^\d+[\.:]\s*/, '') : `Question ${idx+1}`;
                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                          <div className="flex items-start gap-2.5 border-b border-slate-200/60 pb-3">
                            <span className="bg-brand-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg shrink-0">
                              Q{idx + 1}
                            </span>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed pt-0.5">{cleanQ}</p>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                              Answer Box for Question {idx + 1}
                            </label>
                            <textarea
                              name={`q_${idx}`}
                              placeholder={`Type your detailed answer for Question ${idx + 1} here... (copy-paste is disabled)`}
                              onPaste={(e) => { e.preventDefault(); alert("Copy-paste is disabled for academic integrity!"); }}
                              className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-brand-600 transition-all shadow-sm min-h-[120px]"
                              required
                              onChange={(e) => {
                                const count = e.target.value.trim().split(/\s+/).filter(Boolean).length;
                                const el = document.getElementById(`word_count_${idx}`);
                                if (el) {
                                  el.innerText = `Words: ${count} (min 200 required across boxes)`;
                                  el.className = count >= 50 ? "text-[10px] font-bold text-emerald-600" : "text-[10px] font-bold text-amber-600";
                                }
                              }}
                            />
                            <div className="flex justify-between items-center mt-1.5">
                              <span id={`word_count_${idx}`} className="text-[10px] font-bold text-amber-600">
                                Words: 0 (min 200 required across boxes)
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">Box {idx + 1} of {qList.length}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedAssignForSubmit(null)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button disabled={isSubmittingAssign} type="submit" className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-2 px-6 rounded-xl shadow-md transition-all">
                  {isSubmittingAssign ? 'Submitting...' : 'Submit Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedQuizToAttempt && (
        <QuizAttemptModal
          quiz={selectedQuizToAttempt}
          onClose={() => setSelectedQuizToAttempt(null)}
          onSuccess={() => {
            setSelectedQuizToAttempt(null);
            fetchStudentDashboardData();
          }}
        />
      )}
    </div>
  );
}

function QuizAttemptModal({ quiz, onClose, onSuccess }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz.questions?.length || 5) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`/api/academic/student/quizzes/${quiz.id}/submit`, answers);
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Quiz submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = quiz.questions || [];
  const currentQ = questions[currentIndex];

  if (result) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 animate-fadeIn text-white font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center font-black text-2xl shadow-lg ${result.percentage >= 60 ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500' : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500'}`}>
            {result.percentage}%
          </div>
          <h2 className="text-2xl font-black mb-2">{result.status || (result.percentage >= 60 ? 'Mastery (Pass)' : 'Needs Review')}</h2>
          <p className="text-slate-400 text-sm mb-6">Score: <strong className="text-white">{result.score} / {result.total_questions}</strong> Correct</p>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 mb-8 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Instant Scoring & Feedback</span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{result.feedback}</p>
          </div>
          <button
            onClick={onSuccess}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-sans text-slate-100 animate-fadeIn">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">Quiz Mode</span>
          <h3 className="font-bold text-sm text-white truncate max-w-md">{quiz.title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Timer: {formatTime(timeLeft)}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors">
            Exit
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-400">Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-xs text-slate-400 font-semibold">{Object.keys(answers).length} / {questions.length} Answered</span>
            </div>
            {currentQ ? (
              <div className="space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80">
                  {currentQ.question_text}
                </h2>
                <div className="space-y-3">
                  {(currentQ.options || []).map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQ.id, idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${isSelected ? 'bg-brand-600/20 border-brand-500 text-white shadow-md' : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'}`}
                      >
                        <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold">No questions available in this quiz.</div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-800">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
              className="px-6 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              &larr; Previous
            </button>
            <div className="flex gap-3">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
                >
                  Next &rarr;
                </button>
              ) : null}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Navigation Grid */}
        <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between hidden lg:flex shrink-0">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Question Grid</h4>
            <div className="grid grid-cols-4 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${isCurrent ? 'ring-2 ring-brand-500 border-brand-400 bg-brand-600/30 text-white' : isAnswered ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-slate-500 text-[11px] space-y-1">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span> Answered</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700"></span> Not Answered</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded ring-1 ring-brand-500 bg-brand-600/30"></span> Current</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
