import json
import sys
import urllib.request
import pandas as pd
import os

base_url = os.environ.get("BASE_URL", "http://localhost:3001") # Get the base URL for the API from environment variable, default to localhost if not set

with urllib.request.urlopen(f"{base_url}/api/ml-data") as response:  # Fetch the data from the API
    data = json.load(response)

df = pd.DataFrame(data) # Convert the data to a DataFrame for analysis

if len(df) < 2:
    print(json.dumps([]))   # Not enough data to generate insights
    sys.exit(0)

insights = [] # List to hold generated insights

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] # Helper for day names

# --- Hour-based insight ---
hour_stats = df.groupby("hour")["completed"].mean() # Calculate completion rate by hour of the day
worst_hour = hour_stats.idxmin() # Find the hour with the lowest completion rate
best_hour = hour_stats.idxmax() # Find the hour with the highest completion rate

if hour_stats[worst_hour] < 0.4:
    insights.append(f"Tasks created after {worst_hour}:00 have a low success rate — try scheduling them earlier.") # Suggest scheduling tasks earlier if the worst hour has a low completion rate

if hour_stats[best_hour] > 0.7:
    insights.append(f"You complete tasks most reliably around {best_hour}:00 — great time to tackle hard ones.") # Suggest scheduling important tasks during the best hour if it has a high completion rate

# --- Day-based insight ---
day_stats = df.groupby("day")["completed"].mean() # Calculate completion rate by day of the week (0=Monday, 6=Sunday)
worst_day = day_stats.idxmin() # Find the day with the lowest completion rate
best_day = day_stats.idxmax() # Find the day with the highest completion rate

if day_stats[worst_day] < 0.4:
    insights.append(f"You struggle most on {DAY_NAMES[worst_day]}s — consider reducing your workload that day.") # Suggest reducing workload on the worst day if it has a low completion rate

if day_stats[best_day] > 0.7:
    insights.append(f"{DAY_NAMES[best_day]}s are your most productive day — schedule important tasks then.") # Suggest scheduling important tasks on the best day if it has a high completion rate

# --- Overload insight ---
daily_counts = df.groupby("day").size() # Check if there's a day with significantly more tasks than the average, which could indicate overload
busiest_day = daily_counts.idxmax() # Find the day with the most tasks
if daily_counts[busiest_day] > daily_counts.mean() * 1.5: # If the busiest day has 50% more tasks than the average, suggest spreading them out
    insights.append(f"You tend to overload yourself on {DAY_NAMES[busiest_day]}s — try spreading tasks across the week.") # Suggest spreading tasks across the week if one day has significantly more tasks than average

print(json.dumps(insights))