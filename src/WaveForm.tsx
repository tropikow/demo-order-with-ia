import React from 'react';
import './Waveform.css';

interface WaveformProps {
  inVoice: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ inVoice }) => {
  return (
    <div className={`waveform ${inVoice ? 'active' : ''}`}>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
    </div>
  );
};

export default Waveform;