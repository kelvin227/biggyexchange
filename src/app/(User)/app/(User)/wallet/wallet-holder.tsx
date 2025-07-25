"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getBalance,
  getBnbBalance,
  getBnbPrice,
  sendtest,
  sendusdt,
} from "@/functions/blockchain/wallet.utils";
import { getPrice } from "@/functions/blockchain/wallet.utils";
import { useRouter } from "next/navigation";
import { Bitcoin } from "lucide-react";

// Translation object
const translations = {
  En: {
    bnbGasTank: "BNB Gas Tank",
    totalBalance: "Total Balance",
    usd: "USD",
    deposit: "Deposit",
    transfer: "Transfer",
    depositBNB: "Deposit BNB",
    network: "Network",
    bsc: "Binance Smart Chain(BSC)",
    walletAddress: "Wallet Address:",
    copy: "Copy",
    copied: "Wallet address copied to clipboard!",
    depositWarning:
      "Please ensure you are sending BNB on the Binance Smart Chain. Sending funds on the wrong Chain may result in loss of funds.",
    transferBNB: "Transfer BNB",
    recipientAddress: "Recipient Address:",
    paste: "Paste",
    pasteSuccess: "Recipient address pasted from clipboard!",
    pasteError: "Failed to paste content from clipboard.",
    amount: "Amount:",
    processing: "Processing...",
    transferBtn: "Transfer",
    transferFailed: "Transfer failed. Please try again.",
    transferInvalidAddress: "Invalid recipient address",
    transferInvalidAmount: "Invalid transfer amount",
    transferWarning:
      "Please ensure you are sending BNB  on the Binance Smart Chain Network. Sending funds on the wrong network may result in loss of funds.",
    Bitcoin: "Bitcoin",
    ethereumWallet: "Ethereum Wallet",
    Solana: "Solana",
    TON: "Toncoin",
    PI: "Pi Network",
    usdt: "USDT",
    availableBalance: "Available Balance",
    depositUSDT: "Deposit USDT",
    bscBep20: "BSC(BEP20)",
    depositUSDTWarning:
      "Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.",
    transferUSDT: "Transfer USDT",
    transferUSDTWarning:
      "Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.",
    enterRecipient: "Enter recipient address",
    enterAmount: "Enter amount to transfer",
  },
  Chi: {
    bnbGasTank: "BNB 油箱",
    totalBalance: "總餘額",
    usd: "美元",
    deposit: "存款",
    transfer: "轉帳",
    depositBNB: "存入BNB",
    network: "網絡",
    bsc: "幣安智能鏈(BSC)",
    walletAddress: "錢包地址：",
    copy: "複製",
    copied: "錢包地址已複製！",
    depositWarning:
      "請確保您正在幣安智能鏈上發送BNB。錯誤鏈發送可能導致資金丟失。",
    transferBNB: "轉帳BNB",
    recipientAddress: "收款地址：",
    paste: "粘貼",
    pasteSuccess: "收款地址已從剪貼板粘貼！",
    pasteError: "從剪貼板粘貼失敗。",
    amount: "金額：",
    processing: "處理中...",
    transferBtn: "轉帳",
    transferFailed: "轉帳失敗，請重試。",
    transferInvalidAddress: "收款地址無效",
    transferInvalidAmount: "轉帳金額無效",
    transferWarning:
      "請確保您在幣安智能鏈網絡上發送BNB。錯誤網絡發送可能導致資金丟失。",
    Bitcoin: "比特幣",
    ethereumWallet: "以太坊錢包",
    Solana: "索拉納",
    TON: "Toncoin",
    PI: "Pi Network",
    usdt: "USDT",
    availableBalance: "可用餘額",
    depositUSDT: "存入USDT",
    bscBep20: "BSC(BEP20)",
    depositUSDTWarning:
      "請確保您在幣安智能鏈(BEP20)網絡上發送USDT。錯誤網絡發送可能導致資金丟失。",
    transferUSDT: "轉帳USDT",
    transferUSDTWarning:
      "請確保您在幣安智能鏈(BEP20)網絡上發送USDT。錯誤網絡發送可能導致資金丟失。",
    enterRecipient: "輸入收款地址",
    enterAmount: "輸入轉帳金額",
  },
};

