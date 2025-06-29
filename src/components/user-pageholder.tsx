"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Make sure you have a Skeleton component
import {
  Card,
  CardContent,
  CardDescription,
  //CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent  } from "@/components/ui/chart"
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
  //IconTrendingDown,
} from "@tabler/icons-react"

const monthTranslations: Record<string, { En: string; Chi: string }> = {
  January: { En: "January", Chi: "一月" },
  February: { En: "February", Chi: "二月" },
  March: { En: "March", Chi: "三月" },
  April: { En: "April", Chi: "四月" },
  May: { En: "May", Chi: "五月" },
  June: { En: "June", Chi: "六月" },
  July: { En: "July", Chi: "七月" },
  August: { En: "August", Chi: "八月" },
  September: { En: "September", Chi: "九月" },
  October: { En: "October", Chi: "十月" },
  November: { En: "November", Chi: "十一月" },
  December: { En: "December", Chi: "十二月" },
};


  
export default function PagePlaceholder({ pageName, barchartdata, totalVolume, oldtotalVolume, completedtrans, totaltrans, previouscompletedtrans, previousTotaltrans }: { pageName: string, barchartdata: any[], totalVolume: number, oldtotalVolume: number, completedtrans: number, totaltrans: number, previouscompletedtrans: number, previousTotaltrans: number }) {
    const [Lang, setLang] = useState('En');
    const [percentchange, setPercentChange] = useState<number>(0);
    // const [previousCompletionPercentage, setPreviousCompletionPercentage] = useState<number>(0); // Remove, calculate dynamically
    // const [currentCompletionPercentage, setCurrentCompletionPercentage] = useState<number>(0); // Remove, calculate dynamically
    const [completedtranspercent, setcompletedtranspercent] = useState<number>(0);
  const chartConfig = {
  Buy: {
    label: Lang === "Chi" ? "買" :"Buy",
    color: "#2563eb",
  },
  Sell: {
    label: Lang === "Chi"? "賣":"Sell",
    color: "#60a5fa",
  },
} satisfies ChartConfig

  const cardData = [
  {
    title: Lang === "Chi"?"體積":"Volume",
    description: `${percentchange}%`,
    content: totalVolume,
  },
  {
    title: Lang === "Chi" ? "效益" :"Earnings",
    description: "35%",
    content: "200+",
  },
  {
    title: Lang === "Chi" ? "已完成的交易" :"Completed trades",
    description: `${completedtranspercent}%`,
    content: completedtrans,
  },
];
// Fetch volume data only ONCE on mount, or when pageName changes
    useEffect(() => {

        // Set language from local storage once on mount
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem('userLanguage');
            if (storedValue) {
                setLang(storedValue);
            }
        }
    }); // Run only when pageName changes (typically once on mount)


     const [isCardDataLoading, setIsCardDataLoading] = useState(true); // New loading state for cards

    // Modify `useEffect` for `Volume()`
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedValue = localStorage.getItem('userLanguage');
            if (storedValue) {
                setLang(storedValue);
            }
        }
        setTimeout(() => {
          // Simulate loading delay
          // @ts-ignore
          setIsCardDataLoading(false);
        }, 2000);
    });

    // Recalculate percentages whenever their source state variables change
    useEffect(() => {
        const currentCompletionPercentage = calculatePercentage(Number(completedtrans), Number(totaltrans));
        const previousCompletionPercentage = calculatePercentage(Number(previouscompletedtrans), Number(previousTotaltrans));
        const percentageChange = currentCompletionPercentage - previousCompletionPercentage;

        setcompletedtranspercent(percentageChange);
        setPercentChange(calculatevolumePercentage(Number(totalVolume), oldtotalVolume));
    }, [totalVolume, oldtotalVolume, completedtrans, totaltrans, previouscompletedtrans, previousTotaltrans]);


    const calculatePercentage = (completed: number, total: number) => {
        if (total === 0) return 0;
        return (completed / total) * 100;
    };

    const calculatevolumePercentage = (currentVolume: number, oldVolume: number) => {
        if (oldVolume === 0) return 0;
        return ((currentVolume - oldVolume) / oldVolume) * 100;
    };

    const translatedData = barchartdata.map((item: any) => ({
        ...item,
        month: monthTranslations[item.month]?.[Lang as "En" | "Chi"] || item.month,
    }));    


 // Now, in your return:
    if (isCardDataLoading) { // Use the new specific loading state
        return (
            <div className="flex flex-col gap-4 mt-10">
                <Skeleton className="h-10 w-1/3 mb-4" />
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {[1, 2, 3].map((_, idx) => (
                        <Card className="w-full" key={idx}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
               {/* Skeleton for the Bar Chart */}
                <div className="min-h-[200px] w-full mt-6">
                    <Skeleton className="h-48 w-full" /> {/* Adjust height as needed */}
                </div>
            </div>
        );
    } else{
    return (
    <div className="flex flex-col gap-4 mt-10">
      <h1 className="text-3xl font-bold">{pageName}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {cardData.map((card, index) => (
          <Card className="w-full" key={index}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description} <IconTrendingUp className="size-4" /></CardDescription>
            </CardHeader>
            <CardContent>
              <p>{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={translatedData}>
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
        <Bar dataKey="Buy" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="Sell" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>

    
   
   
    </div>
  );
  }
  
}

