import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from '@/components/admin/AdminSideBar'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  // console.log("Session from admin/layout:",session)

  if (!session) {
    redirect("/login");
  }

  if (
    session?.user?.role !== "ADMIN" &&
    session?.user?.role !== "SUPERADMIN"
  ) {
    redirect("/dashboard");
  }

  return (
    <>
      <section className="admin_section pt-4 pb-10 lg:pt-10">
        <div className="container">

          <div className="min-h-screen bg-gray-50">
            <div className="flex min-h-screen flex-col md:flex-row">
              <AdminSidebar />

              <main className="flex-1 px-4 md:px-6">
                <div className="min-h-[calc(100vh-2rem)] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>          
        </div>
      </section>
    </>
  );
}