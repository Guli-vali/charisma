import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
