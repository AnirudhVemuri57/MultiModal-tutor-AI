import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function Quiz({ token }) {
  const [context, setContext] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (questions.length > 0 && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [questions, timeLeft, quizCompleted]);

  const handleStartQuiz = async () => {
    if (!context.trim()) {
      setError('Please enter a topic or content for the quiz');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ context }),
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
        setTimeLeft(data.time_per_question || 30);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setQuizCompleted(false);
        setScore(null);
        setResults([]);
        setError('');
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Start quiz failed: ${response.status} - ${data.error}`);
          setError(data.error || 'Failed to start quiz');
        }
      }
    } catch (err) {
      console.error(`Network error: ${err.message}`);
      setError(`Network error: ${err.message}`);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(30);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const answers = questions.map((q) => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id] || null,
      }));
      const response = await fetch('http://localhost:5000/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ context, answers }),
      });
      const data = await response.json();
      if (response.ok) {
        setScore(data.score);
        setResults(data.results);
        setQuizCompleted(true);
        setError('');
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          console.error(`Submit quiz failed: ${response.status} - ${data.error}`);
          setError(data.error || 'Failed to submit quiz');
        }
      }
    } catch (err) {
      console.error(`Network error: ${err.message}`);
      setError(`Network error: ${err.message}`);
    }
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz Time!</h2>
      {!questions.length && !quizCompleted && (
        <div className="quiz-input-section">
          <textarea
            className="quiz-textarea"
            placeholder="Enter a topic or content (e.g., 'Photosynthesis' or extracted text)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows="5"
          />
          <button onClick={handleStartQuiz} className="quiz-button quiz-start-button">
            Start Quiz
          </button>
        </div>
      )}
      {questions.length > 0 && !quizCompleted && (
        <div className="quiz-question-section">
          <div className="quiz-question-header">
            <h3 className="quiz-question-title">
              Question {currentQuestionIndex + 1} ({questions[currentQuestionIndex].level})
            </h3>
            <div className="quiz-timer" style={{ "--progress": `${(timeLeft / 30) * 100}%` }}>
              <span className="quiz-timer-text">{timeLeft}s</span>
            </div>
          </div>
          <p className="quiz-question-text">{questions[currentQuestionIndex].question}</p>
          <div className="quiz-options">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <div
                key={index}
                className={`quiz-option ${
                  selectedAnswers[questions[currentQuestionIndex].id] === option ? 'quiz-option-selected' : ''
                }`}
                onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, option)}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={selectedAnswers[questions[currentQuestionIndex].id] === option}
                  onChange={() => handleAnswerSelect(questions[currentQuestionIndex].id, option)}
                  className="quiz-radio"
                />
                <span className="quiz-option-text">{option}</span>
              </div>
            ))}
          </div>
          <button onClick={handleNextQuestion} className="quiz-button quiz-next-button">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
          </button>
        </div>
      )}
      {quizCompleted && (
        <div className="quiz-results-section">
          <h3 className="quiz-results-title">Quiz Results</h3>
          <p className="quiz-score">
            Your score: <span className="quiz-score-value">{score}</span> / {results.length}
          </p>
          <div className="quiz-results">
            {results.map((result, index) => (
              <div
                key={index}
                className={`quiz-result ${result.is_correct ? 'quiz-result-correct' : 'quiz-result-incorrect'}`}
              >
                <p className="quiz-result-title">
                  Question {result.question_id}: {result.is_correct ? 'Correct' : 'Incorrect'}
                </p>
                <p className="quiz-result-answer">Your answer: {result.selected_option || 'None'}</p>
                <p className="quiz-result-correct">Correct answer: {result.correct_answer}</p>
                <p className="quiz-result-explanation">Explanation: {result.explanation}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setQuestions([]);
              setQuizCompleted(false);
              setContext('');
            }}
            className="quiz-button quiz-new-quiz-button"
          >
            Start New Quiz
          </button>
        </div>
      )}
      {error && (
        <div className="quiz-error">
          <span className="quiz-error-text">{error}</span>
          <button onClick={() => setError('')} className="quiz-error-close">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;