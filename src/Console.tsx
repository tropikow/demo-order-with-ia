import React, { useEffect, useState } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';

class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      const int16Data = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        int16Data[i] = Math.min(1, inputData[i]) * 0x7FFF;
      }
      this.port.postMessage(int16Data);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);


const client = new RealtimeClient({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowAPIKeyInBrowser: true,
});

async function initializeClient(setIsConnected: (status: boolean) => void) {
  try {
    console.log('Initializing client...');
    
    // Can set parameters ahead of connecting, either separately or all at once
    client.updateSession({ instructions: 'You are a great, upbeat friend.' });
    client.updateSession({ voice: 'alloy' });
    client.updateSession({
      turn_detection: { type: 'server_vad' }, // Corrected type
      input_audio_transcription: { model: 'whisper-1' },
    });

    // Set up event handling
    client.on('conversation.updated', (event: any) => {
      const { item, delta } = event;
      const items = client.conversation.getItems();
      console.log('Conversation updated:', { item, delta, items });
    });

    // Connect to Realtime API
    await client.connect();
    console.log('Connected to Realtime API');
    setIsConnected(true);
  } catch (error) {
    console.error('Error initializing client:', error);
  }
}

function sendMessage() {
  if (client.isConnected()) {
    client.sendUserMessageContent([{ type: 'input_text', text: `How are you?` }]);
    console.log('Sent user message');
  } else {
    console.error('Client is not connected');
  }
}

function sendEmptyAudio() {
  if (client.isConnected()) {
    const emptyAudio = new Int16Array(0);
    const emptyAudioString = btoa(String.fromCharCode(...new Uint8Array(emptyAudio.buffer)));
    client.sendUserMessageContent([{ type: 'input_audio', audio: emptyAudioString }]);
    console.log('Sent empty audio');
  } else {
    console.error('Client is not connected');
  }
}

function sendStreamingAudio() {
  if (client.isConnected()) {
    // Send user audio, must be Int16Array or ArrayBuffer
    // Default audio format is pcm16 with sample rate of 24,000 Hz
    // This populates 1s of noise in 0.1s chunks
    for (let i = 0; i < 10; i++) {
      const data = new Int16Array(2400);
      for (let n = 0; n < 2400; n++) {
        const value = Math.floor((Math.random() * 2 - 1) * 0x8000);
        data[n] = value;
      }
      client.appendInputAudio(data);
    }
    // Pending audio is committed and model is asked to generate
    client.createResponse();
    console.log('Sent streaming audio');
  } else {
    console.error('Client is not connected');
  }
}

function captureAudio() {
  if (client.isConnected()) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(2048, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const int16Data = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            int16Data[i] = Math.min(1, inputData[i]) * 0x7FFF;
          }
          client.appendInputAudio(int16Data);
        };

        // Stop capturing after 5 seconds
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          processor.disconnect();
          source.disconnect();
          client.createResponse();
          console.log('Stopped capturing audio and sent to API');
        }, 5000);
      })
      .catch(error => {
        console.error('Error capturing audio:', error);
      });
  } else {
    console.error('Client is not connected');
  }
}

function Console() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeClient(setIsConnected);
  }, []);

  return (
    <div>
      <h1>Console</h1>
      <button onClick={sendMessage} disabled={!isConnected}>Send Message</button>
      <button onClick={sendEmptyAudio} disabled={!isConnected}>Send Empty Audio</button>
      <button onClick={sendStreamingAudio} disabled={!isConnected}>Send Streaming Audio</button>
      <button onClick={captureAudio} disabled={!isConnected}>Capture Audio</button>
    </div>
  );
}

export default Console;