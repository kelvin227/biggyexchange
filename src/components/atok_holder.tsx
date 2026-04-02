"use client";
/* eslint-disable*/
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import PaystackPop from "@paystack/inline-js";
import { Button } from "./ui/button";
import Pusher from "pusher-js";

export default function MarketPlaceComponent({
  email,
  eth,
  usdt,
  bnb,
  sol,
}: {
  email: string;
  eth: string;
  usdt: string;
  bnb: string;
  sol: string;
}) {
  const [active, setActive] = useState<"buy" | "sell" | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<(typeof coins)[0] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [reference, setRefe] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [txHash, setTxHash] = useState<string>("");
  const [inputMode, setInputMode] = useState<"fiat" | "crypto">("fiat");
  const [amount, setAmount] = useState("");

  const coinPrice = selectedCoin
    ? parseFloat(selectedCoin.price.replace(/[$,]/g, ""))
    : 0;

  // if user enters fiat (NGN)
  const usdFromFiat =
    inputMode === "fiat" && selectedCoin && amount
      ? parseFloat(amount) / selectedCoin.rate
      : 0;

  const cryptoFromFiat =
    inputMode === "fiat" && usdFromFiat && coinPrice
      ? usdFromFiat / coinPrice
      : 0;

  // if user enters crypto
  const usdFromCrypto =
    inputMode === "crypto" && amount && coinPrice
      ? parseFloat(amount) * coinPrice
      : 0;

  const ngnFromCrypto =
    inputMode === "crypto" && usdFromCrypto && selectedCoin
      ? usdFromCrypto * selectedCoin.rate
      : 0;

  // unified display values
  const finalUsdValue = inputMode === "fiat" ? usdFromFiat : usdFromCrypto;

  const finalCryptoValue =
    inputMode === "fiat" ? cryptoFromFiat : parseFloat(amount || "0");

  const finalNgnValue =
    inputMode === "fiat" ? parseFloat(amount || "0") : ngnFromCrypto;
  const popupRef = useRef<PaystackPop | null>(null);

  useEffect(() => {
    popupRef.current = new PaystackPop();
  }, []);

  //get the usd price for each crpyto

  const coins = [
    { name: "Ethereum", symbol: "ETH", rate: 1450, price: `$${eth}` },
    { name: "Solana", symbol: "SOL", rate: 1450, price: `$${sol}` },
    { name: "Toncoin", symbol: "TON", rate: 1450, price: `$${bnb}` },
    { name: "USDT", symbol: "USDT", rate: 1450, price: `$${usdt}` },
  ];

  useEffect(() => {
    if (!reference) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "mt1",
    });

    const channel = pusher.subscribe(`transaction-${reference}`);

    channel.bind("status-update", function (data: any) {
      console.log("Received Pusher event:", data);
      console.log("Current paymentStatus:", paymentStatus);
      console.log("Event status:", data.status);
      console.log("Event txHash:", data.txHash);
      setPaymentStatus(data.status);

      if (data.txHash) {
        setTxHash(data.txHash);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [reference]);

  const handleContinue = async () => {
    if (!selectedCoin) {
      toast.error("Please select a coin");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (active === "buy") {
      await handleBuy();
      return;
    }

    if (active === "sell") {
      await handleSell();
      return;
    }

    toast.error("Please choose buy or sell");
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const response = await fetch("api/buy/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          nairaAmount: finalNgnValue.toString(),
          cryptoType: selectedCoin?.symbol,
          cryptoAmount: finalCryptoValue,
          inputMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          "Transaction initialized successfully. Please proceed to payment.",
        );
        popupRef.current?.resumeTransaction(data.accesscode);
        setRefe(data.paymentReference);
        setLoading(false);
      } else {
        const errorText = await response.text();
        console.error("Failed to initialize transaction", {
          status: response.status,
          errorText,
        });
        toast.error("Failed to initialize transaction. Please try again.");
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(
        "An error occurred while processing your request. Please try again.",
        error,
      );
    }
  };

  const handleSell = async () => {
    try {
      setLoading(true);

      const initResponse = await fetch("/api/sell/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          cryptoType: selectedCoin?.symbol,
          cryptoAmount: finalCryptoValue.toFixed(6),
          nairaAmount: finalNgnValue.toString(),
          usdAmount: finalUsdValue,
          inputMode,
        }),
      });

      const initData = await initResponse.json();

      if (!initResponse.ok) {
        toast.error(initData.message || "Failed to initialize sell transaction");
        setLoading(false);
        return;
      }

      setRefe(initData.reference);
      setPaymentStatus(initData.status || "awaiting-crypto");



      
      const executeResponse = await fetch("/api/sell/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PlatformReference: initData.reference,
        }),
      });

      const executeData = await executeResponse.json();

      if (!executeResponse.ok) {
        toast.error(executeData.message || "Failed to initialize sell transaction");
        setLoading(false);
        return;
      }
      toast.success(initData.message || "testing for return message")


      const payoutResponse = await fetch("/api/sell/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          PlatformReference: initData.reference,
          amountInNaira: finalNgnValue,
        }),
      });

      const payoutData = await payoutResponse.json();

      if (!payoutResponse.ok) {
        toast.error(payoutData.message || "Failed to initialize sell transaction");
        setLoading(false);
        return;
      }


      
      toast.success(payoutData.message || "Sell transaction initialized");
    } catch (error) {
      console.error("Sell initialization error:", error);
      toast.error("An error occurred while initializing sell transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10">
      {/* Step 1: Buy/Sell selection */}
      {!active && !selectedCoin && (
        <div className="w-full max-w-md flex flex-col gap-4">
          <div
            className="flex flex-box pt-4 gap-6 w-full cursor-pointer"
            onClick={() => setActive("buy")}
          >
            <div className="w-full relative hover:shadow-lg hover:shadow-blue-500/50 transition">
              <Card>
                <CardContent className="flex flex-box gap-2 items-center py-6 px-4 text-xl font-semibold">
                  Buy
                  <div className="absolute right-4">
                    <ChevronRight className="justify-end" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div
            className="flex flex-box pt-4 gap-6 w-full cursor-pointer"
            onClick={() => setActive("sell")}
          >
            <div className="w-full relative hover:shadow-lg hover:shadow-blue-500/50 transition">
              <Card className="w-full">
                <CardContent className="flex flex-box gap-2 items-center py-6 px-4 text-xl font-semibold">
                  Sell
                  <div className="absolute right-4">
                    <ChevronRight className="justify-end" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Coin selection */}
      {active && !selectedCoin && (
        <div className="w-full max-w-md mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center">
            {active === "buy" ? "Available to Buy" : "Available to Sell"}
          </h3>
          <div className="grid gap-4">
            {coins.map((coin) => (
              <Card
                key={coin.symbol}
                className="hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedCoin(coin)}
              >
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <span className="font-semibold text-lg">{coin.name}</span>
                  <span className="text-gray-500 font-mono">{coin.symbol}</span>
                  <span className="text-gray-500 font-mono">{coin.price}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <button
            className="mt-6 text-blue-600 hover:underline block mx-auto"
            onClick={() => setActive(null)}
          >
            &larr; Back
          </button>
        </div>
      )}

      {/* Step 3: Input NGN and show USD value */}
      {selectedCoin && paymentStatus === "pending" && (
        <div className="w-full max-w-md mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center">
            {active === "buy" ? "Buy" : "Sell"} {selectedCoin.name}
          </h3>
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex gap-4">
              <div
                onClick={() => setInputMode("fiat")}
                className={
                  inputMode === "fiat"
                    ? "border border-gray-300 bg-blue-400 rounded px-4 py-2 cursor-pointer"
                    : "border border-gray-300 rounded px-4 py-2 cursor-pointer"
                }
              >
                Fiat
              </div>

              <div
                onClick={() => setInputMode("crypto")}
                className={
                  inputMode === "crypto"
                    ? "border border-gray-300 bg-blue-400 rounded px-4 py-2 cursor-pointer"
                    : "border border-gray-300 rounded px-4 py-2 cursor-pointer"
                }
              >
                Coin
              </div>
            </div>
            <label className="text-lg font-medium" htmlFor="amount">
              {inputMode === "fiat"
                ? "Enter Amount (NGN)"
                : `Enter Amount (${selectedCoin?.symbol})`}
            </label>

            <input
              id="amount"
              type="number"
              min="0"
              className="border border-gray-300 rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={
                inputMode === "fiat"
                  ? "Amount in NGN"
                  : `Amount in ${selectedCoin?.symbol}`
              }
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="mb-4 text-lg">
            {amount && (
              <>
                <span className="font-semibold">USD Value: </span>
                <span className="text-blue-600">
                  ${finalUsdValue.toFixed(4)}{" "}
                  <span className="text-gray-500 text-base">
                    (@ ₦{selectedCoin?.rate}/$)
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="mb-4 text-lg">
            {amount && selectedCoin && (
              <>
                <span className="font-semibold">
                  {active === "buy" ? "To receive: " : "To send: "}
                </span>
                <span className="text-blue-600">
                  {finalCryptoValue.toFixed(6)}{" "}
                  <span className="text-gray-500 text-base">
                    {selectedCoin.symbol}
                  </span>
                </span>
              </>
            )}
          </div>

          <div className="mb-4 text-lg">
            {amount && selectedCoin && inputMode === "crypto" && (
              <>
                <span className="font-semibold">NGN Equivalent: </span>
                <span className="text-blue-600">
                  ₦{finalNgnValue.toFixed(2)}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              onClick={() => {
                setSelectedCoin(null);
                setAmount("");
              }}
            >
              &larr; Back
            </Button>
            <Button
              className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={!amount || loading}
              onClick={handleContinue}
            >
              {loading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {selectedCoin && reference && (
        <div className="w-full max-w-md mt-6">
          <Card>
            <CardContent className="py-6 px-6 space-y-4">
              <h4 className="text-lg font-semibold">Transaction Status</h4>

              {paymentStatus === "pending" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-yellow-600 font-medium">
                    Pending Payment. Please complete the payment in the pop-up
                    window that appears after clicking "Continue".
                  </span>
                </div>
              )}

              {paymentStatus === "paid" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-yellow-600 font-medium">
                    Payment received. Preparing crypto transfer...
                  </span>
                </div>
              )}

              {paymentStatus === "Sending crypto" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-600 font-medium">
                    Sending crypto to your wallet...
                  </span>
                </div>
              )}

              {paymentStatus === "Sent" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-green-600 font-semibold">
                      Crypto sent successfully
                    </span>
                  </div>

                  {txHash && (
                    <div className="text-sm text-gray-500 break-all">
                      Tx Hash: {txHash}
                    </div>
                  )}
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-red-600 font-semibold">
                    Transaction failed. Please contact support.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
