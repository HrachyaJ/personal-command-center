import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
import sys
import urllib.request

with urllib.request.urlopen("http://localhost:3001/api/ml-data") as response:
    data = json.load(response)

df = pd.DataFrame(data)

hour = int(sys.argv[1])
day = int(sys.argv[2])

# Guard: not enough data to train
if len(df) < 2 or df["completed"].nunique() < 2:
    completed = df["completed"].sum() if len(df) > 0 else 0
    total = len(df) if len(df) > 0 else 1
    print(f"Probability of completion: {completed / total:.2f}")
    sys.exit(0)

X = df[["hour", "day"]]
y = df["completed"]

model = LogisticRegression()
model.fit(X, y)

test = pd.DataFrame([[hour, day]], columns=["hour", "day"])
prob = model.predict_proba(test)[0][1]

# print(f"Probability of completion: {prob:.2f}")
print(prob)
