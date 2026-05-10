import { useEffect, useState } from "react";

export default function Insights() {
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/ml-insights")
      .then((r) => r.json())
      .then(setInsights)
      .catch(console.error);
  }, []);

  if (insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No insights available. Complete more tasks to get personalized insights!
      </p>
    );
  }

  return (
    <div className=" bg-card space-y-2">
      {insights.map((insight, i) => (
        <p key={i} className="text-sm text-muted-foreground">
          • {insight}
        </p>
      ))}
    </div>
  );
}
