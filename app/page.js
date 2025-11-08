"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Calendar, Sprout, Instagram } from "lucide-react";

const MicrogreensTracker = () => {
  const [activeGrowers, setActiveGrowers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrower, setNewGrower] = useState({
    name: "",
    variety: "",
    startDay: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [shouldVibrate, setShouldVibrate] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);

  // Load data on mount and check Instagram day ONCE
  useEffect(() => {
    loadData();
    checkInstagramDay();
  }, []);

  // Check if today is Instagram posting day
  const checkInstagramDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Monday=1, Wednesday=3, Saturday=6
    if ([1, 3, 6].includes(dayOfWeek)) {
      setShouldVibrate(true);
      vibrateInstagramSection();
    }
  };

  const vibrateInstagramSection = () => {
    if ("vibrate" in navigator) {
      // Vibrate for 5 seconds (5000ms)
      navigator.vibrate(5000);
    }

    // Stop vibrating and animation after 5 seconds
    setTimeout(() => {
      setShouldVibrate(false);
      if ("vibrate" in navigator) {
        navigator.vibrate(0); // Explicitly stop vibration
      }
    }, 5000);
  };

  // Check for notifications daily
  useEffect(() => {
    const checkNotifications = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Check for Instagram post days
      if ([1, 3, 6].includes(dayOfWeek)) {
        showInstagramNotification();
      }

      // Check seed notifications
      activeGrowers.forEach((grower) => {
        const daysSince = calculateDaysSince(grower.startDate, grower.startDay);
        if (daysSince >= 10) {
          showSeedNotification(grower, daysSince);
        }
      });
    };

    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    checkNotifications();
    const interval = setInterval(checkNotifications, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeGrowers]);

  const loadData = async () => {
    try {
      const response = await fetch("/api/growers");
      if (response.ok) {
        const data = await response.json();
        setActiveGrowers(data.growers || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data) => {
    try {
      await fetch("/api/growers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ growers: data }),
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const calculateDaysSince = (startDate, startDay = 0) => {
    const start = new Date(startDate);
    const today = new Date();
    const diff = today - start;
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));
    return startDay + daysPassed;
  };

  const showInstagramNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Instagram Post Reminder", {
        body: "Time to add a post on Instagram for your microgreens business!",
        icon: "🌱",
      });
    }
  };

  const showSeedNotification = (grower, days) => {
    if (Notification.permission === "granted") {
      new Notification(`Day ${days} Alert - ${grower.name}`, {
        body: `${grower.name}'s ${grower.variety} microgreens are on day ${days}. Ready to harvest!`,
        icon: "🌱",
      });
    }
  };

  const addGrower = async () => {
    if (!newGrower.name || !newGrower.variety) return;

    const grower = {
      id: Date.now(),
      name: newGrower.name,
      variety: newGrower.variety,
      startDate: new Date().toISOString(),
      startDay: parseInt(newGrower.startDay) || 0,
    };

    const updated = [...activeGrowers, grower];
    setActiveGrowers(updated);
    await saveData(updated);
    setNewGrower({ name: "", variety: "", startDay: 0 });
    setShowAddForm(false);
  };

  const finishGrowing = async (id) => {
    try {
      // Delete from database
      await fetch("/api/growers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      // Update UI
      const updated = activeGrowers.filter((g) => g.id !== id);
      setActiveGrowers(updated);
    } catch (error) {
      console.error("Error finishing grower:", error);
    }
  };

  const getNotificationStatus = (days) => {
    if (days < 10)
      return { color: "bg-green-100 text-green-800", text: "Growing" };
    if (days === 10)
      return { color: "bg-yellow-100 text-yellow-800", text: "Ready Today!" };
    return { color: "bg-red-100 text-red-800", text: "Overdue" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading your microgreens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="w-10 h-10 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Microgreens Tracker
                </h1>
                <p className="text-gray-600">
                  Manage your growing cycles & notifications
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Seed Planting
            </button>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Add New Planting
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grower Name
                  </label>
                  <input
                    type="text"
                    value={newGrower.name}
                    onChange={(e) =>
                      setNewGrower({ ...newGrower, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Microgreen Variety
                  </label>
                  <input
                    type="text"
                    value={newGrower.variety}
                    onChange={(e) =>
                      setNewGrower({ ...newGrower, variety: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Sunflower, Pea Shoots"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Day (if seeds already planted)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={newGrower.startDay}
                    onChange={(e) =>
                      setNewGrower({ ...newGrower, startDay: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 0 for today, 1 if planted yesterday, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 0 if planting today. Enter 1 if you planted yesterday,
                    etc.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={addGrower}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Planting
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewGrower({ name: "", variety: "", startDay: 0 });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Reminder - Vibrates on Mon/Wed/Sat */}
        <div
          className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 text-white transition-all duration-300 ${
            shouldVibrate ? "animate-pulse ring-4 ring-yellow-400" : ""
          }`}
          style={{
            animation: shouldVibrate
              ? "shake 0.5s ease-in-out infinite"
              : "none",
          }}
        >
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">
                {shouldVibrate
                  ? "🔔 POST TODAY! 🔔"
                  : "Instagram Post Schedule"}
              </h3>
              <p className="text-purple-100">
                {shouldVibrate
                  ? "Don't forget to post on Instagram TODAY!"
                  : "Post on: Monday, Wednesday & Saturday"}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Active Growing Cycles
          </h2>

          {activeGrowers.length === 0 ? (
            <div className="text-center py-12">
              <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No active plantings. Add your first one!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeGrowers.map((grower) => {
                const daysSince = calculateDaysSince(
                  grower.startDate,
                  grower.startDay
                );
                const status = getNotificationStatus(daysSince);

                return (
                  <div
                    key={grower.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {grower.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </div>
                        <p>
                          <strong>Creation Date:</strong>{" "}
                          {new Date(grower.startDate).toLocaleDateString()}
                        </p>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <strong>Variety:</strong> {grower.variety}
                          </p>

                          {grower.startDay > 0 && (
                            <p className="text-sm text-blue-600">
                              (Added on day {grower.startDay})
                            </p>
                          )}
                          <p className="text-lg font-semibold text-green-700">
                            Day {daysSince} of growing
                          </p>
                          {daysSince >= 10 && (
                            <p className="text-red-600 font-medium">
                              ⚠️ Notifications being sent daily!
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => finishGrowing(grower.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        Finish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">📱 How it works:</p>
          <ul className="space-y-1 ml-4">
            <li>• Notifications are automatically enabled</li>
            <li>
              • Add plantings when seeds are sown (or specify the day if already
              planted)
            </li>
            <li>• After day 10, daily notifications will remind you</li>
            <li>• Click "Finish" when harvested</li>
            <li>
              • Instagram section vibrates & highlights on Monday, Wednesday &
              Saturday
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default MicrogreensTracker;
