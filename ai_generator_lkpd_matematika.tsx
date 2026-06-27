import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Calculator, Settings, LogOut, FileText, History, 
  Users, CheckCircle, AlertCircle, Eye, EyeOff, Sparkles, 
  Printer, Download, Edit3, Save, Copy, RotateCcw, Plus,
  Trash2, ChevronRight, PenTool, Wand2, MessageSquare, X
} from 'lucide-react';

// --- API Helper ---
const apiKey = ""; // Disediakan oleh environment
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const generateGeminiContent = async (prompt, systemInstruction = "") => {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  const attemptCall = async (delay) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const delays = [0, 1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < delays.length; i++) {
    try {
      return await attemptCall(delays[i]);
    } catch (error) {
      if (i === delays.length - 1) throw error;
    }
  }
};

// --- Main App Component ---
export default function App() {
  // Session State
  const [user, setUser] = useState(null); // { name, email, role }
  const [view, setView] = useState('login'); // login, dashboard, form, result, history, admin
  
  // Data State
  const [history, setHistory] = useState([]);
  const [adminData, setAdminData] = useState({
    totalUsers: 24,
    users: [
      { name: "Budi Santoso", email: "budi@sekolah.id", loginTime: "2026-06-18 08:00" },
      { name: "Siti Aminah", email: "siti@sekolah.id", loginTime: "2026-06-18 09:15" }
    ],
    totalLKPD: 156,
    popularTopics: ["Aljabar", "Geometri", "Pecahan", "Trigonometri"]
  });

  // App Initialization (Load script for PDF and check session)
  useEffect(() => {
    // Load html2pdf dynamically
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    document.head.appendChild(script);

    // Simple session restore (mocking local persistence)
    const savedUser = sessionStorage.getItem('lkpd_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('lkpd_user', JSON.stringify(userData));
    
    // Add current user to mock admin data if not exists
    if (userData.role === 'member') {
        setAdminData(prev => ({
            ...prev,
            totalUsers: prev.totalUsers + 1,
            users: [{ name: userData.name, email: userData.email, loginTime: new Date().toLocaleString('id-ID') }, ...prev.users]
        }));
    }
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('lkpd_user');
    setView('login');
  };

  const saveLKPD = (lkpd) => {
    const newLkpd = { ...lkpd, id: Date.now().toString(), date: new Date().toLocaleDateString('id-ID') };
    setHistory([newLkpd, ...history]);
    setAdminData(prev => ({ ...prev, totalLKPD: prev.totalLKPD + 1 }));
  };

  // --- Views ---
  if (view === 'login') return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Decorative Math Background Elements */}
      <div className="absolute top-10 left-10 text-emerald-200/40 transform -rotate-12 pointer-events-none"><Calculator size={120} /></div>
      <div className="absolute bottom-20 right-10 text-emerald-200/40 transform rotate-12 pointer-events-none"><PenTool size={150} /></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Calculator size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">AI LKPD Matematika</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Halo, {user?.name}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium">
              <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 print:p-0 print:m-0 print:w-full print:max-w-none">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 print:hidden">
          <nav className="space-y-1">
            <NavItem icon={<BookOpen />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavItem icon={<Plus />} label="Buat LKPD Baru" active={view === 'form'} onClick={() => setView('form')} />
            <NavItem icon={<History />} label="Riwayat LKPD" active={view === 'history'} onClick={() => setView('history')} badge={history.length} />
            {user?.role === 'admin' && (
              <NavItem icon={<Settings />} label="Panel Admin" active={view === 'admin'} onClick={() => setView('admin')} className="mt-4 border-t border-emerald-200 pt-4" />
            )}
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sm:p-8 print:border-none print:shadow-none print:p-0">
          {view === 'dashboard' && <DashboardView user={user} onNavigate={setView} />}
          {view === 'form' && <FormView onGenerate={(data, result) => { setView('result'); window.currentResult = { form: data, result: result }; }} />}
          {view === 'result' && <ResultView data={window.currentResult} onSave={saveLKPD} onNew={() => setView('form')} onRegenerate={(newData) => { window.currentResult.result = newData; setView('dashboard'); setTimeout(()=>setView('result'), 10); }} />}
          {view === 'history' && <HistoryView history={history} onView={(item) => { window.currentResult = { form: item.form, result: item.content, id: item.id }; setView('result'); }} onDelete={(id) => setHistory(history.filter(h => h.id !== id))} />}
          {view === 'admin' && user?.role === 'admin' && <AdminPanel data={adminData} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-800 text-emerald-100 py-6 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            AI Generator LKPD Matematika — Belajar Matematika Jadi Lebih Mudah bersama Bu Taty.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components ---
const NavItem = ({ icon, label, active, onClick, badge, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
    } ${className}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { size: 18 })}
      {label}
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
        {badge}
      </span>
    )}
  </button>
);

