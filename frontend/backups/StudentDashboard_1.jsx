import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { 
  LogOut, User, GraduationCap, LayoutGrid, CheckCircle2,
  Calendar, FileText, Send, Video, ShieldAlert, AlertTriangle, MessageSquare, Play,
  Download, Clock, Check, ChevronRight, Briefcase, Award, Zap, Bell, CheckSquare, Search, Lock, ChevronDown
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
        const subMap = {};
        submissionRes.data.forEach(sub => {
          subMap[sub.assignment_id] = sub;
        });
        setMySubmissions(prev => ({ ...prev, ...subMap }));

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
          list.push({ ...assign, className });
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
      fetchEnrolledClasses();
      fetchAvailableClasses();
      fetchStudentDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (enrolledClasses.length > 0) {
      fetchAllAssignments();
    }
  }, [enrolledClasses]);

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

  const upcomingAssignments = academicAssignments.filter(a => a.posting_date && new Date(a.posting_date) > new Date());
  const upcomingQuizzes = academicQuizzes.filter(q => q.posting_date && new Date(q.posting_date) > new Date());

  const completedAssignments = academicAssignments.filter(a => mySubmissions[a.id]);
  const completedQuizzes = academicQuizzes.filter(q => q.attempt);

  const ongoingAssignments = academicAssignments.filter(a => {
    const isPosted = !a.posting_date || new Date(a.posting_date) <= new Date();
    const isPastDeadline = a.deadline && new Date(a.deadline) < new Date();
    const isSubmitted = !!mySubmissions[a.id];
    return isPosted && !isPastDeadline && !isSubmitted;
  });
  const ongoingQuizzes = academicQuizzes.filter(q => {
    const isPosted = !q.posting_date || new Date(q.posting_date) <= new Date();
    const isAttempted = !!q.attempt;
    return isPosted && !isAttempted;
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
      const formData = new FormData();
      formData.append("submission_text", submitText);
      await axios.post(`/api/academic/student/assignments/${selectedAssignForSubmit.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Assignment submitted successfully!");
      setSubmitText('');
      setSelectedAssignForSubmit(null);
      fetchStudentDashboardData();
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
              {activeMenu === 'sessions' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight mb-4">Scheduled Online Meets</h3>
                  {enrolledClasses.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-550 text-xs">
                      No upcoming online meets scheduled by your teachers.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledClasses.map(cls => (
                        <div 
                          key={cls.id}
                          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-brand-605" />
                              {cls.name}
                            </h4>
                            {cls.meet_date && cls.start_time && (
                              <CountdownTimer meetDate={cls.meet_date} startTime={cls.start_time} durationMins={cls.duration_mins || 60} />
                            )}
                          </div>
                          <p className="text-slate-500 text-xs line-clamp-3 leading-normal">{cls.description || 'No description provided.'}</p>
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-4 text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">{cls.duration_mins ? `${cls.duration_mins} mins` : 'Live Class'}</span>
                            {(() => {
                              const targetTime = new Date(`${cls.meet_date}T${cls.start_time.length === 5 ? cls.start_time + ':00' : cls.start_time}`).getTime();
                              const diff = targetTime - Date.now();
                              const durationMs = (cls.duration_mins || 60) * 60 * 1000;
                              const canJoin = diff <= 5 * 60 * 1000 && diff >= -durationMs;
                              return canJoin ? (
                                <button onClick={() => setAuthModalClass(cls)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1">
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
              )}
            </div>
          )}
        </main>
      </div>

                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedRecordedSession.subject} • {selectedRecordedSession.duration}</span>
              </div>
              <button 
                onClick={() => setSelectedRecordedSession(null)}
                className="h-8 w-8 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center transition-colors"
              >
                <XCircle className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="aspect-video bg-black relative flex flex-col items-center justify-center">
              {/* Prototype Empty Video */}
              <PlayCircle className="h-20 w-20 text-slate-700 animate-pulse" />
              <p className="text-slate-500 text-xs font-bold mt-4 uppercase tracking-widest">Prototype Mode: Stream Not Available</p>
              
              {/* Fake Video Controls */}
              <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 pb-3">
                <div className="w-full flex items-center gap-4">
                  <Play className="h-4 w-4 text-white hover:text-brand-400 cursor-pointer" />
                  <div className="flex-1 h-1 bg-slate-600 rounded-full cursor-pointer relative">
                    <div className="absolute top-0 left-0 h-1 bg-brand-500 rounded-full w-1/3"></div>
                  </div>
                  <span className="text-[10px] text-white font-bold">14:05 / {selectedRecordedSession.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
