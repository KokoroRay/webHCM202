import React from 'react';
import { BookOpen, Clock, Grid, RotateCcw, Bookmark, Sparkles, CheckCircle2, Trophy } from 'lucide-react';

export default function Header({ 
  mode, 
  currentIndex, 
  totalQuestions, 
  answers, 
  timerSeconds, 
  isTimerRunning, 
  onOpenGrid, 
  onResetTest, 
  onToggleBookmarks,
  bookmarkedCount,
  fontSize,
  setFontSize
}) {
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onResetTest}
              className="flex items-center gap-2 text-blue-700 font-bold text-lg sm:text-xl tracking-tight hover:opacity-85 transition cursor-pointer"
              title="Về trang chủ"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="block text-slate-900 font-extrabold text-base sm:text-lg">HCM202</span>
                <span className="text-xs text-blue-600 font-medium hidden sm:block">Tư Tưởng Hồ Chí Minh</span>
              </div>
            </button>

            {/* Mode Badge */}
            {mode && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                mode === 'practice' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {mode === 'practice' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Chế độ Luyện Đề
                  </>
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5 text-blue-600" />
                    Chế độ Thi Thử
                  </>
                )}
              </span>
            )}
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-4 text-sm">
            
            {/* Timer if in Exam mode */}
            {mode === 'exam' && timerSeconds !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-semibold text-sm ${
                timerSeconds < 300 
                  ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
            )}

            {/* Answered Progress */}
            {totalQuestions > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-100 rounded-lg text-blue-800 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Đã làm: <strong className="text-blue-900">{answeredCount}/{totalQuestions}</strong></span>
              </div>
            )}

            {/* Font size control */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button 
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded transition"
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize(Math.min(22, fontSize + 2))}
                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded transition"
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>

            {/* Bookmarks */}
            <button
              onClick={onToggleBookmarks}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer text-xs sm:text-sm"
              title="Danh sách câu đã đánh dấu"
            >
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span className="hidden sm:inline">Đã lưu</span>
              {bookmarkedCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Grid Map Button */}
            {totalQuestions > 0 && (
              <button
                onClick={onOpenGrid}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xs transition cursor-pointer text-xs sm:text-sm"
              >
                <Grid className="w-4 h-4" />
                <span>Danh sách câu</span>
              </button>
            )}

            {/* New Test Button */}
            <button
              onClick={onResetTest}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Tạo đề mới"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalQuestions > 0 && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
