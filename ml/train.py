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
import urllib.parse
import os

print("Fetching training data...")

base_url = os.environ.get("BASE_URL", "http://localhost:3001")
user_id = os.environ.get("ML_USER_ID")

if not user_id:
    print("ML_USER_ID not set — cannot train without a user context.")
    exit(1)

url = f"{base_url}/api/ml-data-internal?userId={urllib.parse.quote(user_id)}"
with urllib.request.urlopen(url) as response:
    data = json.load(response)

df = pd.DataFrame(data) # Convert the data to a DataFrame for training

print(f"Loaded {len(df)} tasks ({df['completed'].sum()} completed, {(~df['completed'].astype(bool)).sum()} not completed)") # Print summary of the data loaded, including total tasks and how many were completed vs not completed

# Guard: need at least 10 tasks with both outcomes to train meaningfully
if len(df) < 10 or df["completed"].nunique() < 2:
    print("Not enough data to train yet. Need at least 10 tasks with both completed and incomplete examples.")
    exit(1)

# Encode categorical features
priority_encoder = LabelEncoder()
category_encoder = LabelEncoder()

df["priority_encoded"] = priority_encoder.fit_transform(df["priority"].fillna("low")) # Fill missing priorities with "low" before encoding
df["category_encoded"] = category_encoder.fit_transform(df["category"].fillna("other")) # Fill missing categories with "other" before encoding

X = df[[ 
    "hour",
    "day",
    "priority_encoded",
    "category_encoded",
    "estimated_minutes",
    "has_due_date",
    "is_recurring",
]] # These are the features our model will use to predict task completion. Must match the order and names used in predict.py
y = df["completed"] # Target variable: whether the task was completed or not

model = LogisticRegression(max_iter=1000) # Logistic Regression is a simple, interpretable model that works well for binary classification tasks like this. We set max_iter=1000 to ensure it converges even on small datasets.
model.fit(X, y) # Train the model on our data

# Save model per-user so multiple users don't overwrite each other
model_dir = f"ml/models/{user_id}"
os.makedirs(model_dir, exist_ok=True)
model_path = f"{model_dir}/model.pkl"

joblib.dump({
    "model": model,
    "priority_encoder": priority_encoder,
    "category_encoder": category_encoder,
}, model_path)

print(f"Model saved to {model_path}")
print(f"Features used: hour, day, priority, category, estimated_minutes, has_due_date, is_recurring")