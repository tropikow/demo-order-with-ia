import { RealtimeClient } from '@openai/realtime-api-beta';

export default async function Console() {
  const client = new RealtimeClient({ 
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowAPIKeyInBrowser: true,  
  });
    
  client.updateSession({ instructions: 'You are a great, upbeat friend.' });
  client.updateSession({ voice: 'alloy' });
  client.updateSession({
    turn_detection: { type: 'server_vad' }, // or 'server_vad'
    input_audio_transcription: { model: 'whisper-1' },
  });
    
    // Set up event handling
  client.on('conversation.updated', (event:any) => {
    const { item, delta } = event;
    const items = client.conversation.getItems();
    /**
      * item is the current item being updated
      * delta can be null or populated
      * you can fetch a full list of items at any time
    */
  });
    
    // Connect to Realtime API
  await client.connect();
    
    // Send a item and triggers a generation
  client.sendUserMessageContent([{ type: 'input_text', text: `How are you?` }]);
}