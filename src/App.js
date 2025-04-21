import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_URL;

function Wrapper({ children }) {
  return <div className="app-wrapper">{children}</div>;
}

export default function QuizApp() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/category/`).then((res) => setCategories(res.data));
  }, [API_BASE]);

  const startQuiz = (id) => {
    setSelectedCategory(id);
    setAnswers({});
    setScore(0);
    setQuizSubmitted(false);
    setCurrentIndex(0);
    axios.get(`${API_BASE}/quiz/${id}`).then((res) => setQuestions(res.data));
  };

  const handleAnswer = (qId, opt) => {
    const updated = { ...answers, [qId]: opt };
    setAnswers(updated);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    } else {
      finishQuiz(updated);
    }
  };

  const finishQuiz = (finalAnswers) => {
    let cnt = 0;
    questions.forEach((q) => {
      const ua = finalAnswers[q.id];
      if (
        typeof ua === "string" &&
        typeof q.correct_option === "string" &&
        ua.trim() === q.correct_option.trim()
      )
        cnt++;
    });
    setScore(cnt);
    setQuizSubmitted(true);
  };

  const reset = () => {
    setSelectedCategory(null);
    setAnswers({});
    setScore(0);
    setQuizSubmitted(false);
  };

  if (!selectedCategory) {
    return (
      <Wrapper>
        <div className="glass-card hero-card">
          <h1 className="hero-title">🎯 Quiz Galaxy</h1>
          <p className="hero-sub">
            Выберите категорию и отправляйтесь в космическое путешествие знаний
          </p>
          <div className="categories-container">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="category-button"
                onClick={() => startQuiz(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </Wrapper>
    );
  }

  if (quizSubmitted) {
    return (
      <Wrapper>
        <div className="glass-card result-screen">
          <h1 className="main-title">📊 Ваш результат</h1>
          <p className="score-text">
            Вы набрали <span className="score-highlight">{score}/{questions.length}</span>
          </p>
          <div className="results-list">
            {questions.map((q, i) => {
              const ua = answers[q.id];
              return (
                <div key={i} className="glass-card question-result">
                  <h3 className="q-text">{q.text}</h3>
                  {q.options.map((opt, idx) => {
                    const isCorrect = opt.trim() === q.correct_option.trim();
                    const isWrong = ua === opt && !isCorrect;
                    const cls = isCorrect
                      ? "res-opt correct"
                      : isWrong
                      ? "res-opt wrong"
                      : "res-opt";
                    return (
                      <div key={idx} className={cls}>
                        {opt} {isCorrect ? "✅" : isWrong ? "❌" : ""}
                      </div>
                    );
                  })}
                  {!ua && <div className="missed">Пропущено</div>}
                </div>
              );
            })}
          </div>
          <button className="category-button reset" onClick={reset}>
            Пройти заново
          </button>
        </div>
      </Wrapper>
    );
  }

  if (questions.length === 0 || !questions[currentIndex]) {
    return (
      <Wrapper>
        <div className="glass-card">
          <h2 className="loading">Загрузка вопроса…</h2>
        </div>
      </Wrapper>
    );
  }

  const q = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Wrapper>
      <div className="glass-card quiz-card">
        <div className="header-quiz">
          <h1 className="main-title">
            🧠 Вопрос {currentIndex + 1} из {questions.length}
          </h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="question-block">
          <h2 className="q-text">{q.text}</h2>
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className="opt-button"
              onClick={() => handleAnswer(q.id, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
