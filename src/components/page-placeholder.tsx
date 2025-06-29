"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  //CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  // IconChevronDown,
  // IconChevronLeft,
  // IconChevronRight,
  // IconChevronsLeft,
  // IconChevronsRight,
  // IconCircleCheckFilled,
  // IconDotsVertical,
  // IconGripVertical,
  // IconLayoutColumns,
  // IconLoader,
  // IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
/* eslint-disable */

 const Transactiontable = ({ transaction }: { transaction: any[] }) => (
        <div className="w-full overflow-x-auto">
        <div className="hidden md:block">
            <table className="min-w-full light:bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="dark:bg-gray-900 light:bg-gray-100">
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                merchant ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                Coin
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold light:text-gray-700">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {transaction.map((tx: any, idx: number) => (
              <tr
                key={tx.id || idx}
                className="border-t border-gray-100 dark:hover:bg-gray-100 dark:hover:text-black hover:bg-gray-900 hover:text-white"
              >
                <td className="px-4 py-2 text-sm">{tx.id}</td>
                <td className="px-4 py-2 text-sm">{tx.merchantID}</td>
                <td className="px-4 py-2 text-sm">{tx.coin}</td>
                <td className="px-4 py-2 text-sm">{tx.type}</td>
                <td className="px-4 py-2 text-sm">{tx.amount}</td>
                <td className="px-4 py-2 text-sm">
                  {tx.createdAt instanceof Date
                    ? tx.createdAt.toLocaleDateString()
                    : String(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      
        {/* Mobile view */}
        <div className="md:hidden flex flex-col gap-2 mt-4">
          {transaction.map((tx: any, idx: number) => (
            <div
              key={tx.id || idx}
              className="light:bg-white border rounded-lg p-3 shadow-sm"
            >
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>ID: {tx.id}</span>
                <span>
                  {tx.createdAt instanceof Date
                    ? tx.createdAt.toLocaleDateString()
                    : String(tx.createdAt)}
                </span>
              </div>
              <div className="font-semibold text-gray-800">{tx.user}</div>
              <div className="flex justify-between mt-1 text-sm">
                <span className="capitalize">{tx.type}</span>
                <span className="font-bold">{tx.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
 )


export default function PagePlaceholder({
  pageName,
  usercount,
  percentage,
  kyccount,
  percentagekyc,
  CTcount,
  percentageCT,
  barchartdata,
  fivecompletedtrans,
  fiveptrans,
}: {
  pageName: string;
  usercount: number;
  percentage: number;
  kyccount: number;
  percentagekyc: number;
  CTcount: number;
  percentageCT: number;
  barchartdata: any[];
  fivecompletedtrans: any[];
  fiveptrans:any[]
}) {
  const [selection, setSelection] = useState("completed");
  const cardData = [
    {
      title: "Pending Kyc",
      description: percentagekyc,
      content: kyccount,
    },
    {
      title: "Total Users",
      description: percentage,
      content: usercount,
    },
    {
      title: "Completed Trades",
      description: percentageCT,
      content: CTcount,
    },
  ];
  const chartConfig = {
    Buy: {
      label: "Buy",
      color: "#2563eb",
    },
    Sell: {
      label: "Sell",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;
  return (
    <div className="flex flex-col gap-4 mt-10">
      <h1 className="text-3xl font-bold">{pageName}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {cardData.map((card, index) => (
          <Card className="w-full" key={index}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>
                {card.description}%
                {card.description > 0 ? (
                  <IconTrendingUp className="size-4 text-green-500" />
                ) : card.description < 0 ? (
                  <IconTrendingDown className="size-4 text-red-500" />
                ) : (
                  <IconMinus className="size-4 text-gray-500" />
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={barchartdata}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="Buy" fill="#2563eb" radius={4} />
          <Bar dataKey="Sell" fill="#60a5fa" radius={4} />
        </BarChart>
      </ChartContainer>


            <h1 className="text-3xl font-bold">Ads Transaction</h1>
         {/* Tabs for Wallet and P2P Transactions */}
      <div className="flex gap-4 border-b pb-2">
        <div
          className={`cursor-pointer ${selection === "completed" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("completed")}
        >
          Completed
        </div>
        <div
          className={`cursor-pointer ${selection === "pending" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setSelection("pending")}
        >
          Pending
        </div>
      </div>
      {/* Transaction Table */}
      <div className="mt-4">
        {/* {loading ? (
          <p className="text-center text-gray-500">Loading transactions...</p>
        ) : */}
        {selection === "completed" ? ( 
          fivecompletedtrans.length > 0 ? (
            <Transactiontable transaction={fivecompletedtrans} />
          ) : (
            <p className="text-center text-gray-500">No wallet transactions found</p>
          )
        ) : fiveptrans.length > 0 ? (
          <Transactiontable transaction={fiveptrans} />
        ) : (
          <p className="text-center text-gray-500">No P2P transactions found</p>
        )}
      </div>
    </div>
  );
}
