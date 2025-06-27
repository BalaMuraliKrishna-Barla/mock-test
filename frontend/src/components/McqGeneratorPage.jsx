// /frontend/src/App.jsx
import React, { useState, useContext  } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; 

function App() {
  const [file, setFile] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const { user, logout } = useContext(AuthContext); 

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError('');
    setMcqs([]);
    setSelectedAnswers({});
  };

  const handleGenerateClick = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    setError('');
    setMcqs([]);
    setSelectedAnswers({});

    try {
      // Vite proxy will forward this request to http://localhost:5001/api/mcq/generate-mcq-from-file
      const response = await axios.post('http://127.0.0.1:5001/api/mcq/generate-mcq-from-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}` 
        },
      });
      setMcqs(response.data.mcqs || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';

      if (err.response?.status === 401) {
        logout(); // Log the user out if their token is invalid
      }

      setError(errorMessage);
      setMcqs([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptionClick = (questionIndex, selectedKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedKey
    }));
  };

  const getOptionClass = (mcq, optionKey, questionIndex) => {
    const selected = selectedAnswers[questionIndex];
    if (!selected) return 'option';
    if (optionKey === mcq.correct_option_key) return 'option correct';
    if (optionKey === selected) return 'option incorrect';
    return 'option';
  };

  return (
    <div className="container">
      {/* THIS IS THE CORRECTED HEADER SECTION */}
      <header>
        <div className="header-content">
          <h1>AutoMCQ 2.0 🤖</h1>
          <p>Welcome, {user.username}! Upload your material to generate a test.</p>
        </div>
        <button className="logout-button" onClick={logout}>Logout</button>
      </header>

      <main>
        <div className="upload-section">
          <input type="file" id="fileInput" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
          <button id="generateBtn" onClick={handleGenerateClick} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate MCQs'}
          </button>
        </div>

        {isLoading && <div className="loader"></div>}
        {error && <div className="error-message">{error}</div>}

        {mcqs.length > 0 && (
          <div className="results-container">
            <h2>Generated Questions</h2>
            <div id="mcq-list">
              {mcqs.map((mcq, index) => (
                <div key={index} className="mcq-item">
                  <div className="question">{`${index + 1}. ${mcq.question}`}</div>
                  <ul className="options">
                    {Object.entries(mcq.options).map(([key, value]) => (
                      <li
                        key={key}
                        className={getOptionClass(mcq, key, index)}
                        onClick={() => handleOptionClick(index, key)}
                      >
                        {`${key}. ${value}`}
                      </li>
                    ))}
                  </ul>
                  {selectedAnswers[index] && (
                     <div className="explanation">
                        <strong>Explanation:</strong> {mcq.explanation}
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;