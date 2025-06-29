"use client"
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ethers } from "ethers";
import { gettransaction } from "@/functions/blockchain/wallet.utils";
import { getp2ptransaction } from "@/functions/user";

export const TransactionTable = ({ address, email }: { address: string, email: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]); // Wallet transactions
  const [p2pTransactions, setP2pTransactions] = useState<any[]>([]); // P2P transactions
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]); // Filtered wallet transactions
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [selection, setSelection] = useState<string>("wallet"); // Selection between wallet and P2P transactions
  const [selectedType, setSelectedType] = useState<string | null>(null); // Selected transaction type for filtering

  // Fetch wallet transactions
  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      const response = await gettransaction(address);
      if (response.status === "1") {
        console.log(response.result)
        const formattedData = response.result.map((tx: any) => ({
          id: tx.hash,
          date: new Date(tx.timeStamp * 1000).toLocaleDateString(),
          txType: tx.to === address.toLowerCase() ? "Deposit" : "Withdraw",
          asset: "USDT",
          amount: ethers.formatEther(tx.value),
        }));
        setTransactions(formattedData);
        setFilteredTransactions(formattedData);
      }
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch P2P transactions
  const fetchP2PTransactionData = async () => {
    try {
      setLoading(true);
      const response = await getp2ptransaction(address);
      if (response.success) {
        if (Array.isArray(response.message)) {
          setP2pTransactions(response.message);
        } else {
          console.error("Unexpected response format:", response.message);
          setP2pTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching P2P transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter wallet transactions by type
  const filterTransactions = (type: string | null) => {
    setSelectedType(type);
    if (type) {
      const filtered = transactions.filter((tx) => tx.txType === type);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactionData();
    fetchP2PTransactionData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>

      {/* Tabs for Wallet and P2P Transactions */}
      <div className="flex gap-4 border-b pb-2">
        <div
          className={`cursor-pointer ${selection === "wallet" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("wallet")}
        >
          Wallet
        </div>
        <div
          className={`cursor-pointer ${selection === "p2p" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("p2p")}
        >
          P2P
        </div>
      </div>

      {/* Dropdown Menu for Filtering Wallet Transactions */}
      {selection === "wallet" && (
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4">
            Filter by Transaction Type
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Transaction Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => filterTransactions(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => filterTransactions("Deposit")}>Deposit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => filterTransactions("Withdraw")}>Withdraw</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Transaction Table */}
      <div className="mt-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading transactions...</p>
        ) : selection === "wallet" ? (
          filteredTransactions.length > 0 ? (
            <TransactionTableContent transactions={filteredTransactions} />
          ) : (
            <p className="text-center text-gray-500">No wallet transactions found</p>
          )
        ) : p2pTransactions.length > 0 ? (
          <TransactionTableContent transactions={p2pTransactions} />
        ) : (
          <p className="text-center text-gray-500">No P2P transactions found</p>
        )}
      </div>
    </div>
  );
};

// Reusable Component for Transaction Table Content
const TransactionTableContent = ({ transactions }: { transactions: any[] }) => (
  <div>
    {/* Desktop Table */}
    <div className="hidden md:block">
      <table className="min-w-full light:bg-white border border-gray-300 rounded-xl shadow-lg">
        <thead>
          <tr className="dark:bg-gray-500 light:bg-gray-100">
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Transaction Type</th>
            <th className="p-4 text-left">Asset</th>
            <th className="p-4 text-left">Amount</th>
            <th className="p-4 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="p-4 border-b">{transaction.date}</td>
              <td className="p-4 border-b">{transaction.txType}</td>
              <td className="p-4 border-b">{transaction.asset}</td>
              <td className="p-4 border-b">{transaction.amount}</td>
              <td className="p-4 border-b">
                {transaction.txType === "Deposit" ? "USDT Deposit to Wallet" : "USDT Withdraw From Wallet"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="dark:bg-gray-500 light:bg-gray-100">
            <td colSpan={5} className="p-4 text-center">
              Total Transactions: {transactions.length}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    {/* Mobile View */}
    <div className="block md:hidden">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="border-b border-gray-300 py-4">
          <p>{transaction.txType === "Deposit" ? "USDT Deposit to Wallet" : "USDT Withdraw From Wallet"}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">{transaction.date}</div>
            <div className="col-span-1">{transaction.txType}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">{transaction.asset}</div>
            <div className="col-span-1">{transaction.amount}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
