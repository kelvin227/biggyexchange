"use client"
/* eslint-disable */
import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ethers } from "ethers";
import { gettransaction } from "@/functions/blockchain/wallet.utils";
import { getp2ptransaction } from "@/functions/user";

// Translation object
const translations = {
  En: {
    transactionHistory: "Transaction History",
    wallet: "Wallet",
    p2p: "P2P",
    filterByType: "Filter by Transaction Type",
    transactionTypes: "Transaction Types",
    all: "All",
    deposit: "Deposit",
    withdraw: "Withdraw",
    loading: "Loading transactions...",
    noWallet: "No wallet transactions found",
    noP2P: "No P2P transactions found",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    totalTransactions: "Total Transactions",
    date: "Date",
    txType: "Transaction Type",
    asset: "Asset",
    amount: "Amount",
    description: "Description",
    depositDesc: "USDT Deposit to Wallet",
    withdrawDesc: "USDT Withdraw From Wallet",
    sold: "Sold",
    purchased: "Purchased",
    to: "to",
    from: "from",
    // Add more as needed
  },
  Chi: {
    transactionHistory: "交易記錄",
    wallet: "錢包",
    p2p: "P2P",
    filterByType: "按交易類型篩選",
    transactionTypes: "交易類型",
    all: "全部",
    deposit: "存款",
    withdraw: "提現",
    loading: "正在加載交易...",
    noWallet: "未找到錢包交易",
    noP2P: "未找到P2P交易",
    previous: "上一頁",
    next: "下一頁",
    page: "頁",
    of: "共",
    totalTransactions: "交易總數",
    date: "日期",
    txType: "交易類型",
    asset: "資產",
    amount: "金額",
    description: "描述",
    depositDesc: "USDT存入錢包",
    withdrawDesc: "USDT從錢包提現",
    sold: "賣出",
    purchased: "買入",
    to: "給",
    from: "從",
    // Add more as needed
  }
};

