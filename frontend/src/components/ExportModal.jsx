import React, { useState } from 'react';
import axios from 'axios';
import { FaFileExport, FaTimes, FaSpinner } from 'react-icons/fa';

const ExportModal = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        '/api/admin/export',
        { prompt },
        { responseType: 'blob' } // Important for file download
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('link');
      link.href = url;
      
      // Extract filename from header if possible
      let filename = 'export_file';
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      if (!filename.includes('.')) {
         filename += prompt.toLowerCase().includes('pdf') ? '.pdf' : '.xlsx';
      }
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      onClose(); // Close modal on success
    } catch (err) {
      console.error(err);
      setError("Failed to generate export. Please check your prompt and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-slate-800 text-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative border border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaFileExport className="text-blue-400" />
          AI Data Export
        </h2>
        
        <p className="text-slate-300 mb-4 text-sm">
          Enter a prompt to generate an Excel or PDF report. 
          <br/>
          <span className="text-slate-400 italic">Example: "generate the excel sheet for the students in cse"</span>
        </p>

        <textarea
          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mb-2 resize-none"
          rows={3}
          placeholder="Type your export prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white mr-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFileExport />}
            Generate & Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
