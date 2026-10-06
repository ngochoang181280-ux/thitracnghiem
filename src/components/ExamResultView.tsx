import React, { useState } from 'react';
import { 
  Trophy, CheckCircle, XCircle, Clock, AlertCircle, 
  RotateCcw, Sparkles, Printer, ChevronDown, ChevronUp,
  BookOpen, ShieldCheck, Share2, HelpCircle
} from 'lucide-react';
import { ExamAttempt, Question } from '../types/exam';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  onRetest: () => void;
  onHome: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  onRetest,
  onHome,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<number, boolean>>({});

  const isPassed = attempt.score >= 5.0;

  // Request free Google AI explanation from backend
  const handleRequestAiExplanation = async (qIndex: number, question: Question) => {
    if (aiExplanations[qIndex]) {
      // Toggle
      setExpandedIndex((prev) => (prev === qIndex ? null : qIndex));
      return;
    }

    setExpandedIndex(qIndex);
    setLoadingAi((prev) => ({ ...prev, [qIndex]: true }));

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          chosenAnswer: attempt.answers[qIndex] || 'Chưa trả lời',
          correctAnswer: question.correct,
          options: question.options,
          citation: question.citation,
        }),
      });

      const data = await res.json();
      setAiExplanations((prev) => ({
        ...prev,
        [qIndex]: data.explanation || 'Không có giải thích chi tiết.',
      }));
    } catch (err) {
      console.error('AI explanation failed', err);
      setAiExplanations((prev) => ({
        ...prev,
        [qIndex]: question.explanation || 'Đáp án chính xác dựa trên quy trình kỹ thuật an toàn ngành điện.',
      }));
    } finally {
      setLoadingAi((prev) => ({ ...prev, [qIndex]: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Top Summary Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                isPassed 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20' 
                  : 'bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-rose-500/20'
              }`}>
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                  {attempt.mode === 'official' ? 'Bài Thi Chính Thức' : 'Bài Thi Luyện Ôn Tập'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-100">
                  Kết Quả: {attempt.candidateName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {attempt.unitName} • Bậc {attempt.level} • Mã đề: <span className="text-slate-200 font-mono font-bold">{attempt.examCode}</span>
                </p>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl sm:text-5xl font-black ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {attempt.score}
                </span>
                <span className="text-lg font-bold text-slate-400">/ 10</span>
              </div>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                isPassed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {isPassed ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'} ({attempt.percent}%)
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 font-medium">Số câu đúng</span>
              <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-5 h-5" />
                <span>{attempt.correct}/{attempt.total}</span>
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 font-medium">Số câu sai</span>
              <p className="text-xl font-bold text-rose-400 mt-1 flex items-center justify-center gap-1.5">
                <XCircle className="w-5 h-5" />
                <span>{attempt.wrong}</span>
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 font-medium">Thời gian làm bài</span>
              <p className="text-xl font-bold text-cyan-300 mt-1 flex items-center justify-center gap-1.5">
                <Clock className="w-5 h-5" />
                <span>{Math.floor(attempt.elapsedSeconds / 60)}p {attempt.elapsedSeconds % 60}s</span>
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-400 font-medium">Rời màn hình</span>
              <p className="text-xl font-bold text-slate-300 mt-1 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>{attempt.focusViolations} lần</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800/80 mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={onHome}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors"
              >
                Về trang chủ
              </button>
              <button
                onClick={onRetest}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm đề khác</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In phiếu kết quả</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Chi Tiết Từng Câu Hỏi & Hỗ Trợ Google AI</span>
            </h2>
            <span className="text-xs text-slate-400">
              Nhấn "Giải thích bằng AI" để hiểu sâu bản chất câu hỏi
            </span>
          </div>

          {attempt.questions.map((q, idx) => {
            const userChoice = attempt.answers[idx] || '';
            const isCorrect = userChoice === q.correct;
            const isExpanded = expandedIndex === idx;
            const isLoading = loadingAi[idx];
            const aiText = aiExplanations[idx];

            return (
              <div
                key={q.id || idx}
                className={`bg-slate-900/80 border rounded-2xl p-4 sm:p-5 transition-all ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : userChoice
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : userChoice
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-100 leading-snug">
                        {q.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Nhóm: {q.section}
                        </span>
                        <span className="text-slate-400">
                          Bạn chọn:{' '}
                          <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                            {userChoice || 'Chưa trả lời'}
                          </strong>
                        </span>
                        {!isCorrect && (
                          <span className="text-slate-400">
                            Đáp án đúng:{' '}
                            <strong className="text-emerald-400 font-bold">{q.correct}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Explain Button */}
                  <button
                    onClick={() => handleRequestAiExplanation(idx, q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold shrink-0 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
                    <span className="hidden sm:inline">Giải thích AI</span>
                  </button>
                </div>

                {/* Options List Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  {Object.entries(q.options || {}).map(([key, optText]) => {
                    const isRightOption = q.correct.includes(key);
                    const isCandidateChoice = userChoice.includes(key);

                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border flex items-center gap-2 ${
                          isRightOption
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200 font-medium'
                            : isCandidateChoice
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="font-bold shrink-0">{key}.</span>
                        <span className="truncate">{optText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* AI / Regulatory Explanation Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Phân Tích Chuyên Môn Bằng Google AI</span>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                        <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                        <span>Đang kết nối Google AI để phân tích câu hỏi...</span>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 font-normal">
                        {aiText}
                      </div>
                    )}

                    {q.citation && (
                      <div className="mt-2.5 text-[11px] text-slate-400 italic">
                        📌 Căn cứ quy trình: {q.citation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
