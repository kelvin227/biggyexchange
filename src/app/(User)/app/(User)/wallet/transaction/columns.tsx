"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  Date: number
  Transaction_type: string
  asset: string
  amount: number
  description: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "Date",
    header: "Date",
  },
  {
    accessorKey: "Transaction_type",
    header: "Transaction Type",
  },
  {
    accessorKey: "asset",
    header: "Asset",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "description",
    header: "Description",
  }
]
