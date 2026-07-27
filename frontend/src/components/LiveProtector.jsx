import React from 'react';
import OnlineMeetingRoom from './OnlineMeetingRoom';

export default function LiveProtector({ classData, classId, className, isHost, onLeave }) {
  // Normalize meetData whether passed via classData object or separate classId/className props
  const rawData = classData || {};
  const normalizedMeet = {
    meeting_id: rawData.meeting_id || rawData.id || classId || 'MEET-DEMO-101',
    id: rawData.id || classId || 'MEET-DEMO-101',
    topic: rawData.topic || rawData.name || className || rawData.subject_name || 'Virtual Live Classroom',
    subject_name: rawData.subject_name || rawData.name || className || 'General Academic Meet',
    department: rawData.department || 'CSE',
    section: rawData.section || 'A',
    teacher_name: rawData.teacher_name || (isHost ? 'You (Host Instructor)' : 'Dr. Faculty Instructor'),
    meet_date: rawData.meet_date || new Date().toISOString().split('T')[0],
    start_time: rawData.start_time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    absence_limit_mins: rawData.absence_limit_mins || rawData.absence_allowed_mins || 15,
    camera_mandatory: rawData.camera_mandatory || false
  };

  const role = isHost ? 'teacher' : 'student';

  return (
    <OnlineMeetingRoom 
      meetData={normalizedMeet} 
      userRole={role} 
      onClose={onLeave} 
      onMeetingEnded={onLeave} 
    />
  );
}
