import './App.css';
import Phone from './Phone';

function App() {
  const inVoice = true;
  return (
    <div className="App">      
        <Phone inVoice={inVoice}/>      
    </div>
  );
}

export default App;
