import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Unlock, Key, Users, BookOpen, Settings, Plus, Search, 
  Trash2, Edit3, Sparkles, CheckCircle2, ShieldAlert, ArrowLeft,
  Download, Printer, RefreshCw, Layers, Sliders, Eye, Camera, FileText,
  Copy, QrCode, ExternalLink, Share2, Info, X, FileCode, Check,
  AlertTriangle, AlertCircle, Minus, CheckSquare, BarChart3, Shuffle
} from 'lucide-react';
import { ExamRoom, Candidate, Question, DepartmentInfo, GroupQuestionCounts } from '../types/exam';
import { GROUP_DEFINITIONS, getQuestionGroupKey } from '../data/mockData';
import { WordImportModal } from './WordImportModal';
import { AiCameraDocumentModal } from './AiCameraDocumentModal';

interface AdminPortalProps {
  rooms: ExamRoom[];
  candidates: Candidate[];
  questions: Question[];
  departments: DepartmentInfo[];
  onUpdateRooms: (rooms: ExamRoom[]) => void;
  onUpdateCandidates: (candidates: Candidate[]) => void;
  onUpdateQuestions: (questions: Question[]) => void;
  onBackToHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  rooms,
  candidates,
  questions,
  departments,
  onUpdateRooms,
  onUpdateCandidates,
  onUpdateQuestions,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'candidates' | 'questions' | 'matrix' | 'ai_gen'>('rooms');
  
  // Room Creation state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomPin, setNewRoomPin] = useState('');
  const [newRoomUnit, setNewRoomUnit] = useState('A');
  const [newRoomLevel, setNewRoomLevel] = useState('5');
  const [newRoomTime, setNewRoomTime] = useState(60);
  const [newRoomTotalQ, setNewRoomTotalQ] = useState(50);
  const [newRoomLock, setNewRoomLock] = useState(true);

  // Room group question counts (AT, QT, NQ, TTD, AX)
  const [newRoomAtCount, setNewRoomAtCount] = useState(10);
  const [newRoomQtCount, setNewRoomQtCount] = useState(10);
  const [newRoomNqCount, setNewRoomNqCount] = useState(5);
  const [newRoomTtdCount, setNewRoomTtdCount] = useState(5);
  const [newRoomAxCount, setNewRoomAxCount] = useState(20);

