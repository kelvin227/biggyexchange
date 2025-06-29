"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Ads = {
  id: string;
  username: string;
  price: number;
  quantity: number;
  payment: "Wallet";
};

export const columns: ColumnDef<Ads>[] = [
  {
    accessorKey: "username",
    header: "username",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "minQty",
    header: "minQty",
  },
  {
    accessorKey: "payment",
    header: "payment",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <Button asChild>
          <Dialog>
            <DialogTrigger className="bg-green-500 w-full rounded-md h-9">
              Buy
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Announcement</DialogTitle>
              The P2P has been Disabled From The Admin Panel Please contact
              admin to quickly resume
            </DialogContent>
          </Dialog>
        </Button>
      );
    },
  },
];
