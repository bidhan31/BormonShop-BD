import UserDashboardLayout from "@/components/UserDashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>;
}
