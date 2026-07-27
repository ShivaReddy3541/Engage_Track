import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ meetDate, startTime, durationMins = 60 }) => {
  const [timeLeft, setTimeLeft] = useState({ status: 'calculating' });

  useEffect(() => {
    const calculateTime = () => {
      if (!meetDate || !startTime) {
        setTimeLeft({ status: 'unknown' });
        return;
      }

      // Parse date and time safely
      const targetStr = `${meetDate}T${startTime.length === 5 ? startTime + ':00' : startTime}`;
      const targetTime = new Date(targetStr).getTime();
      const now = new Date().getTime();

      if (isNaN(targetTime)) {
        setTimeLeft({ status: 'unknown' });
        return;
      }

      const diff = targetTime - now;
      const durationMs = (durationMins || 60) * 60 * 1000;

      if (diff > 0) {
        // Upcoming
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          status: 'upcoming',
          days,
          hours,
          minutes,
          seconds
        });
      } else if (diff <= 0 && Math.abs(diff) <= durationMs) {
        // Live right now
        setTimeLeft({ status: 'live' });
      } else {
        // Session ended
        setTimeLeft({ status: 'ended' });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [meetDate, startTime, durationMins]);

  if (timeLeft.status === 'calculating' || timeLeft.status === 'unknown') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <i className="ri-time-line mr-1.5"></i> Scheduled
      </span>
    );
  }

  if (timeLeft.status === 'live') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        LIVE NOW
      </span>
    );
  }

  if (timeLeft.status === 'ended') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800/80 dark:text-gray-400 border border-gray-200/80 dark:border-gray-700/80">
        <i className="ri-checkbox-circle-line mr-1.5 text-gray-400"></i> Completed
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-md transition-all">
      <span className="font-mono tracking-wide">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default CountdownTimer;
