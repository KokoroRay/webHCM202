import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, XCircle, HelpCircle, Clock, RotateCcw, Filter, Bookmark, Home, BarChart2, Check, Sparkles } from 'lucide-react';

export default function ResultSummary({
  questions,
  answers,
  timeSpentSeconds,
  mode,
  bookmarks,
  onToggleBookmark,
  onRestart,
  onGoHome,
  onOpenHistory
}) {
  const [filter, setFilter] = React.useState('all'); // 'all' | 'wrong' | 'correct' | 'bookmarked'

  const total = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach((q, idx) => {
    const userAns = answers[idx];
    if (userAns === undefined || userAns === null) {
      skippedCount++;
    } else if (userAns === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const score10 = total > 0 ? ((correctCount / total) * 10).toFixed(1) : '0.0';
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const wrongPercent = total > 0 ? Math.round((wrongCount / total) * 100) : 0;
  const skippedPercent = total > 0 ? Math.round((skippedCount / total) * 100) : 0;

  // Trigger confetti for good scores
  useEffect(() => {
    if (scorePercent >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [scorePercent]);

  const formatTime = (secs) => {
    if (!secs) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Grade badge & message
  let gradeBadge = { label: 'Xuất Sắc! 🎉', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (scorePercent < 50) {
    gradeBadge = { label: 'Cần Cố Gắng! 💪', color: 'bg-red-100 text-red-800 border-red-300' };
  } else if (scorePercent < 70) {
    gradeBadge = { label: 'Đạt Khá! 👍', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  } else if (scorePercent < 90) {
    gradeBadge = { label: 'Kết Quả Giỏi! ⭐', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  }

  // Filtered review items
  const filteredQuestions = questions.map((q, idx) => ({ ...q, userAns: answers[idx], originalIndex: idx }))
    .filter((q) => {
      if (filter === 'wrong') return q.userAns !== undefined && q.userAns !== q.correctAnswer;
      if (filter === 'correct') return q.userAns === q.correctAnswer;
      if (filter === 'bookmarked') return bookmarks.includes(q.id);
      return true;
    });

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Result Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>

        {/* Auto-saved badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold mb-4">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Đã tự động lưu kết quả vào Lịch sử!</span>
        </div>

        <div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mb-4 border border-blue-100 shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Kết Quả Làm Bài {mode === 'exam' ? 'Thi Thử' : 'Luyện Đề'}
        </h1>

        <div className={`mt-2 inline-block px-4 py-1.5 rounded-full border font-bold text-sm mb-6 ${gradeBadge.color}`}>
          {gradeBadge.label}
        </div>

        {/* Big Score Display */}
        <div className="flex justify-center items-baseline gap-2 mb-6">
          <span className="text-5xl sm:text-6xl font-black text-blue-700 tracking-tight">{score10}</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-400">/ 10 điểm</span>
          <span className="text-base font-semibold text-slate-500 ml-2">({scorePercent}%)</span>
        </div>

        {/* Accuracy Bar & Detailed Stats */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-emerald-700">Đúng: {correctCount} ({scorePercent}%)</span>
            <span className="text-red-600">Sai: {wrongCount} ({wrongPercent}%)</span>
            {skippedCount > 0 && <span className="text-slate-500">Bỏ qua: {skippedCount} ({skippedPercent}%)</span>}
          </div>
          
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
            <div style={{ width: `${scorePercent}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Đúng ${scorePercent}%`} />
            <div style={{ width: `${wrongPercent}%` }} className="bg-red-500 h-full transition-all duration-500" title={`Sai ${wrongPercent}%`} />
            <div style={{ width: `${skippedPercent}%` }} className="bg-slate-300 h-full transition-all duration-500" title={`Bỏ qua ${skippedPercent}%`} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-emerald-900">{correctCount}</div>
            <div className="text-xs font-medium text-emerald-700">Câu đúng</div>
          </div>

          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-900">{wrongCount}</div>
            <div className="text-xs font-medium text-red-700">Câu sai</div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
            <HelpCircle className="w-6 h-6 text-slate-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-slate-800">{skippedCount}</div>
            <div className="text-xs font-medium text-slate-600">Bỏ qua</div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-900">{formatTime(timeSpentSeconds)}</div>
            <div className="text-xs font-medium text-blue-700">Thời gian làm</div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={onGoHome}
            className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer text-sm"
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>Trang Chủ</span>
          </button>

          <button
            onClick={onRestart}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm Bài Đề Khác</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="px-5 py-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer text-sm"
          >
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Xem Lịch Sử</span>
          </button>
        </div>

      </div>

      {/* Review Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        
        {/* Review Header & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-lg">Danh Sách Chi Tiết Các Câu Đã Làm</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: `Tất cả (${total})` },
              { id: 'wrong', label: `Câu sai (${wrongCount})` },
              { id: 'correct', label: `Câu đúng (${correctCount})` },
              { id: 'bookmarked', label: `Đã lưu (${bookmarks.length})` },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filter === btn.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Review Questions List */}
        <div className="mt-6 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              Không có câu hỏi nào phù hợp với bộ lọc đã chọn.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isUserRight = q.userAns === q.correctAnswer;
              const isSkipped = q.userAns === undefined || q.userAns === null;
              const isBookmarked = bookmarks.includes(q.id);

              return (
                <div 
                  key={q.id}
                  className={`rounded-xl border p-4 sm:p-5 transition ${
                    isSkipped
                      ? 'border-slate-200 bg-slate-50'
                      : isUserRight
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  {/* Top Bar: Question index & status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-slate-800 text-white">
                        Câu {q.originalIndex + 1}
                      </span>
                      {isSkipped ? (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          Chưa trả lời (Bỏ qua)
                        </span>
                      ) : isUserRight ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Trả lời Đúng
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Trả lời Sai
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="text-slate-400 hover:text-amber-500 transition cursor-pointer p-1"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Question Text */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options List */}
                  <div className="mt-3 space-y-2 text-xs sm:text-sm">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectOpt = optIdx === q.correctAnswer;
                      const isUserOpt = optIdx === q.userAns;

                      let rowStyle = 'bg-white border-slate-200 text-slate-700';
                      if (isCorrectOpt) {
                        rowStyle = 'bg-emerald-100/90 border-emerald-300 text-emerald-950 font-bold';
                      } else if (isUserOpt && !isCorrectOpt) {
                        rowStyle = 'bg-red-100/90 border-red-300 text-red-950 font-bold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${rowStyle}`}
                        >
                          <span className="font-bold shrink-0">{optionLetters[optIdx]}.</span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectOpt && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shrink-0 shadow-xs">
                              ✓ Đáp án đúng
                            </span>
                          )}
                          {isUserOpt && !isCorrectOpt && (
                            <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-0.5 rounded shrink-0 shadow-xs">
                              ✗ Lựa chọn của bạn
                            </span>
                          )}
                          {isUserOpt && isCorrectOpt && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shrink-0 shadow-xs">
                              ✓ Lựa chọn chính xác
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.note && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                      💡 <strong>Lưu ý:</strong> {q.note}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
