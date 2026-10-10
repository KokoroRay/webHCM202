import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import supplementaryData from './data/supplementary_questions.json';
import combinedData from './data/combined_questions.json';

import Header from './components/Header';
import SetupModal from './components/SetupModal';
import QuestionCard from './components/QuestionCard';
import QuestionGrid from './components/QuestionGrid';
import ResultSummary from './components/ResultSummary';
import BookmarkView from './components/BookmarkView';
import HistoryAnalytics from './components/HistoryAnalytics';

export default function App() {
  // App views: 'setup' | 'quiz' | 'result' | 'bookmarks' | 'history'
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
  
  // LocalStorage state
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('hcm202_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [examHistory, setExamHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('hcm202_exam_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [questionStats, setQuestionStats] = useState(() => {
    try {
      const saved = localStorage.getItem('hcm202_question_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hcm202_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('hcm202_exam_history', JSON.stringify(examHistory));
    } catch (e) {
      console.error(e);
    }
  }, [examHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('hcm202_question_stats', JSON.stringify(questionStats));
    } catch (e) {
      console.error(e);
    }
  }, [questionStats]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (view === 'quiz' && isTimerRunning) {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
        if (config.mode === 'exam' && timerSeconds !== null) {
          setTimerSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              finishAndRecordTest(answers);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, isTimerRunning, config.mode, timerSeconds, answers]);

  // Start quiz handler
  const handleStartQuiz = (newConfig) => {
    setConfig(newConfig);

    let baseData = combinedData;
    if (newConfig.bank === 'original') {
      baseData = questionsData;
    } else if (newConfig.bank === 'supplementary') {
      baseData = supplementaryData;
    }

    let list = [...baseData];
    if (newConfig.rangeFilter !== 'all') {
      const [start, end] = newConfig.rangeFilter.split('-').map(Number);
      list = list.slice(start - 1, end);
    }

    if (newConfig.order === 'random') {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    const selectedList = list.slice(0, Math.min(newConfig.count, list.length));

    setActiveQuestions(selectedList);
    setCurrentIndex(0);
    setAnswers({});
    setTimeSpentSeconds(0);

    if (newConfig.mode === 'exam') {
      setTimerSeconds(selectedList.length * 60);
    } else {
      setTimerSeconds(null);
    }
    setIsTimerRunning(true);
    setView('quiz');
  };

  // Start custom practice with specific question IDs (e.g. Most Mistakes)
  const handleStartCustomPractice = (questionIds) => {
    const list = combinedData.filter((q) => questionIds.includes(q.id));
    if (list.length === 0) return;

    setConfig({
      mode: 'practice',
      order: 'random',
      count: list.length,
      rangeFilter: 'all'
    });

    setActiveQuestions(list);
    setCurrentIndex(0);
    setAnswers({});
    setTimeSpentSeconds(0);
    setTimerSeconds(null);
    setIsTimerRunning(true);
    setView('quiz');
  };

  // Answer selection handler
  const handleSelectAnswer = (qIndex, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIdx
    }));
  };

  // Finish test & Save History & Question Stats
  const finishAndRecordTest = (currentAnswers = answers) => {
    setIsTimerRunning(false);

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const newStats = { ...questionStats };

    activeQuestions.forEach((q, idx) => {
      const userAns = currentAnswers[idx];
      const qKey = `q_${q.id}`;
      if (!newStats[qKey]) {
        newStats[qKey] = { wrong: 0, correct: 0, total: 0 };
      }

      if (userAns === undefined || userAns === null) {
        skippedCount++;
      } else if (userAns === q.correctAnswer) {
        correctCount++;
        newStats[qKey].correct += 1;
        newStats[qKey].total += 1;
      } else {
        wrongCount++;
        newStats[qKey].wrong += 1;
        newStats[qKey].total += 1;
      }
    });

    const total = activeQuestions.length;
    const score10 = total > 0 ? parseFloat(((correctCount / total) * 10).toFixed(1)) : 0;
    const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const attempt = {
      id: `attempt-${Date.now()}`,
      date: new Date().toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
      mode: config.mode,
      score10,
      scorePercent,
      correctCount,
      wrongCount,
      skippedCount,
      totalQuestions: total,
      timeSpentSeconds
    };

    setExamHistory((prev) => [attempt, ...prev]);
    setQuestionStats(newStats);
    setView('result');
  };

  const handleSubmitExam = () => {
    const unansweredCount = activeQuestions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`)) {
        return;
      }
    }
    finishAndRecordTest();
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

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử và thống kê làm bài?')) {
      setExamHistory([]);
      setQuestionStats({});
    }
  };

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
        onOpenHistory={() => setView('history')}
        historyCount={examHistory.length}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Main View Area */}
      <main className="flex-1">
        
        {view === 'setup' && (
          <SetupModal
            totalOriginal={questionsData.length}
            totalSupplementary={supplementaryData.length}
            totalCombined={combinedData.length}
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
            onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
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
            onGoHome={() => setView('setup')}
            onOpenHistory={() => setView('history')}
          />
        )}

        {view === 'bookmarks' && (
          <BookmarkView
            allQuestions={combinedData}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onClearAllBookmarks={handleClearAllBookmarks}
            onBack={() => setView(activeQuestions.length > 0 ? 'quiz' : 'setup')}
          />
        )}

        {view === 'history' && (
          <HistoryAnalytics
            history={examHistory}
            questionStats={questionStats}
            allQuestions={combinedData}
            onClearHistory={handleClearHistory}
            onBack={() => setView(activeQuestions.length > 0 ? 'quiz' : 'setup')}
            onStartCustomPractice={handleStartCustomPractice}
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
