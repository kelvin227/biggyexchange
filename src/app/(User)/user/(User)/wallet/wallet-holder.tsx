"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  sendEth,
  sendtest,
  sendusdt,
  sendtestEth,
  sendSol,
} from "@/functions/blockchain/wallet.utils";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    usdt: "USDT",
    availableBalance: "Fiat Balance",
    depositUSDT: "Deposit USDT",
    bscBep20: "BSC(BEP20)",
    depositUSDTWarning:
      "Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.",
    transferUSDT: "Transfer USDT",
    transferUSDTWarning:
      "Please ensure you are sending USDT on the Binance Smart Chain(BEP20) Network. Sending funds on the wrong network may result in loss of funds.",
    enterRecipient: "Enter recipient address",
    enterAmount: "Enter amount to transfer",
    selectNetwork: "Select Network",
    ethereum: "Ethereum (ERC20)",
    tron: "Tron (TRC20)",
    polygon: "Polygon (MATIC)",
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
    selectNetwork: "選擇網絡",
    ethereum: "以太坊 (ERC20)",
    tron: "波場 (TRC20)",
    polygon: "Polygon (MATIC)",
  },
};

export default function Wallet({
  email,
  address,
  solanaAddress,
  Ethbalance,
  bnbBalance,
  EthPrice,
  testNetEthBalance,
  testNetEthPrice,
  bnbPrice,
  usdtbnbBalance,
  solBalance,
  solTestNetBalance,
  solPrice,
  soltestnetPrice
}: {
  email: string;
  address: string;
  solanaAddress: string;
  Ethbalance: string;
  bnbBalance: string;
  EthPrice: string;
  testNetEthBalance: string;
  testNetEthPrice: string;
  bnbPrice: string;
  usdtbnbBalance: string;
  solBalance: string;
  solTestNetBalance: string;
  solPrice: string;
  soltestnetPrice: string;
}) {
  const [Lang, setLang] = useState("En");
  const t = translations[Lang as "En" | "Chi"];
  const router = useRouter();
  const price = "$0.00";
  const [password, setPassword] = useState("");
  const [showTransfer, setshowTransfer] = useState(false);
  const walletAddress = address;
  const isSolanaWallet = solanaAddress !== "empty" ? true : false;

  const [bnbshow, setbnbshow] = useState(false);
  const [bnbtransfer, setbnbtransfer] = useState(false);
  const [show, setshow] = useState(false);
  const [ethShow, setEthShow] = useState(false);
  const [showEthTransfer, setshowEthTransfer] = useState(false);
  const [showSolTransfer, setshowSolTransfer] = useState(false);
  const [solShow, setSolShow] = useState(false);
  const [testnet, setTestnet] = useState(false);

  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [createSolWalletLoading, setCreateSolWalletLoading] = useState(false);

  // USDT Network States
  const [usdtShow, setUsdtShow] = useState(false);
  const [usdtTransfer, setUsdtTransfer] = useState(false);
  const [selectedUsdtNetwork, setSelectedUsdtNetwork] = useState("bsc");

  // USDT Networks configuration
  const usdtNetworks = {
    bsc: {
      name: "BSC (BEP20)",
      address: walletAddress,
      chainId: "56",
      warning:
        "Please ensure you are sending USDT on the Binance Smart Chain (BEP20) Network. Sending funds on the wrong network may result in loss of funds.",
    },
    ethereum: {
      name: "Ethereum (ERC20)",
      address: walletAddress,
      chainId: "1",
      warning:
        "Please ensure you are sending USDT on the Ethereum (ERC20) Network. Sending funds on the wrong network may result in loss of funds.",
    },
    tron: {
      name: "Tron (TRC20)",
      address: walletAddress,
      chainId: "tron",
      warning:
        "Please ensure you are sending USDT on the Tron (TRC20) Network. Sending funds on the wrong network may result in loss of funds.",
    },
    polygon: {
      name: "Polygon (MATIC)",
      address: walletAddress,
      chainId: "137",
      warning:
        "Please ensure you are sending USDT on the Polygon (MATIC) Network. Sending funds on the wrong network may result in loss of funds.",
    },
  };

  async function createSolanaWallet() {
    setCreateSolWalletLoading(true);
    if (!password) {
      toast.error("Please enter your password");
      setCreateSolWalletLoading(false);
      return;
    }
    const response = await fetch("/api/Solana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setCreateSolWalletLoading(false);
      toast.success("Solana wallet created successfully");
      router.refresh();
    } else {
      toast.error(data.message || "Failed to create Solana wallet");
    }
  }

  // Function to handle the transfer
  const handleTransfer = async (network: string) => {
    if (!recipientAddress || (network !== "sol" && !ethers.isAddress(recipientAddress))) {
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
      if (network === "bnb") {
        const provider = await sendusdt(
          transferAmount,
          recipientAddress,
          email,
        );
        if (!provider?.success) {
          toast.error(provider?.message);
        } else {
          toast.success(provider.message);
        }
      } else if (network === "eth") {
        const provider = await sendEth(transferAmount, recipientAddress, email);
        if (!provider?.success) {
          toast.error(provider?.message);
        } else {
          toast.success(provider.message);
        }
      } else if (network === "ethtestnet") {
        const provider = await sendtestEth(transferAmount, recipientAddress, email);
        if (!provider?.success) {
          toast.error(provider?.message);
        } else {
          toast.success(provider.message);
        }
      } else if (network === "sol"){
        const provider = await sendSol(email, recipientAddress, parseFloat(transferAmount), testnet ? "testnet" : "mainnet-beta", password);
        if (!provider?.success) {
          toast.error(provider?.error);
        } else {
          toast.success(provider.explorer);
        }
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("userLanguage");
      if (storedValue) {
        setLang(storedValue);
        router.refresh();
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div>

      <div className="flex flex-row gap-4 justify-center items-center mb-4">
        <div className={testnet ? "border border-yellow-600 rounded-lg px-4 py-2 cursor-pointer" : "border border-gray-300 rounded-lg px-4 py-2 cursor-pointer"} onClick={() => setTestnet(false)}>
          Mainnet
          </div>
          <div className={testnet ? "border border-gray-300 rounded-lg px-4 py-2 cursor-pointer" : "border border-yellow-600 rounded-lg px-4 py-2 cursor-pointer"} onClick={() => setTestnet(true)}>
            Testnet
          </div>

        </div>
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
                    Bitcoin
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
                          error,
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
                  onClick={() => handleTransfer("bnb")}
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
      <div className={testnet ? "hidden" : "mt-5"}>
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
          <CardContent
            className={
              ethShow && !testnet || showEthTransfer && !testnet ? "hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.ethereumWallet}
            </div>
            <div className="flex flex-box">
              <div className="sflex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {Ethbalance}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    ${EthPrice}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setEthShow(!ethShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowEthTransfer(!showEthTransfer)}
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
              !ethShow && !testnet ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                Deposit Ethereum
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">Eth</span>
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
                Please ensure you are sending Ethereum on the Ethereum Network.
                Sending funds on the wrong network may result in loss of funds.
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setEthShow(!ethShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={showEthTransfer && !testnet ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                Transfer Ethereum
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}:{" "}
                <span className="font-medium"> Ethereum Network</span>
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
                          error,
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full"
                  onClick={() => handleTransfer("eth")}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowEthTransfer(!showEthTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                Please ensure you are sending Ethereum (Eth) to the right
                Ethereum wallet address. Sending funds on the wrong network may
                result in loss of funds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Ethereum Wallet Card for Testnet (Optional, can be hidden based on requirements) */}
      <div className={testnet? "mt-5" : "hidden"}>
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
          <CardContent
            className={
              ethShow && testnet || showEthTransfer && testnet ? "hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              Ethereum Testnet Wallet
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {testNetEthBalance}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    ${testNetEthPrice}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Dialog */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setEthShow(!ethShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer Section */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowEthTransfer(!showEthTransfer)}
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
              !ethShow && testnet ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                Deposit Ethereum testnet
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">Eth</span>
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
                Please ensure you are sending Ethereum on the Ethereum Network.
                Sending funds on the wrong network may result in loss of funds.
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className=""
                  onClick={() => setEthShow(!ethShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={showEthTransfer && testnet ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                Transfer Ethereum testnet
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}:{" "}
                <span className="font-medium"> Ethereum Network</span>
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
                          error,
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full"
                  onClick={() => handleTransfer("ethtestnet")}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowEthTransfer(!showEthTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                Please ensure you are sending Ethereum (Eth) to the right
                Ethereum wallet address. Sending funds on the wrong network may
                result in loss of funds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BNB wallet Card */}
      <div className="mt-5">
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
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
                    {bnbBalance}
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setbnbshow(!bnbshow)}
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setbnbtransfer(!bnbtransfer)}
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
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setbnbshow(!bnbshow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
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
                          error,
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
                  className="w-full rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={handleBNBTransfer}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
                <div className="flex flex-col gap-4 w-full">
                  <Button
                    variant="outline"
                    className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setbnbtransfer(!bnbtransfer)}
                  >
                    <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                      <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                        Cancel
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solana Wallet Card */}
      <div className={testnet ? "hidden" :"mt-5"}>
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
          <CardContent
            className={isSolanaWallet && !testnet ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center bold">
              {t.Solana}
            </div>
            <div className="flex flex-box justify-center items-center mb-4 mt-2">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-center items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    You have not created a solana wallet yet, click the button
                    below to create your solana wallet.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Solana Creation Button */}
              <div
                className={solShow ? "hidden" : "flex flex-col gap-4 w-full"}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                    >
                      <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                        <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                          Create Solana Wallet
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Solana Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <p>
                        Are you sure you want to create a Solana wallet? A new
                        Solana wallet address will be generated for you.
                      </p>
                      <input
                        type="password"
                        placeholder="Enter your password to confirm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={createSolWalletLoading}
                        variant="outline"
                        className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full"
                        onClick={() => {
                          createSolanaWallet();
                          setSolShow(false);
                        }}
                      >
                        {createSolWalletLoading ? "Loading..." : "Confirm"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              (solShow && !testnet) || (showSolTransfer && !testnet) || (!isSolanaWallet && !testnet)
                ? "hidden"
                : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              {t.Solana}
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    Solana
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {solBalance}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Button */}
              <div
                className={solShow ? "hidden" : "flex flex-col gap-4 w-full"}
              >
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setSolShow(!solShow)}
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowSolTransfer(!showSolTransfer)}
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

          {/* sol wallet deposit section */}
          <CardContent
            className={
              !solShow && !testnet ? "flex flex-col gap-4 hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">Solana</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {solanaAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(solanaAddress);
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
            className={showSolTransfer && !testnet ? "flex flex-col gap-4" : "hidden"}
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
                          error,
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
                  onClick={() => handleTransfer("sol")}
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

      {/* Solana Wallet Card */}
      <div className={!testnet ? "hidden": "mt-5"}>
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
          <CardContent
            className={isSolanaWallet && testnet ? "hidden" : "flex flex-col gap-4"}
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center bold">
              {t.Solana}
            </div>
            <div className="flex flex-box justify-center items-center mb-4 mt-2">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-center items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    You have not created a solana wallet yet, click the button
                    below to create your solana wallet.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Solana Creation Button */}
              <div
                className={solShow ? "hidden" : "flex flex-col gap-4 w-full"}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                    >
                      <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                        <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                          Create Solana Wallet
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Solana Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <p>
                        Are you sure you want to create a Solana wallet? A new
                        Solana wallet address will be generated for you.
                      </p>
                      <input
                        type="password"
                        placeholder="Enter your password to confirm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={createSolWalletLoading}
                        variant="outline"
                        className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full"
                        onClick={() => {
                          createSolanaWallet();
                          setSolShow(false);
                        }}
                      >
                        {createSolWalletLoading ? "Loading..." : "Confirm"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardContent
            className={
              (solShow && testnet) || (showSolTransfer && testnet) || (!isSolanaWallet && testnet)
                ? "hidden"
                : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-box gap-4 w-full justify-center items-center">
              Solana Testnet
            </div>
            <div className="flex flex-box">
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {solTestNetBalance}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium light:text-gray-700">
                    {t.availableBalance}
                  </div>
                  <div className="text-lg font-bold light:text-gray-900">
                    {soltestnetPrice}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-cols-4 mt-2 w-full gap-4">
              {/* Deposit Button */}
              <div
                className={solShow ? "hidden" : "flex flex-col gap-4 w-full"}
              >
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setSolShow(!solShow)}
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
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setshowSolTransfer(!showSolTransfer)}
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

          {/* sol wallet deposit section */}
          <CardContent
            className={
              !solShow && testnet ? "hidden" : "flex flex-col gap-4"
            }
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">Solana</h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">{t.bscBep20}</span>
              </p>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium light:text-gray-700">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
                  <span className="text-sm light:text-gray-900 truncate">
                    {solanaAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(solanaAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
                <div className="flex flex-col gap-4 w-full">
                  <Button
                    variant="outline"
                    className=" rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setSolShow(!solShow)}
                  >
                    <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                      <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                        Cancel
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.depositUSDTWarning}
              </p>
            </div>
          </CardContent>

          <CardContent
            className={showSolTransfer && testnet ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center">
                Transfer Solana Testnet
              </h2>
              <p className="text-sm light:text-gray-700 text-center">
                {t.network}: <span className="font-medium">Solana(SOL)</span>
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
                          error,
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
                <p className="text-sm font-medium light:text-gray-700">
                  Enter Your Password to Confirm the Transfer
                </p>
                <div className="flex items-center gap-2 light:bg-gray-100 p-2 rounded-md w-full">
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-grow bg-transparent border outline-none text-sm light:text-gray-900"
                />
                </div>
              </div>


              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform w-full"
                  onClick={() => handleTransfer("sol")}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>
              <div className="flex flex-col gap-4 w-full">
                  <Button
                    variant="outline"
                    className=" rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                    onClick={() => setshowSolTransfer(!showSolTransfer)}
                  >
                    <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                      <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                        Cancel
                      </div>
                    </div>
                  </Button>
                </div>
              <p className="text-xs light:text-gray-500 text-center">
                {t.transferUSDTWarning}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* USDT Wallet Card with Network Selection */}
      <div className="mt-5">
        <Card className="backdrop-blur-lg bg-black/80 border border-yellow-700 shadow-2xl rounded-3xl">
          <CardContent
            className={
              usdtShow || usdtTransfer ? "hidden" : "flex flex-col gap-4"
            }
          >
            {/* USDT Header */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-box gap-4 w-full justify-center items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  {t.usdt}
                </div>
              </div>

              {/* Network Indicator */}
              <div className="flex flex-col items-center gap-2 bg-black/40 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-400">
                  {t.selectNetwork}
                </p>
                <div className="flex flex-wrap gap-2 w-full justify-center">
                  {Object.entries(usdtNetworks).map(([key, network]) => (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => setSelectedUsdtNetwork(key)}
                      className={`text-xs px-3 py-1 rounded-full transition-all ${
                        selectedUsdtNetwork === key
                          ? "bg-green-500 border-green-400 text-black font-bold"
                          : "bg-gray-700 border-gray-600 text-gray-200 hover:border-green-400"
                      }`}
                    >
                      {network.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Balance Info */}
              <div className="flex flex-col w-full gap-3 bg-black/30 p-3 rounded-lg">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium text-gray-300">
                    {t.totalBalance}
                  </div>
                  <div className="text-lg font-bold">{usdtbnbBalance} USDT</div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="text-sm font-medium text-gray-300">
                    {t.usd}
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {price}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-cols-2 mt-2 w-full gap-4">
              {/* Deposit button */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setUsdtShow(!usdtShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium light:text-gray-700 w-full text-center cursor-pointer">
                      {t.deposit}
                    </div>
                  </div>
                </Button>
              </div>
              {/* Transfer button */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setUsdtTransfer(!usdtTransfer)}
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

          {/* USDT Deposit Section */}
          <CardContent className={!usdtShow ? "hidden" : "flex flex-col gap-4"}>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center text-yellow-400">
                {t.depositUSDT}
              </h2>

              {/* Network Select Dropdown for Deposit */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  {t.selectNetwork}
                </label>
                <select
                  value={selectedUsdtNetwork}
                  onChange={(e) => setSelectedUsdtNetwork(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-yellow-700 rounded-lg text-gray-200 focus:outline-none focus:border-yellow-400"
                >
                  {Object.entries(usdtNetworks).map(([key, network]) => (
                    <option key={key} value={key}>
                      {network.name} (Chain ID: {network.chainId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Network Info */}
              <p className="text-sm text-gray-300 text-center bg-black/40 p-2 rounded">
                {t.network}:{" "}
                <span className="font-medium text-yellow-400">
                  {
                    usdtNetworks[
                      selectedUsdtNetwork as keyof typeof usdtNetworks
                    ].name
                  }
                </span>
              </p>

              {/* Wallet Address Display */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-gray-300">
                  {t.walletAddress}
                </p>
                <div className="flex items-center gap-2 bg-gray-800 border border-yellow-700 p-2 rounded-md w-full">
                  <span className="text-sm text-gray-200 truncate font-mono">
                    {walletAddress}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto bg-yellow-600 hover:bg-yellow-700 border-yellow-500"
                    onClick={() => {
                      navigator.clipboard.writeText(walletAddress);
                      toast.success(t.copied);
                    }}
                  >
                    {t.copy}
                  </Button>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-lg">
                <p className="text-xs text-yellow-200 text-center">
                  ⚠️{" "}
                  {
                    usdtNetworks[
                      selectedUsdtNetwork as keyof typeof usdtNetworks
                    ].warning
                  }
                </p>
              </div>

              {/* Cancel Button */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setUsdtShow(!usdtShow)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>

          {/* USDT Transfer Section */}
          <CardContent
            className={usdtTransfer ? "flex flex-col gap-4" : "hidden"}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-center text-yellow-400">
                {t.transferUSDT}
              </h2>

              {/* Network Select Dropdown for Transfer */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-300">
                  {t.selectNetwork}
                </label>
                <select
                  value={selectedUsdtNetwork}
                  onChange={(e) => setSelectedUsdtNetwork(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-yellow-700 rounded-lg text-gray-200 focus:outline-none focus:border-yellow-400"
                >
                  {Object.entries(usdtNetworks).map(([key, network]) => (
                    <option key={key} value={key}>
                      {network.name} (Chain ID: {network.chainId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Network Info */}
              <p className="text-sm text-gray-300 text-center bg-black/40 p-2 rounded">
                {t.network}:{" "}
                <span className="font-medium text-yellow-400">
                  {
                    usdtNetworks[
                      selectedUsdtNetwork as keyof typeof usdtNetworks
                    ].name
                  }
                </span>
              </p>

              {/* Recipient Address Input */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-gray-300">
                  {t.recipientAddress}
                </p>
                <div className="flex items-center gap-2 bg-gray-800 border border-yellow-700 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterRecipient}
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto bg-yrllow-600 hover:bg-yellow-700 border-yellow-500"
                    onClick={async () => {
                      try {
                        const clipboardText =
                          await navigator.clipboard.readText();
                        setRecipientAddress(clipboardText);
                        toast.success(t.pasteSuccess);
                      } catch (error) {
                        console.error(
                          "Failed to read clipboard content:",
                          error,
                        );
                        toast.error(t.pasteError);
                      }
                    }}
                  >
                    {t.paste}
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-medium text-gray-300">{t.amount}</p>
                <div className="flex items-center gap-2 bg-gray-800 border border-yellow-700 p-2 rounded-md w-full">
                  <input
                    type="text"
                    placeholder={t.enterAmount}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500"
                  />
                  <span className="text-gray-400 text-sm font-medium">
                    USDT
                  </span>
                </div>
              </div>

              {/* Transfer Button */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full rounded-full py-5 bg-gradient-to-r from-yellow-500 via-yellow-500 to-orange-500 text-black font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => handleTransfer("bnb")}
                  disabled={loading}
                >
                  {loading ? t.processing : t.transferBtn}
                </Button>
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-lg">
                <p className="text-xs text-yellow-200 text-center">
                  ⚠️{" "}
                  {
                    usdtNetworks[
                      selectedUsdtNetwork as keyof typeof usdtNetworks
                    ].warning
                  }
                </p>
              </div>

              {/* Cancel Button */}
              <div className="flex flex-col gap-4 w-full">
                <Button
                  variant="outline"
                  className="rounded-full py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={() => setUsdtTransfer(!usdtTransfer)}
                >
                  <div className="flex flex-col justify-between items-center p-4 rounded-lg mb-2 w-full">
                    <div className="text-sm font-medium w-full text-center cursor-pointer">
                      Cancel
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