// --- Login View ---
function LoginView({ onLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', code: '' });
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.code) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid.');
      return;
    }

    if (formData.code === 'AILKPDMTK') {
      onLogin({ ...formData, role: 'member' });
    } else if (formData.code === 'ADMINAILKPD') {
      onLogin({ ...formData, role: 'admin' });
    } else {
      setError('Kode akses tidak valid. Silakan periksa kembali kode Anda.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-10%] left-[-10%] text-emerald-200/50 transform -rotate-12"><Calculator size={400} /></div>
      <div className="absolute bottom-[-10%] right-[-10%] text-emerald-200/50 transform rotate-12"><FileText size={400} /></div>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative z-10 border border-emerald-100">
        <div className="text-center mb-8">
          <div className="mx-auto bg-emerald-100 text-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Calculator size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Masuk ke Aplikasi</h1>
          <p className="text-sm text-slate-500 mt-2">AI Generator LKPD Matematika</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="Masukkan nama Anda"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Akses</label>
            <div className="relative">
              <input 
                type={showCode ? "text" : "password"} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white pr-12"
                placeholder="Masukkan kode akses"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 focus:outline-none"
              >
                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200 mt-2"
          >
            Masuk ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ user, onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Sparkles size={48} />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Selamat datang, {user?.name}!</h2>
      <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
        Buat LKPD Matematika yang terstruktur, menarik, dan sesuai kebutuhan pembelajaran dalam hitungan menit menggunakan bantuan AI.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button 
          onClick={() => onNavigate('form')}
          className="group p-6 bg-white border-2 border-emerald-500 rounded-2xl hover:bg-emerald-50 transition-all flex flex-col items-center gap-3 shadow-sm hover:shadow-md"
        >
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <Plus size={28} />
          </div>
          <span className="font-bold text-emerald-700 text-lg">Buat LKPD Baru</span>
          <span className="text-sm text-slate-500">Mulai rancang materi untuk siswa Anda.</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="group p-6 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col items-center gap-3 shadow-sm hover:shadow-md"
        >
          <div className="bg-slate-100 text-slate-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <History size={28} />
          </div>
          <span className="font-bold text-slate-700 text-lg">Lihat Riwayat</span>
          <span className="text-sm text-slate-500">Akses kembali LKPD yang pernah dibuat.</span>
        </button>
      </div>
    </div>
  );
}

