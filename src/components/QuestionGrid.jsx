import React from 'react';
import { X, Bookmark, Send, CheckCircle2 } from 'lucide-react';

export default function QuestionGrid({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  questions,
  bookmarks,
  onJumpToQuestion,
  mode,
  onSubmitExam
}) {
  if (!isOpen) return null;

  const isPractice = mode === 'practice';
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Danh Sách Câu Hỏi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã trả lời: <strong className="text-blue-700">{answeredCount}/{totalQuestions}</strong> câu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-blue-700"></span>
            <span>Đã làm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300"></span>
            <span>Chưa làm</span>
          </div>
          {isPractice && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
                <span>Đúng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-600"></span>
                <span>Sai</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Đánh dấu</span>
          </div>
        </div>

        {/* Question Grid List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const q = questions[idx];
              const isCurrent = idx === currentIndex;
              const userAns = answers[idx];
              const userArr = Array.isArray(userAns) ? userAns : (userAns !== undefined && userAns !== null ? [userAns] : []);
              const isAnswered = userArr.length > 0;
              const isBookmarked = bookmarks.includes(q?.id);
              
              let btnClass = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50';

              if (isPractice && isAnswered) {
                const correctAnswers = Array.isArray(q?.correctAnswers) ? q.correctAnswers : [q?.correctAnswer];
                const isCorrect = userArr.length === correctAnswers.length && userArr.every((val) => correctAnswers.includes(val));
                btnClass = isCorrect
                  ? 'bg-emerald-600 border-emerald-700 text-white font-bold'
                  : 'bg-red-600 border-red-700 text-white font-bold';
              } else if (isAnswered) {
                btnClass = 'bg-blue-600 border-blue-700 text-white font-bold';
              }

              if (isCurrent) {
                btnClass += ' ring-2 ring-blue-500 ring-offset-2 scale-105 z-10';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onJumpToQuestion(idx);
                    onClose();
                  }}
                  className={`relative h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                >
                  {idx + 1}
                  {isBookmarked && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white flex items-center justify-center">
                      <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng
          </button>

          {mode === 'exam' && (
            <button
              onClick={() => {
                onClose();
                onSubmitExam();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Nộp Bài Thi</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
