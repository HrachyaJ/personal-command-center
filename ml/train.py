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

print("Fetching training data...") # print statement to indicate we're fetching data

base_url = os.environ.get("BASE_URL", "http://localhost:3001") # Get the base URL for the API from environment variable, default to localhost if not set

with urllib.request.urlopen(f"{base_url}/api/ml-data") as response: # Fetch the data from the API
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

# Save model + encoders so predict.py can load them
os.makedirs("ml", exist_ok=True)
joblib.dump({
    "model": model,
    "priority_encoder": priority_encoder,
    "category_encoder": category_encoder,
}, "ml/model.pkl")

print("Model saved to ml/model.pkl") # Confirm that the model was saved successfully
print(f"Features used: hour, day, priority, category, estimated_minutes, has_due_date, is_recurring") # Print the features used for training, which must match what predict.py expects