export default function Wallet({
  email,
  address,
}: {
  email: string;
  address: string;
}) {
  const [Lang, setLang] = useState("En");
  const t = translations[Lang as "En" | "Chi"];
  const router = useRouter();
  const [bnbblalance, setBnbBalance] = useState<string | null>(null);
  const [bnbPrice, setBnbPrice] = useState<string | null>(null);
  const [balances, setBalance] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>("");
  const [showTransfer, setshowTransfer] = useState(false);
  const walletAddress = address;

  const [bnbshow, setbnbshow] = useState(false);
  const [bnbtransfer, setbnbtransfer] = useState(false);
  const [show, setshow] = useState(false);

  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle the transfer
  const handleTransfer = async () => {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast(t.transferInvalidAddress);
      return;
    }
    if (
      !transferAmount ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      toast(t.transferInvalidAmount);
      return;
    }
    try {
      setLoading(true);
      const provider = await sendusdt(transferAmount, recipientAddress, email);
      if (!provider?.success) {
        toast.error(provider?.message);
      } else {
        toast.success(provider.message);
      }
    } catch (error) {
      console.error("Error during transfer:", error);
      toast(t.transferFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleBNBTransfer = async () => {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast(t.transferInvalidAddress);
      return;
    }
    if (
      !transferAmount ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      toast(t.transferInvalidAmount);
      return;
    }
    try {
      setLoading(true);
      const provider = await sendtest(transferAmount, recipientAddress, email);
      if (!provider?.success) {
        toast.error(provider?.message);
      } else {
        toast.success(provider.message);
      }
    } catch (error) {
      console.error("Error during transfer:", error);
      toast(t.transferFailed);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const balanceData = await getBalance(address);
      const priceData = await getPrice();
      const BNBbalanceData = await getBnbBalance(address);
      const BNBPriceData = await getBnbPrice();

      if (BNBbalanceData.success) {
        setBnbBalance(BNBbalanceData.message);
        if (BNBPriceData.success) {
          const cal =
            Number(BNBPriceData.message) * Number(BNBbalanceData.message);
          setBnbPrice(`$${cal.toString()}`);
        } else {
          toast.error("Error Getting bnb price, refresh the page");
        }
      } else {
        toast.error("Error getting bnb balance, refresh the page");
      }
      if (balanceData.success) {
        setBalance(balanceData.message);
        const cal =
          Number(priceData.prices?.usdt) * Number(balanceData.message);
        setPrice(`$${cal.toString()}`);
      } else {
        setBalance("Error fetching balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error fetching balance");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("userLanguage");
      if (storedValue) {
        setLang(storedValue);
        router.refresh();
      }
    }
    fetchBalance();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      {/* Bitcoin Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.Bitcoin}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Ethereum Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.ethereumWallet}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BNB wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={
              bnbshow || bnbtransfer ? "hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.bnbGasTank}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {bnbblalance}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.usd}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {bnbPrice}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit button */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setbnbshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer button */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setbnbtransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          {/* BNB Deposit section */}
          <CardContent className={!bnbshow ? "hidden" : "flex flex-col gap-4"}>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositBNB}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bsc}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositWarning}
              </p>
            </div>
          </CardContent>
          {/* BNB Transfer section */}
          <CardContent
            className={bnbtransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.transferBNB}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bsc}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBNBTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solana Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.Solana}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TON Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.TON}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PI Network Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.PI}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* USDT Wallet Card */}
      <div className="mt-5">
        <Card>
          <CardContent
            className={show || showTransfer ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.usdt}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {balances}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {price}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshow(!show)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className={show ? "hidden" : "flex flex-col gap-4 w-full"}>
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setshowTransfer(!showTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.transfer}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              !show ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">{t.depositUSDT}</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>
          <CardContent
            className={showTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                {t.transferUSDT}
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.amount}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow border outline-none text-sm light:text-gray-900"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
