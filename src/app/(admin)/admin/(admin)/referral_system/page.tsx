"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign } from "lucide-react";

export default function ReferralStats() {
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRewards: 0,
  });

  // Fetch referral stats from the server
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const response = await fetch("/api/admin/referral-stats");
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch referral stats");
  //       }
  //       const data = await response.json();
  //       setStats(data);
  //     } catch (error) {
  //       console.error("Error fetching referral stats:", error);
  //     }
  //   };

  //   fetchStats();
  // }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Community Referral Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Referrals */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Users className="w-6 h-6" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-700">{stats.totalReferrals}</p>
          </CardContent>
        </Card>

        {/* Active Referrals */}
        <Card className="bg-green-50 border border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-6 h-6" />
              Active Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{stats.activeReferrals}</p>
          </CardContent>
        </Card>

        {/* Total Rewards Distributed */}
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <DollarSign className="w-6 h-6" />
              Total Rewards Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">${stats.totalRewards}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
