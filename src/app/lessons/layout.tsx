import { SharedAuthLayout } from '@/components/layout/SharedAuthLayout';

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedAuthLayout>{children}</SharedAuthLayout>;
}
