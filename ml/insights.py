import json
import sys
import urllib.request
import urllib.parse
import pandas as pd
import os

base_url = os.environ.get("BASE_URL", "http://localhost:3001")
user_id = os.environ.get("ML_USER_ID")

if not user_id:
    print(json.dumps([]))
    sys.exit(0)

# Fetch only this user's ml-data — the endpoint now filters by session,
# but we call via internal server-to-server with the userId in the URL
# so the route can trust it (internal only, not exposed publicly)
try:
    url = f"{base_url}/api/ml-data-internal?userId={urllib.parse.quote(user_id)}"
    with urllib.request.urlopen(url) as response:
        data = json.load(response)
except Exception as e:
    print(json.dumps([]))
    sys.exit(0)

df = pd.DataFrame(data)

if len(df) < 2:
    print(json.dumps([]))   # Not enough data to generate meaningful insights
    sys.exit(0)

insights = []
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def make_insight(insight_id, insight_type, title, description, priority, related_to, action_label=None):
    obj = {
        "id": insight_id,
        "type": insight_type,       # "tip" | "warning" | "achievement" | "pattern"
        "title": title,
        "description": description,
        "priority": priority,       # "high" | "medium" | "low"
        "relatedTo": related_to,    # "Tasks" | "Habits" | "Goals"
    }
    if action_label:
        obj["actionLabel"] = action_label
    return obj

# ── Time-of-day pattern ───────────────────────────────────────────────────────
hour_stats = df.groupby("hour")["completed"].mean()
if len(hour_stats) >= 2:
    worst_hour = int(hour_stats.idxmin())
    best_hour = int(hour_stats.idxmax())

    if hour_stats[best_hour] > 0.7:
        insights.append(make_insight(
            "ml-best-hour",
            "pattern",
            f"Peak focus window: {best_hour}:00–{best_hour+1}:00",
            f"You complete tasks most reliably around {best_hour}:00 "
            f"({int(hour_stats[best_hour]*100)}% completion rate). "
            f"Front-load your hardest work into this window.",
            "high",
            "Tasks",
            "Reschedule tasks",
        ))

    if hour_stats[worst_hour] < 0.4:
        insights.append(make_insight(
            "ml-worst-hour",
            "warning",
            f"Low success rate after {worst_hour}:00",
            f"Tasks started around {worst_hour}:00 have only a "
            f"{int(hour_stats[worst_hour]*100)}% completion rate. "
            f"Consider rescheduling them to your peak window.",
            "medium",
            "Tasks",
        ))

# ── Day-of-week pattern ───────────────────────────────────────────────────────
day_stats = df.groupby("day")["completed"].mean()
if len(day_stats) >= 2:
    worst_day = int(day_stats.idxmin())
    best_day = int(day_stats.idxmax())

    if day_stats[worst_day] < 0.4:
        insights.append(make_insight(
            "ml-worst-day",
            "warning",
            f"{DAY_NAMES[worst_day]} slump detected",
            f"Your task completion rate on {DAY_NAMES[worst_day]}s is "
            f"{int(day_stats[worst_day]*100)}% — your lowest. "
            f"Try reducing your task count or avoiding critical work that day.",
            "high",
            "Tasks",
            f"View {DAY_NAMES[worst_day]} tasks",
        ))

    if day_stats[best_day] > 0.7:
        insights.append(make_insight(
            "ml-best-day",
            "pattern",
            f"{DAY_NAMES[best_day]}s are your most productive",
            f"You complete {int(day_stats[best_day]*100)}% of tasks on "
            f"{DAY_NAMES[best_day]}s — your best day by far. "
            f"Schedule important or high-priority tasks then.",
            "medium",
            "Tasks",
        ))

# ── Overload insight ──────────────────────────────────────────────────────────
daily_counts = df.groupby("day").size()
if len(daily_counts) >= 2:
    busiest_day = int(daily_counts.idxmax())
    if daily_counts[busiest_day] > daily_counts.mean() * 1.5:
        insights.append(make_insight(
            "ml-overload",
            "warning",
            f"Task overload on {DAY_NAMES[busiest_day]}s",
            f"You schedule significantly more tasks on {DAY_NAMES[busiest_day]}s "
            f"than any other day ({int(daily_counts[busiest_day])} vs avg "
            f"{daily_counts.mean():.1f}). This gap likely causes stress and "
            f"a false sense of falling behind.",
            "medium",
            "Tasks",
            f"Review {DAY_NAMES[busiest_day]}s",
        ))

# ── High completion achievement ───────────────────────────────────────────────
overall_rate = df["completed"].mean()
if overall_rate > 0.75:
    insights.append(make_insight(
        "ml-high-completion",
        "achievement",
        f"{int(overall_rate*100)}% overall completion rate",
        f"You're completing {int(overall_rate*100)}% of your tasks — "
        f"well above average. Your planning and follow-through are strong.",
        "low",
        "Tasks",
    ))

print(json.dumps(insights))