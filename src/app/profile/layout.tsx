import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
