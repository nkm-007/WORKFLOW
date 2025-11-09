// "use client";

// import React, { useState, useEffect } from "react";
// import { Plus, Check, Calendar, Sprout, Instagram } from "lucide-react";

// const MicrogreensTracker = () => {
//   const [activeGrowers, setActiveGrowers] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newGrower, setNewGrower] = useState({
//     name: "",
//     variety: "",
//     startDay: 0,
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [shouldVibrate, setShouldVibrate] = useState(false);
//   const [hasVibrated, setHasVibrated] = useState(false);

//   // Load data on mount and check Instagram day ONCE
//   useEffect(() => {
//     loadData();
//     checkInstagramDay();
//   }, []);

//   // Check if today is Instagram posting day
//   const checkInstagramDay = () => {
//     const today = new Date();
//     const dayOfWeek = today.getDay();

//     // Monday=1, Wednesday=3, Saturday=6
//     if ([1, 3, 6].includes(dayOfWeek)) {
//       setShouldVibrate(true);
//       vibrateInstagramSection();
//     }
//   };

//   const vibrateInstagramSection = () => {
//     if ("vibrate" in navigator) {
//       // Vibrate for 5 seconds (5000ms)
//       navigator.vibrate(5000);
//     }

//     // Stop vibrating and animation after 5 seconds
//     setTimeout(() => {
//       setShouldVibrate(false);
//       if ("vibrate" in navigator) {
//         navigator.vibrate(0); // Explicitly stop vibration
//       }
//     }, 5000);
//   };

//   // Check for notifications daily
//   useEffect(() => {
//     const checkNotifications = () => {
//       const today = new Date();
//       const dayOfWeek = today.getDay();

//       // Check for Instagram post days
//       if ([1, 3, 6].includes(dayOfWeek)) {
//         showInstagramNotification();
//       }

//       // Check seed notifications
//       activeGrowers.forEach((grower) => {
//         const daysSince = calculateDaysSince(grower.startDate, grower.startDay);
//         if (daysSince >= 10) {
//           showSeedNotification(grower, daysSince);
//         }
//       });
//     };

//     // Request notification permission on mount
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission();
//     }

//     checkNotifications();
//     const interval = setInterval(checkNotifications, 24 * 60 * 60 * 1000);

//     return () => clearInterval(interval);
//   }, [activeGrowers]);

//   const loadData = async () => {
//     try {
//       const response = await fetch("/api/growers");
//       if (response.ok) {
//         const data = await response.json();
//         setActiveGrowers(data.growers || []);
//       }
//     } catch (error) {
//       console.error("Error loading data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveData = async (data) => {
//     try {
//       await fetch("/api/growers", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ growers: data }),
//       });
//     } catch (error) {
//       console.error("Error saving data:", error);
//     }
//   };

//   const calculateDaysSince = (startDate, startDay = 0) => {
//     const start = new Date(startDate);
//     const today = new Date();
//     const diff = today - start;
//     const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));
//     return startDay + daysPassed;
//   };

//   const showInstagramNotification = () => {
//     if (Notification.permission === "granted") {
//       new Notification("Instagram Post Reminder", {
//         body: "Time to add a post on Instagram for your microgreens business!",
//         icon: "🌱",
//       });
//     }
//   };

//   const showSeedNotification = (grower, days) => {
//     if (Notification.permission === "granted") {
//       new Notification(`Day ${days} Alert - ${grower.name}`, {
//         body: `${grower.name}'s ${grower.variety} microgreens are on day ${days}. Ready to harvest!`,
//         icon: "🌱",
//       });
//     }
//   };

//   const addGrower = async () => {
//     if (!newGrower.name || !newGrower.variety) return;

//     const grower = {
//       id: Date.now(),
//       name: newGrower.name,
//       variety: newGrower.variety,
//       startDate: new Date().toISOString(),
//       startDay: parseInt(newGrower.startDay) || 0,
//     };

//     const updated = [...activeGrowers, grower];
//     setActiveGrowers(updated);
//     await saveData(updated);
//     setNewGrower({ name: "", variety: "", startDay: 0 });
//     setShowAddForm(false);
//   };

