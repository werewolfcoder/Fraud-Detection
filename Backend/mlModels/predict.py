import sys
import json
import logging
import os
import joblib
import pandas as pd
from pathlib import Path

# Configure logging to write to file instead of stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='fraud_detection.log'  # Write logs to file instead of stdout
)
logger = logging.getLogger(__name__)

try:
    # Get the absolute path to the mlModels directory
    base_dir = "r"+Path(__file__).parent.absolute()
    
    # Define model paths
    model_files = {
        'xgb': base_dir / 'xgboost_fraud_model.pkl(1)',
        'lgb': base_dir / 'lightgbm_fraud_model.pkl(1)',
        'scaler': base_dir / 'scaler.pkl(1)',
        'label_encoders': base_dir / 'label_encoders.pkl(1)',
        'feature_names': base_dir / 'feature_names.pkl(1)'
    }

    # Load models and preprocessing objects
    xgb_model = joblib.load(model_files['xgb'])
    lgb_model = joblib.load(model_files['lgb'])
    scaler = joblib.load(model_files['scaler'])
    label_encoders = joblib.load(model_files['label_encoders'])
    feature_names = joblib.load(model_files['feature_names'])

    def process_features(data):
        # Convert input features to match model's expected format
        required_features = [
            'Gender', 'Age', 'State', 'City', 'Bank_Branch', 'Account_Type',
            'Transaction_Amount', 'Merchant_ID', 'Transaction_Type', 
            'Merchant_Category', 'Account_Balance', 'Transaction_Device',
            'Transaction_Location', 'Device_Type', 'Transaction_Currency',
            'Transaction_Hour', 'Is_Night_Transaction'
        ]
        
        df = pd.DataFrame([{
            'Gender': 'unknown',
            'Age': 0,
            'State': data['transaction_location'],
            'City': data['transaction_location'],
            'Bank_Branch': 'unknown',
            'Account_Type': 'unknown',
            'Transaction_Amount': data['transaction_amount'],
            'Merchant_ID': 'unknown',
            'Transaction_Type': data['transaction_type'],
            'Merchant_Category': data['merchant_category'],
            'Account_Balance': data['account_balance'],
            'Transaction_Device': 'unknown',
            'Transaction_Location': data['transaction_location'],
            'Device_Type': 'unknown',
            'Transaction_Currency': 'INR',
            'Transaction_Hour': data['transaction_hour'],
            'Is_Night_Transaction': data['transaction_hour'] >= 20 or data['transaction_hour'] < 6
        }])
        
        return df[required_features]

    # Read input from Node.js and make prediction
    input_data = json.loads(sys.stdin.read())
    features_df = process_features(input_data)
    
    xgb_prob = xgb_model.predict_proba(features_df)[:, 1][0]
    lgb_prob = lgb_model.predict_proba(features_df)[:, 1][0]
    final_prob = (xgb_prob + lgb_prob) / 2

    # Print only the JSON result to stdout
    print(json.dumps({
        "fraud_probability": float(final_prob),
        "is_fraud": bool(final_prob > 0.5)
    }))

except Exception as e:
    logger.error("Fatal error", exc_info=True)
    # Print only JSON to stdout
    print(json.dumps({
        "fraud_probability": 0.1,
        "is_fraud": False
    }))
