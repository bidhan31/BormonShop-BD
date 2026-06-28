import AdminDashboardLayout from "@/components/AdminDashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
