"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchTransaction } from "@/functions/user";

export default function TransactionLog() {
  const [transactions, setTransactions] = useState<{
    id: string | null,
    price: string,
    orderId: string,
    coin: string,
    walletAddress: string,
    userId: string,
    merchantID: string,
    amount: number,
    status: string,
    createdAt: Date,
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch transactions from the server

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    setShowDetails(false);
    try {
      const response = await searchTransaction(searchQuery);

      if (response) {
        setTransactions({
          id: response.id ?? null,
          price: response.price ?? "",
          orderId: response.orderId ?? "",
          coin: response.coin ?? "",
          walletAddress: response.walletAddress ?? "",
          userId: response.userId ?? "",
          merchantID: response.merchantID ?? "",
          amount: typeof response.amount === "number" ? response.amount : Number(response.amount) || 0,
          status: response.status ?? "",
          createdAt: response.createdAt ? new Date(response.createdAt) : new Date(),
        });
      } else {
        setTransactions(null);
      }
    } catch (error) {
      console.error("Error searching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Transaction Logs</h1>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by user or transaction ID"
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

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full light:bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead>
            <tr className="dark:bg-gray-700 light:bg-gray-100">
              <th className="p-4 text-left">Transaction ID</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions ? (
              <tr key={transactions.id}>
                <td className="p-4 border-b">{transactions.id}</td>
                <td className="p-4 border-b">{transactions.coin}</td>
                <td className="p-4 border-b">{transactions.amount}</td>
                <td className="p-4 border-b">{transactions.price}</td>
                <td className="p-4 border-b">
                  <span
                    className={`px-2 py-1 rounded-md text-white ${
                      transactions.status === "completed"
                        ? "bg-green-500"
                        : transactions.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {transactions.status}
                  </span>
                </td>
                <td className="p-4 border-b">
                  {new Date(transactions.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 border-b">
                  <Button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => setShowDetails(true)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        {transactions ? (
          <div className="border rounded-lg shadow-md p-4 mb-4 light:bg-white">
            <div className="mb-2">
              <span className="font-semibold">Transaction ID:</span> {transactions.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">User:</span> {transactions.coin}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Amount:</span> {transactions.amount}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Price:</span> {transactions.price}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded-md text-white ${
                  transactions.status === "completed"
                    ? "bg-green-500"
                    : transactions.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {transactions.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(transactions.createdAt).toLocaleDateString()}
            </div>
            <Button
              className="bg-blue-500 text-white w-full mt-2"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500">No transactions found</div>
        )}
      </div>

      {/* Details Modal/Section */}
      {showDetails && transactions && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="dark:bg-gray-700 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 dark:text-gray-500 hover:text-gray-700"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
            <div className="mb-2">
              <span className="font-semibold">Transaction ID:</span> {transactions.id}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Order ID:</span> {transactions.orderId}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Coin:</span> {transactions.coin}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Wallet Address:</span> {transactions.walletAddress}
            </div>
            <div className="mb-2">
              <span className="font-semibold">User ID:</span> {transactions.userId}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Merchant ID:</span> {transactions.merchantID}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Amount:</span> {transactions.amount}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Price:</span> {transactions.price}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded-md text-white ${
                  transactions.status === "completed"
                    ? "bg-green-500"
                    : transactions.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              >
                {transactions.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Date:</span>{" "}
              {new Date(transactions.createdAt).toLocaleString()}
            </div>
            <Button
              className="bg-blue-500 text-white w-full mt-4"
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}