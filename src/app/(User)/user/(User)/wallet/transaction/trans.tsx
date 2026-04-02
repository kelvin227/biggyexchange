"use client";
/* eslint-disable */

import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Funnel,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { getTransactions } from "@/functions/blockchain/wallet.utils";
import { getp2ptransaction } from "@/functions/user";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type WalletTransaction = {
  id: string;
  date: string;
  txType: "Deposit" | "Withdraw";
  asset: string;
  amount: string;
};

type P2PTransaction = {
  id: string;
  createdAt: string | Date;
  type: string | null;
  coin: string;
  amount: string | number;
  userId: string;
  userName: string;
};

type TransactionFilter = "all" | "deposit" | "withdraw";
type SelectionType = "wallet" | "p2p";

export const TransactionTable = ({
  address,
  email,
  id,
}: {
  address: string;
  email: string;
  id: string;
}) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [p2pTransactions, setP2pTransactions] = useState<P2PTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<SelectionType>("wallet");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const formatDate = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

const fetchTransactionData = async () => {
  try {
    const response = await getTransactions({
      address,
      chain: "eth",
    });

    if (response?.status === "1" && Array.isArray(response.result)) {
      const formattedData: WalletTransaction[] = response.result.map((tx: any) => ({
        id: tx.hash,
        date: formatDate(new Date(Number(tx.timeStamp) * 1000)),
        txType:
          tx.to?.toLowerCase() === address?.toLowerCase()
            ? "Deposit"
            : "Withdraw",
        asset: "ETH",
        amount: ethers.formatEther(tx.value),
      }));

      setTransactions(formattedData);
    } else {
      setTransactions([]);
    }
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    setTransactions([]);
  }
};

  const fetchP2PTransactionData = async () => {
    try {
      const response = await getp2ptransaction(email);

      if (response.success && Array.isArray(response.message)) {
        setP2pTransactions(response.message);
      } else {
        setP2pTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching P2P transactions:", error);
      setP2pTransactions([]);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTransactionData(), fetchP2PTransactionData()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [address, email]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selection, filter]);

  const filteredWalletTransactions = useMemo(() => {
    if (filter === "deposit") {
      return transactions.filter((tx) => tx.txType === "Deposit");
    }

    if (filter === "withdraw") {
      return transactions.filter((tx) => tx.txType === "Withdraw");
    }

    return transactions;
  }, [transactions, filter]);

  const activeTransactions = useMemo(() => {
    return selection === "wallet" ? filteredWalletTransactions : p2pTransactions;
  }, [selection, filteredWalletTransactions, p2pTransactions]);

  const totalPages = Math.max(1, Math.ceil(activeTransactions.length / itemsPerPage));

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return activeTransactions.slice(start, end);
  }, [activeTransactions, currentPage]);

  const walletDepositCount = transactions.filter((tx) => tx.txType === "Deposit").length;
  const walletWithdrawCount = transactions.filter((tx) => tx.txType === "Withdraw").length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Transaction History</CardTitle>
              <CardDescription>
                View wallet activity and peer-to-peer trades in one place.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={selection === "wallet" ? "default" : "outline"}
                onClick={() => setSelection("wallet")}
                className="rounded-full"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </Button>

              <Button
                variant={selection === "p2p" ? "default" : "outline"}
                onClick={() => setSelection("p2p")}
                className="rounded-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                P2P
              </Button>

              <Button
                variant="outline"
                onClick={loadTransactions}
                className="rounded-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Wallet Transactions</p>
            <p className="mt-2 text-2xl font-semibold">{transactions.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Deposits</p>
            <p className="mt-2 text-2xl font-semibold">{walletDepositCount}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Withdrawals / P2P Trades</p>
            <p className="mt-2 text-2xl font-semibold">
              {selection === "wallet" ? walletWithdrawCount : p2pTransactions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {selection === "wallet" && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium">Filter Transactions</p>
            <p className="text-sm text-muted-foreground">
              Narrow wallet activity by transaction type.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full">
                <Funnel className="mr-2 h-4 w-4" />
                {filter === "all"
                  ? "All Transactions"
                  : filter === "deposit"
                  ? "Deposits"
                  : "Withdrawals"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52">
              <DropdownMenuLabel>Transaction Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Transactions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("deposit")}>
                Deposits
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("withdraw")}>
                Withdrawals
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-muted-foreground">
              Loading transactions...
            </div>
          ) : activeTransactions.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 text-center">
              <p className="text-base font-medium">
                {selection === "wallet"
                  ? "No wallet transactions found"
                  : "No P2P transactions found"}
              </p>
              <p className="text-sm text-muted-foreground">
                Your transaction history will appear here once activity is available.
              </p>
            </div>
          ) : (
            <>
              <TransactionTableContent
                transactions={paginatedTransactions}
                selection={selection}
                userid={id}
                totalCount={activeTransactions.length}
              />

              {activeTransactions.length > itemsPerPage && (
                <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionTableContent = ({
  transactions,
  selection,
  userid,
  totalCount,
}: {
  transactions: any[];
  selection: SelectionType;
  userid: string;
  totalCount: number;
}) => {
  const formatDate = (value: string | Date) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getP2PLabel = (transaction: any) => {
    const isUserTransactionOwner = transaction.userId === userid;
    const isBuy = transaction.type === "buy";

    if (isBuy) {
      return isUserTransactionOwner ? "Purchased" : "Sold";
    }

    return isUserTransactionOwner ? "Sold" : "Purchased";
  };

  const getP2PDescription = (transaction: any) => {
    const isUserTransactionOwner = transaction.userId === userid;
    const isBuy = transaction.type === "buy";

    if (isBuy) {
      return isUserTransactionOwner
        ? `Purchased ${transaction.amount} ${transaction.coin} from ${transaction.userName}`
        : `Sold ${transaction.amount} ${transaction.coin} to ${transaction.userName}`;
    }

    return isUserTransactionOwner
      ? `Sold ${transaction.amount} ${transaction.coin} to ${transaction.userName}`
      : `Purchased ${transaction.amount} ${transaction.coin} from ${transaction.userName}`;
  };

  const getWalletBadge = (txType: "Deposit" | "Withdraw") => {
    const isDeposit = txType === "Deposit";

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          isDeposit
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        }`}
      >
        {isDeposit ? (
          <ArrowDownLeft className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpRight className="h-3.5 w-3.5" />
        )}
        {txType}
      </span>
    );
  };

  const getP2PBadge = (transaction: any) => {
    const label = getP2PLabel(transaction);
    const isPurchased = label === "Purchased";

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          isPurchased
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
        }`}
      >
        {isPurchased ? (
          <ArrowDownLeft className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpRight className="h-3.5 w-3.5" />
        )}
        {label}
      </span>
    );
  };

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Asset</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={transaction.id ?? `${transaction.createdAt}-${index}`}
                className="border-b transition-colors hover:bg-muted/30"
              >
                <td className="px-6 py-4 text-sm">
                  {selection === "p2p"
                    ? formatDate(transaction.createdAt)
                    : transaction.date}
                </td>

                <td className="px-6 py-4 text-sm">
                  {selection === "p2p"
                    ? getP2PBadge(transaction)
                    : getWalletBadge(transaction.txType)}
                </td>

                <td className="px-6 py-4 text-sm">
                  {selection === "p2p" ? transaction.coin : transaction.asset}
                </td>

                <td className="px-6 py-4 text-sm font-medium">
                  {transaction.amount}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {selection === "p2p"
                    ? getP2PDescription(transaction)
                    : transaction.txType === "Deposit"
                    ? "deposit to wallet"
                    : "withdrawal from wallet"}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-muted/30">
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                Total Transactions: {totalCount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id ?? `${transaction.createdAt}-${index}`}
            className="rounded-2xl border p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selection === "p2p"
                    ? formatDate(transaction.createdAt)
                    : transaction.date}
                </p>
                <p className="mt-1 text-base font-semibold">
                  {selection === "p2p"
                    ? transaction.coin
                    : transaction.asset}
                </p>
              </div>

              <div>
                {selection === "p2p"
                  ? getP2PBadge(transaction)
                  : getWalletBadge(transaction.txType)}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{transaction.amount}</span>
              </div>

              <div className="border-t pt-2 text-muted-foreground">
                {selection === "p2p"
                  ? getP2PDescription(transaction)
                  : transaction.txType === "Deposit"
                  ? "deposit to wallet"
                  : "withdrawal from wallet"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};