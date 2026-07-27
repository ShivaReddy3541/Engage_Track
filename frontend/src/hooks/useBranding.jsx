import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BrandingContext = createContext(null);

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    institution_name: 'SSV University',
    logo_url: '/assets/ssv_logo.png',
    primary_color: '#1e3a8a',
    secondary_color: '#f59e0b',
    slogan: 'New-Gen Cognitive Proctoring & LMS'
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const response = await axios.get('/api/admin/branding');
      if (response && response.data) {
        setBranding(response.data);
        applyBrandingStyles(response.data);
      }
    } catch (err) {
      console.error('Failed to load branding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyBrandingStyles = (data) => {
    if (!data) return;
    if (data.institution_name) {
      document.title = `${data.institution_name} | EngageAI Portal`;
    }
    const root = document.documentElement;
    if (data.primary_color) {
      root.style.setProperty('--brand-600', data.primary_color);
      root.style.setProperty('--brand-500', `${data.primary_color}D9`); // 85% opacity
      root.style.setProperty('--brand-50', `${data.primary_color}0D`);  // 5% opacity
    }
  };

  const updateBranding = async (newData) => {
    try {
      const response = await axios.post('/api/admin/branding', newData);
      setBranding(newData);
      applyBrandingStyles(newData);
      return { success: true, message: response.data.message };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Failed to update branding settings.' 
      };
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, isLoading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
