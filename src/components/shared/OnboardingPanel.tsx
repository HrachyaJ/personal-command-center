import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Sparkles, CheckCircle2 } from "lucide-react";

export interface OnboardingStep {
  title: string;
  description: string;
}

interface OnboardingPanelProps {
  title: string;
  subtitle: string;
  steps: OnboardingStep[];
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingDialogProps extends OnboardingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingPanel({
  title,
  subtitle,
  steps,
  primaryAction,
  secondaryAction,
}: OnboardingPanelProps) {
  return (
    <Card className="bg-card border-border rounded-3xl shadow-sm overflow-hidden">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Getting started
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="grid gap-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-3 rounded-2xl border border-border bg-muted p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 font-semibold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Pro tip</p>
            <p className="text-xs text-muted-foreground">
              Start simple and build momentum. One focused entry can drive your
              day.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {primaryAction.label}
            </Button>
            {secondaryAction ? (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OnboardingDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  steps,
  primaryAction,
  secondaryAction,
}: OnboardingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl rounded-3xl p-0">
        <Card className="border-none shadow-none overflow-hidden">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Getting started
                  </p>
                  <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground">
                    {title}
                  </DialogTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-3 rounded-2xl border border-border bg-muted p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Pro tip</p>
                <p className="text-xs text-muted-foreground">
                  Start simple and build momentum. One focused entry can drive
                  your day.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {primaryAction.label}
                </Button>
                {secondaryAction ? (
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    className="w-full sm:w-auto"
                  >
                    {secondaryAction.label}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
