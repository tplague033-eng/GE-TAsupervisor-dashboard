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
} from "lucide-react";

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

export default function SupervisorDailyTracker(): JSX.Element {
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

  // Load data from localStorage on mount
  const [categories, setCategories] = useState<Category[]>(() => {
    const savedData = localStorage.getItem("supervisorDailyTracker");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Re-add icons since they can't be serialized
        return parsed.map((cat: any, index: number) => ({
          ...cat,
          icon: initialCategories[index].icon,
        }));
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return initialCategories;
      }
    }
    return initialCategories;
  });

  const [progress, setProgress] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);

  // Save to localStorage whenever categories change
  useEffect(() => {
    try {
      // Remove icons before saving (they can't be serialized)
      const dataToSave = categories.map((cat) => ({
        ...cat,
        icon: null,
      }));
      localStorage.setItem(
        "supervisorDailyTracker",
        JSON.stringify(dataToSave)
      );
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [categories]);

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
    localStorage.removeItem("supervisorDailyTracker");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400 p-4 pb-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto pt-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Supervisor Daily Tracker
            </h1>
            <p className="text-white/80 text-sm">
              Track your daily responsibilities
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

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm mb-1">Daily Status</p>
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

          {/* Progress Bar */}
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

        {/* Storage Status Indicator */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/10">
          <p className="text-white/70 text-xs text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Data tersimpan otomatis di browser Anda
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-2xl mx-auto space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden"
          >
            {/* Category Header */}
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

            {/* Tasks List */}
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

      {/* Summary Footer */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/20 text-center">
          <p className="text-white/80 text-sm mb-2">
            {progress === 100
              ? "🎯 Semua tugas hari ini telah selesai! Kerja bagus!"
              : `💪 Tetap semangat! ${
                  totalTasks - completedTasks
                } tugas tersisa`}
          </p>
          <div className="flex justify-center gap-6 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
              <p className="text-white/70 text-xs">Completed</p>
            </div>
            <div className="border-l border-white/30"></div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {totalTasks - completedTasks}
              </p>
              <p className="text-white/70 text-xs">Remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
