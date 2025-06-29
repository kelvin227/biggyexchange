import { Payment, columns } from "@/app/(User)/app/(User)/wallet/columns";
import { DataTable } from "@/app/(User)/app/(User)/user_dashboard/data-table";
 
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      Coins: 100,
      Balance: 200,
    },
    {
        id: "728ed52f",
        Coins: 100,
        Balance: 200,
    },
    {
        id: "728ed52f",
        Coins: 100,
        Balance: 200,
    }
    // ...
  ]
}
export async function AppTable() {
    const data = await getData()
    return (
        <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
    )
}