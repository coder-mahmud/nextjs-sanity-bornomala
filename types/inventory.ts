// types/inventory.ts
export interface Student {
  id: string;
  studentId?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  subscriptionDate?: string;
  totalAmount: number;
  discount: number;
  paidAmount: number;
  due: number;
  location: "PARIS" | "HOCHE" | "ONLINE";
}

export interface InventoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  students: Student[];
}