  // Edit room state
  const [editingRoom, setEditingRoom] = useState<ExamRoom | null>(null);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);

  // Matrix Tab states
  const [selectedMatrixRoomId, setSelectedMatrixRoomId] = useState<string>(() => rooms[0]?.id || '');
  const [showPreviewExamModal, setShowPreviewExamModal] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);

  // System Matrix Settings
  const [matrixAtCount, setMatrixAtCount] = useState(10);
  const [matrixQtCount, setMatrixQtCount] = useState(10);
  const [matrixNqCount, setMatrixNqCount] = useState(5);
  const [matrixTtdCount, setMatrixTtdCount] = useState(5);
  const [matrixAxCount, setMatrixAxCount] = useState(20);

  // Available questions inventory count per group
  const availableCounts = useMemo(() => {
    const counts: Record<string, number> = { at: 0, qt: 0, nq: 0, ttd: 0, ax: 0 };
    questions.forEach((q) => {
      const k = getQuestionGroupKey(q);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [questions]);

  // Synchronize matrix tab with selected room
  useEffect(() => {
    const r = rooms.find((rm) => rm.id === selectedMatrixRoomId) || rooms[0];
    if (r) {
      const gc = r.groupCounts || {
        at: Math.round(r.totalQuestions * 0.2),
        qt: Math.round(r.totalQuestions * 0.2),
        nq: Math.round(r.totalQuestions * 0.1),
        ttd: Math.round(r.totalQuestions * 0.1),
        ax: Math.round(r.totalQuestions * 0.4),
      };
      setMatrixAtCount(gc.at ?? 10);
      setMatrixQtCount(gc.qt ?? 10);
      setMatrixNqCount(gc.nq ?? 5);
      setMatrixTtdCount(gc.ttd ?? 5);
      setMatrixAxCount(gc.ax ?? 20);
    }
  }, [selectedMatrixRoomId, rooms]);

  const applyMatrixPreset = (preset: 'spmo50' | 'at40' | 'ax50' | 'ttd45' | 'quick25' | 'even') => {
    if (preset === 'spmo50') {
      setMatrixAtCount(10);
      setMatrixQtCount(10);
      setMatrixNqCount(5);
      setMatrixTtdCount(5);
      setMatrixAxCount(20);
    } else if (preset === 'at40') {
      setMatrixAtCount(20);
      setMatrixQtCount(15);
      setMatrixNqCount(5);
      setMatrixTtdCount(0);
      setMatrixAxCount(0);
    } else if (preset === 'ax50') {
      setMatrixAtCount(5);
      setMatrixQtCount(5);
      setMatrixNqCount(5);
      setMatrixTtdCount(5);
      setMatrixAxCount(30);
    } else if (preset === 'ttd45') {
      setMatrixAtCount(10);
      setMatrixQtCount(10);
      setMatrixNqCount(5);
      setMatrixTtdCount(12);
      setMatrixAxCount(8);
    } else if (preset === 'quick25') {
      setMatrixAtCount(5);
      setMatrixQtCount(5);
      setMatrixNqCount(5);
      setMatrixTtdCount(2);
      setMatrixAxCount(8);
    } else if (preset === 'even') {
      setMatrixAtCount(8);
      setMatrixQtCount(8);
      setMatrixNqCount(8);
      setMatrixTtdCount(8);
      setMatrixAxCount(8);
    }
  };

  const handleSaveMatrixConfig = () => {
    const totalCalc = matrixAtCount + matrixQtCount + matrixNqCount + matrixTtdCount + matrixAxCount;
    const targetRoom = rooms.find((r) => r.id === selectedMatrixRoomId) || rooms[0];
    if (!targetRoom) return;

    const updated = rooms.map((r) => {
      if (r.id === targetRoom.id) {
        return {
          ...r,
          totalQuestions: totalCalc > 0 ? totalCalc : r.totalQuestions,
          groupCounts: {
            at: matrixAtCount,
            qt: matrixQtCount,
            nq: matrixNqCount,
            ttd: matrixTtdCount,
            ax: matrixAxCount,
          },
        };
      }
      return r;
    });

    onUpdateRooms(updated);
    setImportNotification(`Đã lưu ma trận thành công cho phòng [${targetRoom.roomCode}]: Tổng ${totalCalc} câu (${matrixAtCount} AT, ${matrixQtCount} QT, ${matrixNqCount} NQ, ${matrixTtdCount} TTD, ${matrixAxCount} AX)!`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  const handlePreviewExam = () => {
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
    const atPool = shuffle(questions.filter((q) => getQuestionGroupKey(q) === 'at')).slice(0, matrixAtCount);
    const qtPool = shuffle(questions.filter((q) => getQuestionGroupKey(q) === 'qt')).slice(0, matrixQtCount);
    const nqPool = shuffle(questions.filter((q) => getQuestionGroupKey(q) === 'nq')).slice(0, matrixNqCount);
    const ttdPool = shuffle(questions.filter((q) => getQuestionGroupKey(q) === 'ttd')).slice(0, matrixTtdCount);
    const axPool = shuffle(questions.filter((q) => getQuestionGroupKey(q) === 'ax')).slice(0, matrixAxCount);

    const generated = [...atPool, ...qtPool, ...nqPool, ...ttdPool, ...axPool];
    setPreviewQuestions(generated);
    setShowPreviewExamModal(true);
  };

  // Candidate Filter & Management
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [newCandName, setNewCandName] = useState('');
  const [newCandCode, setNewCandCode] = useState('');
  const [newCandUnit, setNewCandUnit] = useState('A');
  const [newCandLevel, setNewCandLevel] = useState('5');
  const [newCandRoom, setNewCandRoom] = useState(rooms[0]?.roomCode || 'SPM-2026');

  // Question Filter & Search
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSectionFilter, setQuestionSectionFilter] = useState('ALL');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrect, setNewQCorrect] = useState('A');
  const [newQSection, setNewQSection] = useState('AT');
  const [newQCitation, setNewQCitation] = useState('');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('Vận hành an toàn máy biến áp lực 110kV và rơ le bảo vệ');
  const [aiDept, setAiDept] = useState('Nhà máy điện');
  const [aiLevel, setAiLevel] = useState('5');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);

  // Modals for Word import and AI Camera/Document
  const [showWordImportModal, setShowWordImportModal] = useState(false);
  const [showAiCameraModal, setShowAiCameraModal] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const handleImportWordQuestions = (imported: Question[]) => {
    onUpdateQuestions([...imported, ...questions]);
    setImportNotification(`Đã nhập thành công ${imported.length} câu hỏi từ file Word vào ngân hàng!`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  const handleAddAiCameraQuestions = (imported: Question[]) => {
    onUpdateQuestions([...imported, ...questions]);
    setImportNotification(`Đã tạo và thêm thành công ${imported.length} câu hỏi bằng Google AI Vision!`);
    setTimeout(() => setImportNotification(null), 5000);
  };

  // QR Code & Room Link states
  const [qrModalRoom, setQrModalRoom] = useState<ExamRoom | null>(null);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);

  const handleCopyRoomLink = (room: ExamRoom) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room.roomCode)}`;
      navigator.clipboard.writeText(url);
      setCopiedRoomCode(room.roomCode);
      setTimeout(() => setCopiedRoomCode(null), 3000);
    }
  };

  const handleCopyGeneralLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}`;
      navigator.clipboard.writeText(url);
      setCopiedRoomCode('GENERAL');
      setTimeout(() => setCopiedRoomCode(null), 3000);
    }
  };

  // Google Apps Script Modal states
  const [showAppsScriptModal, setShowAppsScriptModal] = useState(false);
  const [appsScriptTab, setAppsScriptTab] = useState<'guide' | 'code_gs' | 'index_html'>('guide');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Helper to generate random PIN code
  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewRoomPin(pin);
  };

  // Helper to generate random Room Code
  const generateRandomRoomCode = () => {
    const letters = ['SPM', 'TEST', 'THI', 'NB'];
    const randLetter = letters[Math.floor(Math.random() * letters.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    setNewRoomCode(`${randLetter}-${randNum}`);
  };

  // Toggle Room Lock
  const toggleRoomLock = (roomId: string) => {
    const updated = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          isLocked: !r.isLocked,
          status: (!r.isLocked ? 'locked' : 'active') as 'locked' | 'active',
        };
      }
      return r;
    });
    onUpdateRooms(updated);
  };

  // Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomCode.trim()) return;

    const totalCalc = newRoomAtCount + newRoomQtCount + newRoomNqCount + newRoomTtdCount + newRoomAxCount;
    const newRoom: ExamRoom = {
      id: `room-${Date.now()}`,
      roomName: newRoomName.trim(),
      roomCode: newRoomCode.trim().toUpperCase(),
      accessPin: newRoomPin.trim(),
      isLocked: newRoomLock,
      unit: newRoomUnit,
      level: newRoomLevel,
      examTimeMinutes: Number(newRoomTime) || 60,
      totalQuestions: totalCalc > 0 ? totalCalc : (Number(newRoomTotalQ) || 50),
      groupCounts: {
        at: newRoomAtCount,
        qt: newRoomQtCount,
        nq: newRoomNqCount,
        ttd: newRoomTtdCount,
        ax: newRoomAxCount,
      },
      maxFocusViolations: 3,
      activeCandidatesCount: 0,
      status: newRoomLock ? 'locked' : 'active',
      createdAt: new Date().toISOString(),
    };

    onUpdateRooms([newRoom, ...rooms]);
    setShowCreateRoomModal(false);
    setNewRoomName('');
    setNewRoomCode('');
    setNewRoomPin('');
  };

  // Open Edit Room Modal
  const handleOpenEditRoom = (room: ExamRoom) => {
    setEditingRoom(room);
    setNewRoomName(room.roomName);
    setNewRoomCode(room.roomCode);
    setNewRoomPin(room.accessPin || '');
    setNewRoomUnit(room.unit || 'A');
    setNewRoomLevel(room.level || '5');
    setNewRoomTime(room.examTimeMinutes || 60);
    setNewRoomLock(room.isLocked);
    const gc = room.groupCounts || {
      at: Math.round(room.totalQuestions * 0.2),
      qt: Math.round(room.totalQuestions * 0.2),
      nq: Math.round(room.totalQuestions * 0.1),
      ttd: Math.round(room.totalQuestions * 0.1),
      ax: Math.round(room.totalQuestions * 0.4),
    };
    setNewRoomAtCount(gc.at);
    setNewRoomQtCount(gc.qt);
    setNewRoomNqCount(gc.nq);
    setNewRoomTtdCount(gc.ttd);
    setNewRoomAxCount(gc.ax);
    setNewRoomTotalQ(room.totalQuestions);
  };

  // Save Edited Room
  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !newRoomName.trim()) return;

    const totalCalc = newRoomAtCount + newRoomQtCount + newRoomNqCount + newRoomTtdCount + newRoomAxCount;
    const updated = rooms.map((r) => {
      if (r.id === editingRoom.id) {
        return {
          ...r,
          roomName: newRoomName.trim(),
          accessPin: newRoomPin.trim(),
          isLocked: newRoomLock,
          unit: newRoomUnit,
          level: newRoomLevel,
          examTimeMinutes: Number(newRoomTime) || 60,
          totalQuestions: totalCalc > 0 ? totalCalc : r.totalQuestions,
          groupCounts: {
            at: newRoomAtCount,
            qt: newRoomQtCount,
            nq: newRoomNqCount,
            ttd: newRoomTtdCount,
            ax: newRoomAxCount,
          },
          status: (newRoomLock ? 'locked' : 'active') as 'locked' | 'active',
        };
      }
      return r;
    });

    onUpdateRooms(updated);
    setEditingRoom(null);
    setImportNotification(`Đã cập nhật cấu hình phòng thi [${editingRoom.roomCode}] thành công!`);
    setTimeout(() => setImportNotification(null), 4000);
  };

  // Delete Room
  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Bạn có chắc muốn xóa phòng thi này?')) {
      onUpdateRooms(rooms.filter((r) => r.id !== roomId));
    }
  };

  // Add Candidate to roster
  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim()) return;

    const unitObj = departments.find((d) => d.code === newCandUnit);
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      fullName: newCandName.trim(),
      employeeCode: newCandCode.trim() || `NV-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: newCandUnit,
      unitName: unitObj ? unitObj.name : newCandUnit,
      level: newCandLevel,
      roomCode: newCandRoom,
      examCode: `${newCandUnit}${Math.floor(100 + Math.random() * 900)}`,
      status: 'not_started',
      focusViolations: 0,
    };

    onUpdateCandidates([newCand, ...candidates]);
    setShowAddCandidateModal(false);
    setNewCandName('');
    setNewCandCode('');
  };

  // Delete candidate
  const handleDeleteCandidate = (candId: string) => {
    if (confirm('Xóa thí sinh này khỏi danh sách?')) {
      onUpdateCandidates(candidates.filter((c) => c.id !== candId));
    }
  };

  // Add Question manually
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQOptA || !newQOptB) return;

    const newQ: Question = {
      id: `q-${Date.now()}`,
      question: newQText.trim(),
      options: {
        A: newQOptA.trim(),
        B: newQOptB.trim(),
        C: newQOptC.trim() || 'Phương án C',
        D: newQOptD.trim() || 'Phương án D',
      },
      correct: newQCorrect,
      section: newQSection,
      level: 'COMMON',
      citation: newQCitation.trim() || 'Quy chuẩn an toàn',
    };

    onUpdateQuestions([newQ, ...questions]);
    setShowAddQuestionModal(false);
    setNewQText('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQCitation('');
  };

  // Generate question using Google AI
  const handleGenerateQuestionByAI = async () => {
    setAiLoading(true);
    setAiGeneratedSuccess(false);

    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          department: aiDept,
          level: aiLevel,
        }),
      });

      const data = await res.json();
      if (data.question) {
        const generatedQ: Question = {
          id: `q-ai-${Date.now()}`,
          question: data.question.question,
          options: data.question.options,
          correct: data.question.correct,
          section: data.question.section || 'AT',
          level: `A${aiLevel}`,
          citation: data.question.citation,
          explanation: data.question.explanation,
        };

        onUpdateQuestions([generatedQ, ...questions]);
        setAiGeneratedSuccess(true);
      } else {
        alert('Không thể tạo câu hỏi: ' + (data.error || 'Lỗi không xác định'));
      }
    } catch (err: any) {
      alert('Lỗi gọi Google AI: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered Candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchName = c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.employeeCode && c.employeeCode.toLowerCase().includes(candidateSearch.toLowerCase()));
    const matchRoom = selectedRoomFilter === 'ALL' || c.roomCode === selectedRoomFilter;
    return matchName && matchRoom;
  });

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchText = q.question.toLowerCase().includes(questionSearch.toLowerCase());
    const matchSec = questionSectionFilter === 'ALL' || q.section === questionSectionFilter;
    return matchText && matchSec;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Quay về màn hình thí sinh"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-slate-100">Bảng Điều Khiển Quản Trị (Admin)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO V8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản lý mã khóa phòng thi • Danh sách thí sinh • Ngân hàng câu hỏi • Google AI
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'rooms'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Khóa Phòng Thi</span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'candidates'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Danh Sách Thí Sinh ({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'questions'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Ngân Hàng Đề ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'matrix'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Ma Trận Đề</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_gen')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'ai_gen'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/80 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Google AI</span>
          </button>

          <button
            onClick={() => setShowAppsScriptModal(true)}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all shadow-sm"
            title="Xem mã nguồn và hướng dẫn chạy trên Google Apps Script"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">📦 Apps Script</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        
        {/* TAB 1: PHÒNG THI & TẠO MÃ KHÓA PHÒNG */}
        {activeTab === 'rooms' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Key className="w-6 h-6 text-cyan-400" />
                  <span>Quản Lý Phòng Thi & Tạo Mã Khóa Bảo Mật</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Tạo mã PIN khóa phòng thi, bật/tắt quyền thí sinh tham gia và cấu hình thời gian thi.
                </p>
              </div>

              <button
                onClick={() => {
                  generateRandomPin();
                  generateRandomRoomCode();
                  setShowCreateRoomModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Phòng Thi Mới</span>
              </button>
            </div>

            {/* Instruction banner for links & candidate entry */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Info className="w-4 h-4" />
                    <span>Hướng Dẫn Link Đăng Nhập & Cách Thí Sinh Vào Thi</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    • <strong>Link chung cho thí sinh</strong>: Thí sinh mở link trên điện thoại hoặc máy tính, nhập Họ tên, chọn Phòng thi và nhập Mã khóa (PIN).<br />
                    • <strong>Link riêng từng phòng</strong>: Bấm <em>"Sao chép link gửi thí sinh"</em> tại mỗi phòng để gửi qua Zalo/Email. Thí sinh bấm vào là tự chọn đúng phòng thi!
                  </p>
                </div>

                <button
                  onClick={handleCopyGeneralLink}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shrink-0 active:scale-95 transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedRoomCode === 'GENERAL' ? '✓ Đã sao chép link chung!' : 'Sao chép link trang chủ'}</span>
                </button>
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map((room) => {
                const candidateCount = candidates.filter((c) => c.roomCode === room.roomCode).length;

                return (
                  <div
                    key={room.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                      room.isLocked
                        ? 'border-cyan-500/40 shadow-cyan-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-sm">
                          {room.roomCode}
                        </span>

                        {/* Lock / Unlock Toggle Button */}
                        <button
                          onClick={() => toggleRoomLock(room.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            room.isLocked
                              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                              : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                        >
                          {room.isLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>ĐANG KHÓA</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>MỞ TỰ DO</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h3 className="font-bold text-base text-slate-100 mb-1">
                        {room.roomName}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                        {room.description || 'Chưa có ghi chú phòng thi.'}
                      </p>

                      {/* Room Details */}
                      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Mã Khóa (PIN):</span>
                          <span className="font-mono font-bold text-amber-300 text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {room.accessPin || 'Không yêu cầu'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thời gian làm bài:</span>
                          <span className="font-semibold text-slate-200">{room.examTimeMinutes} phút</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quy mô đề thi:</span>
                          <span className="font-semibold text-slate-200">{room.totalQuestions} câu hỏi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Số thí sinh trong phòng:</span>
                          <span className="font-semibold text-cyan-400">{candidateCount} thí sinh</span>
                        </div>

                        {/* Breakdown of questions per group */}
                        <div className="pt-2 border-t border-slate-700/60 mt-1">
                          <div className="flex justify-between items-center text-[11px] mb-1.5">
                            <span className="text-slate-400 font-medium">Số câu trong mỗi nhóm:</span>
                            <span className="text-cyan-400 font-bold font-mono">{room.totalQuestions} câu</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono font-bold">
                            <div className="bg-slate-900/90 py-1 rounded border border-slate-700 text-cyan-300">
                              <span className="block text-[8px] text-slate-500 font-sans">AT</span>
                              {room.groupCounts?.at ?? 10}
                            </div>
                            <div className="bg-slate-900/90 py-1 rounded border border-slate-700 text-teal-300">
                              <span className="block text-[8px] text-slate-500 font-sans">QT</span>
                              {room.groupCounts?.qt ?? 10}
                            </div>
                            <div className="bg-slate-900/90 py-1 rounded border border-slate-700 text-amber-300">
                              <span className="block text-[8px] text-slate-500 font-sans">NQ</span>
                              {room.groupCounts?.nq ?? 5}
                            </div>
                            <div className="bg-slate-900/90 py-1 rounded border border-slate-700 text-indigo-300">
                              <span className="block text-[8px] text-slate-500 font-sans">TTD</span>
                              {room.groupCounts?.ttd ?? 5}
                            </div>
                            <div className="bg-slate-900/90 py-1 rounded border border-slate-700 text-purple-300">
                              <span className="block text-[8px] text-slate-500 font-sans">AX</span>
                              {room.groupCounts?.ax ?? 20}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Direct Link & QR share action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => handleCopyRoomLink(room)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
                          title="Sao chép link trực tiếp phòng thi này"
                        >
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{copiedRoomCode === room.roomCode ? '✓ Đã chép' : 'Sao chép link'}</span>
                        </button>

                        <button
                          onClick={() => setQrModalRoom(room)}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
                          title="Hiển thị mã QR quét bằng camera điện thoại"
                        >
                          <QrCode className="w-3.5 h-3.5 text-purple-400" />
                          <span>Mã QR</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => handleOpenEditRoom(room)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa ma trận</span>
                      </button>

                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa phòng</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DANH SÁCH THÍ SINH */}
        {activeTab === 'candidates' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <span>Danh Sách Thí Sinh & Giám Sát Trực Tiếp</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Theo dõi tiến độ làm bài, số lần vi phạm rời màn hình, điểm số và kết quả bài thi.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddCandidateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thí Sinh Mới</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã nhân viên..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">Lọc phòng:</span>
                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">Tất cả phòng thi</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.roomCode}>
                      {r.roomCode} - {r.roomName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Họ Và Tên</th>
                      <th className="py-3.5 px-4">Bộ Phận / Bậc</th>
                      <th className="py-3.5 px-4">Phòng Thi</th>
                      <th className="py-3.5 px-4">Trạng Thái</th>
                      <th className="py-3.5 px-4">Điểm / Tỷ Lệ</th>
                      <th className="py-3.5 px-4">Rời Màn Hình</th>
                      <th className="py-3.5 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Chưa có thí sinh nào khớp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-100">{cand.fullName}</span>
                            <span className="block text-[11px] text-slate-500 font-mono">
                              {cand.employeeCode || 'Không có mã'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-slate-200">{cand.unitName}</span>
                            <span className="block text-[11px] text-cyan-400 font-semibold">
                              Bậc {cand.level}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold text-xs border border-slate-700">
                              {cand.roomCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {cand.status === 'submitted' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Đã nộp bài
                              </span>
                            )}
                            {cand.status === 'testing' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse">
                                Đang thi
                              </span>
                            )}
                            {cand.status === 'not_started' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                Chưa vào thi
                              </span>
                            )}
                            {cand.status === 'violation' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                Vi phạm
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {cand.score !== undefined ? (
                              <span className="font-bold text-emerald-400 text-base">
                                {cand.score}/10
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-semibold ${cand.focusViolations > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                              {cand.focusViolations} lần
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCandidate(cand.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Xóa thí sinh"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NGÂN HÀNG CÂU HỎI */}
        {activeTab === 'questions' && (
          <div className="flex flex-col gap-6">
            {/* Success notification banner */}
            {importNotification && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{importNotification}</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  <span>Ngân Hàng Câu Hỏi Trắc Nghiệm ({questions.length} câu)</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Phân nhóm theo An toàn (AT), Quy trình (QT), Nội quy (NQ), Điều độ (TTD) và Chuyên môn bậc (AX).
                </p>
              </div>

              {/* Action Buttons for Word, AI Camera & Manual */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={() => setShowAiCameraModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition-all"
                  title="Chụp ảnh tài liệu/trang sách bằng máy ảnh để AI tự tạo câu hỏi"
                >
                  <Camera className="w-4 h-4" />
                  <span>📸 Máy Ảnh / Tài Liệu (AI)</span>
                </button>

                <button
                  onClick={() => setShowWordImportModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 active:scale-95 transition-all"
                  title="Nhập câu hỏi tự động từ file Word .docx"
                >
                  <FileText className="w-4 h-4" />
                  <span>📄 Nhập File Word (.docx)</span>
                </button>

                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thủ Công</span>
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nội dung câu hỏi..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Nhóm:</span>
                <select
                  value={questionSectionFilter}
                  onChange={(e) => setQuestionSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">Tất cả nhóm</option>
                  <option value="AT">Mức I - An toàn (AT)</option>
                  <option value="QT">Mức II - Quy trình (QT)</option>
                  <option value="NQ">Mức III - Nội quy (NQ)</option>
                  <option value="TTD">Mức IV - Điều độ (TTD)</option>
                </select>
              </div>
            </div>

            {/* Question List */}
            <div className="flex flex-col gap-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs shrink-0">
                        {q.section}
                      </span>
                      <h4 className="font-semibold text-sm sm:text-base text-slate-100">
                        {q.question}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Xóa câu hỏi này khỏi ngân hàng?')) {
                          onUpdateQuestions(questions.filter((item) => item.id !== q.id));
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    {Object.entries(q.options || {}).map(([key, optText]) => {
                      const isCorrect = q.correct.includes(key);
                      return (
                        <div
                          key={key}
                          className={`p-2 rounded-lg border ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="mr-1.5">{key}.</span>
                          <span>{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.citation && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Căn cứ: {q.citation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MA TRẬN ĐỀ THI & CHỌN SỐ CÂU TRONG MỖI NHÓM */}
        {activeTab === 'matrix' && (
          <div className="flex flex-col gap-6">
            {/* Success notification banner */}
            {importNotification && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{importNotification}</span>
              </div>
            )}

            {/* Header banner */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                  <Sliders className="w-6 h-6 text-cyan-400" />
                  <span>Ma Trận Đề Thi & Chọn Số Câu Trong Mỗi Nhóm</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Thiết lập chính xác số lượng câu hỏi cần bốc từ mỗi nhóm (AT, QT, NQ, TTD, AX) cho từng phòng thi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handlePreviewExam}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-md"
                  title="Bốc thử ngẫu nhiên một đề thi theo ma trận này để kiểm tra"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Bốc Thử Đề (Preview)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMatrixConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Ma Trận Phòng Thi</span>
                </button>
              </div>
            </div>

            {/* Room selection & Global stats */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Áp dụng cho phòng:</span>
                  <select
                    value={selectedMatrixRoomId}
                    onChange={(e) => setSelectedMatrixRoomId(e.target.value)}
                    className="flex-1 md:w-80 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.roomCode}] {r.roomName} ({r.totalQuestions} câu - {r.examTimeMinutes}p)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Cards */}
                <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto justify-between md:justify-end">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-400">Tổng số câu đề thi:</span>
                    <span className="font-mono font-black text-cyan-300 text-sm">
                      {matrixAtCount + matrixQtCount + matrixNqCount + matrixTtdCount + matrixAxCount} câu
                    </span>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-400">Có sẵn trong kho:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {questions.length} câu
                    </span>
                  </div>

                  {/* Stock validation badge */}
                  {(matrixAtCount > (availableCounts.at || 0) ||
                    matrixQtCount > (availableCounts.qt || 0) ||
                    matrixNqCount > (availableCounts.nq || 0) ||
                    matrixTtdCount > (availableCounts.ttd || 0) ||
                    matrixAxCount > (availableCounts.ax || 0)) ? (
                    <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Số câu chọn vượt quá số câu có sẵn trong kho!</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Kho đủ câu hỏi đáp ứng ma trận</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Click Matrix Presets */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mẫu Ma Trận Đề Chuẩn (1-Click Presets):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('spmo50')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                      Chuẩn SPMO 50c
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      10 AT • 10 QT • 5 NQ • 5 TTD • 20 AX
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('at40')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                      Sát Hạch An Toàn 40c
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      20 AT • 15 QT • 5 NQ (Chuyên AT)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('ax50')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-purple-300">
                      Chuyên Môn Sâu 50c
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      5 AT • 5 QT • 5 NQ • 5 TTD • 30 AX
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('ttd45')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-indigo-300">
                      Trưởng Ca / Điều Độ 45c
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      10 AT • 10 QT • 5 NQ • 12 TTD • 8 AX
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('quick25')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-teal-300">
                      Ôn Luyện Nhanh 25c
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      5 AT • 5 QT • 5 NQ • 2 TTD • 8 AX
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyMatrixPreset('even')}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all active:scale-95 group"
                  >
                    <span className="block font-bold text-xs text-slate-200 group-hover:text-amber-300">
                      Chia Đều Các Nhóm
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      8 câu mỗi nhóm (Đều nhau)
                    </span>
                  </button>
                </div>
              </div>

              {/* Segmented Percentage Progress Bar */}
              {(() => {
                const total = Math.max(1, matrixAtCount + matrixQtCount + matrixNqCount + matrixTtdCount + matrixAxCount);
                const pAt = ((matrixAtCount / total) * 100).toFixed(1);
                const pQt = ((matrixQtCount / total) * 100).toFixed(1);
                const pNq = ((matrixNqCount / total) * 100).toFixed(1);
                const pTtd = ((matrixTtdCount / total) * 100).toFixed(1);
                const pAx = ((matrixAxCount / total) * 100).toFixed(1);

                return (
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-medium">
                      <span>Tỷ lệ cơ cấu phân bổ đề thi (%):</span>
                      <span>100% (Tổng {total} câu)</span>
                    </div>

                    <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
                      {matrixAtCount > 0 && (
                        <div
                          style={{ width: `${pAt}%` }}
                          className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                          title={`AT: ${matrixAtCount} câu (${pAt}%)`}
                        />
                      )}
                      {matrixQtCount > 0 && (
                        <div
                          style={{ width: `${pQt}%` }}
                          className="bg-teal-400 h-full rounded-full transition-all duration-300"
                          title={`QT: ${matrixQtCount} câu (${pQt}%)`}
                        />
                      )}
                      {matrixNqCount > 0 && (
                        <div
                          style={{ width: `${pNq}%` }}
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          title={`NQ: ${matrixNqCount} câu (${pNq}%)`}
                        />
                      )}
                      {matrixTtdCount > 0 && (
                        <div
                          style={{ width: `${pTtd}%` }}
                          className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                          title={`TTD: ${matrixTtdCount} câu (${pTtd}%)`}
                        />
                      )}
                      {matrixAxCount > 0 && (
                        <div
                          style={{ width: `${pAx}%` }}
                          className="bg-purple-500 h-full rounded-full transition-all duration-300"
                          title={`AX: ${matrixAxCount} câu (${pAx}%)`}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                      <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                        AT: {matrixAtCount}c ({pAt}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                        QT: {matrixQtCount}c ({pQt}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        NQ: {matrixNqCount}c ({pNq}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                        TTD: {matrixTtdCount}c ({pTtd}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        AX: {matrixAxCount}c ({pAx}%)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Individual Group Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* GROUP 1: AT */}
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                      MỨC I: AN TOÀN (AT)
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      matrixAtCount > (availableCounts.at || 0)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Kho: {availableCounts.at || 0} câu
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    Kỹ Thuật An Toàn & Bảo Hộ Lao Động
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Quy chuẩn an toàn điện QCVN 01:2020/BCT, khoảng cách an toàn điện cao áp, tiếp đất di động, cấp cứu điện giật.
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Số câu bốc vào đề:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixAtCount(Math.max(0, matrixAtCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={availableCounts.at || 100}
                        value={matrixAtCount}
                        onChange={(e) => setMatrixAtCount(Math.max(0, Number(e.target.value)))}
                        className="w-16 py-1 text-center bg-slate-900 border border-cyan-500/50 rounded-lg text-cyan-300 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatrixAtCount(matrixAtCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(availableCounts.at || 15, 30)}
                    value={matrixAtCount}
                    onChange={(e) => setMatrixAtCount(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  {matrixAtCount > (availableCounts.at || 0) && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Vượt quá kho ({availableCounts.at || 0} câu). </span>
                      <button
                        type="button"
                        onClick={() => setMatrixAtCount(availableCounts.at || 0)}
                        className="underline font-bold hover:text-rose-300"
                      >
                        Đặt về {availableCounts.at || 0}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GROUP 2: QT */}
              <div className="bg-slate-900/90 border border-teal-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30">
                      MỨC II: QUY TRÌNH (QT)
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      matrixQtCount > (availableCounts.qt || 0)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Kho: {availableCounts.qt || 0} câu
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    Quy Trình Kỹ Thuật & Vận Hành Thiết Bị
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Phiếu công tác, phiếu thao tác, quy trình vận hành máy biến áp, máy cắt cao thế, nguồn tự dùng và ắc quy trạm.
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Số câu bốc vào đề:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixQtCount(Math.max(0, matrixQtCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={availableCounts.qt || 100}
                        value={matrixQtCount}
                        onChange={(e) => setMatrixQtCount(Math.max(0, Number(e.target.value)))}
                        className="w-16 py-1 text-center bg-slate-900 border border-teal-500/50 rounded-lg text-teal-300 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatrixQtCount(matrixQtCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(availableCounts.qt || 15, 30)}
                    value={matrixQtCount}
                    onChange={(e) => setMatrixQtCount(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />

                  {matrixQtCount > (availableCounts.qt || 0) && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Vượt quá kho ({availableCounts.qt || 0} câu). </span>
                      <button
                        type="button"
                        onClick={() => setMatrixQtCount(availableCounts.qt || 0)}
                        className="underline font-bold hover:text-rose-300"
                      >
                        Đặt về {availableCounts.qt || 0}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GROUP 3: NQ */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      MỨC III: NỘI QUY (NQ)
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      matrixNqCount > (availableCounts.nq || 0)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Kho: {availableCounts.nq || 0} câu
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    Nội Quy & Kỷ Luật Vận Hành
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Nội quy lao động ngành điện, văn hóa an toàn doanh nghiệp, chế độ giao nhận ca trực và quy định xử lý sự cố.
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Số câu bốc vào đề:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixNqCount(Math.max(0, matrixNqCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={availableCounts.nq || 100}
                        value={matrixNqCount}
                        onChange={(e) => setMatrixNqCount(Math.max(0, Number(e.target.value)))}
                        className="w-16 py-1 text-center bg-slate-900 border border-amber-500/50 rounded-lg text-amber-300 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatrixNqCount(matrixNqCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(availableCounts.nq || 10, 20)}
                    value={matrixNqCount}
                    onChange={(e) => setMatrixNqCount(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  {matrixNqCount > (availableCounts.nq || 0) && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Vượt quá kho ({availableCounts.nq || 0} câu). </span>
                      <button
                        type="button"
                        onClick={() => setMatrixNqCount(availableCounts.nq || 0)}
                        className="underline font-bold hover:text-rose-300"
                      >
                        Đặt về {availableCounts.nq || 0}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GROUP 4: TTD */}
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                      MỨC IV: ĐIỀU ĐỘ (TTD)
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      matrixTtdCount > (availableCounts.ttd || 0)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Kho: {availableCounts.ttd || 0} câu
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    Quy Trình Thao Tác Điều Độ
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Quy định đàm thoại mệnh lệnh điều độ, xử lý sự cố rã lưới khu vực, quyền hạn Trưởng ca và điều khiển điện áp.
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Số câu bốc vào đề:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixTtdCount(Math.max(0, matrixTtdCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={availableCounts.ttd || 100}
                        value={matrixTtdCount}
                        onChange={(e) => setMatrixTtdCount(Math.max(0, Number(e.target.value)))}
                        className="w-16 py-1 text-center bg-slate-900 border border-indigo-500/50 rounded-lg text-indigo-300 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatrixTtdCount(matrixTtdCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(availableCounts.ttd || 10, 20)}
                    value={matrixTtdCount}
                    onChange={(e) => setMatrixTtdCount(Number(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer"
                  />

                  {matrixTtdCount > (availableCounts.ttd || 0) && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Vượt quá kho ({availableCounts.ttd || 0} câu). </span>
                      <button
                        type="button"
                        onClick={() => setMatrixTtdCount(availableCounts.ttd || 0)}
                        className="underline font-bold hover:text-rose-300"
                      >
                        Đặt về {availableCounts.ttd || 0}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* GROUP 5: AX */}
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                      CHUYÊN MÔN (AX)
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      matrixAxCount > (availableCounts.ax || 0)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      Kho: {availableCounts.ax || 0} câu
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-1">
                    Chuyên Môn Bậc Thợ & Vị Trí Công Tác
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Kiến thức chuyên sâu theo bậc thợ (Bậc 2 - 8) và vị trí công tác (Nhà máy điện A, Cơ khí B, Điện D, Trưởng ca C).
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Số câu bốc vào đề:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMatrixAxCount(Math.max(0, matrixAxCount - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={availableCounts.ax || 100}
                        value={matrixAxCount}
                        onChange={(e) => setMatrixAxCount(Math.max(0, Number(e.target.value)))}
                        className="w-16 py-1 text-center bg-slate-900 border border-purple-500/50 rounded-lg text-purple-300 font-mono font-bold text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setMatrixAxCount(matrixAxCount + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={Math.max(availableCounts.ax || 25, 40)}
                    value={matrixAxCount}
                    onChange={(e) => setMatrixAxCount(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />

                  {matrixAxCount > (availableCounts.ax || 0) && (
                    <div className="text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Vượt quá kho ({availableCounts.ax || 0} câu). </span>
                      <button
                        type="button"
                        onClick={() => setMatrixAxCount(availableCounts.ax || 0)}
                        className="underline font-bold hover:text-rose-300"
                      >
                        Đặt về {availableCounts.ax || 0}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TRỢ LÝ GOOGLE AI */}
        {activeTab === 'ai_gen' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {/* Quick-action AI Cards for Camera and Word */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setShowAiCameraModal(true)}
                className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 hover:border-purple-400 cursor-pointer transition-all shadow-xl hover:shadow-purple-950/50 group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">
                  📸 Máy Ảnh & Quét Tài Liệu
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Chụp ảnh trang sách, đề thi in giấy bằng máy ảnh điện thoại/webcam để Google AI trích xuất câu hỏi tự động.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-purple-400 group-hover:underline">
                  Mở máy ảnh quét ngay →
                </span>
              </div>

              <div 
                onClick={() => setShowWordImportModal(true)}
                className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all shadow-xl hover:shadow-cyan-950/50 group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                  📄 Nhập File Word (.docx)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tải file ngân hàng câu hỏi định dạng Word, tự nhận diện A/B/C/D, in đậm đáp án và trích dẫn quy trình.
                </p>
                <span className="inline-block mt-3 text-xs font-bold text-cyan-400 group-hover:underline">
                  Tải lên file Word →
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-100">
                    Soạn Thảo Câu Hỏi Chuyên Môn Bằng Google AI
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-300">
                    Nhập chủ đề kỹ thuật để AI tự động soạn câu hỏi 4 phương án, đáp án và trích dẫn chuẩn xác.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Chủ đề câu hỏi hoặc tình huống vận hành:
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="VD: Sự cố chạm đất cuộn stator, Thao tác dao cách ly khi có điện thoại..."
                    className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Bộ phận áp dụng:
                    </label>
                    <select
                      value={aiDept}
                      onChange={(e) => setAiDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                    >
                      <option value="Nhà máy điện">A - Nhà máy điện</option>
                      <option value="XSC cơ">B - XSC cơ</option>
                      <option value="Trưởng ca">C - Trưởng ca vận hành</option>
                      <option value="XSC điện">D - XSC điện</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Bậc thi:
                    </label>
                    <select
                      value={aiLevel}
                      onChange={(e) => setAiLevel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-400"
                    >
                      <option value="2">Bậc 2</option>
                      <option value="3">Bậc 3</option>
                      <option value="4">Bậc 4</option>
                      <option value="5">Bậc 5</option>
                      <option value="6">Bậc 6</option>
                      <option value="7">Bậc 7</option>
                      <option value="8">Bậc 8</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuestionByAI}
                  disabled={aiLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Google AI Đang Soạn Câu Hỏi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Sinh Câu Hỏi Mới Và Lưu Vào Ngân Hàng</span>
                    </>
                  )}
                </button>

                {aiGeneratedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã tạo câu hỏi thành công và tự động thêm vào Ngân hàng đề thi!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Create Room */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateRoom} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Tạo Phòng Thi Mới & Mã Khóa</span>
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tên phòng thi:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thi Nâng Bậc Thợ Đợt 2"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mã phòng:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SPM-88"
                    value={newRoomCode}
                    onChange={(e) => setNewRoomCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-cyan-300 uppercase focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-medium">Mã Khóa (PIN):</label>
                    <button
                      type="button"
                      onClick={generateRandomPin}
                      className="text-cyan-400 text-[11px] hover:underline"
                    >
                      Sinh ngẫu nhiên
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="VD: 8899"
                    value={newRoomPin}
                    onChange={(e) => setNewRoomPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newRoomTime}
                    onChange={(e) => setNewRoomTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold text-xs">
                      Phân bổ số câu trong mỗi nhóm:
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      Tổng: {newRoomAtCount + newRoomQtCount + newRoomNqCount + newRoomTtdCount + newRoomAxCount} câu
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-cyan-400">AT</span>
                      <input
                        type="number"
                        min="0"
                        value={newRoomAtCount}
                        onChange={(e) => setNewRoomAtCount(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">Kho: {availableCounts.at || 0}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-teal-400">QT</span>
                      <input
                        type="number"
                        min="0"
                        value={newRoomQtCount}
                        onChange={(e) => setNewRoomQtCount(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">Kho: {availableCounts.qt || 0}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-amber-400">NQ</span>
                      <input
                        type="number"
                        min="0"
                        value={newRoomNqCount}
                        onChange={(e) => setNewRoomNqCount(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">Kho: {availableCounts.nq || 0}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-indigo-400">TTD</span>
                      <input
                        type="number"
                        min="0"
                        value={newRoomTtdCount}
                        onChange={(e) => setNewRoomTtdCount(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">Kho: {availableCounts.ttd || 0}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-purple-400">AX</span>
                      <input
                        type="number"
                        min="0"
                        value={newRoomAxCount}
                        onChange={(e) => setNewRoomAxCount(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-500 mt-0.5">Kho: {availableCounts.ax || 0}</span>
                    </div>
                  </div>

                  {/* Quick preset chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => { setNewRoomAtCount(10); setNewRoomQtCount(10); setNewRoomNqCount(5); setNewRoomTtdCount(5); setNewRoomAxCount(20); }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                    >
                      Chuẩn 50c
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewRoomAtCount(20); setNewRoomQtCount(15); setNewRoomNqCount(5); setNewRoomTtdCount(0); setNewRoomAxCount(0); }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                    >
                      An toàn 40c
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewRoomAtCount(5); setNewRoomQtCount(5); setNewRoomNqCount(5); setNewRoomTtdCount(2); setNewRoomAxCount(8); }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                    >
                      Luyện 25c
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="lockCheckbox"
                  checked={newRoomLock}
                  onChange={(e) => setNewRoomLock(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="lockCheckbox" className="text-slate-300 text-xs font-semibold cursor-pointer">
                  Khóa phòng thi ngay khi tạo (Yêu cầu nhập mã PIN)
                </label>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowCreateRoomModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
              >
                Tạo Phòng Thi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Room & Matrix Configuration */}
      {showEditRoomModal && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveEditRoom} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>Sửa Phòng Thi & Ma Trận Đề</span>
              </h3>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {editingRoom.roomCode}
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tên phòng thi:</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mã phòng:</label>
                  <input
                    type="text"
                    disabled
                    value={editingRoom.roomCode}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-400 uppercase cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mã Khóa (PIN):</label>
                  <input
                    type="text"
                    placeholder="VD: 8899"
                    value={newRoomPin}
                    onChange={(e) => setNewRoomPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Thời gian (phút):</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newRoomTime}
                    onChange={(e) => setNewRoomTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bộ phận / Ban:</label>
                  <select
                    value={newRoomUnit}
                    onChange={(e) => setNewRoomUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Group Counts Section in Edit Modal */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Số câu bốc trong mỗi nhóm (Ma trận):</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                    Tổng: {newRoomAtCount + newRoomQtCount + newRoomNqCount + newRoomTtdCount + newRoomAxCount} câu
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-cyan-400">AT</span>
                    <input
                      type="number"
                      min="0"
                      value={newRoomAtCount}
                      onChange={(e) => setNewRoomAtCount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Kho: {availableCounts.at || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-teal-400">QT</span>
                    <input
                      type="number"
                      min="0"
                      value={newRoomQtCount}
                      onChange={(e) => setNewRoomQtCount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Kho: {availableCounts.qt || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-amber-400">NQ</span>
                    <input
                      type="number"
                      min="0"
                      value={newRoomNqCount}
                      onChange={(e) => setNewRoomNqCount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Kho: {availableCounts.nq || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-indigo-400">TTD</span>
                    <input
                      type="number"
                      min="0"
                      value={newRoomTtdCount}
                      onChange={(e) => setNewRoomTtdCount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Kho: {availableCounts.ttd || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-purple-400">AX</span>
                    <input
                      type="number"
                      min="0"
                      value={newRoomAxCount}
                      onChange={(e) => setNewRoomAxCount(Math.max(0, Number(e.target.value)))}
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                    <span className="text-[9px] text-slate-500 mt-1">Kho: {availableCounts.ax || 0}</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => { setNewRoomAtCount(10); setNewRoomQtCount(10); setNewRoomNqCount(5); setNewRoomTtdCount(5); setNewRoomAxCount(20); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                  >
                    Chuẩn 50c
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewRoomAtCount(20); setNewRoomQtCount(15); setNewRoomNqCount(5); setNewRoomTtdCount(0); setNewRoomAxCount(0); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                  >
                    An toàn 40c
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewRoomAtCount(5); setNewRoomQtCount(5); setNewRoomNqCount(5); setNewRoomTtdCount(5); setNewRoomAxCount(30); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                  >
                    Chuyên môn 50c
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewRoomAtCount(5); setNewRoomQtCount(5); setNewRoomNqCount(5); setNewRoomTtdCount(2); setNewRoomAxCount(8); }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                  >
                    Luyện 25c
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editLockCheckbox"
                  checked={newRoomLock}
                  onChange={(e) => setNewRoomLock(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="editLockCheckbox" className="text-slate-300 text-xs font-semibold cursor-pointer">
                  Khóa phòng thi (Yêu cầu thí sinh nhập mã PIN khi vào thi)
                </label>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditRoomModal(false);
                  setEditingRoom(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Preview Exam Sample */}
      {showPreviewExamModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>Xem Trước Đề Thi Mẫu (Bốc Theo Ma Trận)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {previewQuestions.length} câu
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phân bổ: {matrixAtCount} AT • {matrixQtCount} QT • {matrixNqCount} NQ • {matrixTtdCount} TTD • {matrixAxCount} AX
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreviewExamModal(false)}
                className="p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions preview list */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 my-4 space-y-3.5">
              {previewQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[11px] shrink-0 border border-cyan-500/30">
                        Câu {idx + 1} ({q.section})
                      </span>
                      <p className="font-semibold text-slate-100 text-sm leading-snug">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 pt-1">
                    {Object.entries(q.options || {}).map(([key, opt]) => {
                      const isCorrect = q.correct.includes(key);
                      return (
                        <div
                          key={key}
                          className={`p-1.5 rounded-lg border text-[11px] ${
                            isCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="mr-1">{key}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.citation && (
                    <p className="text-[10px] text-slate-500 italic pl-2">
                      Căn cứ: {q.citation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePreviewExam}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bốc ngẫu nhiên đề khác</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewExamModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Candidate */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddCandidate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Thêm Thí Sinh Vào Danh Sách</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Họ và tên thí sinh:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trần Văn Nam"
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Mã nhân viên (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="VD: SPM-0284"
                  value={newCandCode}
                  onChange={(e) => setNewCandCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bộ phận:</label>
                  <select
                    value={newCandUnit}
                    onChange={(e) => setNewCandUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Bậc thi:</label>
                  <select
                    value={newCandLevel}
                    onChange={(e) => setNewCandLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {['2', '3', '4', '5', '6', '7', '8'].map((lv) => (
                      <option key={lv} value={lv}>
                        Bậc {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phòng thi chỉ định:</label>
                <select
                  value={newCandRoom}
                  onChange={(e) => setNewCandRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.roomCode}>
                      {r.roomCode} - {r.roomName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowAddCandidateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
              >
                Thêm Vào Danh Sách
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuestion} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Thêm Câu Hỏi Trắc Nghiệm Mới</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nội dung câu hỏi:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nhập câu hỏi..."
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phương án A:</label>
                <input
                  type="text"
                  required
                  value={newQOptA}
                  onChange={(e) => setNewQOptA(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phương án B:</label>
                <input
                  type="text"
                  required
                  value={newQOptB}
                  onChange={(e) => setNewQOptB(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phương án C:</label>
                <input
                  type="text"
                  value={newQOptC}
                  onChange={(e) => setNewQOptC(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Phương án D:</label>
                <input
                  type="text"
                  value={newQOptD}
                  onChange={(e) => setNewQOptD(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Đáp án đúng:</label>
                  <select
                    value={newQCorrect}
                    onChange={(e) => setNewQCorrect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-bold text-cyan-300"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="AB">AB (Nhiều đáp án)</option>
                    <option value="AC">AC (Nhiều đáp án)</option>
                    <option value="ABD">ABD (Nhiều đáp án)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nhóm:</label>
                  <select
                    value={newQSection}
                    onChange={(e) => setNewQSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="AT">Mức I (AT - An toàn)</option>
                    <option value="QT">Mức II (QT - Quy trình)</option>
                    <option value="NQ">Mức III (NQ - Nội quy)</option>
                    <option value="TTD">Mức IV (TTD - Điều độ)</option>
                    <option value="A5.1">Chuyên môn A5.1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Căn cứ quy trình / trích dẫn:</label>
                <input
                  type="text"
                  placeholder="VD: Điều 12, Quy chuẩn QCVN 01:2020/BCT"
                  value={newQCitation}
                  onChange={(e) => setNewQCitation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all"
              >
                Lưu Câu Hỏi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Word .docx Question Import */}
      <WordImportModal
        isOpen={showWordImportModal}
        onClose={() => setShowWordImportModal(false)}
        onImportQuestions={handleImportWordQuestions}
      />

      {/* Modal: AI Camera & Document Question Generator */}
      <AiCameraDocumentModal
        isOpen={showAiCameraModal}
        onClose={() => setShowAiCameraModal(false)}
        onAddQuestions={handleAddAiCameraQuestions}
      />

      {/* Modal: Room QR Code Display */}
      {qrModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setQrModalRoom(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="font-black text-base text-slate-100">
              Quét Mã Vào Phòng Thi
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Dùng camera điện thoại để quét mã và vào phòng ngay lập tức
            </p>

            <div className="p-3 bg-white rounded-2xl shadow-xl inline-block mx-auto mb-4 border-4 border-slate-800">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  typeof window !== 'undefined'
                    ? `${window.location.origin}${window.location.pathname}?room=${qrModalRoom.roomCode}`
                    : ''
                )}`}
                alt="Room QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Phòng:</span>
                <span className="font-bold text-cyan-400 font-mono">{qrModalRoom.roomCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tên:</span>
                <span className="font-semibold text-slate-200 truncate max-w-[180px]">{qrModalRoom.roomName}</span>
              </div>
              {qrModalRoom.isLocked && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã Khóa (PIN):</span>
                  <span className="font-bold text-amber-300 font-mono">{qrModalRoom.accessPin}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                handleCopyRoomLink(qrModalRoom);
                setQrModalRoom(null);
              }}
              className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Copy className="w-4 h-4" />
              <span>Sao chép link & đóng</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Google Apps Script Deployment Guide & Source Code */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative animate-scaleUp my-auto max-h-[92vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>Triển Khai Lên Google Apps Script</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tự động lưu Google Sheets
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chạy hoàn toàn miễn phí trên Google Drive, tự động tạo 3 sheet: PHONG_THI, THI_SINH, CAU_HOI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAppsScriptModal(false)}
                className="p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 my-3">
              <button
                onClick={() => setAppsScriptTab('guide')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  appsScriptTab === 'guide'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Hướng Dẫn Cài Đặt (3 phút)
              </button>
              <button
                onClick={() => setAppsScriptTab('code_gs')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  appsScriptTab === 'code_gs'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Mã Nguồn Code.gs
              </button>
              <button
                onClick={() => setAppsScriptTab('index_html')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  appsScriptTab === 'index_html'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Mã Nguồn Index.html
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto max-h-80 pr-1 text-xs sm:text-sm text-slate-300">
              {appsScriptTab === 'guide' && (
                <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <p>
                      <strong>Tạo Google Sheet mới:</strong> Vào <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">sheets.new</a> để tạo 1 bảng tính Google Trang tính mới.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <p>
                      <strong>Mở Apps Script:</strong> Trên menu của Google Sheet, bấm <em>Tiện ích mở rộng (Extensions)</em> &gt; <em>Apps Script</em>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <p>
                      <strong>Dán mã nguồn:</strong><br />
                      • Dán tab <em>Code.gs</em> vào file <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Code.gs</code>.<br />
                      • Bấm dấu <strong>+</strong> &gt; Chọn <strong>HTML</strong> &gt; Đặt tên là <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Index</code> &gt; Dán toàn bộ nội dung từ tab <em>Index.html</em>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                    <p>
                      <strong>Chạy khởi tạo Sheet:</strong> Chọn hàm <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold">initDatabase</code> &gt; Bấm nút <strong>Chạy (Run)</strong> và cấp quyền Google Drive lần đầu. Sheet sẽ tự động sinh 3 tab: <strong className="text-slate-100">PHONG_THI, THI_SINH, CAU_HOI</strong>!
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">5</span>
                    <p>
                      <strong>Triển khai Web App:</strong> Bấm <em>Triển khai (Deploy)</em> &gt; <em>Tùy chọn triển khai mới</em> &gt; Chọn <strong>Ứng dụng web (Web app)</strong> &gt; Chọn <strong>Ai có quyền truy cập: Bất kỳ ai (Anyone)</strong> &gt; Bấm Triển khai và nhận link Web App cho thí sinh!
                    </p>
                  </div>
                </div>
              )}

              {appsScriptTab === 'code_gs' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Dán vào file <code className="text-cyan-300">Code.gs</code> trong Google Apps Script:</span>
                    <button
                      onClick={() => {
                        const code = `/**
 * SPMO Pro - Google Apps Script Backend (Code.gs)
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.initialRoom = (e && e.parameter && e.parameter.room) ? e.parameter.room : '';
  return template.evaluate()
    .setTitle('SPMO Pro - Hệ Thống Thi Trắc Nghiệm')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetRooms = ss.getSheetByName('PHONG_THI') || ss.insertSheet('PHONG_THI');
  if (sheetRooms.getLastRow() === 0) {
    sheetRooms.appendRow(['Mã Phòng', 'Tên Phòng', 'Mã Khóa (PIN)', 'Đang Khóa?', 'Bộ Phận', 'Bậc Thi', 'Thời Gian (Phút)', 'Số Câu', 'Ghi Chú', 'Ngày Tạo']);
    sheetRooms.appendRow(['SPM-2026', 'Kỳ Thi Nâng Bậc Nghề Đợt 1', '8899', 'TRUE', 'A', '5', 60, 50, 'Phòng thi chính thức có mã khóa', new Date()]);
  }
  var sheetCandidates = ss.getSheetByName('THI_SINH') || ss.insertSheet('THI_SINH');
  if (sheetCandidates.getLastRow() === 0) {
    sheetCandidates.appendRow(['Thời Gian', 'Họ Và Tên', 'Mã NV', 'Bộ Phận', 'Bậc', 'Phòng Thi', 'Mã Đề', 'Điểm', 'Số Câu Đúng', 'Tổng Câu', 'Thời Gian Làm', 'Số Lần Rời Màn Hình', 'Trạng Thái']);
  }
  var sheetQuestions = ss.getSheetByName('CAU_HOI') || ss.insertSheet('CAU_HOI');
  if (sheetQuestions.getLastRow() === 0) {
    sheetQuestions.appendRow(['ID', 'Nội Dung Câu Hỏi', 'Phương Án A', 'Phương Án B', 'Phương Án C', 'Phương Án D', 'Đáp Án Đúng', 'Nhóm', 'Bậc', 'Trích Dẫn Quy Trình', 'Giải Thích']);
  }
  return { status: 'ok' };
}

function apiGetInitialData() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rRows = ss.getSheetByName('PHONG_THI').getDataRange().getValues();
  var rooms = [];
  for (var i = 1; i < rRows.length; i++) {
    if (rRows[i][0]) {
      rooms.push({
        roomCode: String(rRows[i][0]),
        roomName: String(rRows[i][1]),
        accessPin: String(rRows[i][2] || ''),
        isLocked: String(rRows[i][3]).toUpperCase() === 'TRUE',
        unit: String(rRows[i][4] || 'A'),
        level: String(rRows[i][5] || '5'),
        examTimeMinutes: Number(rRows[i][6]) || 60,
        totalQuestions: Number(rRows[i][7]) || 50
      });
    }
  }
  var cRows = ss.getSheetByName('THI_SINH').getDataRange().getValues();
  var candidates = [];
  for (var j = 1; j < cRows.length; j++) {
    if (cRows[j][1]) {
      candidates.push({
        fullName: String(cRows[j][1]),
        unitName: String(cRows[j][3] || ''),
        level: String(cRows[j][4] || ''),
        roomCode: String(cRows[j][5] || ''),
        score: cRows[j][7] !== '' ? Number(cRows[j][7]) : undefined,
        status: String(cRows[j][12] || '')
      });
    }
  }
  var qRows = ss.getSheetByName('CAU_HOI').getDataRange().getValues();
  var questions = [];
  for (var k = 1; k < qRows.length; k++) {
    if (qRows[k][1]) {
      questions.push({
        id: 'Q-' + k,
        question: String(qRows[k][1]),
        options: { A: String(qRows[k][2]||''), B: String(qRows[k][3]||''), C: String(qRows[k][4]||''), D: String(qRows[k][5]||'') },
        correct: String(qRows[k][6] || 'A'),
        section: String(qRows[k][7] || 'AT'),
        citation: String(qRows[k][9] || '')
      });
    }
  }
  return { rooms: rooms, candidates: candidates, questions: questions };
}

function apiSubmitExam(attempt) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('THI_SINH') || ss.insertSheet('THI_SINH');
  var elapsedText = Math.floor(attempt.elapsedSeconds / 60) + 'p ' + (attempt.elapsedSeconds % 60) + 's';
  sheet.appendRow([
    new Date(), attempt.candidateName, '', attempt.unitName, attempt.level,
    attempt.roomCode, attempt.examCode, attempt.score, attempt.correct, attempt.total,
    elapsedText, attempt.focusViolations || 0, attempt.status || 'ĐÃ NỘP BÀI'
  ]);
  return { status: 'success' };
}`;
                        navigator.clipboard.writeText(code);
                        setCopiedScript('CODE_GS');
                        setTimeout(() => setCopiedScript(null), 3000);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedScript === 'CODE_GS' ? '✓ Đã sao chép!' : 'Sao chép Code.gs'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-60 leading-relaxed">
{`function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.initialRoom = (e && e.parameter && e.parameter.room) ? e.parameter.room : '';
  return template.evaluate()
    .setTitle('SPMO Pro - Hệ Thống Thi Trắc Nghiệm')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Tự động tạo 3 sheet: PHONG_THI, THI_SINH, CAU_HOI
}`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    File đầy đủ đã được lưu tại <code className="text-cyan-400">/apps-script/Code.gs</code> trong dự án.
                  </p>
                </div>
              )}

              {appsScriptTab === 'index_html' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">File giao diện web hoàn chỉnh cho Apps Script:</span>
                    <button
                      onClick={() => {
                        alert('Nội dung file Index.html hoàn chỉnh đã được tạo sẵn tại thư mục /apps-script/Index.html trong dự án. Bạn có thể mở file này và sao chép toàn bộ.');
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Xem file /apps-script/Index.html</span>
                    </button>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-slate-200">
                      File <code className="text-emerald-400 font-mono">/apps-script/Index.html</code> đã được đóng gói sẵn 100%:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
                      <li>Giao diện Dark Mode Tailwind CSS chạy mượt trên cả mobile và desktop.</li>
                      <li>Tích hợp đầy đủ chức năng Thí sinh làm bài thi (hẹn giờ, điều hướng, khóa phòng thi).</li>
                      <li>Tự động kết nối với hàm <code className="text-cyan-300 font-mono">google.script.run.apiSubmitExam()</code> để ghi ngay bài thi vào Google Sheet.</li>
                      <li>Bảng quản trị Admin đồng bộ 2 chiều với Google Sheets.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-3">
              <span className="text-[11px] text-slate-500">
                Tài liệu chi tiết tại: <code className="text-slate-400 font-mono">/apps-script/HUONG_DAN_CAI_DAT_APPS_SCRIPT.md</code>
              </span>
              <button
                onClick={() => setShowAppsScriptModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
