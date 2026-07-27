import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileModal = ({ user, profile, isOpen, onClose, onUpdate, isAdminEdit = false, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const targetUser = user || profile;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    department: '',
    section: '',
    roll_number: '',
    phone_number: '',
    dob: '',
    designation: '',
    education: ''
  });

  useEffect(() => {
    if (targetUser) {
      setFormData({
        full_name: targetUser.full_name || targetUser.name || '',
        email: targetUser.email || '',
        role: targetUser.role || type || 'student',
        department: targetUser.department || '',
        section: targetUser.section || '',
        roll_number: targetUser.roll_number || '',
        phone_number: targetUser.phone_number || '',
        dob: targetUser.dob || '',
        designation: targetUser.designation || '',
        education: targetUser.education || ''
      });
      setIsEditing(false);
      setError(null);
      setSuccess(null);
    }
  }, [user, profile, isOpen, type]);

  if (!isOpen || !targetUser) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        full_name: formData.full_name,
        department: formData.department,
        section: formData.section,
        roll_number: formData.roll_number,
        phone_number: formData.phone_number,
        dob: formData.dob,
        designation: formData.designation,
        education: formData.education
      };

      let res;
      if (isAdminEdit && targetUser.id) {
        res = await axios.put(`http://localhost:8000/api/admin/users/${targetUser.id}`, payload, { headers });
      } else {
        res = await axios.put(`http://localhost:8000/api/auth/profile`, payload, { headers });
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dept_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    teacher: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    student: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-2 transition-colors"
          >
            <i className="ri-close-line text-lg"></i>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
              {formData.full_name.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{formData.full_name || 'User Profile'}</h3>
              <p className="text-indigo-100 text-sm opacity-90">{formData.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider ${roleColors[formData.role] || roleColors.student}`}>
                  {formData.role === 'dept_admin' ? 'Dept Admin' : formData.role}
                </span>
                {formData.department && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white border border-white/20">
                    {formData.department} {formData.section && `- Sec ${formData.section}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm flex items-center gap-2 border border-red-200 dark:border-red-800">
              <i className="ri-error-warning-line text-lg"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
              <i className="ri-checkbox-circle-line text-lg"></i>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                    {formData.full_name || 'N/A'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Email Address
                </label>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700 select-all">
                  {formData.email || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                    {formData.department || 'All'}
                  </p>
                )}
              </div>

              {formData.role === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Roll Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="roll_number"
                        value={formData.roll_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                        {formData.roll_number || 'N/A'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Section
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                        {formData.section || 'N/A'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Designation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Professor, HoD"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                        {formData.designation || 'Faculty Member'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Education
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Ph.D., M.Tech"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                        {formData.education || 'N/A'}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1 234 567 890"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                    {formData.phone_number || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 py-2 border-b border-gray-100 dark:border-gray-700">
                    {formData.dob || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                  >
                    {loading && <i className="ri-loader-4-line animate-spin"></i>}
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all"
                  >
                    <i className="ri-edit-line"></i>
                    <span>Edit Profile</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
