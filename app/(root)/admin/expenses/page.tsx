// app/admin/expenses/page.tsx
import { auth } from "@/auth";
import DailyExpensesListPage from "./ExpenseClient";
export default async function Page() {
  const session = await auth();
  const userRole = session?.user?.role || "ADMIN"; // Fallback role

  return <DailyExpensesListPage userRole={userRole} />;
}