//   const finishGrowing = async (id) => {
//     try {
//       // Delete from database
//       await fetch("/api/growers", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });

//       // Update UI
//       const updated = activeGrowers.filter((g) => g.id !== id);
//       setActiveGrowers(updated);
//     } catch (error) {
//       console.error("Error finishing grower:", error);
//     }
//   };

//   const getNotificationStatus = (days) => {
//     if (days < 10)
//       return { color: "bg-green-100 text-green-800", text: "Growing" };
//     if (days === 10)
//       return { color: "bg-yellow-100 text-yellow-800", text: "Ready Today!" };
//     return { color: "bg-red-100 text-red-800", text: "Overdue" };
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
//         <div className="text-center">
//           <Sprout className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
//           <p className="text-xl text-gray-600">Loading your microgreens...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Sprout className="w-10 h-10 text-green-600" />
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">
//                   Microgreens Tracker
//                 </h1>
//                 <p className="text-gray-600">
//                   Manage your growing cycles & notifications
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowAddForm(true)}
//               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Add Seed Planting
//             </button>
//           </div>
//         </div>

//         {/* Add Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
//               <h2 className="text-2xl font-bold mb-6 text-gray-800">
//                 Add New Planting
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Grower Name
//                   </label>
//                   <input
//                     type="text"
//                     value={newGrower.name}
//                     onChange={(e) =>
//                       setNewGrower({ ...newGrower, name: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="Enter name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Microgreen Variety
//                   </label>
//                   <input
//                     type="text"
//                     value={newGrower.variety}
//                     onChange={(e) =>
//                       setNewGrower({ ...newGrower, variety: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="e.g., Sunflower, Pea Shoots"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Starting Day (if seeds already planted)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="20"
//                     value={newGrower.startDay}
//                     onChange={(e) =>
//                       setNewGrower({ ...newGrower, startDay: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                     placeholder="Enter 0 for today, 1 if planted yesterday, etc."
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Enter 0 if planting today. Enter 1 if you planted yesterday,
//                     etc.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={addGrower}
//                   className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Add Planting
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAddForm(false);
//                     setNewGrower({ name: "", variety: "", startDay: 0 });
//                   }}
//                   className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Instagram Reminder - Vibrates on Mon/Wed/Sat */}
//         <div
//           className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 mb-6 text-white transition-all duration-300 ${
//             shouldVibrate ? "animate-pulse ring-4 ring-yellow-400" : ""
//           }`}
//           style={{
//             animation: shouldVibrate
//               ? "shake 0.5s ease-in-out infinite"
//               : "none",
//           }}
//         >
//           <div className="flex items-center gap-3">
//             <Instagram className="w-8 h-8" />
//             <div>
//               <h3 className="text-xl font-bold">
//                 {shouldVibrate
//                   ? "🔔 POST TODAY! 🔔"
//                   : "Instagram Post Schedule"}
//               </h3>
//               <p className="text-purple-100">
//                 {shouldVibrate
//                   ? "Don't forget to post on Instagram TODAY!"
//                   : "Post on: Monday, Wednesday & Saturday"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Summary Dashboard */}
//         <div className="bg-white rounded-2xl shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//             <Calendar className="w-6 h-6 text-green-600" />
//             Active Growing Cycles
//           </h2>

//           {activeGrowers.length === 0 ? (
//             <div className="text-center py-12">
//               <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg">
//                 No active plantings. Add your first one!
//               </p>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {activeGrowers.map((grower) => {
//                 const daysSince = calculateDaysSince(
//                   grower.startDate,
//                   grower.startDay
//                 );
//                 const status = getNotificationStatus(daysSince);

//                 return (
//                   <div
//                     key={grower.id}
//                     className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="text-xl font-bold text-gray-800">
//                             {grower.name}
//                           </h3>
//                           <span
//                             className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
//                           >
//                             {status.text}
//                           </span>
//                         </div>
//                         <p>
//                           <strong>Creation Date:</strong>{" "}
//                           {new Date(grower.startDate).toLocaleDateString()}
//                         </p>
//                         <div className="space-y-1 text-gray-600">
//                           <p>
//                             <strong>Variety:</strong> {grower.variety}
//                           </p>

