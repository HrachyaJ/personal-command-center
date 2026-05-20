import json
import sys
import urllib.request
import pandas as pd

import os
base_url = os.environ.get("BASE_URL", "http://localhost:3001")
with urllib.request.urlopen(f"{base_url}/api/ml-data") as response:
    data = json.load(response)

df = pd.DataFrame(data)

if len(df) < 2:
    print(json.dumps([]))
    sys.exit(0)

insights = []

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# --- Hour-based insight ---
hour_stats = df.groupby("hour")["completed"].mean()
worst_hour = hour_stats.idxmin()
best_hour = hour_stats.idxmax()

if hour_stats[worst_hour] < 0.4:
    insights.append(f"Tasks created after {worst_hour}:00 have a low success rate — try scheduling them earlier.")

if hour_stats[best_hour] > 0.7:
    insights.append(f"You complete tasks most reliably around {best_hour}:00 — great time to tackle hard ones.")

# --- Day-based insight ---
day_stats = df.groupby("day")["completed"].mean()
worst_day = day_stats.idxmin()
best_day = day_stats.idxmax()

if day_stats[worst_day] < 0.4:
    insights.append(f"You struggle most on {DAY_NAMES[worst_day]}s — consider reducing your workload that day.")

if day_stats[best_day] > 0.7:
    insights.append(f"{DAY_NAMES[best_day]}s are your most productive day — schedule important tasks then.")

# --- Overload insight ---
daily_counts = df.groupby("day").size()
busiest_day = daily_counts.idxmax()
if daily_counts[busiest_day] > daily_counts.mean() * 1.5:
    insights.append(f"You tend to overload yourself on {DAY_NAMES[busiest_day]}s — try spreading tasks across the week.")

print(json.dumps(insights))