// --- Generator Form View ---
function FormView({ onGenerate }) {
  const [formData, setFormData] = useState({
    jenjang: 'SMP',
    kelas: '',
    materi: '',
    tujuan: '',
    kurikulum: 'Kurikulum Merdeka',
    jenis: 'Latihan soal',
    kesulitan: 'Sedang',
    jumlahSoal: '5',
    bentukSoal: 'Pilihan ganda',
    ilustrasi: 'Tidak',
    kunci: 'Ya',
    pembahasan: 'Tidak',
    instruksi: ''
  });
  
  const [loadingAI, setLoadingAI] = useState({ topik: false, tujuan: false, generate: false });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getAITopik = async () => {
    if (!formData.jenjang || !formData.kelas) {
      setError("Silakan isi Jenjang dan Kelas terlebih dahulu untuk mendapatkan Ide Topik.");
      return;
    }
    setError('');
    setLoadingAI({ ...loadingAI, topik: true });
    try {
      const prompt = `Berikan SATU ide topik matematika yang spesifik, kreatif, dan sangat kontekstual untuk siswa ${formData.jenjang} kelas ${formData.kelas}. Contoh format: "Menghitung Luas Taman Bermain dengan Bangun Datar". Langsung jawab topiknya saja tanpa teks tambahan.`;
      const result = await generateGeminiContent(prompt);
      setFormData(prev => ({ ...prev, materi: result.replace(/["']/g, '').trim() }));
    } catch (err) {
      setError("Gagal mendapatkan ide topik. Coba lagi.");
    }
    setLoadingAI({ ...loadingAI, topik: false });
  };

  const getAITujuan = async () => {
    if (!formData.materi) {
      setError("Silakan isi Materi terlebih dahulu untuk membuat Tujuan Pembelajaran.");
      return;
    }
    setError('');
    setLoadingAI({ ...loadingAI, tujuan: true });
    try {
      const prompt = `Buatkan 1 atau 2 kalimat tujuan pembelajaran berstandar pedagogi (mengandung unsur Audience, Behavior, Condition, Degree jika memungkinkan) untuk materi matematika: '${formData.materi}' jenjang ${formData.jenjang}. Langsung berikan kalimat tujuannya tanpa basa-basi.`;
      const result = await generateGeminiContent(prompt);
      setFormData(prev => ({ ...prev, tujuan: result.trim() }));
    } catch (err) {
      setError("Gagal membuat tujuan. Coba lagi.");
    }
    setLoadingAI({ ...loadingAI, tujuan: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kelas || !formData.materi || !formData.tujuan) {
      setError("Mohon lengkapi Kelas, Materi, dan Tujuan Pembelajaran.");
      return;
    }
    setError('');
    setLoadingAI({ ...loadingAI, generate: true });

    const systemPrompt = `Anda adalah asisten AI profesional untuk guru matematika di Indonesia. Tugas Anda adalah membuat Lembar Kerja Peserta Didik (LKPD) yang terstruktur, rapi, mendidik, dan menggunakan bahasa Indonesia yang baik dan benar sesuai jenjang siswa. Gunakan format Teks Biasa yang rapi dengan pembatas yang jelas (gunakan huruf kapital tebal untuk judul bagian). Pastikan rumus matematika ditulis rapi (bisa menggunakan teks biasa yang jelas atau notasi sederhana). JANGAN MENGGUNAKAN MARKDOWN RUMIT yang sulit diedit guru dalam textarea, cukup gunakan struktur teks yang bersih.`;
    
    const userPrompt = `Buat Lembar Kerja Peserta Didik (LKPD) Matematika dengan detail berikut:
- Jenjang: ${formData.jenjang}
- Kelas: ${formData.kelas}
- Materi: ${formData.materi}
- Tujuan Pembelajaran: ${formData.tujuan}
- Kurikulum: ${formData.kurikulum}
- Jenis LKPD: ${formData.jenis}
- Tingkat Kesulitan: ${formData.kesulitan}
- Jumlah Soal: ${formData.jumlahSoal}
- Bentuk Soal: ${formData.bentukSoal}
- Gunakan Ilustrasi/Konteks Cerita: ${formData.ilustrasi}
- Sertakan Kunci Jawaban: ${formData.kunci}
- Sertakan Pembahasan: ${formData.pembahasan}
- Instruksi Tambahan dari Guru: ${formData.instruksi || 'Tidak ada'}

Struktur LKPD WAJIB berurutan seperti ini:
JUDUL LKPD
IDENTITAS SISWA (Nama, Kelas, No. Absen, Tanggal)
TUJUAN PEMBELAJARAN
PETUNJUK PENGERJAAN
RINGKASAN KONSEP SINGKAT
CONTOH SOAL DAN PENYELESAIAN (Jika relevan)
AKTIVITAS / LANGKAH KERJA (Jika jenisnya penemuan konsep/proyek)
SOAL LATIHAN
REFLEKSI SISWA
KESIMPULAN

[Tulis Kunci Jawaban dan Pembahasan di bagian paling bawah jika diminta].`;

    try {
      const resultText = await generateGeminiContent(userPrompt, systemPrompt);
      onGenerate(formData, resultText);
    } catch (err) {
      setError("Terjadi kesalahan saat membuat LKPD. Silakan periksa koneksi internet atau coba lagi beberapa saat.");
      setLoadingAI({ ...loadingAI, generate: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Form Generator LKPD</h2>
        <p className="text-slate-500">Lengkapi formulir di bawah ini untuk menghasilkan materi LKPD.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Konteks Pembelajaran */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-2"><BookOpen size={18}/> Konteks Pembelajaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
              <select name="jenjang" value={formData.jenjang} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option>SD</option>
                <option>SMP</option>
                <option>SMA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
              <input type="text" name="kelas" value={formData.kelas} onChange={handleChange} placeholder="Misal: 7, 8, atau X" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kurikulum</label>
              <select name="kurikulum" value={formData.kurikulum} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option>Kurikulum Merdeka</option>
                <option>Kurikulum 2013</option>
                <option>Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Materi / Topik Matematika</label>
              <button type="button" onClick={getAITopik} disabled={loadingAI.topik} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 py-1 px-2 rounded-md flex items-center gap-1 transition-colors border border-amber-200">
                {loadingAI.topik ? <RotateCcw size={12} className="animate-spin" /> : <Sparkles size={12} />} Ide Topik AI
              </button>
            </div>
            <input type="text" name="materi" value={formData.materi} onChange={handleChange} placeholder="Contoh: Persamaan Linear Satu Variabel" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Tujuan Pembelajaran</label>
              <button type="button" onClick={getAITujuan} disabled={loadingAI.tujuan} className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 py-1 px-2 rounded-md flex items-center gap-1 transition-colors border border-amber-200">
                {loadingAI.tujuan ? <RotateCcw size={12} className="animate-spin" /> : <Sparkles size={12} />} Bantu Tulis AI
              </button>
            </div>
            <textarea name="tujuan" value={formData.tujuan} onChange={handleChange} rows="2" placeholder="Siswa dapat..." className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" required></textarea>
          </div>
        </div>

        {/* Section 2: Format LKPD */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-2"><Settings size={18}/> Format & Detail Soal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis LKPD</label>
              <select name="jenis" value={formData.jenis} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white">
                <option>Latihan soal</option>
                <option>Penemuan konsep</option>
                <option>Pemecahan masalah</option>
                <option>Soal cerita kontekstual</option>
                <option>Remedial</option>
                <option>Pengayaan</option>
                <option>Berbasis proyek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat Kesulitan</label>
              <select name="kesulitan" value={formData.kesulitan} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white">
                <option>Mudah</option>
                <option>Sedang</option>
                <option>Sulit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bentuk Soal</label>
              <select name="bentukSoal" value={formData.bentukSoal} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none bg-white">
                <option>Pilihan ganda</option>
                <option>Isian singkat</option>
                <option>Uraian</option>
                <option>Campuran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Soal</label>
              <input type="number" name="jumlahSoal" value={formData.jumlahSoal} onChange={handleChange} min="1" max="20" className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 bg-white px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={formData.ilustrasi === 'Ya'} onChange={e => setFormData({...formData, ilustrasi: e.target.checked ? 'Ya' : 'Tidak'})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Gunakan Konteks Cerita/Ilustrasi
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 bg-white px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={formData.kunci === 'Ya'} onChange={e => setFormData({...formData, kunci: e.target.checked ? 'Ya' : 'Tidak'})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Sertakan Kunci Jawaban
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 bg-white px-4 py-2 border rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="checkbox" checked={formData.pembahasan === 'Ya'} onChange={e => setFormData({...formData, pembahasan: e.target.checked ? 'Ya' : 'Tidak'})} className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
              Sertakan Pembahasan
            </label>
          </div>
        </div>

        {/* Section 3: Tambahan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Instruksi Tambahan (Opsional)</label>
          <textarea name="instruksi" value={formData.instruksi} onChange={handleChange} rows="2" placeholder="Misal: Buat soal yang berkaitan dengan jajanan pasar..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-slate-50 focus:bg-white"></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loadingAI.generate}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
        >
          {loadingAI.generate ? (
             <><RotateCcw className="animate-spin" /> AI Sedang Menyusun LKPD...</>
          ) : (
             <><Sparkles /> Generate LKPD</>
          )}
        </button>
      </form>
    </div>
  );
}

// --- Result View ---
function ResultView({ data, onSave, onNew, onRegenerate }) {
  const [content, setContent] = useState(data.result);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(data.id ? true : false); // if it has ID, it's from history

  // State untuk Asisten AI
  const [aiLoading, setAiLoading] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const runAIFeature = async (type, prompt, title) => {
    setAiLoading(type);
    try {
      const result = await generateGeminiContent(prompt);
      if (type === 'refine') {
         setContent(result);
         alert("Teks berhasil diperhalus oleh AI ✨!");
      } else {
         setAiFeedback(result);
         setModalTitle(title);
         setShowModal(true);
      }
    } catch (error) {
      alert("Gagal memanggil AI. Silakan periksa koneksi atau coba lagi.");
    }
    setAiLoading(null);
  };

  const handleAIEvaluate = () => {
     const prompt = `Anda adalah pakar pedagogi dan guru matematika senior. Evaluasi LKPD berikut ini secara singkat namun berbobot. Berikan:\n1. Skor Kualitas (1-100)\n2. Kekuatan utama LKPD ini\n3. 2 Saran perbaikan praktis agar lebih interaktif.\n\nLKPD:\n${content}`;
     runAIFeature('evaluate', prompt, "Evaluasi Kualitas LKPD");
  };

  const handleAIDifferentiation = () => {
     const prompt = `Anda adalah ahli pendidikan inklusif. Berdasarkan LKPD matematika berikut, berikan saran singkat (maksimal 3 paragraf) bagaimana guru dapat mendiferensiasi pembelajaran ini:\n1. Untuk siswa yang lambat belajar (Slow Learners) agar tidak frustrasi.\n2. Untuk siswa yang cepat tanggap (Fast Learners) agar tetap tertantang.\n\nLKPD:\n${content}`;
     runAIFeature('differentiate', prompt, "Saran Diferensiasi Pembelajaran");
  };

  const handleAIRefine = () => {
     const prompt = `Perbaiki tata bahasa, ejaan, dan struktur kalimat pada teks LKPD matematika berikut agar lebih profesional, mudah dipahami siswa, dan sangat rapi. JANGAN mengubah struktur dasar, materi, atau soalnya. Kembalikan HANYA teks yang sudah diperbaiki tanpa tambahan apapun.\n\n${content}`;
     runAIFeature('refine', prompt, "");
  };

  // Custom simple formatter for plain text to maintain structure in view mode
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, index) => {
      // Basic styling based on common AI output patterns
      if (line.match(/^[A-Z\s]+$/) && line.length > 5) {
        // Assume all caps lines are major headers
        return <h2 key={index} className="text-xl font-bold text-emerald-800 mt-6 mb-3 border-b border-emerald-100 pb-1">{line}</h2>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
         return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        // Handle inline bolding simply
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-1 text-slate-700">
            {parts.map((part, i) => 
              part.startsWith('**') ? <strong key={i} className="text-slate-900 font-semibold">{part.replace(/\*\*/g, '')}</strong> : part
            )}
          </p>
        );
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      alert("Teks LKPD berhasil disalin ke clipboard!");
    });
  };

  const handleSave = () => {
    if (!isSaved) {
      onSave({ form: data.form, content: content });
      setIsSaved(true);
      alert("LKPD berhasil disimpan ke Riwayat.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('lkpd-document-container');
    
    // Hide UI elements inside the container before generating PDF
    element.classList.add('pdf-mode');
    
    const opt = {
      margin:       0.5,
      filename:     `LKPD_${data.form.materi.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
       window.html2pdf().set(opt).from(element).save().then(() => {
          element.classList.remove('pdf-mode');
       });
    } else {
       alert("Library PDF belum termuat. Silakan gunakan tombol Cetak lalu 'Save as PDF'.");
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Sticky Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 p-4 rounded-xl mb-4 border border-emerald-100 print:hidden sticky top-0 z-20 shadow-sm">
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}>
            <Edit3 size={16} /> {isEditing ? 'Selesai Edit' : 'Edit LKPD'}
          </button>
          {!isEditing && (
             <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
               <Copy size={16} /> Salin Teks
             </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button onClick={() => { if(confirm('Buat ulang LKPD ini? Perubahan yang belum disimpan akan hilang.')) { onRegenerate(data.form); } }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors">
             <RotateCcw size={16} /> Generate Ulang
           </button>
           <button onClick={handleSave} disabled={isSaved} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSaved ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'}`}>
             {isSaved ? <CheckCircle size={16} /> : <Save size={16} />} {isSaved ? 'Tersimpan' : 'Simpan'}
           </button>
           <button onClick={handleDownloadPDF} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
             <Download size={16} /> Unduh PDF
           </button>
           <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors">
             <Printer size={16} /> Cetak
           </button>
           <button onClick={onNew} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
             <Plus size={16} /> Buat Baru
           </button>
        </div>
      </div>

      {/* AI Assistant Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-amber-50/80 p-3 rounded-xl mb-6 border border-amber-200 print:hidden shadow-sm">
        <span className="text-sm font-bold text-amber-800 flex items-center gap-1 ml-1"><Sparkles size={16}/> Asisten AI LKPD:</span>
        <button onClick={handleAIEvaluate} disabled={aiLoading !== null} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50">
          {aiLoading === 'evaluate' ? <RotateCcw size={14} className="animate-spin" /> : <MessageSquare size={14} />} Evaluasi Kualitas ✨
        </button>
        <button onClick={handleAIDifferentiation} disabled={aiLoading !== null} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50">
          {aiLoading === 'differentiate' ? <RotateCcw size={14} className="animate-spin" /> : <Users size={14} />} Saran Diferensiasi ✨
        </button>
        <button onClick={handleAIRefine} disabled={aiLoading !== null} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50">
          {aiLoading === 'refine' ? <RotateCcw size={14} className="animate-spin" /> : <Wand2 size={14} />} Perhalus Bahasa ✨
        </button>
      </div>

      {/* Document Container (Target for PDF/Print) */}
      <div 
        id="lkpd-document-container" 
        className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:w-full"
      >
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #lkpd-document-container, #lkpd-document-container * { visibility: visible; }
            #lkpd-document-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; }
          }
          .pdf-mode { padding: 20px; font-family: 'Times New Roman', serif; }
        `}</style>
        
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[600px] p-6 outline-none resize-none font-mono text-sm leading-relaxed text-slate-700 bg-slate-50 rounded-xl"
            placeholder="Ketik konten LKPD di sini..."
          />
        ) : (
          <div className="p-8 sm:p-12 min-h-[600px] font-serif text-black leading-normal document-content">
            {renderFormattedText(content)}
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-amber-200">
            <div className="flex items-center justify-between p-4 border-b border-amber-100 bg-amber-50">
              <h3 className="font-bold text-amber-800 flex items-center gap-2"><Sparkles size={18} className="text-amber-500"/> {modalTitle}</h3>
              <button onClick={() => setShowModal(false)} className="text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto font-sans text-slate-700 text-sm leading-relaxed">
              {aiFeedback.split('\n').map((line, i) => (
                line.trim() === '' ? <br key={i} /> : 
                line.startsWith('**') && line.endsWith('**') ? <h4 key={i} className="font-bold text-slate-900 mt-2 mb-1">{line.replace(/\*\*/g, '')}</h4> :
                <p key={i} className="mb-1">{line.replace(/\*\*/g, '')}</p>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-amber-600 rounded-lg text-sm font-bold text-white hover:bg-amber-700 shadow-sm shadow-amber-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- History View ---
function HistoryView({ history, onView, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
          <History size={48} />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">Belum ada Riwayat LKPD</h3>
        <p className="text-slate-500">LKPD yang Anda simpan selama sesi ini akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Riwayat LKPD</h2>
        <p className="text-slate-500">Daftar LKPD yang telah Anda buat dan simpan.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="mb-3 flex-1">
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md mb-2 inline-block">
                {item.form.jenjang} - Kelas {item.form.kelas}
              </span>
              <h3 className="font-bold text-slate-800 line-clamp-2 mt-1">{item.form.materi}</h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <FileText size={12} /> {item.form.jenis}
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400">{item.date}</span>
              <div className="flex gap-2">
                <button onClick={() => onView(item)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors tooltip" title="Buka / Edit">
                  <Eye size={18} />
                </button>
                <button onClick={() => { if(confirm('Hapus riwayat ini?')) onDelete(item.id); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Hapus">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Admin Panel View ---
function AdminPanel({ data }) {
  return (
    <div>
      <div className="mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="bg-slate-800 text-white p-2 rounded-lg"><Settings size={24} /></div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel Admin</h2>
          <p className="text-slate-500">Ringkasan aktivitas penggunaan aplikasi.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl shadow-sm"><Users size={24} /></div>
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Pengguna Aktif</p>
            <p className="text-3xl font-bold text-blue-900">{data.totalUsers}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-sm"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-emerald-600 font-medium">LKPD Dibuat (Sesi)</p>
            <p className="text-3xl font-bold text-emerald-900">{data.totalLKPD}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
           <p className="text-sm text-amber-600 font-medium mb-2">Materi Terpopuler</p>
           <div className="flex flex-wrap gap-2">
             {data.popularTopics.map(topic => (
               <span key={topic} className="text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-md">{topic}</span>
             ))}
           </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Log Pengguna Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Pengguna</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Waktu Login</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 text-slate-600">{u.loginTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}