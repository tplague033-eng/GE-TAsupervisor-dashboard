import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Heart,
  Users,
  Settings,
  RotateCcw,
  Calendar,
  FileText,
  Printer,
  TrendingUp,
  ExternalLink,
  FileSpreadsheet,
  LayoutGrid,
  Globe,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  query,
  orderByKey,
  startAt,
  endAt,
} from "firebase/database";

// ========================================
// 1. QUICK LINKS CONFIG - ISI LINK ANDA DI SINI
// ========================================
const QUICK_LINKS = [
  {
    id: 1,
    title: "Progres keseluruhan-Kelas",
    url: "https://docs.google.com/spreadsheets/d/1jfWYxDXpTpDKZlmpnrtSCjKAFO-NLFsKMh_5LuTfqxE/edit?usp=sharing",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "bg-green-500/20 text-green-100 border-green-500/30",
  },
  {
    id: 2,
    title: "Placement test-Teens",
    url: "https://docs.google.com/spreadsheets/d/1_7dIb1X9NEnnHeiGNe-buthWJ16YPT1ZofMhNOszjaM/edit?usp=sharing",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "bg-blue-500/20 text-blue-100 border-blue-500/30",
  },
  {
    id: 3,
    title: "Placement test-Adults & SO",
    url: "https://docs.google.com/spreadsheets/d/1-0KQjPY-wusZ99cpKT2LFbpjomCaM8-ZAmr6QCXxT9o/edit?usp=sharing",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: "bg-indigo-500/20 text-indigo-100 border-indigo-500/30",
  },
];

// ========================================
// 2. FIREBASE CONFIG - PASTE CREDENTIALS ANDA DI SINI
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyDA5Kim8dZfsuVLIV1lRZCyfnW6YA9DGVQ",
  authDomain: "ge-tos-dashboard.firebaseapp.com",
  databaseURL:
    "https://ge-tos-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ge-tos-dashboard",
  storageBucket: "ge-tos-dashboard.firebasestorage.app",
  messagingSenderId: "342247541094",
  appId: "1:342247541094:web:1fcd26d9c7a4fd5096e0a7",
  measurementId: "G-RHDME53NKM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ========================================
// TYPES
// ========================================
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Category {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  isOpen: boolean;
  tasks: Task[];
}

interface DailyLog {
  tasks: Category[];
  notes: string;
  timestamp: number;
  progress: number;
}

interface WeeklyData {
  date: string;
  progress: number;
  notes: string;
}

