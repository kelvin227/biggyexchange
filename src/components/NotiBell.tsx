"use client";
import React, { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bell, BellDot } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
const NotiBell = ({tnotifications, tsentYou, tbtcLow,  notification}: {tnotifications: string, tsentYou: string, tbtcLow: string, notification: Notification[]}) => {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
        }, 10000); // refresh every 10 seconds

        return () => clearInterval(interval);
    }, [router]);
  return (
    <>
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
            
          >
            {
                notification.length <= 0 ? (
                    <Bell size={20} />
                )
                :
                (
                <BellDot size={20} className="text-blue-500"/>
            )
            }
            
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tnotifications}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{tsentYou}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <Link href={"/notification"}>
            <DropdownMenuItem>{tbtcLow}</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
     
  );
};

export default NotiBell;
