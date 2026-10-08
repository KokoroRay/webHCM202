import React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Grid, Send, Sparkles, Award } from 'lucide-react';

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  mode,
  selectedAnswer,
  onSelectAnswer,
  onPrev,
  onNext,
  isBookmarked,
  onToggleBookmark,
  onOpenGrid,
  onSubmitExam,
  fontSize
}) {
  if (!question) return null;

  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isPractice = mode === 'practice';
  const isCorrect = isAnswered && selectedAnswer === question.correctAnswer;
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Question Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Card Header: Question Number & Page info */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg">
              Câu {questionIndex + 1} / {totalQuestions}
            </span>
            {question.original_num && (
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                [{question.original_num}] - Tr. {question.page}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(question.id)}
              className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi này'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu câu'}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-6 sm:p-8">
          <h2 
            className="font-bold text-slate-900 leading-relaxed tracking-normal"
            style={{ fontSize: `${fontSize}px` }}
          >
            {question.question}
          </h2>

          {/* Options List */}
          <div className="mt-6 space-y-3">
            {question.options.map((optText, optIdx) => {
              const isSelected = selectedAnswer === optIdx;
              const isRightAnswer = optIdx === question.correctAnswer;

              // Color styles calculation
              let btnStyle = 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white';
              let icon = null;

              if (isPractice && isAnswered) {
                if (isRightAnswer) {
                  btnStyle = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-semibold ring-2 ring-emerald-400/20';
                  badgeStyle = 'bg-emerald-600 text-white';
                  icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-auto" />;
                } else if (isSelected && !isRightAnswer) {
                  btnStyle = 'border-red-400 bg-red-50/80 text-red-900 font-semibold ring-2 ring-red-400/20';
                  badgeStyle = 'bg-red-600 text-white';
                  icon = <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-auto" />;
                } else {
                  btnStyle = 'border-slate-200 opacity-60 text-slate-600';
                  badgeStyle = 'bg-slate-100 text-slate-400';
                }
              } else if (!isPractice && isSelected) {
                btnStyle = 'border-blue-600 bg-blue-50 text-blue-950 font-semibold ring-2 ring-blue-500/20';
                badgeStyle = 'bg-blue-600 text-white';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => onSelectAnswer(questionIndex, optIdx)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-3.5 transition-all duration-200 group cursor-pointer ${btnStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}>
                    {optionLetters[optIdx] || optIdx + 1}
                  </span>
                  
                  <span 
                    className="flex-1 pt-0.5 leading-relaxed"
                    style={{ fontSize: `${fontSize - 1}px` }}
                  >
                    {optText}
                  </span>

                  {icon}
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback Box (Practice Mode Only) */}
          {isPractice && isAnswered && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="shrink-0 mt-0.5">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="text-sm">
                <div className="font-bold">
                  {isCorrect ? 'Chính xác! 🎉' : 'Chưa chính xác!'}
                </div>
                {!isCorrect && (
                  <div className="mt-1">
                    Đáp án đúng là: <strong className="text-emerald-700 font-bold">{optionLetters[question.correctAnswer]}. {question.options[question.correctAnswer]}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Control Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrev}
            disabled={questionIndex === 0}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              questionIndex === 0
                ? 'border-slate-200 text-slate-300 bg-slate-100 cursor-not-allowed'
                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {/* Center Info / Grid toggle / View Result */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGrid}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>

            {/* Always available Submit / View Result button */}
            <button
              type="button"
              onClick={onSubmitExam}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Hoàn thành bài và xem bảng điểm"
            >
              <Award className="w-4 h-4" />
              <span>{isPractice ? 'Xem Điểm' : 'Nộp Bài'}</span>
            </button>
          </div>

          {/* Next Button or Final Finish Button */}
          {isLastQuestion ? (
            <button
              type="button"
              onClick={onSubmitExam}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Xem Kết Quả</span>
              <Award className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>Câu tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
