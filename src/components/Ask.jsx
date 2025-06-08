import React, { useState } from 'react';

function Ask({ token }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (response.ok) {
        setAnswer(data.answer);
        setError('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to process question');
    }
  };

  return (
    <div className="form-container">
      <h2>Ask a Study Question</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your study question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit">Ask</button>
      </form>
      {error && <p className="error">{error}</p>}
      {answer && (
        <div>
          <h3>Answer</h3>
          <p className="ask-text-glow">{answer}</p> {/* Apply the class here */}
        </div>
      )}
    </div>
  );
}
  export default Ask;