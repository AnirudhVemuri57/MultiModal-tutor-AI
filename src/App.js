import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Upload from './components/Upload';
import Ask from './components/Ask';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            {!token ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/upload">TextMiner</Link></li>
                <li><Link to="/ask">QueryCraft</Link></li>
                <li><Link to="/quiz">Quizzy</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            )}
          </ul>
        </nav>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="/upload" element={<Upload token={token} />} />
          <Route path="/ask" element={<Ask token={token} />} />
          <Route path="/quiz" element={<Quiz token={token} />} />
          <Route path="/" element={<Login setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;