// ========================================
// MAIN COMPONENT
// ========================================
export default function SupervisorDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dailyNotes, setDailyNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  // Weekly Report States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState<number>(0);

  const initialCategories: Category[] = [
    {
      id: 1,
      title: "Academic Control",
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-purple-500/30 to-pink-500/30",
      isOpen: false,
      tasks: [
        {
          id: 101,
          text: "Mengawasi placement & spoken test diselesaikan maksimal H+2",
          completed: false,
        },
        {
          id: 102,
          text: "Mengontrol kelas reguler/private/TOEFL aman tanpa missed class",
          completed: false,
        },
      ],
    },
    {
      id: 2,
      title: "Service Excellence",
      icon: <Heart className="w-6 h-6" />,
      color: "from-orange-500/30 to-yellow-500/30",
      isOpen: false,
      tasks: [
        {
          id: 201,
          text: "Memastikan setiap murid mendapatkan respons yang cepat, akurat, dan sesuai kebutuhan",
          completed: false,
        },
        {
          id: 202,
          text: "Menangani dan memonitor penyelesaian komplain murid maksimal 24 jam",
          completed: false,
        },
      ],
    },
    {
      id: 3,
      title: "Teacher & Admin Management",
      icon: <Users className="w-6 h-6" />,
      color: "from-pink-500/30 to-rose-500/30",
      isOpen: false,
      tasks: [
        {
          id: 301,
          text: "Mengelola dan mengawasi layanan guru (surat tugas, informasi jadwal, perubahan jadwal)",
          completed: false,
        },
        {
          id: 302,
          text: "Mengawasi penyelesaian administrasi harian/mingguan agar tertib dan tepat waktu",
          completed: false,
        },
        {
          id: 303,
          text: "Menjaga dan memeriksa akurasi data murid/guru/jadwal",
          completed: false,
        },
      ],
    },
    {
      id: 4,
      title: "Operational Stability",
      icon: <Settings className="w-6 h-6" />,
      color: "from-teal-500/30 to-cyan-500/30",
      isOpen: false,
      tasks: [
        {
          id: 401,
          text: "Memastikan semua jobdesc tuntas tanpa pending (jadwal, laporan, data)",
          completed: false,
        },
        {
          id: 402,
          text: "Mengontrol kelancaran komunikasi internal agar alur kerja antar tim tetap efektif",
          completed: false,
        },
        {
          id: 403,
          text: "Menjaga stabilitas operasional cabang dan meminimalkan potensi gangguan layanan",
          completed: false,
        },
      ],
    },
  ];

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [progress, setProgress] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);

  // Load data from Firebase on mount
  useEffect(() => {
    loadDailyData(currentDate);
  }, [currentDate]);

  // Calculate progress
  useEffect(() => {
    let total = 0;
    let completed = 0;
    categories.forEach((category) => {
      total += category.tasks.length;
      completed += category.tasks.filter((task) => task.completed).length;
    });
    setTotalTasks(total);
    setCompletedTasks(completed);
    setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  }, [categories]);

  // Auto-save to Firebase
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveDailyData();
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [categories, dailyNotes, progress]);

  // ========================================
  // FIREBASE FUNCTIONS
  // ========================================
  const loadDailyData = async (date: string) => {
    try {
      const logRef = ref(database, `logs/${date}`);
      const snapshot = await get(logRef);

      if (snapshot.exists()) {
        const data: DailyLog = snapshot.val();
        // Restore icons
        const restoredCategories = data.tasks.map((cat, index) => ({
          ...cat,
          icon: initialCategories[index].icon,
        }));
        setCategories(restoredCategories);
        setDailyNotes(data.notes || "");
      } else {
        setCategories(initialCategories);
        setDailyNotes("");
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveDailyData = async () => {
    try {
      setIsSaving(true);
      const logRef = ref(database, `logs/${currentDate}`);

      // Remove icon property before saving
      const dataToSave = {
        tasks: categories.map((cat) => {
          const { icon, ...rest } = cat;
          return rest;
        }),
        notes: dailyNotes,
        timestamp: Date.now(),
        progress: progress,
      };

      await set(logRef, dataToSave);
      setLastSaved(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving data:", error);
      setIsSaving(false);
    }
  };

  const loadWeeklyReport = async () => {
    if (!startDate || !endDate) return;

    try {
      const logsRef = ref(database, "logs");
      const weekQuery = query(
        logsRef,
        orderByKey(),
        startAt(startDate),
        endAt(endDate)
      );
      const snapshot = await get(weekQuery);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const weeklyArray: WeeklyData[] = Object.keys(data).map((date) => ({
          date,
          progress: data[date].progress || 0,
          notes: data[date].notes || "Tidak ada catatan",
        }));

        setWeeklyData(weeklyArray);

        const avgProgress =
          weeklyArray.reduce((sum, day) => sum + day.progress, 0) /
          weeklyArray.length;
        setWeeklyAverage(Math.round(avgProgress));
      } else {
        setWeeklyData([]);
        setWeeklyAverage(0);
      }
    } catch (error) {
      console.error("Error loading weekly report:", error);
    }
  };

  // ========================================
  // UI HANDLERS
  // ========================================
  const toggleCategory = (categoryId: number): void => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isOpen: !cat.isOpen } : cat
      )
    );
  };

  const toggleTask = (categoryId: number, taskId: number): void => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            tasks: cat.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          };
        }
        return cat;
      })
    );
  };

  const resetAll = (): void => {
    const resetCategories: Category[] = initialCategories.map((cat) => ({
      ...cat,
      isOpen: false,
      tasks: cat.tasks.map((task) => ({ ...task, completed: false })),
    }));
    setCategories(resetCategories);
    setDailyNotes("");
  };

  const handlePrint = (): void => {
    window.print();
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-4 pb-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              GE-TOS-Dashboard
            </h1>
            <p className="text-white/80 text-sm">
              Complete Task & Report Management System
            </p>
          </div>
          <button
            onClick={resetAll}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-semibold">Reset</span>
          </button>
        </div>

        {/* Quick Access Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-lg ${link.color}`}
            >
              {link.icon}
              <span className="font-semibold text-sm flex-1">{link.title}</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "daily"
                ? "bg-white text-purple-600 shadow-lg"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Daily Tracker
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "weekly"
                ? "bg-white text-purple-600 shadow-lg"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Weekly Report
          </button>
        </div>

        {/* DAILY TRACKER TAB */}
        {activeTab === "daily" && (
          <>
            {/* Status Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/80 text-sm mb-1">
                    {new Date(currentDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {progress === 100
                      ? "Excellent! All Tasks Done 🎉"
                      : "In Progress"}
                  </h2>
                </div>
                <div
                  className={`${
                    progress === 100 ? "bg-green-400/30" : "bg-blue-400/30"
                  } p-3 rounded-full`}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-white/90 text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-bold">
                    {completedTasks}/{totalTasks} Tasks ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Save Status */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/10">
              <p className="text-white/70 text-xs text-center flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Menyimpan ke Firebase...
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Tersimpan otomatis {lastSaved && `- ${lastSaved}`}
                  </>
                )}
              </p>
            </div>

            {/* Category Cards */}
            <div className="space-y-4 mb-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden"
                >
                  <div
                    onClick={() => toggleCategory(category.id)}
                    className="p-5 cursor-pointer hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`bg-gradient-to-br ${category.color} p-3 rounded-xl`}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {category.title}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {category.tasks.filter((t) => t.completed).length}/
                            {category.tasks.length} completed
                          </p>
                        </div>
                      </div>
                      {category.isOpen ? (
                        <ChevronDown className="w-6 h-6 text-white/70" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-white/70" />
                      )}
                    </div>
                  </div>

                  {category.isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      {category.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(category.id, task.id)}
                              className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-teal-500 checked:border-teal-500 cursor-pointer transition-all duration-300"
                            />
                            <span
                              className={`text-white leading-relaxed flex-1 transition-all duration-300 ${
                                task.completed
                                  ? "line-through opacity-50"
                                  : "opacity-100"
                              }`}
                            >
                              {task.text}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Daily Notes Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">
                  Catatan Supervisi / Temuan Hari Ini
                </h3>
              </div>
              <textarea
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder="Tulis catatan kendala, temuan penting, atau laporan manual di sini..."
                className="w-full h-40 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
              <p className="text-white/60 text-xs mt-2">
                Catatan otomatis tersimpan ke Firebase
              </p>
            </div>
          </>
        )}

        {/* WEEKLY REPORT TAB */}
        {activeTab === "weekly" && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Pilih Rentang Tanggal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>
              <button
                onClick={loadWeeklyReport}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Generate Laporan
              </button>
            </div>

            {/* Weekly Summary */}
            {weeklyData.length > 0 && (
              <>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Ringkasan Kinerja Mingguan
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-white/70 text-sm mb-1">Total Hari</p>
                      <p className="text-3xl font-bold text-white">
                        {weeklyData.length}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-white/70 text-sm mb-1">
                        Rata-rata Progress
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {weeklyAverage}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weekly Table */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Rincian Harian
                    </h3>
                    <button
                      onClick={handlePrint}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                    >
                      <Printer className="w-4 h-4" />
                      Print Report
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/80 py-3 px-4">
                            Tanggal
                          </th>
                          <th className="text-left text-white/80 py-3 px-4">
                            Progress
                          </th>
                          <th className="text-left text-white/80 py-3 px-4">
                            Catatan Supervisi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyData.map((day, index) => (
                          <tr
                            key={index}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="text-white py-3 px-4">
                              {new Date(day.date).toLocaleDateString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="text-white py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-white/20 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-teal-400 h-full rounded-full"
                                    style={{ width: `${day.progress}%` }}
                                  />
                                </div>
                                <span className="font-semibold">
                                  {day.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="text-white/80 py-3 px-4 text-sm max-w-md truncate">
                              {day.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}