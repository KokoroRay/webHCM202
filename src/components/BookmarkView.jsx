import React from 'react';
import { Bookmark, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';

export default function BookmarkView({
  allQuestions,
  bookmarks,
  onToggleBookmark,
  onClearAllBookmarks,
  onBack
}) {
  const bookmarkedQuestions = allQuestions.filter((q) => bookmarks.includes(q.id));
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h1 className="font-bold text-slate-900 text-lg sm:text-xl">
            Câu Hỏi Đã Lưu ({bookmarkedQuestions.length})
          </h1>
        </div>

        {bookmarkedQuestions.length > 0 && (
          <button
            onClick={onClearAllBookmarks}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 p-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa tất cả</span>
          </button>
        )}
      </div>

      {/* Bookmarked Questions List */}
      {bookmarkedQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Chưa có câu hỏi nào được lưu</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Trong quá trình làm bài, hãy bấm biểu tượng biểu tượng Đánh dấu để lưu lại các câu quan trọng cần ôn luyện thêm.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                  Câu #{q.id} (Tr. {q.page})
                </span>
                <button
                  onClick={() => onToggleBookmark(q.id)}
                  className="p-1 text-amber-500 hover:text-red-600 transition cursor-pointer"
                  title="Xóa khỏi câu đã lưu"
                >
                  <Bookmark className="w-5 h-5 fill-amber-500" />
                </button>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-relaxed mb-4">
                {q.question}
              </h3>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border text-sm flex items-start gap-3 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="shrink-0 font-bold text-xs w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center">
                        {optionLetters[optIdx]}
                      </span>
                      <span className="flex-1 pt-0.5">{opt}</span>
                      {isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {q.note && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  💡 <strong>Lưu ý:</strong> {q.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