export const TransactionTable = ({ address, email, id }: { address: string, email: string, id: string }) => {
  const [Lang, setLang] = useState<'En' | 'Chi'>('En');
  const [transactions, setTransactions] = useState<any[]>([]); // Wallet transactions
  const [p2pTransactions, setP2pTransactions] = useState<any[]>([]); // P2P transactions
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]); // Filtered wallet transactions
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [selection, setSelection] = useState<string>("wallet"); // Selection between wallet and P2P transactions

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Compute paginated transactions
  const paginatedTransactions =
    selection === "wallet"
      ? filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : p2pTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages =
    selection === "wallet"
      ? Math.ceil(filteredTransactions.length / itemsPerPage)
      : Math.ceil(p2pTransactions.length / itemsPerPage);

  // Reset to first page when selection/filter changes
  useEffect(() => {
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('userLanguage');
      if (storedValue && (storedValue === "En" || storedValue === "Chi")) {
        setLang(storedValue as "En" | "Chi");
      }
    }
  }, [selection, filteredTransactions, p2pTransactions]);

  // Fetch wallet transactions
  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      const response = await gettransaction(address);
      if (response.status === "1") {
        const formattedData = response.result.map((tx: any) => ({
          id: tx.hash,
          date: new Date(tx.timeStamp * 1000).toLocaleDateString(Lang === "Chi" ? "zh-CN" : "en-US"),
          txType: tx.to === address.toLowerCase() ? translations[Lang].deposit : translations[Lang].withdraw,
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
      const response = await getp2ptransaction(email);
      if (response.success) {
        if (Array.isArray(response.message)) {
          setP2pTransactions(response.message);
        } else {
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
    if (type) {
      const filtered = transactions.filter((tx) => tx.txType === translations[Lang][type.toLowerCase() as "deposit" | "withdraw"]);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactionData();
    fetchP2PTransactionData();
  }, [Lang]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{translations[Lang].transactionHistory}</h1>

      {/* Tabs for Wallet and P2P Transactions */}
      <div className="flex gap-4 border-b pb-2">
        <div
          className={`cursor-pointer ${selection === "wallet" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("wallet")}
        >
          {translations[Lang].wallet}
        </div>
        <div
          className={`cursor-pointer ${selection === "p2p" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("p2p")}
        >
          {translations[Lang].p2p}
        </div>
      </div>

      {/* Dropdown Menu for Filtering Wallet Transactions */}
      {selection === "wallet" && (
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4">
            {translations[Lang].filterByType}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>{translations[Lang].transactionTypes}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => filterTransactions(null)}>{translations[Lang].all}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => filterTransactions("Deposit")}>{translations[Lang].deposit}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => filterTransactions("Withdraw")}>{translations[Lang].withdraw}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Transaction Table */}
      <div className="mt-4">
        {loading ? (
          <p className="text-center text-gray-500">{translations[Lang].loading}</p>
        ) : selection === "wallet" ? (
          filteredTransactions.length > 0 ? (
            <>
              <TransactionTableContent transactions={paginatedTransactions} selection={selection} userid={id} Lang={Lang} />
              {/* Pagination Controls */}
              {filteredTransactions.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    {translations[Lang].previous}
                  </button>
                  <span>
                    {translations[Lang].page} {currentPage} {translations[Lang].of} {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    {translations[Lang].next}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">{translations[Lang].noWallet}</p>
          )
        ) : p2pTransactions.length > 0 ? (
          <>
            <TransactionTableContent transactions={paginatedTransactions} selection={selection} userid={id} Lang={Lang} />
            {/* Pagination Controls */}
            {p2pTransactions.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  {translations[Lang].previous}
                </button>
                <span>
                  {translations[Lang].page} {currentPage} {translations[Lang].of} {totalPages}
                </span>
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  {translations[Lang].next}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">{translations[Lang].noP2P}</p>
        )}
      </div>
    </div>
  );
};

// Reusable Component for Transaction Table Content
const TransactionTableContent = ({
  transactions,
  selection,
  userid,
  Lang,
}: {
  transactions: any[];
  selection: string;
  userid: string;
  Lang: "En" | "Chi";
}) => {
  const t = translations[Lang];
  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="min-w-full light:bg-white border border-gray-300 rounded-xl shadow-lg">
          <thead>
            <tr className="dark:bg-gray-500 light:bg-gray-100">
              <th className="p-4 text-left">{t.date}</th>
              <th className="p-4 text-left">{t.txType}</th>
              <th className="p-4 text-left">{t.asset}</th>
              <th className="p-4 text-left">{t.amount}</th>
              <th className="p-4 text-left">{t.description}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="p-4 border-b">
                  {selection === "p2p"
                    ? transaction.createdAt.toLocaleDateString(Lang === "Chi" ? "zh-CN" : "en-US")
                    : transaction.date}
                </td>
                <td className="p-4 border-b">
                  {selection === "p2p"
                    ? transaction.type === "buy"
                      ? t.deposit
                      : t.withdraw
                    : transaction.txType}
                </td>
                <td className="p-4 border-b">
                  {selection === "p2p" ? transaction.coin : transaction.asset}
                </td>
                <td className="p-4 border-b">{transaction.amount}</td>
                <td className="p-4 border-b">
                  {selection === "p2p"
                    ? transaction.type === "buy"
                      ? transaction.userId !== userid
                        ? `${t.sold} ${transaction.amount} ${transaction.coin} ${t.to} ${transaction.userName}`
                        : `${t.purchased} ${transaction.amount} ${transaction.coin} ${t.from} ${transaction.userName}`
                      : transaction.userId === userid
                      ? `${t.sold} ${transaction.amount} ${transaction.coin} ${t.to} ${transaction.userName}`
                      : `${t.purchased} ${transaction.amount} ${transaction.coin} ${t.from} ${transaction.userName}`
                    : transaction.txType}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="dark:bg-gray-500 light:bg-gray-100">
              <td colSpan={5} className="p-4 text-center">
                {t.totalTransactions}: {transactions.length}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border-b border-gray-300 py-4">
            <p>
              {transaction.txType === t.deposit
                ? t.depositDesc
                : t.withdrawDesc}
            </p>
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
};