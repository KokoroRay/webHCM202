import React, { useState } from 'react';
import { History, TrendingUp, AlertTriangle, ArrowLeft, Trash2, Trophy, Clock, CheckCircle2, XCircle, Play, Sparkles, BarChart2 } from 'lucide-react';

export default function HistoryAnalytics({
  history,
  questionStats,
  allQuestions,
  onClearHistory,
  onBack,
  onStartCustomPractice
}) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'mistakes'

  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0 
    ? (history.reduce((acc, item) => acc + item.score10, 0) / totalAttempts).toFixed(1) 
    : 0;
  const highestScore = totalAttempts > 0 
    ? Math.max(...history.map((item) => item.score10)).toFixed(1) 
    : 0;
  const totalStudySeconds = history.reduce((acc, item) => acc + (item.timeSpentSeconds || 0), 0);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  // Calculate Most Frequently Incorrect Questions
  const mistakesList = Object.entries(questionStats)
    .map(([qIdStr, stat]) => {
      const qId = parseInt(qIdStr.replace('q_', ''));
      const qObj = allQuestions.find((q) => q.id === qId);
      const wrongCount = stat.wrong || 0;
      const totalTimes = stat.total || (stat.wrong + stat.correct) || 1;
      const wrongRate = Math.round((wrongCount / totalTimes) * 100);
      return {
        ...qObj,
        wrongCount,
        correctCount: stat.correct || 0,
        totalTimes,
        wrongRate
      };
    })
    .filter((q) => q.wrongCount > 0 && q.question)
    .sort((a, b) => b.wrongCount - a.wrongCount || b.wrongRate - a.wrongRate);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          <h1 className="font-extrabold text-slate-900 text-xl sm:text-2xl tracking-tight">
            Thống Kê & Lịch Sử Làm Bài
          </h1>
        </div>

        {totalAttempts > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 p-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 bg-slate-100/70 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Bài Kiểm Tra ({totalAttempts})</span>
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'mistakes'
              ? 'bg-white text-red-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Top Câu Hay Sai Nhất ({mistakesList.length})</span>
        </button>
      </div>

      {/* TAB 1: HISTORY & SCORE TRENDS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Summary Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
              <History className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-slate-900">{totalAttempts}</div>
              <div className="text-xs font-medium text-slate-500">Tổng số lần thi</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-emerald-700">{avgScore}</div>
              <div className="text-xs font-medium text-slate-500">Điểm trung bình</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-amber-600">{highestScore}</div>
              <div className="text-xs font-medium text-slate-500">Điểm cao nhất</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
              <Clock className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
              <div className="text-xl font-black text-indigo-900">{formatTime(totalStudySeconds)}</div>
              <div className="text-xs font-medium text-slate-500">Tổng thời gian ôn</div>
            </div>
          </div>

          {/* History List */}
          {totalAttempts === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base">Chưa có lịch sử làm bài</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Hãy bắt đầu hoàn thành các bài thi thử hoặc luyện đề để hệ thống tự động ghi nhận tiến độ học tập của bạn!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => {
                const prevItem = history[idx + 1];
                const diff = prevItem ? (item.score10 - prevItem.score10).toFixed(1) : null;

                return (
                  <div key={item.id || idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center shrink-0 border ${
                        item.score10 >= 8 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.score10 >= 5
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.score10}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase ${
                            item.mode === 'exam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.mode === 'exam' ? 'Thi thử' : 'Luyện đề'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                        </div>

                        <div className="text-sm font-bold text-slate-800 mt-1">
                          Đúng {item.correctCount}/{item.totalQuestions} câu ({item.scorePercent}%) • {Math.floor(item.timeSpentSeconds / 60)} phút {item.timeSpentSeconds % 60}s
                        </div>
                      </div>
                    </div>

                    {/* Comparison badge */}
                    {diff !== null && (
                      <div className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${
                        parseFloat(diff) > 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : parseFloat(diff) < 0
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {parseFloat(diff) > 0 ? `▲ +${diff} so với lần trước` : parseFloat(diff) < 0 ? `▼ ${diff} so với lần trước` : '='}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MOST FREQUENT MISTAKES */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          
          {/* Header Action: Practice incorrect questions */}
          {mistakesList.length > 0 && (
            <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  Luyện Tập Chuyên Sâu Các Câu Hay Sai
                </h3>
                <p className="text-xs text-red-100 mt-1">
                  Có {mistakesList.length} câu hỏi bạn từng trả lời sai. Hãy tạo bộ đề luyện riêng để khắc phục triệt để lỗ hổng kiến thức!
                </p>
              </div>

              <button
                onClick={() => onStartCustomPractice(mistakesList.map((q) => q.id))}
                className="px-5 py-3 bg-white text-red-700 hover:bg-slate-100 font-bold rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-red-700" />
                <span>Luyện Ngay ({mistakesList.length} câu)</span>
              </button>
            </div>
          )}

          {/* Mistakes Ranking List */}
          {mistakesList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Chưa ghi nhận câu hỏi bị sai!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Khi bạn làm bài thi hoặc luyện đề và chọn sai đáp án, hệ thống sẽ tự động tổng hợp câu hỏi đó vào danh sách này để giúp bạn ôn lại hiệu quả.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mistakesList.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  
                  {/* Question header stats */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        Câu #{q.id} (Tr. {q.page})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                        Sai {q.wrongCount} lần ({q.wrongRate}%)
                      </span>
                    </div>
                  </div>

                  {/* Question text */}
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed mb-3">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    {q.options.map((opt, optIdx) => {
                      const correctAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswer];
                      const isCorrect = correctAnswers.includes(optIdx);
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold shrink-0">{optionLetters[optIdx]}.</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
