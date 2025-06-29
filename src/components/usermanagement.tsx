"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blockuser, getUser, unblockuser } from "@/functions/user";

export default function UserManagementHolder() {
  const [userData, setUserData] = useState<{
    name: string | null;
    userName: string | null;
    email: string;
    roles: string | null;
    emailVerified: Date | null;
    phoneNo: string | null;
    image: string | null;
    referralCode: string | null;
    referredBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    isBlocked: boolean; // Added field to track if the user is blocked
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // Loading state for block/unblock actions

  // Handle search user
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await getUser(searchQuery);
      if (!response) {
        throw new Error("Failed to fetch user data");
      }
      const data = {
        ...response, 
        email: response.email || "", // Ensure email is present
        isBlocked: response.isBlocked || false, // Ensure isBlocked is present
        emailVerified: typeof response.emailVerified === "string" || typeof response.emailVerified === "number"
          ? new Date(response.emailVerified)
          : null, // Convert emailVerified to Date if valid
      };
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle block/unblock user
  const toggleBlockUser = async () => {
    if (!userData) return;

    setActionLoading(true);
    try {
      const response = await blockuser(userData.email); // Call the block/unblock function

      if (!response.success) {
        console.log(response.message)
      } 
      if(response.success){
        console.log(response.message)
      }
      // Update the user's block status locally
      setUserData((prev) => (prev ? { ...prev, isBlocked: !prev.isBlocked } : null));
    } catch (error) {
      console.error("Error updating user block status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleunblockUser = async () => {
    if (!userData) return;

    setActionLoading(true);
    try {
      const response = await unblockuser(userData.email); // Call the block/unblock function

      if (!response.success) {
        console.log(response.message)
      } 
      if(response.success){
        console.log(response.message)
      }
      // Update the user's block status locally
      setUserData((prev) => (prev ? { ...prev, isBlocked: !prev.isBlocked } : null));
    } catch (error) {
      console.error("Error updating user block status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">User Management</h1>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* User Data */}
      {userData ? (
        <Card className="light:bg-gray-50 border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold">User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone Number:</strong> {userData.phoneNo || "N/A"}
            </p>
            <p>
              <strong>Account Status:</strong>{" "}
              {userData.isBlocked ? (
                <span className="text-red-500 font-semibold">Blocked</span>
              ) : (
                <span className="text-green-500 font-semibold">Active</span>
              )}
            </p>
            <div className="mt-4">
              <Button
                onClick={userData.isBlocked ? toggleunblockUser : toggleBlockUser}
                className={`px-6 py-2 rounded-md ${
                  userData.isBlocked ? "bg-green-500" : "bg-red-500"
                } text-white`}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : userData.isBlocked
                  ? "Unblock User"
                  : "Block User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 text-center">
          {loading ? "Loading user data..." : "No user data available"}
        </p>
      )}
    </div>
  );
}
