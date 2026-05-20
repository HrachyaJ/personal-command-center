"""
train.py — Run this to train and save the model.
Usage: py ml/train.py

Run this manually for now, or once a day.
The model is saved to ml/model.pkl and reused by predict.py.
"""

import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import joblib
import urllib.request
import os

print("Fetching training data...")

base_url = os.environ.get("BASE_URL", "http://localhost:3001")
with urllib.request.urlopen(f"{base_url}/api/ml-data") as response:
    data = json.load(response)

df = pd.DataFrame(data)

print(f"Loaded {len(df)} tasks ({df['completed'].sum()} completed, {(~df['completed'].astype(bool)).sum()} not completed)")

# Guard: need at least 10 tasks with both outcomes to train meaningfully
if len(df) < 10 or df["completed"].nunique() < 2:
    print("Not enough data to train yet. Need at least 10 tasks with both completed and incomplete examples.")
    exit(1)

# Encode categorical features
priority_encoder = LabelEncoder()
category_encoder = LabelEncoder()

df["priority_encoded"] = priority_encoder.fit_transform(df["priority"].fillna("low"))
df["category_encoded"] = category_encoder.fit_transform(df["category"].fillna("other"))

X = df[[
    "hour",
    "day",
    "priority_encoded",
    "category_encoded",
    "estimated_minutes",
    "has_due_date",
    "is_recurring",
]]
y = df["completed"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# Save model + encoders so predict.py can load them
os.makedirs("ml", exist_ok=True)
joblib.dump({
    "model": model,
    "priority_encoder": priority_encoder,
    "category_encoder": category_encoder,
}, "ml/model.pkl")

print("Model saved to ml/model.pkl")
print(f"Features used: hour, day, priority, category, estimated_minutes, has_due_date, is_recurring")