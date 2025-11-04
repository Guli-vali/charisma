import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}

