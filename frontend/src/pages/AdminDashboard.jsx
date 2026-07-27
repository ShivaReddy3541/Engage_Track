import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useBranding } from '../hooks/useBranding';
import { 
  LogOut, User, GraduationCap, ShieldAlert, Settings, FileText, 
  CheckCircle2, Bell, ChevronDown, Check, Users, Database, Clipboard, Trash2,
  Briefcase, CalendarRange, Megaphone, DownloadCloud
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExportModal from '../components/ExportModal';
import ProfileModal from '../components/ProfileModal';


export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { branding, updateBranding } = useBranding();
  
  const [instName, setInstName] = useState(branding.institution_name);
  const [logoUrl, setLogoUrl] = useState(branding.logo_url);
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(branding.secondary_color);
  const [slogan, setSlogan] = useState(branding.slogan);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (branding) {
      setInstName(branding.institution_name);
      setLogoUrl(branding.logo_url);
      setPrimaryColor(branding.primary_color);
      setSecondaryColor(branding.secondary_color);
      setSlogan(branding.slogan);
    }
  }, [branding]);

  const handleBrandingSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setFeedbackMsg('');
    const result = await updateBranding({
      institution_name: instName,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      slogan: slogan
    });
    setIsUpdating(false);
    if (result.success) {
      setFeedbackMsg(result.message || 'Branding updated successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } else {
      setFeedbackMsg(`Error: ${result.error}`);
    }
  };

  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Faculty management states
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Student management states
  const [studentList, setStudentList] = useState([]);
  const [studentDept, setStudentDept] = useState('CSE');
  const [studentSection, setStudentSection] = useState('A');
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStuName, setNewStuName] = useState('');
  const [newStuFatherName, setNewStuFatherName] = useState('');
  const [newStuDob, setNewStuDob] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('');
  const [newStuPersonalEmail, setNewStuPersonalEmail] = useState('');
  const [newStuDept, setNewStuDept] = useState('CSE');
  const [stuError, setStuError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Add faculty form states
  const [newFacName, setNewFacName] = useState('');
  const [newFacDesignation, setNewFacDesignation] = useState('');
  const [newFacEducation, setNewFacEducation] = useState('');
  const [newFacDob, setNewFacDob] = useState('');
  const [newFacPhone, setNewFacPhone] = useState('');
  const [newFacEmail, setNewFacEmail] = useState('');
  const [newFacPersonalEmail, setNewFacPersonalEmail] = useState('');
  const [newFacDept, setNewFacDept] = useState('CSE');
  const [facError, setFacError] = useState('');
  const [allFacultyEmails, setAllFacultyEmails] = useState([]);
  
  // Navigation Menu state
  const [activeMenu, setActiveMenu] = useState('dashboard'); // dashboard, approvals, audit, faculty, branding
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Placements state
  const [placementTab, setPlacementTab] = useState('ongoing'); // ongoing, upcoming, completed
  const [placementsList, setPlacementsList] = useState([]);

  // Schedule state
  const [selectedScheduleMonth, setSelectedScheduleMonth] = useState('July');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDay, setNewEventDay] = useState('');
  const [newEventType, setNewEventType] = useState('Academic');
  const [newEventDetails, setNewEventDetails] = useState('');
  const [newEvMonth, setNewEvMonth] = useState('July');
  const [newEventAttachment, setNewEventAttachment] = useState('');

  useEffect(() => {
    setNewEvMonth(selectedScheduleMonth);
  }, [selectedScheduleMonth]);
  
  const [scheduleEvents, setScheduleEvents] = useState([]);

  // Announcements state
  const [showAddAnnForm, setShowAddAnnForm] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPriority, setNewAnnPriority] = useState('Medium');
  const [newAnnTarget, setNewAnnTarget] = useState('All');
  const [newAnnAttachment, setNewAnnAttachment] = useState('');
  
  const [announcementsList, setAnnouncementsList] = useState([]);

  const [newDriveDate, setNewDriveDate] = useState('');
  const [newDriveBranches, setNewDriveBranches] = useState('');
  const [newDriveStatus, setNewDriveStatus] = useState('Upcoming');

  // New placed students list
  const [placementRecords, setPlacementRecords] = useState([]);
  
  const [facilityRequests, setFacilityRequests] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [admissionsRate, setAdmissionsRate] = useState(null);
  
  // Export form state
  const [exportPrompt, setExportPrompt] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [showAddDriveForm, setShowAddDriveForm] = useState(false);

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileModalType, setProfileModalType] = useState('student');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const fetchDashboardData = async () => {
    try {
      const [
        placementsRes, scheduleRes, announcementsRes, 
        facilityReqsRes, feesRes, placementRecordsRes, admissionsRes
      ] = await Promise.all([
        axios.get('/api/admin/placement-drives').catch(() => ({ data: [] })),
        axios.get('/api/admin/schedule-events').catch(() => ({ data: [] })),
        axios.get('/api/admin/announcements').catch(() => ({ data: [] })),
        axios.get('/api/admin/facility-requests').catch(() => ({ data: [] })),
        axios.get('/api/admin/fees').catch(() => ({ data: [] })),
        axios.get('/api/admin/placements/records').catch(() => ({ data: [] })),
        axios.get('/api/admin/admissions-rate').catch(() => ({ data: null }))
      ]);
      setPlacementsList(placementsRes.data);
      setScheduleEvents(scheduleRes.data);
      setAnnouncementsList(announcementsRes.data);
      setFacilityRequests(facilityReqsRes.data);
      setStudentFees(feesRes.data);
      setPlacementRecords(placementRecordsRes.data);
      setAdmissionsRate(admissionsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    if (!exportPrompt.trim()) return;
    
    setIsExporting(true);
    setExportMessage('');
    try {
      const res = await axios.post('/api/admin/export', { prompt: exportPrompt });
      const { format, filename, headers, data } = res.data;
      
      if (!data || data.length === 0) {
        setExportMessage('No data found for this prompt.');
        setIsExporting(false);
        return;
      }
      
      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        setExportMessage(`Successfully generated ${filename}.xlsx`);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        const tableColumn = headers;
        const tableRows = data.map(row => headers.map(h => row[h] || ''));
        
        doc.text("Exported Data", 14, 15);
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 20,
        });
        doc.save(`${filename}.pdf`);
        setExportMessage(`Successfully generated ${filename}.pdf`);
      }
    } catch (err) {
      console.error("Export error", err);
      setExportMessage('Error generating export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };



  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDay || !newEventDetails) return;
    try {
      const res = await axios.post('/api/admin/schedule-events', {
        title: newEventTitle,
        month: newEvMonth,
        day: newEventDay,
        event_type: newEventType,
        details: newEventDetails,
        attachment_name: newEventAttachment || null
      });
      setScheduleEvents([...scheduleEvents, res.data]);
      setNewEventTitle('');
      setNewEventDay('');
      setNewEventDetails('');
      setNewEventAttachment('');
      setShowAddEventForm(false);
      setFeedbackMsg(`Milestone '${newEventTitle}' added to ${newEvMonth} schedule.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
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
        date: new Date().toISOString().split('T')[0]
      });
      setAnnouncementsList([res.data, ...announcementsList]);
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnAttachment('');
      setShowAddAnnForm(false);
      setFeedbackMsg(`Campus announcement '${newAnnTitle}' posted successfully.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDrive = async (e) => {
    e.preventDefault();
    if (!newDriveCompany || !newDriveRole) return;
    try {
      const res = await axios.post('/api/admin/placement-drives', {
        company: newDriveCompany,
        role: newDriveRole,
        package: newDrivePackage,
        cutoff: newDriveCutoff,
        date: newDriveDate,
        branches: newDriveBranches,
        status: newDriveStatus
      });
      setPlacementsList([res.data, ...placementsList]);
      setShowAddDriveForm(false);
      setNewDriveCompany('');
      setNewDriveRole('');
      setNewDrivePackage('');
      setNewDriveCutoff('');
      setNewDriveDate('');
      setNewDriveBranches('');
      setFeedbackMsg(`Placement drive for '${newDriveCompany}' added.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePlacement = async (id, company) => {
    try {
      await axios.delete(`/api/admin/placement-drives/${id}`);
      setPlacementsList(placementsList.filter(p => p.id !== id));
      setFeedbackMsg(`Placement drive for '${company}' removed.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveEvent = async (id, title) => {
    try {
      await axios.delete(`/api/admin/schedule-events/${id}`);
      setScheduleEvents(scheduleEvents.filter(e => e.id !== id));
      setFeedbackMsg(`Milestone '${title}' removed.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAnnouncement = async (id, title) => {
    try {
      await axios.delete(`/api/admin/announcements/${id}`);
      setAnnouncementsList(announcementsList.filter(a => a.id !== id));
      setFeedbackMsg(`Announcement '${title}' deleted.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFeeStatus = async (fee_id, newStatus, paidAmount, remarks) => {
    try {
      await axios.put(`/api/admin/fees/${fee_id}`, {
        paid_fee: paidAmount,
        status: newStatus,
        remarks: remarks || null
      });
      setStudentFees(studentFees.map(f => f.id === fee_id ? { ...f, status: newStatus, paid_fee: paidAmount } : f));
      setFeedbackMsg(`Fee status updated.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch(e) {
      alert(e.response?.data?.detail || 'Failed to update fee.');
    }
  };

  const handleBulkClearFees = async (dept, sec) => {
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

  const handleApproveFacilityRequest = async (id, status) => {
    try {
      await axios.put(`/api/admin/facility-requests/${id}/status?status_str=${status}`);
      setFacilityRequests(facilityRequests.map(r => r.id === id ? { ...r, status } : r));
      setFeedbackMsg(`Facility request ${status}.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      const response = await axios.get('/api/admin/pending-teachers');
      setPendingTeachers(response.data);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    setFacultyLoading(true);
    try {
      const [facRes, emailRes] = await Promise.all([
        axios.get('/api/admin/faculty'),
        axios.get('/api/admin/faculty/all-emails'),
      ]);
      setFacultyList(facRes.data);
      setAllFacultyEmails(emailRes.data);
    } catch (error) {
      console.error("Error fetching faculty list:", error);
    } finally {
      setFacultyLoading(false);
    }
  };

  const generateEmailFromName = (name) => {
    if (!name) return '';
    // Remove common title prefixes
    let clean = name.replace(/\b(dr|mr|mrs|ms|prof)\b\.?/gi, '');
    clean = clean.toLowerCase().trim();
    clean = clean.replace(/\s+/g, '.');
    clean = clean.replace(/[^a-z0-9.]/g, '');
    if (!clean) return '';

    // Check uniqueness against ALL departments' emails globally
    const base = clean;
    let candidate = `${base}@ssvuniversity.in`;
    let counter = 2;
    while (allFacultyEmails.includes(candidate)) {
      candidate = `${base}${counter}@ssvuniversity.in`;
      counter++;
    }
    return candidate;
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setFacError('');
    

    if (!newFacEmail.toLowerCase().endsWith('@ssvuniversity.in')) {
      setFacError("Email must end with the college domain '@ssvuniversity.in'");
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
        department: newFacDept,
        personal_email: newFacPersonalEmail || null
      });
      
      setFeedbackMsg(`Faculty member '${newFacName}' added successfully!`);
      // Reset form
      setNewFacName('');
      setNewFacDesignation('');
      setNewFacEducation('');
      setNewFacDob('');
      setNewFacPhone('');
      setNewFacEmail('');
      setNewFacPersonalEmail('');
      setShowAddForm(false);
      
      fetchFaculty();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (error) {
      setFacError(error.response?.data?.detail || 'Failed to add faculty member.');
    }
  };

  const handleRemoveFaculty = (facultyId, name) => {
    setDeleteConfirm({ type: 'faculty', id: facultyId, name });
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
        department: newStuDept,
        personal_email: newStuPersonalEmail || null
      });
      setFeedbackMsg(`Student '${newStuName}' pre-registered successfully!`);
      setNewStuName('');
      setNewStuFatherName('');
      setNewStuDob('');
      setNewStuPhone('');
      setNewStuPersonalEmail('');
      setNewStuDept('CSE');
      setShowAddStudentForm(false);
      fetchStudents();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setStuError(err.response?.data?.detail || 'Failed to add student.');
    }
  };

  const handleRemoveStudent = (id, name) => {
    setDeleteConfirm({ type: 'student', id, name });
  };


  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/admin/students');
      setStudentList(res.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingTeachers();
      fetchFaculty();
      fetchStudents();
    }
  }, [user]);

  const handleApprove = async (userId, name) => {
    try {
      await axios.post(`/api/admin/approve-teacher/${userId}`);
      setFeedbackMsg(`Teacher '${name}' approved successfully!`);
      fetchPendingTeachers();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to approve teacher.');
    }
  };

  const handleReject = async (userId, name) => {
    try {
      await axios.delete(`/api/admin/reject-teacher/${userId}`);
      setFeedbackMsg(`Teacher registration for '${name}' was rejected and deleted.`);
      fetchPendingTeachers();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to reject teacher.');
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  if (!user) return null;

  const initials = getInitials(user.full_name);


  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">
      
      {/* LEFT SIDEBAR: MeritCurve Style for Admin */}
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none overflow-y-auto">
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
              <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>

          {/* Menus */}
          <div className="p-4 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Overview</span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'dashboard'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Clipboard className="h-4 w-4" />
                  Dashboard Overview
                </button>
                <button
                  onClick={() => { setActiveMenu('faculty'); fetchFaculty(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'faculty'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Faculty Directory
                </button>
                <button
                  onClick={() => { setActiveMenu('students'); fetchStudents(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'students'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student Directory
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">Campus Management</span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveMenu('placements')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'placements'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Placements Portal
                </button>
                <button
                  onClick={() => setActiveMenu('schedule')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'schedule'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange className="h-4 w-4" />
                  Schedule
                </button>
                <button
                  onClick={() => setActiveMenu('announcements')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'announcements'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="h-4 w-4" />
                  Announcements
                </button>

                <button
                  onClick={() => setActiveMenu('fees')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMenu === 'fees'
                      ? 'bg-brand-50 text-brand-600' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Clipboard className="h-4 w-4" />
                  Fee Management
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
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header navbar with Dropdown */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            >
              <DownloadCloud className="h-3.5 w-3.5" /> Export Data
            </button>
            <span className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">{branding.institution_name} Admin Control</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              {pendingTeachers.length > 0 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-brand-600 rounded-full"></span>}
            </button>
            
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
                      <span className="text-[10px] text-slate-500 break-all">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button 
                      onClick={() => { setShowProfileMenu(false); handleProfileClick(user, 'admin'); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      View Profile
                    </button>
                    <button 
                      onClick={() => { setShowProfileMenu(false); handleProfileClick(user, 'admin'); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                      Edit Profile
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
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {feedbackMsg}
            </div>
          )}

          {/* MENU A: DASHBOARD VIEW */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-brand-500/[0.04] to-brand-600/[0.01] border border-brand-500/10 rounded-3xl p-8 relative overflow-hidden flex justify-between items-center">
                <div className="relative z-10 max-w-xl">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                    Welcome Back, <span className="text-brand-600">ADMINISTRATOR!</span> 🛡️
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">Ready to manage university faculty directories and review staff records?</p>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="bg-brand-600 text-white rounded-2xl px-5 py-3 text-center shadow-lg shadow-brand-600/10 hidden md:block">
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Total Faculty</span>
                    <span className="text-2xl font-black">{facultyList.length}</span>
                  </div>
                  <div className="bg-slate-800 text-white rounded-2xl px-5 py-3 text-center shadow-lg shadow-slate-800/10 hidden md:block">
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Total Students</span>
                    <span className="text-2xl font-black">{studentList.length}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-brand-600/10 text-brand-600 rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CSE Department Faculty</span>
                    <h3 className="text-lg font-black text-slate-900 leading-none mt-1">
                      {facultyList.filter(f => f.department === 'CSE').length} Active
                    </h3>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-brand-600/10 text-brand-600 rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ECE Department Faculty</span>
                    <h3 className="text-lg font-black text-slate-900 leading-none mt-1">
                      {facultyList.filter(f => f.department === 'ECE').length} Active
                    </h3>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-brand-600/10 text-brand-600 rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EEE Department Faculty</span>
                    <h3 className="text-lg font-black text-slate-900 leading-none mt-1">
                      {facultyList.filter(f => f.department === 'EEE').length} Active
                    </h3>
                  </div>
                </div>
              </div>

              {admissionsRate && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Admissions Rate Report</h3>
                    <p className="text-slate-500 text-xs">Comparison between previous and current academic year.</p>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Previous Year</span>
                      <span className="text-2xl font-black text-slate-700">{admissionsRate.previous_year_count || admissionsRate.previous_year_total}</span>
                    </div>
                    <div className="text-center border-l border-slate-100 pl-6">
                      <span className="text-[10px] text-brand-500 font-bold uppercase tracking-wider block mb-1">This Year</span>
                      <span className="text-2xl font-black text-brand-600">{admissionsRate.this_year_count || admissionsRate.current_year_total}</span>
                    </div>
                    {admissionsRate.rate_change_percent !== undefined && (
                      <div className="text-center border-l border-slate-100 pl-6">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Growth / Change</span>
                        <span className={`text-2xl font-black ${admissionsRate.rate_change_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {admissionsRate.rate_change_percent >= 0 ? '+' : ''}{admissionsRate.rate_change_percent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}



          {/* MENU E: FACULTY DIRECTORY */}
          {activeMenu === 'faculty' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header card with action button */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Faculty Directory</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Manage and review department staff directories. Enforces official college email domains.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-brand-600/20"
                >
                  {showAddForm ? 'Close Registration Form' : '+ Add Faculty Member'}
                </button>
              </div>

              {/* Add Faculty Collapsible Form */}
              {showAddForm && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slideDown">
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Register New Faculty Member</h4>
                  {facError && (
                    <div className="bg-red-50 border border-red-200 text-red-750 rounded-xl p-3 text-xs font-semibold">
                      {facError}
                    </div>
                  )}
                  <form onSubmit={handleAddFaculty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Ramesh Babu"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewFacName(val);
                            setNewFacEmail(generateEmailFromName(val));
                          }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Designation / Role</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Professor (VLSI)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacDesignation}
                          onChange={(e) => setNewFacDesignation(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Education / Degree</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ph.D, M.Tech"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacEducation}
                          onChange={(e) => setNewFacEducation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Date of Birth</label>
                        <input
                          type="date"
                          required
                          max="2001-12-31"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacDob}
                          onChange={(e) => setNewFacDob(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacPhone}
                          onChange={(e) => setNewFacPhone(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Email (with College Domain)</label>
                        <input
                          type="email"
                          required
                          placeholder="name@ssvuniversity.in"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacEmail}
                          onChange={(e) => setNewFacEmail(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Personal Email <span className="text-slate-400 font-normal normal-case">(for welcome email)</span></label>
                        <input
                          type="email"
                          placeholder="faculty@gmail.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newFacPersonalEmail}
                          onChange={(e) => setNewFacPersonalEmail(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-slate-600 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Department</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-909 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newFacDept}
                          onChange={(e) => setNewFacDept(e.target.value)}
                        >
                          <option value="CSE">CSE (Computer Science)</option>
                          <option value="ECE">ECE (Electronics &amp; Comm)</option>
                          <option value="EEE">EEE (Electrical &amp; Electronics)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Save Faculty Member
                    </button>
                  </form>
                </div>
              )}

              {/* Department Tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-px select-none">
                {['CSE', 'ECE', 'EEE'].map((dept) => {
                  const count = facultyList.filter(f => f.department === dept).length;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className={`px-6 py-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                        selectedDept === dept
                          ? 'border-brand-600 text-brand-600'
                          : 'border-transparent text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      {dept} Department
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        selectedDept === dept ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Department Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                {facultyLoading ? (
                  <p className="text-slate-400 text-xs py-4">Loading directory...</p>
                ) : facultyList.filter(f => f.department === selectedDept).length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-slate-500 text-xs font-semibold">No faculty members registered in {selectedDept} Department.</p>
                    <p className="text-slate-400 text-[10px]">Click "+ Add Faculty Member" to register staff.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="px-5 py-3.5 rounded-l-xl">Name</th>
                          <th className="px-5 py-3.5">Designation (Role/Subject)</th>
                          <th className="px-5 py-3.5">Education</th>
                          <th className="px-5 py-3.5">Date of Birth</th>
                          <th className="px-5 py-3.5">Phone Number</th>
                          <th className="px-5 py-3.5">Email Address</th>
                          <th className="px-5 py-3.5 text-right rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {facultyList
                          .filter((f) => f.department === selectedDept)
                          .map((f) => (
                            <tr 
                              key={f.id} 
                              className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                              onClick={() => handleProfileClick(f, 'faculty')}
                            >
                              <td className="px-5 py-4 font-bold text-slate-900">{f.name}</td>
                              <td className="px-5 py-4 text-slate-600 font-medium">{f.designation}</td>
                              <td className="px-5 py-4 text-slate-500 font-semibold">{f.education}</td>
                              <td className="px-5 py-4 text-slate-500 font-medium">{f.dob}</td>
                              <td className="px-5 py-4 text-slate-500 font-mono font-medium">{f.phone_number}</td>
                              <td className="px-5 py-4 text-brand-600 font-bold">{f.email}</td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFaculty(f.id, f.name); }}
                                  className="bg-red-50 hover:bg-red-100/40 text-red-600 border border-red-200 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                >
                                  Remove
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

          {activeMenu === 'students' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Directory</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Manage pre-registered students across all departments</p>
                </div>
              </div>

              {/* Department & Section Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex gap-2">
                  {['CSE', 'ECE', 'EEE'].map(dept => (
                    <button 
                      key={dept} 
                      onClick={() => { setStudentDept(dept); setStudentSection('A'); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${studentDept === dept ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <div className="h-8 w-px bg-slate-200 self-center"></div>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map(sec => (
                    <button 
                      key={sec} 
                      onClick={() => setStudentSection(sec)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${studentSection === sec ? 'bg-brand-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      Section {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-slate-900">{studentDept} - Section {studentSection}</h3>
                  <button
                    onClick={() => { setShowAddStudentForm(!showAddStudentForm); setStuError(''); }}
                    className="bg-brand-600 hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    {showAddStudentForm ? 'Close Form' : '+ Add Student'}
                  </button>
                </div>

                {/* Add Student Form */}
                {showAddStudentForm && (
                  <div className="p-6 border-b border-slate-100 bg-slate-50/60 space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-800">Pre-register New Student</h4>
                    {stuError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs font-semibold">
                        {stuError}
                      </div>
                    )}
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text" required
                            placeholder="e.g. Aarav Reddy"
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
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Personal Email <span className="text-slate-400 font-normal normal-case">(for welcome email)</span></label>
                          <input
                            type="email"
                            placeholder="student@gmail.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all"
                            value={newStuPersonalEmail}
                            onChange={(e) => setNewStuPersonalEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Department</label>
                          <select
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-400 transition-all font-semibold"
                            value={newStuDept}
                            onChange={(e) => setNewStuDept(e.target.value)}
                          >
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-brand-600 hover:opacity-90 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md">
                          Add to Directory
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3.5">Roll Number</th>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Father Name</th>
                        <th className="px-5 py-3.5">DOB</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5 text-center">Portal Status</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentList.filter(s => s.department === studentDept && s.section === studentSection).map(s => (
                        <tr 
                          key={s.id} 
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => handleProfileClick(s, 'student')}
                        >
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">{s.roll_number}</td>
                          <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap">{s.full_name}</td>
                          <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{s.father_name}</td>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{s.dob}</td>
                          <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{s.phone_number}</td>
                          <td className="px-5 py-4 text-slate-500 font-mono text-[10px]">{s.email}</td>
                          <td className="px-5 py-4 text-center">
                            {s.is_registered ? (
                              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Registered</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold">Pending</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveStudent(s.id, s.full_name); }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeMenu === 'placements' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Placement Rate</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-none mt-2">84.2%</h3>
                  <span className="text-[10px] text-emerald-500 font-bold mt-1 block">↑ 3.1% vs last year</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Package</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-none mt-2">7.8 LPA</h3>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">Highest: 32.5 LPA</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Offers</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-none mt-2">145</h3>
                  <span className="text-[10px] text-slate-400 font-medium mt-1 block">Eligible: 210 students</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Partners</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-none mt-2">24</h3>
                  <span className="text-[10px] text-brand-600 font-bold mt-1 block">4 new this month</span>
                </div>
              </div>

              {/* Title Banner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Campus Placement Drives</h3>
                  <p className="text-slate-500 text-xs mt-1">Monitor upcoming, ongoing, and completed campus recruitment drives.</p>
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
                  <form onSubmit={handleAddDrive} className="space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Target Branches</label>
                        <input
                          type="text" required placeholder="e.g. CSE, ECE"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newDriveBranches}
                          onChange={(e) => setNewDriveBranches(e.target.value)}
                        />
                      </div>
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
                                  onClick={() => handleRemovePlacement(p.id, p.company)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                >
                                  Remove
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

          {activeMenu === 'schedule' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Academic Schedule</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Manage milestones, proctored exams, holidays, and critical campus timelines for the entire academic year.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEventForm(!showAddEventForm)}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {showAddEventForm ? 'Close Form' : '+ Add Milestone'}
                </button>
              </div>

              {/* Add Milestone Collapsible Form */}
              {showAddEventForm && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slideDown">
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Add Academic Milestone</h4>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Milestone Title</label>
                        <input
                          type="text" required placeholder="e.g. Mid-Term Lab Practicals"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Month</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newEvMonth}
                          onChange={(e) => setNewEvMonth(e.target.value)}
                        >
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Day of Month</label>
                        <input
                          type="text" required placeholder="e.g. 15 or 12-18"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newEventDay}
                          onChange={(e) => setNewEventDay(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Category</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value)}
                        >
                          <option value="Academic">Academic</option>
                          <option value="Exam">Exam (Proctored)</option>
                          <option value="Holiday">Holiday</option>
                          <option value="Placement">Placement</option>
                          <option value="Event">Event / Fest</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Brief Details</label>
                        <input
                          type="text" required placeholder="e.g. Core evaluations in respective block labs"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newEventDetails}
                          onChange={(e) => setNewEventDetails(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Attachment Name (Optional)</label>
                        <input
                          type="text" placeholder="e.g. syllabus_v1.pdf"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newEventAttachment || ''}
                          onChange={(e) => setNewEventAttachment(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Add Event
                    </button>
                  </form>
                </div>
              )}

              {/* Month Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px select-none">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => {
                  const count = scheduleEvents.filter(e => e.month === month).length;
                  return (
                    <button
                      key={month}
                      onClick={() => setSelectedScheduleMonth(month)}
                      className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                        selectedScheduleMonth === month
                          ? 'border-brand-600 text-brand-600'
                          : 'border-transparent text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      {month} 2026
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        selectedScheduleMonth === month ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>


              {/* Schedule events matching selected month */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduleEvents.filter(e => e.month === selectedScheduleMonth).length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center md:col-span-2 space-y-1">
                    <p className="text-slate-550 text-xs font-semibold">No milestones scheduled for {selectedScheduleMonth} 2026.</p>
                    <p className="text-slate-400 text-[10px]">Click "+ Add Milestone" to add events.</p>
                  </div>
                ) : (
                  scheduleEvents
                    .filter(e => e.month === selectedScheduleMonth)
                    .sort((a,b) => parseInt(a.day) - parseInt(b.day))
                    .map((e) => {
                      let badgeColor = "bg-slate-100 text-slate-650";
                      if (e.type === "Exam") badgeColor = "bg-red-50 text-red-750 border border-red-150";
                      else if (e.type === "Holiday") badgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
                      else if (e.type === "Placement") badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                      else if (e.type === "Academic") badgeColor = "bg-blue-50 text-blue-700 border border-blue-100";

                      return (
                        <div key={e.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex gap-4 hover:shadow-md hover:border-slate-300 transition-all group relative">
                          <div className="h-14 w-14 rounded-2xl bg-brand-50 border border-brand-500/10 flex flex-col items-center justify-center text-brand-600 flex-shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-wider leading-none">{selectedScheduleMonth.slice(0,3)}</span>
                            <span className="text-xl font-black mt-0.5 leading-none">{e.day}</span>
                          </div>
                          <div className="space-y-1 pr-6">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                              {e.type}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-brand-600 transition-colors pt-1">{e.title}</h4>
                            <p className="text-slate-550 text-[10px] leading-relaxed font-medium">{e.details}</p>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveEvent(e.id, e.title)}
                            className="absolute top-4 right-4 h-6 w-6 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 flex items-center justify-center transition-colors"
                            title="Remove event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {activeMenu === 'announcements' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Action Banner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Campus Announcements</h3>
                  <p className="text-slate-500 text-xs mt-1">Broadcast official news, policy tweaks, and system updates to all branches.</p>
                </div>
                <button
                  onClick={() => setShowAddAnnForm(!showAddAnnForm)}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
                >
                  {showAddAnnForm ? 'Close Form' : '+ Post Announcement'}
                </button>
              </div>

              {/* Add Announcement Collapsible Form */}
              {showAddAnnForm && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-slideDown">
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Compose Announcement</h4>
                  <form onSubmit={handleAddAnnouncement} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Announcement Title</label>
                        <input
                          type="text" required placeholder="e.g. Campus Closed on Independence Day"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                          value={newAnnTitle}
                          onChange={(e) => setNewAnnTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Priority / Urgency</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newAnnPriority}
                          onChange={(e) => setNewAnnPriority(e.target.value)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Target Audience</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-semibold"
                          value={newAnnTarget}
                          onChange={(e) => setNewAnnTarget(e.target.value)}
                        >
                          <option value="All">All Students &amp; Faculty</option>
                          <option value="Students">Students Only</option>
                          <option value="Teachers">Faculty / Teachers Only</option>
                        </select>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Attachment File</label>
                        <input
                          type="file"
                          className="hidden"
                          id="announcement-file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewAnnAttachment(e.target.files[0].name);
                            }
                          }}
                        />
                        <label htmlFor="announcement-file" className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 min-h-[38px]">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="truncate max-w-[150px]">{newAnnAttachment ? newAnnAttachment : "Choose File"}</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Message Content</label>
                      <textarea
                        required rows="3" placeholder="Compose message details... Postings are automatically audited for safety compliance."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium resize-none"
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider"
                    >
                      Publish Announcement
                    </button>
                  </form>
                </div>
              )}

              {/* Announcements Feed */}
              <div className="space-y-4">
                {announcementsList.map((a) => {
                  let priorityColor = "bg-slate-100 text-slate-650";
                  if (a.priority === "High") priorityColor = "bg-red-50 text-red-700 border border-red-100";
                  else if (a.priority === "Medium") priorityColor = "bg-amber-50 text-amber-750 border border-amber-150";

                  return (
                    <div key={a.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:border-slate-350 transition-colors group relative">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColor}`}>
                            {a.priority} Priority
                          </span>
                          <span className="bg-brand-50 text-brand-650 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                            To: {a.target}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">
                            Posted: {new Date(a.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        <h4 className="font-extrabold text-xs text-slate-900">{a.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">{a.content}</p>

                        {/* Circular/File Attachment Block */}
                        {a.attachment && (
                          <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-150 rounded-xl p-2.5 max-w-sm hover:bg-slate-100/50 transition-colors cursor-pointer select-none">
                            <FileText className="h-4 w-4 text-brand-600" />
                            <span className="text-[10px] text-slate-600 font-bold truncate max-w-[200px]">{a.attachment}</span>
                            <span className="text-[9px] text-slate-405 font-semibold ml-auto border border-slate-200 bg-white px-2 py-0.5 rounded-md">View circular</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold pt-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          Safety audited by Content-Moderator Agent
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleRemoveAnnouncement(a.id, a.title)}
                          className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {false && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Pending Approvals</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Review and verify new faculty/student portal requests</p>
                  </div>
                </div>

                {loading ? (
                  <p className="text-slate-400 text-xs py-4">Loading pending approvals...</p>
                ) : pendingTeachers.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <p className="text-slate-500 text-xs font-semibold">All caught up!</p>
                    <p className="text-slate-400 text-[10px]">There are no pending teacher registration requests at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Name</th>
                          <th className="px-5 py-3.5">Email</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Created At</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingTeachers.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-900">{t.full_name}</td>
                            <td className="px-5 py-4 font-mono text-[10px] text-slate-550">{t.email}</td>
                            <td className="px-5 py-4">
                              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                {t.role}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-400">
                              {new Date(t.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 text-right space-x-2">
                              <button
                                onClick={() => handleApprove(t.id, t.full_name)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-md"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(t.id, t.full_name)}
                                className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Facility Requests Section */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Facility & Permission Requests</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Review requests from Department Admins</p>
                  </div>
                </div>

                {loading ? (
                  <p className="text-slate-400 text-xs py-4">Loading requests...</p>
                ) : facilityRequests.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <p className="text-slate-500 text-xs font-semibold">No facility requests.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Department</th>
                          <th className="px-5 py-3.5">Type</th>
                          <th className="px-5 py-3.5">Details</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {facilityRequests.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-900">{r.department}</td>
                            <td className="px-5 py-4 font-medium text-slate-700">{r.request_type}</td>
                            <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate" title={r.details}>{r.details}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right space-x-2">
                              {r.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveFacilityRequest(r.id, 'Approved')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-md"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleApproveFacilityRequest(r.id, 'Rejected')}
                                    className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all border border-red-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
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

          {activeMenu === 'fees' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Student Fee Management</h3>
                  <p className="text-slate-500 text-xs mt-1">Monitor fee dues, record payments, and update statuses across all departments.</p>
                </div>
                <div className="flex gap-3">
                  <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
                    value={studentDept}
                    onChange={(e) => {
                      setStudentDept(e.target.value);
                      axios.get(`/api/admin/fees?department=${e.target.value}`).then(r => setStudentFees(r.data)).catch(()=>{});
                    }}
                  >
                    <option value="">All Departments</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
              </div>

              {/* Summary Cards */}
              {studentFees.length > 0 && (() => {
                const total = studentFees.reduce((s, f) => s + f.total_fee, 0);
                const collected = studentFees.reduce((s, f) => s + f.paid_fee, 0);
                const due = total - collected;
                const cleared = studentFees.filter(f => f.status === 'Cleared').length;
                const partial = studentFees.filter(f => f.status === 'Partial').length;
                const pending = studentFees.filter(f => f.status === 'Due').length;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                      <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Collected</p>
                      <p className="text-emerald-700 text-xl font-black mt-1">₹{collected.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <p className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Outstanding</p>
                      <p className="text-red-700 text-xl font-black mt-1">₹{due.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cleared / Partial / Due</p>
                      <p className="text-slate-900 text-xl font-black mt-1">{cleared} / {partial} / {pending}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Total Students</p>
                      <p className="text-blue-700 text-xl font-black mt-1">{studentFees.length}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Fee Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                {studentFees.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-xs font-semibold">No fee records found. Students must be pre-registered first.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3.5">Student</th>
                          <th className="px-5 py-3.5">Roll No.</th>
                          <th className="px-5 py-3.5">Dept – Section</th>
                          <th className="px-5 py-3.5">Fee Type</th>
                          <th className="px-5 py-3.5">Total</th>
                          <th className="px-5 py-3.5">Paid</th>
                          <th className="px-5 py-3.5">Balance</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentFees.map((f) => {
                          const balance = f.total_fee - f.paid_fee;
                          return (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4 font-bold text-slate-900">{f.student_name}</td>
                              <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">{f.roll_number}</td>
                              <td className="px-5 py-4 text-slate-600 font-medium">{f.department} – {f.section}</td>
                              <td className="px-5 py-4 text-slate-500">{f.fee_type}</td>
                              <td className="px-5 py-4 font-bold text-slate-800">₹{f.total_fee.toLocaleString()}</td>
                              <td className="px-5 py-4 font-bold text-emerald-600">₹{f.paid_fee.toLocaleString()}</td>
                              <td className="px-5 py-4 font-bold text-red-500">₹{balance.toLocaleString()}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  f.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' :
                                  f.status === 'Partial' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>{f.status}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {f.status !== 'Cleared' && (
                                    <button
                                      onClick={() => handleUpdateFeeStatus(f.id, 'Cleared', f.total_fee, 'Full payment received')}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                    >
                                      Mark Cleared
                                    </button>
                                  )}
                                  {f.status === 'Due' && (
                                    <button
                                      onClick={() => {
                                        const amt = prompt(`Enter amount paid for ${f.student_name} (max ₹${f.total_fee.toLocaleString()}):`);
                                        if (!amt || isNaN(amt)) return;
                                        const paid = Math.min(parseFloat(amt), f.total_fee);
                                        const status = paid >= f.total_fee ? 'Cleared' : 'Partial';
                                        handleUpdateFeeStatus(f.id, status, paid, null);
                                      }}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all"
                                    >
                                      Record Payment
                                    </button>
                                  )}
                                </div>
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
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Department & Section-wise Fee Report</h3>
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
                            .sort((a, b) => {
                              if (a.department !== b.department) return a.department.localeCompare(b.department);
                              return a.section.localeCompare(b.section);
                            })
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
                                            handleBulkClearFees(row.department, row.section);
                                          }
                                        }}
                                        className="bg-brand-650 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-500 font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all shadow-xs"
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
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[11px] px-4 py-2 rounded-xl transition-all"
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
                        setFeedbackMsg(`Faculty member '${name}' removed successfully.`);
                        fetchFaculty();
                      } else {
                        await axios.delete(`/api/admin/students/${id}`);
                        setFeedbackMsg(`Student '${name}' removed successfully.`);
                        fetchStudents();
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
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

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
