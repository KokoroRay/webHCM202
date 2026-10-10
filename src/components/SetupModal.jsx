import React, { useState } from 'react';
import { Sparkles, Trophy, Shuffle, ListOrdered, CheckCircle, BookOpen, ArrowRight, Target, Database, PlusCircle, Layers } from 'lucide-react';

export default function SetupModal({ totalOriginal, totalSupplementary, totalCombined, onStartQuiz }) {
  const [bank, setBank] = useState('combined'); // 'original' | 'supplementary' | 'combined'
  const [mode, setMode] = useState('practice'); // 'practice' | 'exam'
  const [order, setOrder] = useState('default'); // 'default' | 'random'
  const [quantityType, setQuantityType] = useState('60'); // 'all' | '10' | '20' | '40' | '60' | '100' | 'custom'
  const [customQty, setCustomQty] = useState(30);
  const [rangeFilter, setRangeFilter] = useState('all');

  const getBankTotal = () => {
    if (bank === 'original') return totalOriginal;
    if (bank === 'supplementary') return totalSupplementary;
    return totalCombined;
  };

  const currentTotal = getBankTotal();

  const handleStart = () => {
    let count = currentTotal;
    if (quantityType === 'all') {
      count = currentTotal;
    } else if (quantityType === 'custom') {
      count = Math.min(Math.max(1, parseInt(customQty) || 10), currentTotal);
    } else {
      count = parseInt(quantityType);
    }

    onStartQuiz({
      bank,
      mode,
      order,
      count,
      rangeFilter
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 mb-4 transform hover:scale-105 transition duration-300">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ôn Thi Trắc Nghiệm HCM202
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-md mx-auto">
          Ngân hàng câu hỏi trắc nghiệm môn Tư Tưởng Hồ Chí Minh (<strong className="text-blue-700">{totalCombined} câu tổng hợp & bổ sung</strong>).
        </p>
      </div>

      {/* Main Options Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* 0. Select Question Bank */}
        <div>
          <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Chọn Bộ Ngân Hàng Câu Hỏi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button
              type="button"
              onClick={() => setBank('combined')}
              className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                bank === 'combined'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-950 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm">Toàn Bộ ({totalCombined})</span>
              </div>
              <p className="text-[11px] text-slate-500">Tất cả đề cương + câu hỏi bổ sung mới</p>
            </button>

            <button
              type="button"
              onClick={() => setBank('original')}
              className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                bank === 'original'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-950 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-sm">Đề Cương ({totalOriginal})</span>
              </div>
              <p className="text-[11px] text-slate-500">614 câu chuẩn từ Đề cương tổng hợp gốc</p>
            </button>

            <button
              type="button"
              onClick={() => setBank('supplementary')}
              className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer ${
                bank === 'supplementary'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-950 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm">Bổ Sung ({totalSupplementary})</span>
              </div>
              <p className="text-[11px] text-slate-500">Các câu hỏi mới đã lọc trùng lặp</p>
            </button>

          </div>
        </div>

        {/* 1. Select Mode */}
        <div>
          <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
            Chọn Chế Độ Học
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Practice Mode */}
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={`p-4 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                mode === 'practice'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {mode === 'practice' && (
                <CheckCircle className="w-5 h-5 text-blue-600 absolute top-3 right-3" />
              )}
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Chế Độ Luyện Đề</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Hiển thị đáp án đúng/sai ngay lập tức. Thích hợp vừa đọc vừa ghi nhớ kiến thức.
              </p>
            </button>

            {/* Exam Mode */}
            <button
              type="button"
              onClick={() => setMode('exam')}
              className={`p-4 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                mode === 'exam'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {mode === 'exam' && (
                <CheckCircle className="w-5 h-5 text-blue-600 absolute top-3 right-3" />
              )}
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Chế Độ Thi Thử</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tính thời gian đếm ngược, chỉ công bố đáp án và tổng điểm sau khi bấm nộp bài.
              </p>
            </button>
          </div>
        </div>

        {/* 2. Select Question Order */}
        <div>
          <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
            Thứ Tự Câu Hỏi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <button
              type="button"
              onClick={() => setOrder('default')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                order === 'default'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ListOrdered className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-bold">Mặc định (1 ➔ {currentTotal})</div>
                <div className="text-xs text-slate-500 font-normal">Theo thứ tự đề cương ôn tập</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrder('random')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                order === 'random'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Shuffle className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-bold">Tráo ngẫu nhiên (Random)</div>
                <div className="text-xs text-slate-500 font-normal">Xáo trộn thứ tự tất cả câu hỏi</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Select Quantity */}
        <div>
          <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
            Số Lượng Câu Hỏi
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { label: `Tất cả (${currentTotal})`, val: 'all' },
              { label: '20 câu', val: '20' },
              { label: '40 câu', val: '40' },
              { label: '60 câu (Chuẩn thi)', val: '60' },
              { label: '100 câu', val: '100' },
              { label: 'Tùy chọn...', val: 'custom' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setQuantityType(item.val)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  quantityType === item.val
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {quantityType === 'custom' && (
            <div className="mt-3 flex items-center gap-3 max-w-xs">
              <span className="text-xs text-slate-600 font-medium">Nhập số câu:</span>
              <input
                type="number"
                min="1"
                max={currentTotal}
                value={customQty}
                onChange={(e) => setCustomQty(e.target.value)}
                className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <span className="text-xs text-slate-500">(1 - {currentTotal})</span>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99] transition duration-200 cursor-pointer"
          >
            <span>Bắt Đầu Làm Bài</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
