export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Урок рендерится на полный экран без Header и Sidebar
  return <>{children}</>;
}
