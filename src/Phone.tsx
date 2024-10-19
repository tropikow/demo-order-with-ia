import React from 'react';
import WaveForm from './WaveForm';
import Console from './Console';
import './PhoneSimulator.css'

interface PhoneProps {
  inVoice: boolean;
}

const Phone: React.FC<PhoneProps> = ({inVoice}) => {
  return (
    <div className="container">
      <div className="phone">
      <div className="phone-header">
        <div className="camera"></div>
        <div className="speaker"></div>
      </div>
      <div className="phone-screen">
        <WaveForm inVoice={inVoice}/>        
      </div>
      <div className="phone-footer">
        <div className="home-button"></div>        
      </div>
    </div>
    </div>
  );
}

export default Phone;