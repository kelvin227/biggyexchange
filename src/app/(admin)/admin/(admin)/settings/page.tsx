"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    platformName: "Socio", // Read-only
    supportEmail: "support@socio.com", // Read-only
    enableKYC: true,
    enableNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  // Handle toggle switches
  const handleToggle = (name: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enableKYC: settings.enableKYC,
          enableNotifications: settings.enableNotifications,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const data = await response.json();
      toast.success(data.message || "Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Name (Read-Only) */}
        <div>
          <label htmlFor="platformName" className="block text-sm font-medium text-gray-700">
            Platform Name
          </label>
          <input
            id="platformName"
            name="platformName"
            type="text"
            value={settings.platformName}
            readOnly
            className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md cursor-not-allowed"
          />
        </div>

        {/* Support Email (Read-Only) */}
        <div>
          <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700">
            Support Email
          </label>
          <input
            id="supportEmail"
            name="supportEmail"
            type="email"
            value={settings.supportEmail}
            readOnly
            className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md cursor-not-allowed"
          />
        </div>

        {/* Enable KYC */}
        <div className="flex items-center justify-between">
          <label htmlFor="enableKYC" className="text-sm font-medium text-gray-700">
            Enable KYC
          </label>
          <Switch
            id="enableKYC"
            checked={settings.enableKYC}
            onCheckedChange={() => handleToggle("enableKYC")}
          />
        </div>

        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <label htmlFor="enableNotifications" className="text-sm font-medium text-gray-700">
            Enable Notifications
          </label>
          <Switch
            id="enableNotifications"
            checked={settings.enableNotifications}
            onCheckedChange={() => handleToggle("enableNotifications")}
          />
        </div>
        <label htmlFor="platformName" className="block text-sm font-medium text-gray-700">
           P2P Settings
          </label>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;