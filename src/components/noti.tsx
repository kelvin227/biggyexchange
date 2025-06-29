"use client";
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    read: boolean;
}

export default function NotificationPage({ notification }: { notification: Notification[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(notification);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  useEffect(() => {
    // Here you could fetch notifications from your backend
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-7 h-7 text-blue-500" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No notifications yet.</div>
        ) : (
          notifications.map((noti) => (
            <div
              key={noti.id}
              className={`border rounded-lg p-4 shadow transition-all ${
                noti.read ? "bg-gray-100" : "bg-blue-50 border-blue-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{noti.title}</span>
                {!noti.read && (
                  <button
                    className="text-xs text-blue-600 underline"
                    onClick={() => markAsRead(noti.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <div className="text-gray-700 mb-2">{noti.message}</div>
              <div className="text-xs text-gray-400">{noti.date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}