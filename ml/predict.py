"""
predict.py — Loads the saved model and returns a completion probability.
Usage: py ml/predict.py <hour> <day> <priority> <category> <estimated_minutes> <has_due_date> <is_recurring>

Called by /api/predict in index.ts on every task add.
Fast because it just loads ml/model.pkl — no retraining.
"""

import sys
import joblib
import pandas as pd
import os

user_id = os.environ.get("ML_USER_ID")
model_path = f"ml/models/{user_id}/model.pkl" if user_id else "ml/model.pkl"

if not os.path.exists(model_path):
    print("MODEL_NOT_TRAINED")
    sys.exit(0)

# Load args passed from index.ts
hour            = int(sys.argv[1])
day             = int(sys.argv[2])
priority        = sys.argv[3]
category        = sys.argv[4]
est_minutes     = float(sys.argv[5])
has_due_date    = int(sys.argv[6])
is_recurring    = int(sys.argv[7])

# Load saved model + encoders
bundle = joblib.load(model_path)
model             = bundle["model"]
priority_encoder  = bundle["priority_encoder"]
category_encoder  = bundle["category_encoder"]

# Encode categoricals — handle unseen labels gracefully
def safe_encode(encoder, value):
    if value in encoder.classes_:
        return encoder.transform([value])[0]
    return 0  # fallback to 0 for unknown values

priority_enc = safe_encode(priority_encoder, priority)
category_enc = safe_encode(category_encoder, category)

# Build input row — must match exact columns used in train.py
input_df = pd.DataFrame([[
    hour,
    day,
    priority_enc,
    category_enc,
    est_minutes,
    has_due_date,
    is_recurring,
]], columns=[
    "hour",
    "day",
    "priority_encoded",
    "category_encoded",
    "estimated_minutes",
    "has_due_date",
    "is_recurring",
])

prob = model.predict_proba(input_df)[0][1] # Get probability of completion (class 1)
print(prob)