import { Card, CardContent } from "../../ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  testId?: string;
}

export function DashboardStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor,
  iconBg,
  testId,
}: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground leading-tight">
              {title}
            </p>
            <p className="text-xl sm:text-2xl font-semibold mt-1 leading-none">
              {value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight truncate">
              {subtext}
            </p>
          </div>
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