//                           {grower.startDay > 0 && (
//                             <p className="text-sm text-blue-600">
//                               (Added on day {grower.startDay})
//                             </p>
//                           )}
//                           <p className="text-lg font-semibold text-green-700">
//                             Day {daysSince} of growing
//                           </p>
//                           {daysSince >= 10 && (
//                             <p className="text-red-600 font-medium">
//                               ⚠️ Notifications being sent daily!
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => finishGrowing(grower.id)}
//                         className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                       >
//                         <Check className="w-5 h-5" />
//                         Finish
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Info Footer */}
//         <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
//           <p className="font-semibold mb-2">📱 How it works:</p>
//           <ul className="space-y-1 ml-4">
//             <li>• Notifications are automatically enabled</li>
//             <li>
//               • Add plantings when seeds are sown (or specify the day if already
//               planted)
//             </li>
//             <li>• After day 10, daily notifications will remind you</li>
//             <li>• Click "Finish" when harvested</li>
//             <li>
//               • Instagram section vibrates & highlights on Monday, Wednesday &
//               Saturday
//             </li>
//           </ul>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes shake {
//           0%,
//           100% {
//             transform: translateX(0);
//           }
//           10%,
//           30%,
//           50%,
//           70%,
//           90% {
//             transform: translateX(-5px);
//           }
//           20%,
//           40%,
//           60%,
//           80% {
//             transform: translateX(5px);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MicrogreensTracker;
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Calendar,
  Sprout,
  Instagram,
  RotateCcw,
  Trash2,
  Edit2,
  MoreVertical,
  X,
} from "lucide-react";

