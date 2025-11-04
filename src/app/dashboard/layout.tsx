import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
