"use client";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ChevronRight } from "lucide-react";

export default function AtokHolder({
  ETH,
  BTC,
  TON,
  SOL,
  USDT,
  Pi,
}: {
  ETH: string;
  BTC: string;
  TON: string;
  SOL: string;
  USDT: string;
  Pi: string;
}) {
  const [active, setActive] = useState<"buy" | "sell" | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<(typeof coins)[0] | null>(
    null
  );
  const [ngnAmount, setNgnAmount] = useState<string>("");

  // Calculate USD value from NGN input and coin rate
  const usdValue =
    selectedCoin && ngnAmount
      ? (parseFloat(ngnAmount) / selectedCoin.rate).toFixed(4)
      : "";

  //calculate the crypto to recieve based on usd value and the current price of the crypto
  const cryptoToReceive = selectedCoin
    ? (
        parseFloat(usdValue) /
        parseFloat(selectedCoin.price.replace(/[$,]/g, ""))
      ).toFixed(4)
    : "";

  //get the usd price for each crpyto

  const coins = [
    { name: "Ethereum", symbol: "ETH", rate: 1450, price: `$${ETH}` },
    { name: "Bitcoin", symbol: "BTC", rate: 1450, price: `$${BTC}` },
    { name: "Solana", symbol: "SOL", rate: 1450, price: `$${SOL}` },
    { name: "Toncoin", symbol: "TON", rate: 1450, price: `$${TON}` },
    { name: "Pi Network", symbol: "PI", rate: 1450, price: `$${Pi}` },
    { name: "USDT", symbol: "USDT", rate: 1450, price: `$${USDT}` },
  ];

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
      {selectedCoin && (
        <div className="w-full max-w-md mt-8">
          <h3 className="text-2xl font-bold mb-4 text-center">
            {active === "buy" ? "Buy" : "Sell"} {selectedCoin.name}
          </h3>
          <div className="mb-6 flex flex-col gap-2">
            <label className="text-lg font-medium" htmlFor="ngnAmount">
              Enter Amount (NGN)
            </label>
            <input
              id="ngnAmount"
              type="number"
              min="0"
              className="border border-gray-300 rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Amount in NGN"
              value={ngnAmount}
              onChange={(e) => setNgnAmount(e.target.value)}
            />
          </div>
          <div className="mb-4 text-lg">
            {ngnAmount && (
              <>
                <span className="font-semibold">USD Value: </span>
                <span className="text-blue-600">
                  ${usdValue}{" "}
                  <span className="text-gray-500 text-base">
                    (@ ₦{selectedCoin.rate}/$)
                  </span>
                </span>
              </>
            )}
          </div>
          <div className="mb-4 text-lg">
            {ngnAmount && selectedCoin && (
              <>
                <span className="font-semibold">To recieve: </span>
                <span className="text-blue-600">
                  {cryptoToReceive}{" "}
                  <span className="text-gray-500 text-base">
                    {selectedCoin.symbol}
                  </span>
                </span>
              </>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <button
              className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              onClick={() => {
                setSelectedCoin(null);
                setNgnAmount("");
              }}
            >
              &larr; Back
            </button>
            <button
              className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={!ngnAmount || parseFloat(ngnAmount) <= 0}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
