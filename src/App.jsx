import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';

import Header from './components/Header';
import SetupModal from './components/SetupModal';
import QuestionCard from './components/QuestionCard';
import QuestionGrid from './components/QuestionGrid';
import ResultSummary from './components/ResultSummary';
import BookmarkView from './components/BookmarkView';

export default function App() {
  // App views: 'setup' | 'quiz' | 'result' | 'bookmarks'
  const [view, setView] = useState('setup');
  
  // Config state
  const [config, setConfig] = useState({
    mode: 'practice', // 'practice' | 'exam'
    order: 'default', // 'default' | 'random'
    count: 60,
    rangeFilter: 'all'
  });

  // Quiz active state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIdx]: optionIdx }
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Timer state (Exam mode)
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // UI preferences & bookmarks
  const [fontSize, setFontSize] = useState(16);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('hcm202_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hcm202_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [bookmarks]);

  // Timer interval for Exam mode
  useEffect(() => {
    let interval = null;
    if (view === 'quiz' && isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
        if (config.mode === 'exam' && timerSeconds !== null) {
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleSubmitExam(); // Auto submit on timer timeout
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, isTimerRunning, config.mode, timerSeconds]);

  // Start quiz handler
  const handleStartQuiz = (newConfig) => {
    setConfig(newConfig);

    // 1. Filter by range if selected
    let list = [...questionsData];
    if (newConfig.rangeFilter !== 'all') {
      const [start, end] = newConfig.rangeFilter.split('-').map(Number);
      list = list.slice(start - 1, end);
    }

    // 2. Order: Default vs Random
    if (newConfig.order === 'random') {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    // 3. Count
    const selectedList = list.slice(0, Math.min(newConfig.count, list.length));

    setActiveQuestions(selectedList);
    setCurrentIndex(0);
    setAnswers({});
    setTimeSpentSeconds(0);

    if (newConfig.mode === 'exam') {
      // 1 minute per question for Exam mode timer
      setTimerSeconds(selectedList.length * 60);
      setIsTimerRunning(true);
    } else {
      setTimerSeconds(null);
      setIsTimerRunning(true);
    }

    setView('quiz');
  };

  // Answer selection handler
  const handleSelectAnswer = (qIndex, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIdx
    }));
  };

  // Navigation handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Toggle bookmark handler
  const handleToggleBookmark = (questionId) => {
    setBookmarks((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleClearAllBookmarks = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả câu hỏi đã lưu?')) {
      setBookmarks([]);
    }
  };

  // Submit Exam handler
  const handleSubmitExam = () => {
    const unansweredCount = activeQuestions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
        return;
      }
    }
    setIsTimerRunning(false);
    setView('result');
  };

  // Reset to setup screen
  const handleResetTest = () => {
    if (view === 'quiz') {
      if (!window.confirm('Bạn có muốn hủy bài làm hiện tại để quay về trang tạo đề?')) {
        return;
      }
    }
    setIsTimerRunning(false);
    setView('setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Header */}
      <Header
        mode={view === 'quiz' || view === 'result' ? config.mode : null}
        currentIndex={currentIndex}
        totalQuestions={activeQuestions.length}
        answers={answers}
        timerSeconds={timerSeconds}
        isTimerRunning={isTimerRunning}
        onOpenGrid={() => setIsGridOpen(true)}
        onResetTest={handleResetTest}
        onToggleBookmarks={() => setView('bookmarks')}
        bookmarkedCount={bookmarks.length}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Main View Area */}
      <main className="flex-1">
        
        {view === 'setup' && (
          <SetupModal
            totalQuestionsInBank={questionsData.length}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {view === 'quiz' && (
          <QuestionCard
            question={activeQuestions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={activeQuestions.length}
            mode={config.mode}
            selectedAnswer={answers[currentIndex]}
            onSelectAnswer={handleSelectAnswer}
            onPrev={handlePrev}
            onNext={handleNext}
            isBookmarked={bookmarks.includes(activeQuestions[currentIndex]?.id)}
            onToggleBookmark={handleToggleBookmark}
            onOpenGrid={() => setIsGridOpen(true)}
            onSubmitExam={handleSubmitExam}
            fontSize={fontSize}
          />
        )}

        {view === 'result' && (
          <ResultSummary
            questions={activeQuestions}
            answers={answers}
            timeSpentSeconds={timeSpentSeconds}
            mode={config.mode}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onRestart={() => setView('setup')}
          />
        )}

        {view === 'bookmarks' && (
          <BookmarkView
            allQuestions={questionsData}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onClearAllBookmarks={handleClearAllBookmarks}
            onBack={() => setView(activeQuestions.length > 0 ? 'quiz' : 'setup')}
          />
        )}

      </main>

      {/* Question Map Modal */}
      <QuestionGrid
        isOpen={isGridOpen}
        onClose={() => setIsGridOpen(false)}
        totalQuestions={activeQuestions.length}
        currentIndex={currentIndex}
        answers={answers}
        questions={activeQuestions}
        bookmarks={bookmarks}
        onJumpToQuestion={(idx) => setCurrentIndex(idx)}
        mode={config.mode}
        onSubmitExam={handleSubmitExam}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 bg-white">
        Ôn thi Tư Tưởng Hồ Chí Minh (HCM202) • Antigravity AI Powered • Visual Theme Blue + White
      </footer>

    </div>
  );
}
