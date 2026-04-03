import { auth } from "@/auth";
import { redirect } from "next/navigation";



export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth();
  // console.log("Session from auth layout:", session);
  if(!session){
    redirect("/login");
  }
  if(session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN'){
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col">
        {children}
    </div>
  );
}