const MicrogreensTracker = () => {
  const [activeGrowers, setActiveGrowers] = useState([]);
  const [finishedGrowers, setFinishedGrowers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingGrower, setEditingGrower] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showFinishedMenu, setShowFinishedMenu] = useState(null);
  const [newGrower, setNewGrower] = useState({
    name: "",
    variety: "",
    startDay: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [shouldVibrate, setShouldVibrate] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);

  useEffect(() => {
    loadData();
    checkInstagramDay();
  }, []);

  const checkInstagramDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    if ([1, 3, 6].includes(dayOfWeek) && !hasVibrated) {
      setShouldVibrate(true);
      vibrateInstagramSection();
      setHasVibrated(true);
    }
  };

  const vibrateInstagramSection = () => {
    if ("vibrate" in navigator) {
      const pattern = [];
      for (let i = 0; i < 17; i++) {
        pattern.push(200);
        if (i < 16) pattern.push(100);
      }
      navigator.vibrate(pattern);
    }
  };

  const loadData = async () => {
    try {
      const response = await fetch("/api/growers");
      if (response.ok) {
        const data = await response.json();
        setActiveGrowers(data.active || []);
        setFinishedGrowers(data.finished || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (active, finished) => {
    try {
      await fetch("/api/growers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active, finished }),
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
    await saveData(updated, finishedGrowers);
    setNewGrower({ name: "", variety: "", startDay: 0 });
    setShowAddForm(false);
  };

  const openEditForm = (grower) => {
    setEditingGrower({
      ...grower,
      editName: grower.name,
      editVariety: grower.variety,
      editStartDay: grower.startDay,
    });
    setShowEditForm(true);
  };

  const saveEdit = async () => {
    if (!editingGrower.editName || !editingGrower.editVariety) return;

    const updatedGrowers = activeGrowers.map((g) =>
      g.id === editingGrower.id
        ? {
            ...g,
            name: editingGrower.editName,
            variety: editingGrower.editVariety,
            startDay: parseInt(editingGrower.editStartDay) || 0,
          }
        : g
    );

    setActiveGrowers(updatedGrowers);
    await saveData(updatedGrowers, finishedGrowers);
    setShowEditForm(false);
    setEditingGrower(null);
  };

  const confirmFinish = (grower) => {
    setConfirmAction({
      type: "finish",
      grower: grower,
      message: `Are you sure you want to mark "${grower.name}'s ${grower.variety}" as finished?`,
    });
    setShowConfirmDialog(true);
  };

  const confirmRestore = (grower) => {
    setShowFinishedMenu(null);
    setConfirmAction({
      type: "restore",
      grower: grower,
      message: `Do you want to restore "${grower.name}'s ${grower.variety}" back to Active Cycles?`,
    });
    setShowConfirmDialog(true);
  };

  const confirmDelete = (grower) => {
    setShowFinishedMenu(null);
    setConfirmAction({
      type: "delete",
      grower: grower,
      message: `Are you sure you want to permanently delete "${grower.name}'s ${grower.variety}"? This cannot be undone.`,
    });
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (confirmAction.type === "finish") {
      await finishGrowing(confirmAction.grower);
    } else if (confirmAction.type === "restore") {
      await restoreGrowing(confirmAction.grower);
    } else if (confirmAction.type === "delete") {
      await deleteGrowing(confirmAction.grower);
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const finishGrowing = async (grower) => {
    const finishedGrower = {
      ...grower,
      finishedDate: new Date().toISOString(),
      totalDays: calculateDaysSince(grower.startDate, grower.startDay),
    };

    const updatedActive = activeGrowers.filter((g) => g.id !== grower.id);
    const updatedFinished = [finishedGrower, ...finishedGrowers].slice(0, 5);

    setActiveGrowers(updatedActive);
    setFinishedGrowers(updatedFinished);
    await saveData(updatedActive, updatedFinished);
  };

  const restoreGrowing = async (grower) => {
    const restoredGrower = {
      id: grower.id,
      name: grower.name,
      variety: grower.variety,
      startDate: grower.startDate,
      startDay: grower.startDay,
    };

    const updatedFinished = finishedGrowers.filter((g) => g.id !== grower.id);
    const updatedActive = [...activeGrowers, restoredGrower];

    setFinishedGrowers(updatedFinished);
    setActiveGrowers(updatedActive);
    await saveData(updatedActive, updatedFinished);
  };

  const deleteGrowing = async (grower) => {
    const updatedFinished = finishedGrowers.filter((g) => g.id !== grower.id);
    setFinishedGrowers(updatedFinished);
    await saveData(activeGrowers, updatedFinished);
  };

  const getNotificationStatus = (days) => {
    if (days < 10)
      return { color: "bg-green-100 text-green-800", text: "Growing" };
    if (days === 10)
      return { color: "bg-yellow-100 text-yellow-800", text: "Ready Today!" };
    return { color: "bg-red-100 text-red-800", text: "Overdue" };
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sprout className="w-8 md:w-10 h-8 md:h-10 text-green-600 flex-shrink-0" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Microgreens Tracker
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Manage your growing cycles
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Seed Planting
            </button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
                Confirm Action
              </h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                {confirmAction?.message}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Yes, Confirm
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
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
                    placeholder="Enter 0 for today"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 0 if planting today. Enter 1 if planted yesterday,
                    etc.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

        {/* Edit Form Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
                Edit Planting
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grower Name
                  </label>
                  <input
                    type="text"
                    value={editingGrower.editName}
                    onChange={(e) =>
                      setEditingGrower({
                        ...editingGrower,
                        editName: e.target.value,
                      })
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
                    value={editingGrower.editVariety}
                    onChange={(e) =>
                      setEditingGrower({
                        ...editingGrower,
                        editVariety: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Sunflower, Pea Shoots"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Day
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editingGrower.editStartDay}
                    onChange={(e) =>
                      setEditingGrower({
                        ...editingGrower,
                        editStartDay: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Adjust if needed. Started date remains unchanged.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Started:</strong>{" "}
                    {formatDateTime(editingGrower.startDate)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    This date cannot be changed
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingGrower(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Reminder */}
        <div
          className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 text-white transition-all duration-300 ${
            shouldVibrate ? "animate-pulse ring-4 ring-yellow-400" : ""
          }`}
          style={{
            animation: shouldVibrate
              ? "shake 0.5s ease-in-out infinite"
              : "none",
          }}
        >
          <div className="flex items-center gap-3">
            <Instagram className="w-6 md:w-8 h-6 md:h-8 flex-shrink-0" />
            <div>
              <h3 className="text-lg md:text-xl font-bold">
                {shouldVibrate
                  ? "🔔 POST TODAY! 🔔"
                  : "Instagram Post Schedule"}
              </h3>
              <p className="text-sm md:text-base text-purple-100">
                {shouldVibrate
                  ? "Don't forget to post on Instagram TODAY!"
                  : "Post on: Monday, Wednesday & Saturday"}
              </p>
            </div>
          </div>
        </div>

        {/* Active Growing Cycles */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
            Active Growing Cycles
          </h2>

          {activeGrowers.length === 0 ? (
            <div className="text-center py-12">
              <Sprout className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base md:text-lg">
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
                    className="border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg md:text-xl font-bold text-gray-800">
                            {grower.name}
                          </h3>
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm md:text-base text-gray-600">
                          <p>
                            <strong>Variety:</strong> {grower.variety}
                          </p>
                          <p>
                            <strong>Started:</strong>{" "}
                            {formatDateTime(grower.startDate)}
                          </p>
                          {grower.startDay > 0 && (
                            <p className="text-xs md:text-sm text-blue-600">
                              (Added on day {grower.startDay})
                            </p>
                          )}
                          <p className="text-base md:text-lg font-semibold text-green-700">
                            Day {daysSince} of growing
                          </p>
                          {daysSince >= 10 && (
                            <p className="text-red-600 font-medium text-xs md:text-sm">
                              ⚠️ Ready to harvest!
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => openEditForm(grower)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="sm:hidden md:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => confirmFinish(grower)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                        >
                          <Check className="w-4 h-4" />
                          <span className="sm:hidden md:inline">Finish</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Finished Cycles */}
        {finishedGrowers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
              <Check className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
              Finished Cycles (Last 5)
            </h2>

            <div className="grid gap-4">
              {finishedGrowers.map((grower) => (
                <div
                  key={grower.id}
                  className="border border-blue-200 bg-blue-50 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                          {grower.name}
                        </h3>
                        <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          Completed
                        </span>
                      </div>
                      <div className="space-y-1 text-sm md:text-base text-gray-600">
                        <p className="truncate">
                          <strong>Variety:</strong> {grower.variety}
                        </p>
                        <p className="text-xs md:text-sm">
                          <strong>Started:</strong>{" "}
                          {formatDateTime(grower.startDate)}
                        </p>
                        <p className="text-xs md:text-sm">
                          <strong>Finished:</strong>{" "}
                          {formatDateTime(grower.finishedDate)}
                        </p>
                        <p className="text-base md:text-lg font-semibold text-blue-700">
                          Total: {grower.totalDays} days
                        </p>
                      </div>
                    </div>

                    {/* Mobile: Three dots menu */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowFinishedMenu(
                            showFinishedMenu === grower.id ? null : grower.id
                          )
                        }
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {showFinishedMenu === grower.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowFinishedMenu(null)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <button
                              onClick={() => confirmRestore(grower)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm"
                            >
                              <RotateCcw className="w-4 h-4 text-blue-600" />
                              <span>Restore to Active</span>
                            </button>
                            <button
                              onClick={() => confirmDelete(grower)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left text-sm text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 md:mt-6 bg-blue-50 rounded-xl p-4 text-xs md:text-sm text-blue-800">
          <p className="font-semibold mb-2">📱 How it works:</p>
          <ul className="space-y-1 ml-4">
            <li>• Add plantings when seeds are sown</li>
            <li>• Click "Edit" to update name, variety, or starting day</li>
            <li>• Click "Finish" to complete a cycle (saves timestamp)</li>
            <li>
              • Use three-dot menu in finished cycles to restore or delete
            </li>
            <li>• Only last 5 finished cycles are kept</li>
            <li>• Instagram reminder on Monday, Wednesday & Saturday</li>
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
