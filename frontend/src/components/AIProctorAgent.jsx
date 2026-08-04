import React, { useEffect, useRef, useState } from 'react';

export default function AIProctorAgent({ videoRef, isHostOrAdmin, onViolation, isActive }) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [audioListening, setAudioListening] = useState(false);
  
  const faceCheckInterval = useRef(null);
  const missingFaceCounter = useRef(0);
  
  const speechRecognition = useRef(null);
  
  // 1. Load face-api.js models from CDN
  useEffect(() => {
    if (isHostOrAdmin || !isActive) return;

    const loadModels = async () => {
      try {
        if (!window.faceapi) {
          console.warn("faceapi not found on window object.");
          return;
        }
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("AI Proctor: Face models loaded successfully.");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
      }
    };
    
    loadModels();
  }, [isHostOrAdmin, isActive]);

  // 2. Start Video Analysis Loop
  useEffect(() => {
    if (!modelsLoaded || isHostOrAdmin || !isActive || !videoRef?.current) return;

    const analyzeVideo = async () => {
      if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState !== 4) return;

      try {
        const detections = await window.faceapi.detectAllFaces(
          videoRef.current, 
          new window.faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
        );

        if (detections.length === 0) {
          missingFaceCounter.current += 1;
          // If face is missing for roughly 4 intervals (e.g. ~8 seconds)
          if (missingFaceCounter.current >= 4) {
            onViolation('beep', 'No face detected in frame. Please look at the camera.');
            missingFaceCounter.current = 0; // Reset after violation
          }
        } else {
          // Face detected, reset counter
          missingFaceCounter.current = 0;
          
          if (detections.length > 1) {
             onViolation('warning', 'Multiple faces detected. Please ensure you are alone.');
          }
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    };

    // Run every 2 seconds
    faceCheckInterval.current = setInterval(analyzeVideo, 2000);

    return () => {
      if (faceCheckInterval.current) clearInterval(faceCheckInterval.current);
    };
  }, [modelsLoaded, isHostOrAdmin, isActive, videoRef, onViolation]);

  // 3. Audio Monitoring (Speech Recognition for Profanity/Abuse)
  useEffect(() => {
    if (isHostOrAdmin || !isActive) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    speechRecognition.current = new SpeechRec();
    speechRecognition.current.continuous = true;
    speechRecognition.current.interimResults = false;
    speechRecognition.current.lang = 'en-US';

    speechRecognition.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('').toLowerCase();
        
      const bannedWords = ['abuse', 'cheat', 'stupid', 'idiot', 'spam', 'hack', 'fuck', 'shit'];
      
      const hasAbuse = bannedWords.some(w => transcript.includes(w));
      if (hasAbuse) {
        onViolation('audio_abuse', 'Inappropriate or abusive language detected via microphone.');
      }
    };

    speechRecognition.current.onstart = () => setAudioListening(true);
    speechRecognition.current.onerror = (e) => {
      console.log("Speech recognition error/stopped:", e.error);
      setAudioListening(false);
    };
    speechRecognition.current.onend = () => {
      // Auto-restart if still active
      if (isActive && !isHostOrAdmin) {
        try { speechRecognition.current.start(); } catch(e){}
      }
    };

    try {
      speechRecognition.current.start();
    } catch (e) {
      console.warn("Could not start speech recognition automatically:", e);
    }

    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
    };
  }, [isHostOrAdmin, isActive, onViolation]);

  if (isHostOrAdmin || !isActive) return null;

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
      <div className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm border ${modelsLoaded ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
        <span className={`h-2 w-2 rounded-full ${modelsLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></span>
        {modelsLoaded ? 'Face AI Active' : 'Loading Face AI...'}
      </div>
      {audioListening && (
        <div className="px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Audio AI Monitor
        </div>
      )}
    </div>
  );
}
