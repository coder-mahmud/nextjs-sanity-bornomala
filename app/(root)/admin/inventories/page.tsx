// app/admin/inventories/page.tsx
import { auth } from "@/auth";
import InventoryClient from "./InventoryClient";

export default async function Page() {
  const session = await auth();
  const userRole = session?.user?.role || "ADMIN"; // Fallback role

  return <InventoryClient userRole={userRole} />;
}