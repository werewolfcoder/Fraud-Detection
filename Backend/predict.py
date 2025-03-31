import pickle
import sys
import json

# Load model
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

# Read input from Node.js
input_data = json.loads(sys.stdin.read())

# Prepare features (match your model's input requirements)
features = [
    input_data['amount'],
    input_data['ctx_avg_amount'],
    input_data['ctx_fraud_count']
]

# Make prediction
prediction = model.predict_proba([features])[0][1]  # Fraud probability

# Return result to Node.js
print(json.dumps({
    "fraud_probability": float(prediction),
    "is_fraud": int(prediction > 0.5)
}))