import AdminLayoutClient from '../AdminLayoutClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
