import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function SkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
