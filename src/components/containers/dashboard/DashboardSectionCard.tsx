import { Card, CardContent } from "../../ui/card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardSectionCard({ title, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}
