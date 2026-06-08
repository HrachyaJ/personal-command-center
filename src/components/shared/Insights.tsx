import { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, authFetchJson } from "../../lib/utils";

type Status = "loading" | "error" | "empty" | "ready";

export default function Insights() {
  const [insights, setInsights] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    setStatus("loading");

    authFetchJson<string[]>(
      `${API_BASE}/api/ml-insights`,
      {},
      "Failed to load insights.",
    )
      .then((data) => {
        setInsights(data);
        setStatus(data.length === 0 ? "empty" : "ready");
      })
      .catch(() => {
        toast.error("Unable to load insights. Please try again later.");
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded w-full" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-destructive">
        Couldn't load insights. Try again later.
      </p>
    );
  }

  if (status === "empty") {
    return (
      <p className="text-sm text-muted-foreground">
        No insights yet. Complete more tasks to get personalized insights!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          • {insight}
        </p>
      ))}
    </div>
  );
}
