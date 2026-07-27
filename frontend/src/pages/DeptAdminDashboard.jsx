import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import axios from 'axios';
import {
  Users, GraduationCap, LogOut, CheckCircle2, Trash2,
  ChevronDown, ChevronUp, User, Clipboard, ShieldAlert, DownloadCloud,
  Bell, BookOpen, Calendar, Edit3, Upload, Plus, Clock, FileText, Trash, DollarSign, Briefcase
} from 'lucide-react';
import ExportModal from '../components/ExportModal';
import ProfileModal from '../components/ProfileModal';
import LiveProtector from '../components/LiveProtector';

export default function DeptAdminDashboard() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();

  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [facError, setFacError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Navigation Menu tabs: 'dashboard', 'faculty', 'students', 'announcements', 'academic', 'timetable', 'sessions', 'fees'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [studentSection, setStudentSection] = useState('A');

  // Fee management state
  const [studentFees, setStudentFees] = useState([]);
  const [feeEditingId, setFeeEditingId] = useState(null);
  const [feeEditPaid, setFeeEditPaid] = useState('');

  const [newFacName, setNewFacName] = useState('');
  const [newFacDesignation, setNewFacDesignation] = useState('');
  const [newFacEducation, setNewFacEducation] = useState('');
  const [newFacDob, setNewFacDob] = useState('');
  const [newFacPhone, setNewFacPhone] = useState('');
  const [newFacEmail, setNewFacEmail] = useState('');
  const [newFacPersonalEmail, setNewFacPersonalEmail] = useState('');
  const [allFacultyEmails, setAllFacultyEmails] = useState([]);

  // Student Form states
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStuName, setNewStuName] = useState('');
  const [newStuFatherName, setNewStuFatherName] = useState('');
  const [newStuDob, setNewStuDob] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('');
  const [newStuPersonalEmail, setNewStuPersonalEmail] = useState('');
  const [stuError, setStuError] = useState('');

  // New features states
  const [globalAnnouncements, setGlobalAnnouncements] = useState([]);
  const [deptAnnouncements, setDeptAnnouncements] = useState([]);
  const [showAddAnnForm, setShowAddAnnForm] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  // Notifications
  const [notificationsList, setNotificationsList] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileModalType, setProfileModalType] = useState('student');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Placements State
  const [placementsList, setPlacementsList] = useState([]);
  const [placementTab, setPlacementTab] = useState('ongoing'); // ongoing, upcoming, completed
  const [showAddDriveForm, setShowAddDriveForm] = useState(false);
  const [newDriveCompany, setNewDriveCompany] = useState('');
  const [newDriveRole, setNewDriveRole] = useState('');
  const [newDrivePackage, setNewDrivePackage] = useState('');
  const [newDriveCutoff, setNewDriveCutoff] = useState('');
  const [newDriveDate, setNewDriveDate] = useState('');
  const [newDriveStatus, setNewDriveStatus] = useState('Upcoming');

  const handleProfileClick = (profile, type) => {
    setSelectedProfile(profile);
    setProfileModalType(type);
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = (updatedProfile) => {
    if (profileModalType === 'student') {
      setStudentList(prev => prev.map(s => s.id === updatedProfile.id ? updatedProfile : s));
    } else {
      setFacultyList(prev => prev.map(f => f.id === updatedProfile.id ? updatedProfile : f));
    }
  };

  const [newAnnPriority, setNewAnnPriority] = useState('Medium');
  const [newAnnTarget, setNewAnnTarget] = useState('All');
  const [newAnnAttachment, setNewAnnAttachment] = useState('');

  // Academics state
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSection, setSelectedSection] = useState('A');
  const [showAddSubForm, setShowAddSubForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [newSubName, setNewSubName] = useState('');
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);
  const [uploadedSyllabusUrl, setUploadedSyllabusUrl] = useState('');

  // Timetable state
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlotSubject, setNewSlotSubject] = useState('');
  const [newSlotTeacherId, setNewSlotTeacherId] = useState('');

  const [activeSessionRoom, setActiveSessionRoom] = useState(null);
  const [teacherSessions, setTeacherSessions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const el = document.getElementById('live-protector-wrapper');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  };




  const dept = user?.department || '';

  const deptLabel = {
    CSE: 'Computer Science & Engineering',
    ECE: 'Electronics & Communication Engineering',
    EEE: 'Electrical & Electronics Engineering',
  }[dept] || dept;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [facRes, emailRes, stuRes, globalAnnRes, deptAnnRes, placeRes, subjectsRes, timetableRes, notifRes, classesRes, meetsRes] = await Promise.all([
        axios.get(`/api/admin/faculty?department=${dept}`),
        axios.get('/api/admin/faculty/all-emails').catch(() => ({ data: [] })),
        axios.get('/api/admin/students'),
        axios.get('/api/admin/announcements'),
        axios.get('/api/admin/announcements?mine=true'),
        axios.get('/api/admin/placement-drives').catch(() => ({ data: [] })),
        axios.get('/api/academic/subjects?department=' + dept),
        axios.get('/api/academic/timetable?department=' + dept),
        axios.get('/api/notifications').catch(() => ({ data: [] })),
        axios.get('/api/classes/all-available').catch(() => ({ data: [] })),
        axios.get('/api/academic/meets').catch(() => ({ data: [] }))
      ]);
      setFacultyList(facRes.data);
      setAllFacultyEmails(emailRes.data);
      setStudentList(stuRes.data);
      setGlobalAnnouncements(globalAnnRes.data);
      setDeptAnnouncements(deptAnnRes.data);
      
      const deptPlacements = placeRes.data.filter(p => 
        p.branches === 'All' || p.branches.includes(dept) || p.branches === ''
      );
      setPlacementsList(deptPlacements);
      setSubjectsList(subjectsRes.data);
      setTimetableSlots(timetableRes.data);
      setNotificationsList(notifRes.data);
      
      const combined = [
        ...(classesRes.data || []).map(c => ({ ...c, source: 'class' })),
        ...(meetsRes.data || []).map(m => ({ ...m, name: m.topic || m.subject_name || 'Online Meet', source: 'meet' }))
      ].filter(s => s.status !== 'completed' && s.status !== 'closed' && s.is_active !== false);
      setTeacherSessions(combined);
      
      try {
        const feesRes = await axios.get('/api/admin/fees');
        setStudentFees(feesRes.data);
      } catch (_) {}
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeptFee = async (fee_id, newStatus, paidAmount, remarks) => {
    try {
      await axios.put(`/api/admin/fees/${fee_id}`, { paid_fee: paidAmount, status: newStatus, remarks: remarks || null });
      setStudentFees(studentFees.map(f => f.id === fee_id ? { ...f, status: newStatus, paid_fee: paidAmount } : f));
      setFeedbackMsg('Fee updated successfully.');
      setFeeEditingId(null);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update fee.');
    }
  };



  const handleBulkClearDeptFees = async (sec) => {
    try {
      await axios.post(`/api/admin/fees/bulk-clear?department=${dept}&section=${sec}`);
      setFeedbackMsg(`Bulk cleared fee dues for ${dept} - Section ${sec}.`);
      setStudentFees(prev => prev.map(f => {
        if (f.department === dept && f.section === sec) {
          return { ...f, paid_fee: f.total_fee, status: 'Cleared' };
        }
        return f;
      }));
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to bulk clear section fees.");
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const generateEmailFromName = (name) => {
    if (!name) return '';
    let clean = name.replace(/\b(dr|mr|mrs|ms|prof)\b\.?/gi, '');
    clean = clean.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    if (!clean) return '';
    let candidate = `${clean}@ssvuniversity.in`;
    let counter = 2;
    while (allFacultyEmails.includes(candidate)) {
      candidate = `${clean}${counter}@ssvuniversity.in`;
      counter++;
    }
    return candidate;
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setFacError('');


    if (!newFacEmail.toLowerCase().endsWith('@ssvuniversity.in')) {
      setFacError("Email must end with '@ssvuniversity.in'");
      return;
    }

    try {
      await axios.post('/api/admin/faculty', {
        name: newFacName,
        designation: newFacDesignation,
        education: newFacEducation,
        dob: newFacDob,
        phone_number: newFacPhone,
        email: newFacEmail,
        department: dept,
        personal_email: newFacPersonalEmail || null,
      });
      setFeedbackMsg(`Faculty member '${newFacName}' added successfully!`);
      setNewFacName(''); setNewFacDesignation(''); setNewFacEducation('');
      setNewFacDob(''); setNewFacPhone(''); setNewFacEmail(''); setNewFacPersonalEmail('');
      setShowAddForm(false);
      fetchDashboardData();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFacError(err.response?.data?.detail || 'Failed to add faculty member.');
    }
  };

  const handleRemoveFaculty = (id, name) => {
    setDeleteConfirm({ type: 'faculty', id, name });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setStuError('');

    try {
      await axios.post('/api/admin/students', {
        full_name: newStuName,
        father_name: newStuFatherName,
        dob: newStuDob,
        phone_number: newStuPhone,
        department: dept,
        personal_email: newStuPersonalEmail || null,
      });
      setFeedbackMsg(`Student '${newStuName}' pre-registered successfully!`);
      setNewStuName('');
      setNewStuFatherName('');
      setNewStuDob('');
      setNewStuPhone('');
      setNewStuPersonalEmail('');
      setShowAddStudentForm(false);
      fetchDashboardData();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setStuError(err.response?.data?.detail || 'Failed to add student.');
    }
  };

  const handleRemoveStudent = (id, name) => {
    setDeleteConfirm({ type: 'student', id, name });
  };


  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    try {
      const res = await axios.post('/api/admin/announcements', {
        title: newAnnTitle,
        content: newAnnContent,
        priority: newAnnPriority,
        target_audience: newAnnTarget,
        attachment_name: newAnnAttachment || null,
        department: dept,
        date: new Date().toISOString().split('T')[0]
      });
      setDeptAnnouncements([res.data, ...deptAnnouncements]);
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnAttachment('');
      setNewAnnPriority('Medium');
      setNewAnnTarget('All');
      setShowAddAnnForm(false);
      setFeedbackMsg(`Department announcement '${newAnnTitle}' posted successfully.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAnnouncement = async (id, title) => {
    try {
      await axios.delete(`/api/admin/announcements/${id}`);
      setDeptAnnouncements(deptAnnouncements.filter(a => a.id !== id));
      setFeedbackMsg(`Announcement '${title}' deleted.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubName) return;
    try {
      const res = await axios.post('/api/academic/subjects', {
        name: newSubName,
        department: dept,
        section: selectedSection,
        syllabus_pdf_url: uploadedSyllabusUrl || null
      });
      setSubjectsList([...subjectsList, res.data]);
      setNewSubName('');
      setUploadedSyllabusUrl('');
      setShowAddSubForm(false);
      setFeedbackMsg(`Subject '${newSubName}' created successfully.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!editingSub || !editingSub.name) return;
    try {
      const res = await axios.put(`/api/academic/subjects/${editingSub.id}`, {
        name: editingSub.name,
        department: dept,
        section: selectedSection,
        syllabus_pdf_url: uploadedSyllabusUrl || editingSub.syllabus_pdf_url
      });
      setSubjectsList(subjectsList.map(s => s.id === editingSub.id ? res.data : s));
      setEditingSub(null);
      setUploadedSyllabusUrl('');
      setFeedbackMsg(`Subject updated successfully.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    try {
      await axios.delete(`/api/academic/subjects/${id}`);
      setSubjectsList(subjectsList.filter(s => s.id !== id));
      setFeedbackMsg(`Subject '${name}' deleted successfully.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyllabusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSyllabus(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/academic/subjects/upload-syllabus', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedSyllabusUrl(res.data.syllabus_pdf_url);
      setFeedbackMsg('Syllabus PDF uploaded successfully.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to upload syllabus PDF');
    } finally {
      setUploadingSyllabus(false);
    }
  };

  const handleUpdateTimetableSlot = async (e) => {
    e.preventDefault();
    if (!editingSlot) return;
    try {
      const res = await axios.put(`/api/academic/timetable/${editingSlot.id}`, {
        department: dept,
        section: selectedSection,
        day_of_week: editingSlot.day_of_week,
        start_time: editingSlot.start_time,
        end_time: editingSlot.end_time,
        subject_name: newSlotSubject,
        teacher_id: newSlotTeacherId ? parseInt(newSlotTeacherId) : null
      });
      setTimetableSlots(timetableSlots.map(s => s.id === editingSlot.id ? res.data : s));
      setEditingSlot(null);
      setNewSlotSubject('');
      setNewSlotTeacherId('');
      setFeedbackMsg('Timetable slot updated successfully.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to update timetable slot.');
    }
  };

  const handleResetTimetableSlot = async (slotId) => {
    const slot = timetableSlots.find(s => s.id === slotId);
    if (!slot) return;
    try {
      const res = await axios.put(`/api/academic/timetable/${slotId}`, {
        department: dept,
        section: selectedSection,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        subject_name: 'TBD',
        teacher_id: null
      });
      setTimetableSlots(timetableSlots.map(s => s.id === slotId ? res.data : s));
      setFeedbackMsg('Timetable slot reset.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to reset timetable slot.');
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/placement-drives', {
        company: newDriveCompany,
        role: newDriveRole,
        package: newDrivePackage,
        cutoff: newDriveCutoff,
        date: newDriveDate,
        branches: user?.department || 'All', // Force to DeptAdmin's department
        status: newDriveStatus
      });
      setPlacementsList([res.data, ...placementsList]);
      setShowAddDriveForm(false);
      setNewDriveCompany('');
      setNewDriveRole('');
      setNewDrivePackage('');
      setNewDriveCutoff('');
      setNewDriveDate('');
      setNewDriveStatus('Upcoming');
      setFeedbackMsg('Placement drive created successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Failed to create placement drive.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleRemoveDrive = async (id, company) => {
    if (!window.confirm(`Are you sure you want to remove the placement drive for ${company}?`)) return;
    try {
      await axios.delete(`/api/admin/placement-drives/${id}`);
      setPlacementsList(placementsList.filter(p => p.id !== id));
      setFeedbackMsg(`Placement drive for '${company}' removed.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMsg('Failed to remove placement drive.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DA';
    const parts = name.split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  if (!user) return null;

  const deptColors = { CSE: 'from-blue-600', ECE: 'from-purple-600', EEE: 'from-emerald-600' };
  const deptAccent = { CSE: 'bg-blue-600', ECE: 'bg-purple-600', EEE: 'bg-emerald-600' };
  const deptBorder = { CSE: 'border-blue-200 bg-blue-50 text-blue-700', ECE: 'border-purple-200 bg-purple-50 text-purple-700', EEE: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  const deptText = { CSE: 'text-blue-600', ECE: 'text-purple-600', EEE: 'text-emerald-600' };

  // Filtered lists
  const filteredSubjects = subjectsList.filter(s => s.section === selectedSection);
  const filteredTimetable = timetableSlots.filter(s => s.section === selectedSection);

  // Group timetable by day and time slot
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slotsTimeRange = [
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { label: '12:00 - 13:00 (Lunch)', start: '12:00', end: '13:00', isLunch: true },
    { label: '13:00 - 14:00', start: '13:00', end: '14:00' },
    { label: '14:00 - 15:00', start: '14:00', end: '15:00' }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">

      {/* SIDEBAR */}
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <img
              src={branding.logo_url}
              className="h-8 w-auto object-contain max-w-[40px]"
              onError={(e) => { e.target.style.display = 'none'; }}
              alt="Logo"
            />
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none truncate max-w-[130px]">{branding.institution_name}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${deptText[dept] || 'text-brand-500'}`}>{dept} Admin Panel</span>
            </div>
          </div>

          {/* Nav */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Overview</span>
            <button onClick={() => setActiveTab('placements')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'placements' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Briefcase className="h-4 w-4" />
              Placements Portal
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'dashboard' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Clipboard className="h-4 w-4" />
              Dashboard Overview
            </button>
            <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'announcements' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Bell className="h-4 w-4" />
              Announcements Feed
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mt-4 mb-2">Academic</span>
            <button onClick={() => setActiveTab('academic')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'academic' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <BookOpen className="h-4 w-4" />
              Syllabus & Subjects
            </button>
            <button onClick={() => setActiveTab('timetable')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'timetable' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Calendar className="h-4 w-4" />
              Section Timetable
            </button>
            <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'sessions' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Clock className="h-4 w-4" />
              Sessions
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mt-4 mb-2">Directory</span>
            <button onClick={() => setActiveTab('faculty')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'faculty' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <GraduationCap className="h-4 w-4" />
              Faculty Directory
            </button>
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'students' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <Users className="h-4 w-4" />
              Student Directory
            </button>
            <button onClick={() => setActiveTab('fees')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${activeTab === 'fees' ? (deptBorder[dept] || 'bg-brand-50 text-brand-600 border border-brand-100') : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}>
              <DollarSign className="h-4 w-4" />
              Fee Management
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-sm font-black text-slate-900">{dept} Department Admin</h1>
            <p className="text-[10px] text-slate-400 font-medium">{deptLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            >
              <DownloadCloud className="h-3.5 w-3.5" /> Export Data
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-all relative"
              >
                <Bell className="h-4 w-4" />
                {notificationsList.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {showNotifMenu && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-250 rounded-2xl shadow-2xl py-3 z-50 animate-fadeIn overflow-hidden">
                  <div className="px-4 pb-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    {notificationsList.filter(n => !n.is_read).length > 0 && (
                      <button 
                        onClick={async () => {
                          await axios.put('/api/notifications/read').catch(()=>{});
                          setNotificationsList(notificationsList.map(n => ({...n, is_read: true})));
                        }}
                        className="text-[10px] text-brand-600 font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto px-2 pt-2 space-y-1">
                    {notificationsList.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4 font-medium">No notifications</p>
                    ) : (
                      notificationsList.map(n => (
                        <div 
                          key={n.id} 
                          onClick={async () => {
                            if(!n.is_read) {
                              await axios.put(`/api/notifications/${n.id}/read`).catch(()=>{});
                              setNotificationsList(notificationsList.map(item => item.id === n.id ? {...item, is_read: true} : item));
                            }
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-colors ${n.is_read ? 'hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${n.is_read ? 'text-slate-400' : 'text-blue-600'}`}>
                              {n.type || 'Alert'}
                            </span>
                            {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0"></span>}
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${n.is_read ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors relative"
            >
              <div className={`h-8 w-8 rounded-full ${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs flex items-center justify-center`}>
                {getInitials(user.full_name)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.full_name}</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{user.email}</p>
              </div>
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-slate-250 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">ROLE</span>
                    <span className="text-xs font-extrabold text-slate-800 uppercase">{user.role}</span>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); handleProfileClick(user, 'dept_admin'); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" /> View Profile
                  </button>
                  <button onClick={() => { setShowProfileMenu(false); handleProfileClick(user, 'dept_admin'); }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Edit Profile
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 font-bold flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </button>
          </div>
        </header>

        {/* VIEW AREA */}
        <main className="flex-1 p-8 overflow-y-auto space-y-6">

          {feedbackMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 text-sm flex items-center gap-2 animate-fadeIn shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold">{feedbackMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${deptText[dept]}`}></div>
            </div>
          ) : activeSessionRoom ? (
            <div className="animate-fadeIn mt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Monitoring: {activeSessionRoom.subject_name || 'Session'}</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Section {activeSessionRoom.section} • {activeSessionRoom.start_time} - {activeSessionRoom.end_time}</p>
                </div>
                <button 
                  onClick={() => setActiveSessionRoom(null)} 
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Leave Monitor View
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[500px]">
                <LiveProtector 
                  classData={{
                    id: activeSessionRoom.id,
                    name: activeSessionRoom.subject_name,
                    section: activeSessionRoom.section,
                    department: activeSessionRoom.department
                  }}
                  isHost={false}
                  onLeave={() => setActiveSessionRoom(null)}
                />
              </div>
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Welcome Banner */}
                  <div className={`bg-gradient-to-r ${deptColors[dept] || 'from-brand-600'} to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex justify-between items-center`}>
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        Welcome Back, {dept} Admin! 👋
                      </h2>
                      <p className="text-slate-100 text-xs font-semibold mt-1">Manage academic syllabus, class timetables, faculty entries, and broadcast department announcements.</p>
                    </div>
                  </div>

                  {/* Comprehensive Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fadeIn">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Total Students</span>
                      <span className="text-3xl font-black text-slate-900">{studentList.filter(s => s.department === dept).length}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Total Faculty</span>
                      <span className="text-3xl font-black text-slate-900">{facultyList.filter(f => f.department === dept).length}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Placements</span>
                      <span className="text-3xl font-black text-slate-900">{placementsList.length}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Announcements</span>
                      <span className="text-3xl font-black text-slate-900">{deptAnnouncements.length}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Timetable Slots</span>
                      <span className="text-3xl font-black text-slate-900">{timetableSlots.length}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Subjects</span>
                      <span className="text-3xl font-black text-slate-900">{subjectsList.length}</span>
                    </div>
                  </div>

                  {/* Main Admin announcements for Department Admin */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-500" />
                      Global Announcements from Main Admin
                    </h3>
                    {globalAnnouncements.length === 0 ? (
                      <p className="text-slate-500 text-xs font-semibold py-4 text-center">No global announcements.</p>
                    ) : (
                      <div className="space-y-4">
                        {globalAnnouncements.map((ann) => (
                          <div key={ann.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                ann.priority === 'High' ? 'bg-red-100 text-red-700' : 
                                ann.priority === 'Critical' ? 'bg-red-600 text-white animate-pulse' :
                                'bg-slate-100 text-slate-700'
                              }`}>{ann.priority} Priority</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-[9px] font-semibold text-slate-400">
                              <span>Published: {ann.date}</span>
                              {ann.attachment_name && <span className="text-blue-600">📎 {ann.attachment_name}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sections Allocation Status */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Students Count by Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {['A', 'B', 'C', 'D'].map((sec) => {
                        const count = studentList.filter(s => s.department === dept && s.section === sec).length;
                        return (
                          <div key={sec} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 text-center shadow-xs">
                            <span className="font-extrabold text-xs text-slate-400 uppercase tracking-wider block mb-1">Section {sec}</span>
                            <span className="text-2xl font-black text-slate-800">{count}</span>
                            <span className="text-[10px] text-slate-550 font-semibold block mt-1">Active Students</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS TAB */}
              {activeTab === 'announcements' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Department Announcements</h2>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">Post news and alerts that will target students and teachers of your department specifically.</p>
                    </div>
                    <button
                      onClick={() => setShowAddAnnForm(!showAddAnnForm)}
                      className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                    >
                      {showAddAnnForm ? 'Close Form' : '+ Post Announcement'}
                    </button>
                  </div>

                  {showAddAnnForm && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fadeIn">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">Compose Department Announcement</h3>
                      <form onSubmit={handleAddAnnouncement} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Title</label>
                            <input
                              type="text" required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                              value={newAnnTitle}
                              onChange={(e) => setNewAnnTitle(e.target.value)}
                              placeholder="e.g. Lab Exam Schedule"
                            />
                          </div>
                          <div className="flex grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Priority</label>
                              <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                                value={newAnnPriority}
                                onChange={(e) => setNewAnnPriority(e.target.value)}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Target Audience</label>
                              <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                                value={newAnnTarget}
                                onChange={(e) => setNewAnnTarget(e.target.value)}
                              >
                                <option value="All">All Staff & Students</option>
                                <option value="Students">Students Only</option>
                                <option value="Teachers">Teachers Only</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Content</label>
                          <textarea
                            required rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                            value={newAnnContent}
                            onChange={(e) => setNewAnnContent(e.target.value)}
                            placeholder="Write the announcement description here..."
                          />
                        </div>
                        <div className="flex flex-col md:w-1/2">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Attachment Name (Optional)</label>
                          <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                            value={newAnnAttachment}
                            onChange={(e) => setNewAnnAttachment(e.target.value)}
                            placeholder="e.g. Schedule_V1.pdf"
                          />
                        </div>
                        <button
                          type="submit"
                          className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                        >
                          Publish Announcement
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Your Department Announcements</h3>
                    {deptAnnouncements.length === 0 ? (
                      <p className="text-slate-500 text-xs font-semibold py-8 text-center">No department announcements published yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {deptAnnouncements.map((ann) => (
                          <div key={ann.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                  ann.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                }`}>{ann.priority} Priority</span>
                                <span className="text-[8px] text-slate-500 bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-extrabold uppercase">Target: {ann.target_audience}</span>
                              </div>
                              <p className="text-xs text-slate-655 leading-relaxed">{ann.content}</p>
                              <div className="flex items-center gap-3 text-[9px] text-slate-400 font-semibold mt-1">
                                <span>Published: {ann.date}</span>
                                {ann.attachment_name && <span>📎 {ann.attachment_name}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveAnnouncement(ann.id, ann.title)}
                              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACADEMIC SUBJECTS TAB */}
              {activeTab === 'academic' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Academic Subjects & Syllabus</h2>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">Manage subjects for current academic year and upload syllabus PDFs for each of the 4 sections.</p>
                    </div>
                    <button
                      onClick={() => { setShowAddSubForm(!showAddSubForm); setEditingSub(null); setUploadedSyllabusUrl(''); }}
                      className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                    >
                      {showAddSubForm ? 'Close Form' : '+ Add Subject'}
                    </button>
                  </div>

                  {/* Section Switcher */}
                  <div className="flex gap-2 bg-slate-150 p-1.5 rounded-2xl w-fit">
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSelectedSection(sec)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedSection === sec ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>

                  {/* Add / Edit Subject Forms */}
                  {(showAddSubForm || editingSub) && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-fadeIn">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                        {editingSub ? 'Edit Subject' : `Add Subject to Section ${selectedSection}`}
                      </h3>
                      <form onSubmit={editingSub ? handleEditSubject : handleAddSubject} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Subject Name</label>
                            <input
                              type="text" required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                              value={editingSub ? editingSub.name : newSubName}
                              onChange={(e) => {
                                if (editingSub) {
                                  setEditingSub({ ...editingSub, name: e.target.value });
                                } else {
                                  setNewSubName(e.target.value);
                                }
                              }}
                              placeholder="e.g. Distributed Databases"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Syllabus PDF File</label>
                            <div className="flex items-center gap-3">
                              <label className="cursor-pointer flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-brand-500 rounded-xl px-4 py-2 bg-slate-50 text-xs text-slate-600 font-bold transition-colors">
                                <Upload className="h-4 w-4" />
                                {uploadingSyllabus ? 'Uploading...' : 'Choose PDF File'}
                                <input
                                  type="file" accept=".pdf"
                                  className="hidden"
                                  onChange={handleSyllabusUpload}
                                  disabled={uploadingSyllabus}
                                />
                              </label>
                              {uploadedSyllabusUrl && (
                                <span className="text-[10px] text-emerald-600 font-bold">✓ PDF Loaded</span>
                              )}
                              {!uploadedSyllabusUrl && editingSub?.syllabus_pdf_url && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">Current: {editingSub.syllabus_pdf_url.split('/').pop()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                          >
                            {editingSub ? 'Save Changes' : 'Create Subject'}
                          </button>
                          {editingSub && (
                            <button
                              type="button"
                              onClick={() => { setEditingSub(null); setUploadedSyllabusUrl(''); }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Subjects List */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Subjects for Section {selectedSection}</h3>
                    {filteredSubjects.length === 0 ? (
                      <p className="text-slate-550 text-xs font-semibold py-8 text-center">No subjects added for Section {selectedSection} yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSubjects.map((sub) => (
                          <div key={sub.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900">{sub.name}</h4>
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-slate-400" />
                                {sub.syllabus_pdf_url ? (
                                  <a href={sub.syllabus_pdf_url} download className="text-[10px] text-blue-600 hover:underline font-bold">Download Syllabus PDF</a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-semibold">No syllabus uploaded</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditingSub(sub); setShowAddSubForm(false); setUploadedSyllabusUrl(''); }}
                                className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(sub.id, sub.name)}
                                className="p-2 text-slate-500 hover:text-red-500 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TIMETABLE TAB */}
              {activeTab === 'timetable' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900">Weekly Section Timetables</h2>
                    <p className="text-slate-550 text-xs font-semibold mt-0.5">Click on any section to configure and edit timetable slots. The schedule is structured as 5 teaching classes per day.</p>
                  </div>

                  {/* Section Switcher */}
                  <div className="flex gap-2 bg-slate-150 p-1.5 rounded-2xl w-fit">
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => { setSelectedSection(sec); setEditingSlot(null); }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedSection === sec ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>

                  {/* Edit Slot Modal / Inline Card */}
                  {editingSlot && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md animate-fadeIn border-l-4 border-l-blue-500">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                        Edit Slot: {editingSlot.day_of_week} ({editingSlot.start_time} - {editingSlot.end_time})
                      </h3>
                      <form onSubmit={handleUpdateTimetableSlot} className="flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col w-56">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Subject</label>
                          <select
                            required
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                            value={newSlotSubject}
                            onChange={(e) => setNewSlotSubject(e.target.value)}
                          >
                            <option value="">-- Choose Subject --</option>
                            <option value="TBD">To Be Decided (TBD)</option>
                            {subjectsList.filter(s => s.section === selectedSection).map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col w-56">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Teacher</label>
                          <select
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:bg-white"
                            value={newSlotTeacherId}
                            onChange={(e) => setNewSlotTeacherId(e.target.value)}
                          >
                            <option value="">-- No Teacher / Empty --</option>
                            {facultyList.filter(f => f.department === dept).map(f => (
                              // Map the faculty.email to User database ID or name
                              <option key={f.id} value={f.id}>{f.name} ({f.designation.split(' ')[0]})</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                          >
                            Assign Slot
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSlot(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Timetable Grid */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto">
                    <table className="w-full text-xs text-center border border-slate-100 border-collapse">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="border border-slate-100 px-4 py-3.5 text-left">Day</th>
                          {slotsTimeRange.map((st) => (
                            <th key={st.label} className="border border-slate-100 px-4 py-3.5">{st.label}</th>
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
                                  <td key={st.label} className="border border-slate-100 px-4 py-4 bg-amber-50/40 text-amber-700 font-extrabold italic select-none">
                                    Lunch Break
                                  </td>
                                );
                              }
                              // Find matching slot
                              const slot = filteredTimetable.find(s => s.day_of_week === day && s.start_time === st.start);
                              return (
                                <td key={st.label} className="border border-slate-100 px-2 py-3 min-w-[140px] group relative">
                                  {slot ? (
                                    <div className="space-y-1">
                                      <p className="font-extrabold text-slate-800 text-[11px]">{slot.subject_name}</p>
                                      <p className="text-[9px] text-slate-450 font-bold">{slot.teacher_name || 'No Teacher Assigned'}</p>
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-white/95 flex items-center justify-center gap-1.5 px-2">
                                        <button
                                          onClick={() => {
                                            setEditingSlot(slot);
                                            setNewSlotSubject(slot.subject_name);
                                            setNewSlotTeacherId(slot.teacher_id || '');
                                          }}
                                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg text-[9px] font-bold border border-blue-200 transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleResetTimetableSlot(slot.id)}
                                          className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg text-[9px] font-bold border border-slate-200 transition-colors"
                                        >
                                          Reset
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-slate-350 italic text-[10px]">Unscheduled</span>
                                      <button
                                        onClick={() => {
                                          // Mock timetable creation
                                          const mockNewSlot = {
                                            day_of_week: day,
                                            start_time: st.start,
                                            end_time: st.end
                                          };
                                          // Add temporary slot to edit
                                          setEditingSlot(mockNewSlot);
                                          setNewSlotSubject('');
                                          setNewSlotTeacherId('');
                                        }}
                                        className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-white/95 flex items-center justify-center transition-opacity"
                                      >
                                        <span className="text-blue-600 text-[10px] font-black hover:underline">+ Schedule Class</span>
                                      </button>
                                    </div>
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

              {/* SESSIONS TAB */}
              {activeTab === 'sessions' && (
                <div className="space-y-6 animate-fadeIn">
                  {activeSessionRoom ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative" id="live-protector-wrapper">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setActiveSessionRoom(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-xl">
                            <i className="ri-arrow-left-line text-lg"></i>
                          </button>
                          <div>
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                              Live Monitoring: {activeSessionRoom.name}
                            </h3>
                            <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider">{activeSessionRoom.department} - Section {activeSessionRoom.section}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={toggleFullscreen} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700">
                            {isFullscreen ? (
                              <><i className="ri-fullscreen-exit-line text-sm"></i> Exit Fullscreen</>
                            ) : (
                              <><i className="ri-fullscreen-line text-sm"></i> Fullscreen</>
                            )}
                          </button>
                          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Status</span>
                            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><i className="ri-shield-check-line"></i> Active</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black rounded-2xl overflow-hidden shadow-inner h-[600px] border border-slate-800 relative group">
                        <LiveProtector 
                          classId={activeSessionRoom.id}
                          className={activeSessionRoom.name}
                          isHost={false} 
                          onLeave={() => setActiveSessionRoom(null)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Clock className="h-6 w-6 text-brand-600"/> Active Department Sessions</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-full">Today's Schedule</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(() => {
                          // Filter sessions to match dept admin's department, and only show today's upcoming or ongoing
                          const now = new Date();
                          const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                          
                          const deptSessions = teacherSessions.filter(c => {
                            if (!c.department || c.department.toUpperCase() !== dept.toUpperCase()) return false;
                            if (c.status === 'completed' || c.status === 'closed' || c.is_active === false) return false;
                            
                            // Check if date is today or in the future
                            if (c.meet_date && c.meet_date < today) return false;
                            
                            // Check if time is upcoming or ongoing (ongoing = start_time <= now <= start_time + duration)
                            if (!c.start_time) return true; // Show if missing exact time
                            
                            const duration = parseInt(c.duration_mins) || 60;
                            const [hours, mins] = c.start_time.split(':').map(Number);
                            const startTime = new Date(now);
                            startTime.setHours(hours, mins, 0, 0);
                            
                            const endTime = new Date(startTime.getTime() + duration * 60000);
                            
                            // If the meeting is today and it's already past end time, hide it
                            if (c.meet_date === today && now > endTime) return false;
                            
                            return true;
                          });
                          
                          if (deptSessions.length === 0) {
                            return (
                              <div className="col-span-full py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <p className="text-slate-500 text-xs font-bold">No active sessions found.</p>
                              </div>
                            );
                          }
                          
                          return deptSessions.map((slot, i) => {
                            const [h, m] = (slot.start_time || '00:00').split(':').map(Number);
                            const startD = new Date(); startD.setHours(h, m, 0, 0);
                            const isLive = new Date() >= startD;
                            
                            return (
                              <div key={slot.id || i} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all bg-white relative overflow-hidden group">
                                {isLive && (
                                  <div className="absolute top-0 right-0 p-3">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm animate-pulse">
                                      <span className="h-1.5 w-1.5 bg-red-600 rounded-full"></span> Live
                                    </span>
                                  </div>
                                )}
                                
                                <div className="mb-4">
                                  <h4 className="font-bold text-slate-900 text-sm">{slot.name || slot.subject_name}</h4>
                                  <p className="text-slate-500 text-xs font-medium mt-1">Section {slot.section}</p>
                                </div>
                                
                                <div className="space-y-2 mb-5">
                                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-xl">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{slot.start_time} - {slot.duration_mins} mins</span>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => setActiveSessionRoom(slot)}
                                  className="w-full py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow"
                                >
                                  Join Monitoring Room <i className="ri-arrow-right-s-line text-lg group-hover:translate-x-1 transition-transform"></i>
                                </button>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FACULTY DIRECTORY TAB */}
              {activeTab === 'faculty' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className={`bg-gradient-to-r ${deptColors[dept] || 'from-brand-600'}/[0.06] to-transparent border border-slate-200 rounded-3xl p-7 flex justify-between items-center`}>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">
                        {dept} Faculty Directory
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold mt-1">
                        You manage <span className={`font-extrabold ${deptText[dept]}`}>{facultyList.filter(f => f.department === dept).length}</span> faculty members in {deptLabel}.
                      </p>
                    </div>
                    <div className={`${deptAccent[dept] || 'bg-brand-600'} text-white rounded-2xl px-5 py-3 text-center shadow-lg hidden md:block`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">Total</span>
                      <span className="text-2xl font-black">{facultyList.filter(f => f.department === dept).length}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Faculty List</h3>
                      <button
                        onClick={() => { setShowAddForm(!showAddForm); setFacError(''); }}
                        className={`${deptAccent[dept] || 'bg-brand-600'} hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                      >
                        {showAddForm ? 'Close Form' : '+ Add Faculty Member'}
                      </button>
                    </div>

                    {showAddForm && (
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mb-6 animate-fadeIn">
                        <h4 className="text-sm font-extrabold text-slate-800 mb-4">Add New Faculty Member</h4>
                        {facError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-xs font-semibold">
                            {facError}
                          </div>
                        )}
                        <form onSubmit={handleAddFaculty} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                              <input
                                type="text" required
                                placeholder="e.g. Dr. Ramesh Babu"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacName}
                                onChange={(e) => {
                                  setNewFacName(e.target.value);
                                  setNewFacEmail(generateEmailFromName(e.target.value));
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Designation</label>
                              <input
                                type="text" required
                                placeholder="e.g. Assistant Professor"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacDesignation}
                                onChange={(e) => setNewFacDesignation(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Education</label>
                              <input
                                type="text" required
                                placeholder="e.g. Ph.D, M.Tech"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacEducation}
                                onChange={(e) => setNewFacEducation(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Date of Birth</label>
                              <input
                                type="date" required
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacDob}
                                onChange={(e) => setNewFacDob(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Phone Number</label>
                              <input
                                type="tel" required
                                placeholder="e.g. +91 9876543210"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacPhone}
                                onChange={(e) => setNewFacPhone(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Generated Email Address</label>
                              <input
                                type="email" required
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-655 text-xs focus:outline-none font-semibold cursor-not-allowed"
                                value={newFacEmail}
                                readOnly
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Personal Email (Verification)</label>
                              <input
                                type="email"
                                placeholder="e.g. ramesh@gmail.com"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newFacPersonalEmail}
                                onChange={(e) => setNewFacPersonalEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className={`${deptAccent[dept] || 'bg-brand-600'} hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                          >
                            Save Faculty Record
                          </button>
                        </form>
                      </div>
                    )}

                    {facultyList.filter(f => f.department === dept).length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-xs font-semibold">No faculty members found in this department.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                            <tr>
                              <th className="px-5 py-3.5">Name</th>
                              <th className="px-5 py-3.5">Designation</th>
                              <th className="px-5 py-3.5">Education</th>
                              <th className="px-5 py-3.5">System Email</th>
                              <th className="px-5 py-3.5 text-center">Status</th>
                              <th className="px-5 py-3.5 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {facultyList.filter(f => f.department === dept).map((fac) => (
                              <tr 
                                key={fac.id} 
                                className="hover:bg-slate-550/10 transition-colors cursor-pointer"
                                onClick={() => handleProfileClick(fac, 'faculty')}
                              >
                                <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-705 flex items-center justify-center font-bold text-[10px]">
                                    {getInitials(fac.name)}
                                  </div>
                                  {fac.name}
                                </td>
                                <td className="px-5 py-4 text-slate-655 font-medium">{fac.designation}</td>
                                <td className="px-5 py-4 text-slate-500 font-semibold">{fac.education}</td>
                                <td className="px-5 py-4 text-slate-655 font-mono">{fac.email}</td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    fac.is_registered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {fac.is_registered ? 'Registered' : 'Pending Sign-up'}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFaculty(fac.id, fac.name); }}
                                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STUDENT DIRECTORY TAB */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className={`bg-gradient-to-r ${deptColors[dept] || 'from-brand-600'}/[0.06] to-transparent border border-slate-200 rounded-3xl p-7 flex justify-between items-center`}>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-slate-900">
                        {dept} Pre-Registered Students
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold mt-1">
                        Add students to the database so they can verify their identity and register their accounts.
                      </p>
                    </div>
                    <div className={`${deptAccent[dept] || 'bg-brand-600'} text-white rounded-2xl px-5 py-3 text-center shadow-lg hidden md:block`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">Total</span>
                      <span className="text-2xl font-black">{studentList.filter(s => s.department === dept).length}</span>
                    </div>
                  </div>

                  {/* Section Selector */}
                  <div className="flex gap-2 bg-slate-150 p-1.5 rounded-2xl w-fit">
                    {['A', 'B', 'C', 'D'].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setStudentSection(sec)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                          studentSection === sec ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Students in Section {studentSection}</h3>
                      <button
                        onClick={() => { setShowAddStudentForm(!showAddStudentForm); setStuError(''); }}
                        className={`${deptAccent[dept] || 'bg-brand-600'} hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                      >
                        {showAddStudentForm ? 'Close Form' : '+ Pre-Register Student'}
                      </button>
                    </div>

                    {showAddStudentForm && (
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 mb-6 animate-fadeIn">
                        <h4 className="text-sm font-extrabold text-slate-800 mb-4">Add Student Record</h4>
                        {stuError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-xs font-semibold">
                            {stuError}
                          </div>
                        )}
                        <form onSubmit={handleAddStudent} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                              <input
                                type="text" required
                                placeholder="e.g. Shiva Reddy"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newStuName}
                                onChange={(e) => setNewStuName(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Father's Name</label>
                              <input
                                type="text" required
                                placeholder="e.g. Srinivas Reddy"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newStuFatherName}
                                onChange={(e) => setNewStuFatherName(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Date of Birth</label>
                              <input
                                type="date" required
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newStuDob}
                                onChange={(e) => setNewStuDob(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Phone Number</label>
                              <input
                                type="tel" required
                                placeholder="e.g. +91 9876543210"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newStuPhone}
                                onChange={(e) => setNewStuPhone(e.target.value)}
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Personal Email</label>
                              <input
                                type="email"
                                placeholder="e.g. shiva@gmail.com"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                                value={newStuPersonalEmail}
                                onChange={(e) => setNewStuPersonalEmail(e.target.value)}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Note: Roll number, college email address, and class section will be assigned automatically.</span>
                          <button
                            type="submit"
                            className={`${deptAccent[dept] || 'bg-brand-600'} hover:opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md`}
                          >
                            Save Student Record
                          </button>
                        </form>
                      </div>
                    )}

                    {studentList.filter(s => s.department === dept && s.section === studentSection).length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-slate-550 text-xs font-semibold">No students pre-registered in Section {studentSection}.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                            <tr>
                              <th className="px-5 py-3.5">Roll Number</th>
                              <th className="px-5 py-3.5">Name</th>
                              <th className="px-5 py-3.5">DOB</th>
                              <th className="px-5 py-3.5">College Email</th>
                              <th className="px-5 py-3.5 text-center">Status</th>
                              <th className="px-5 py-3.5 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {studentList.filter(s => s.department === dept && s.section === studentSection).map((stu) => (
                              <tr 
                                key={stu.id} 
                                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                onClick={() => handleProfileClick(stu, 'student')}
                              >
                                <td className="px-5 py-4 font-bold text-slate-900 font-mono">{stu.roll_number}</td>
                                <td className="px-5 py-4 font-semibold text-slate-800">{stu.full_name}</td>
                                <td className="px-5 py-4 text-slate-500 font-semibold">{stu.dob}</td>
                                <td className="px-5 py-4 text-slate-600 font-mono">{stu.email}</td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    stu.is_registered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {stu.is_registered ? 'Registered' : 'Unregistered'}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveStudent(stu.id, stu.full_name); }}
                                    className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </>
          )}

          {/* PLACEMENTS TAB */}
          {activeTab === 'placements' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Title Banner */}
              <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t-4 ${dept === 'CSE' ? 'border-t-indigo-500' : dept === 'ECE' ? 'border-t-emerald-500' : 'border-t-amber-500'}`}>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Department Placement Drives</h3>
                  <p className="text-slate-500 text-xs mt-1">Monitor upcoming, ongoing, and completed campus recruitment drives for {dept}.</p>
                </div>
                <button
                  onClick={() => setShowAddDriveForm(!showAddDriveForm)}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {showAddDriveForm ? 'Close Form' : '+ Add Upcoming Drive'}
                </button>
              </div>

              {/* Add Drive Form */}
              {showAddDriveForm && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slideDown">
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Add New Placement Drive</h4>
                  <form onSubmit={handleCreateDrive} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Company</label>
                        <input
                          type="text" required placeholder="e.g. Google"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDriveCompany}
                          onChange={(e) => setNewDriveCompany(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Role</label>
                        <input
                          type="text" required placeholder="e.g. SDE"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDriveRole}
                          onChange={(e) => setNewDriveRole(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Package (LPA)</label>
                        <input
                          type="text" required placeholder="e.g. 24.5 LPA"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDrivePackage}
                          onChange={(e) => setNewDrivePackage(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Cutoff CGPA</label>
                        <input
                          type="text" required placeholder="e.g. 8.0 CGPA"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDriveCutoff}
                          onChange={(e) => setNewDriveCutoff(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Date</label>
                        <input
                          type="date" required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDriveDate}
                          onChange={(e) => setNewDriveDate(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Status</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newDriveStatus}
                          onChange={(e) => setNewDriveStatus(e.target.value)}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Save Placement Drive
                    </button>
                  </form>
                </div>
              )}

              {/* Placement Tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-px select-none">
                {['ongoing', 'upcoming', 'completed'].map((tab) => {
                  const count = placementsList.filter(p => p.status.toLowerCase() === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setPlacementTab(tab)}
                      className={`px-6 py-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 capitalize ${
                        placementTab === tab
                          ? 'border-brand-600 text-brand-600'
                          : 'border-transparent text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      {tab} Drives
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        placementTab === tab ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Placements Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                {placementsList.filter(p => p.status.toLowerCase() === placementTab).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-550 text-xs font-semibold">No {placementTab} placement drives found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Company</th>
                          <th className="px-5 py-3.5">Job Role</th>
                          <th className="px-5 py-3.5">Package</th>
                          <th className="px-5 py-3.5">Cutoff</th>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5">Target Branches</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {placementsList
                          .filter(p => p.status.toLowerCase() === placementTab)
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                                <span className="h-6 w-6 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-brand-600 uppercase border border-slate-200">
                                  {p.company.slice(0,2)}
                                </span>
                                {p.company}
                              </td>
                              <td className="px-5 py-4 text-slate-600 font-medium">{p.role}</td>
                              <td className="px-5 py-4 text-slate-800 font-bold">{p.package}</td>
                              <td className="px-5 py-4 text-slate-500 font-mono">{p.cutoff}</td>
                              <td className="px-5 py-4 text-slate-500 font-medium">
                                {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="px-5 py-4">
                                {p.branches.split(',').map((br) => (
                                  <span key={br} className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md text-[9px] font-bold mr-1 uppercase">
                                    {br.trim()}
                                  </span>
                                ))}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  p.status === 'Ongoing' ? 'bg-amber-100 text-amber-750 border border-amber-200' :
                                  p.status === 'Upcoming' ? 'bg-blue-100 text-blue-750 border border-blue-200' : 'bg-slate-100 text-slate-550 border border-slate-200'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => handleRemoveDrive(p.id, p.company)}
                                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FEE MANAGEMENT TAB */}
          {activeTab === 'fees' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t-4 ${dept === 'CSE' ? 'border-t-indigo-500' : dept === 'ECE' ? 'border-t-emerald-500' : 'border-t-amber-500'}`}>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Fee Management – {dept}</h2>
                  <p className="text-slate-500 text-xs mt-1 font-semibold">View and update fee payment records for {deptLabel} students.</p>
                </div>
              </div>

              {/* Summary Stats */}
              {studentFees.length > 0 && (() => {
                const collected = studentFees.reduce((s, f) => s + f.paid_fee, 0);
                const outstanding = studentFees.reduce((s, f) => s + (f.total_fee - f.paid_fee), 0);
                const cleared = studentFees.filter(f => f.status === 'Cleared').length;
                const partial = studentFees.filter(f => f.status === 'Partial').length;
                const due = studentFees.filter(f => f.status === 'Due').length;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Collected</p>
                      <p className="text-emerald-700 text-xl font-black mt-1">₹{collected.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Outstanding</p>
                      <p className="text-red-700 text-xl font-black mt-1">₹{outstanding.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Cleared / Partial / Due</p>
                      <p className="text-blue-700 text-xl font-black mt-1">{cleared} / {partial} / {due}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Students</p>
                      <p className="text-slate-900 text-xl font-black mt-1">{studentFees.length}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Fee Table */}
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                {studentFees.length === 0 ? (
                  <div className="text-center py-16">
                    <DollarSign className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400 text-xs font-semibold">No fee records available for your department.</p>
                    <p className="text-slate-300 text-[10px] mt-1">Students must be pre-registered first.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Roll No.</th>
                          <th className="px-5 py-3.5">Section</th>
                          <th className="px-5 py-3.5">Fee Type</th>
                          <th className="px-5 py-3.5">Total</th>
                          <th className="px-5 py-3.5">Paid</th>
                          <th className="px-5 py-3.5">Balance</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Remarks</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentFees.map((f) => {
                          const balance = f.total_fee - f.paid_fee;
                          const isEditing = feeEditingId === f.id;
                          return (
                            <tr key={f.id} className={`transition-colors ${isEditing ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
                              <td className="px-5 py-4 font-bold text-slate-900">{f.student_name}</td>
                              <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">{f.roll_number}</td>
                              <td className="px-5 py-4 text-slate-600 font-semibold">{f.section}</td>
                              <td className="px-5 py-4 text-slate-500">{f.fee_type}</td>
                              <td className="px-5 py-4 font-bold text-slate-800">₹{f.total_fee.toLocaleString()}</td>
                              <td className="px-5 py-4 font-bold text-emerald-600">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    className="w-24 border border-indigo-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    value={feeEditPaid}
                                    onChange={e => setFeeEditPaid(e.target.value)}
                                    min={0} max={f.total_fee}
                                  />
                                ) : (
                                  `₹${f.paid_fee.toLocaleString()}`
                                )}
                              </td>
                              <td className="px-5 py-4 font-bold text-red-500">₹{balance.toLocaleString()}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  f.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' :
                                  f.status === 'Partial' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>{f.status}</span>
                              </td>
                              <td className="px-5 py-4 text-slate-400 text-[11px] max-w-[120px] truncate">{f.remarks || '—'}</td>
                              <td className="px-5 py-4 text-right">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        const paid = Math.min(parseFloat(feeEditPaid) || 0, f.total_fee);
                                        const status = paid >= f.total_fee ? 'Cleared' : paid > 0 ? 'Partial' : 'Due';
                                        handleUpdateDeptFee(f.id, status, paid, null);
                                      }}
                                      className={`${deptAccent[dept] || 'bg-brand-600'} text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all`}
                                    >Save</button>
                                    <button
                                      onClick={() => { setFeeEditingId(null); setFeeEditPaid(''); }}
                                      className="border border-slate-200 text-slate-500 font-bold text-[10px] px-3 py-1.5 rounded-xl hover:bg-slate-50"
                                    >Cancel</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    {f.status !== 'Cleared' && (
                                      <>
                                        <button
                                          onClick={() => { setFeeEditingId(f.id); setFeeEditPaid(String(f.paid_fee)); }}
                                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                        >Edit</button>
                                        <button
                                          onClick={() => handleUpdateDeptFee(f.id, 'Cleared', f.total_fee, 'Full payment received')}
                                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                        >Mark Cleared</button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section-wise Student Fee dues Report */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Section-wise Fee Report</h3>
                {studentFees.length === 0 ? (
                  <p className="text-slate-400 text-xs font-semibold text-center py-4">No data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Department</th>
                          <th className="px-5 py-3.5">Section</th>
                          <th className="px-5 py-3.5">Total Dues</th>
                          <th className="px-5 py-3.5">Total Paid</th>
                          <th className="px-5 py-3.5">Balance Left</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const breakdown = {};
                          studentFees.forEach(f => {
                            const key = `${f.department}-${f.section}`;
                            if (!breakdown[key]) {
                              breakdown[key] = {
                                department: f.department,
                                section: f.section,
                                total: 0,
                                paid: 0,
                                due: 0,
                                clearedCount: 0,
                                totalCount: 0
                              };
                            }
                            breakdown[key].total += f.total_fee;
                            breakdown[key].paid += f.paid_fee;
                            breakdown[key].due += (f.total_fee - f.paid_fee);
                            breakdown[key].totalCount += 1;
                            if (f.status === 'Cleared') breakdown[key].clearedCount += 1;
                          });

                          return Object.values(breakdown)
                            .sort((a, b) => a.section.localeCompare(b.section))
                            .map((row) => {
                              const isAllCleared = row.due <= 0;
                              return (
                                <tr key={`${row.department}-${row.section}`} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-5 py-4 font-bold text-slate-900">{row.department}</td>
                                  <td className="px-5 py-4 text-slate-655 font-bold">Section {row.section}</td>
                                  <td className="px-5 py-4 font-semibold text-slate-800 font-mono">₹{row.total.toLocaleString()}</td>
                                  <td className="px-5 py-4 font-bold text-emerald-600 font-mono">₹{row.paid.toLocaleString()}</td>
                                  <td className="px-5 py-4 font-bold text-red-500 font-mono">₹{row.due.toLocaleString()}</td>
                                  <td className="px-5 py-4">
                                    {isAllCleared ? (
                                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                        All Cleared ✅
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                                        Dues Outstanding ({row.totalCount - row.clearedCount} Students)
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    {isAllCleared ? (
                                      <span className="text-[10px] text-slate-400 font-bold italic">No Update Needed</span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to clear fee dues for all students in ${row.department} Section ${row.section}?`)) {
                                            handleBulkClearDeptFees(row.section);
                                          }
                                        }}
                                        className="bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-500 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-xs"
                                      >
                                        Update Them (Clear All)
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}


          {deleteConfirm && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
                <div className="flex items-center gap-3 text-red-600">
                  <ShieldAlert className="h-6 w-6" />
                  <h4 className="text-base font-extrabold tracking-tight">Confirm Removal</h4>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to remove <strong>{deleteConfirm.name}</strong>? {deleteConfirm.type === 'student' && "This will also delete their registered student account."}
                </p>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold text-[11px] px-4 py-2 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const { type, id, name } = deleteConfirm;
                      setDeleteConfirm(null);
                      try {
                        if (type === 'faculty') {
                          await axios.delete(`/api/admin/faculty/${id}`);
                          setFeedbackMsg(`Faculty member '${name}' removed.`);
                          fetchDashboardData();
                        } else {
                          await axios.delete(`/api/admin/students/${id}`);
                          setFeedbackMsg(`Student '${name}' removed.`);
                          fetchDashboardData();
                        }
                        setTimeout(() => setFeedbackMsg(''), 4000);
                      } catch (err) {
                        alert(err.response?.data?.detail || `Failed to remove ${type}.`);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition-all shadow-md"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        type={profileModalType}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}
