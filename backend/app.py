from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import json

app = Flask(__name__)
CORS(app)

# Global variables to store pipeline state
pipeline_data = {
    'dataset': None,
    'processed_data': None,
    'preprocessing_applied': None,
    'X_train': None,
    'X_test': None,
    'y_train': None,
    'y_test': None,
    'target_column': None,
    'feature_columns': None,
    'model': None,
    'model_type': None,
    'predictions': None,
    'accuracy': None
}

@app.route('/api/upload', methods=['POST'])
def upload_dataset():
    """Handle dataset upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file based on extension
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file)
        else:
            return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel file.'}), 400
        
        # Reset pipeline state
        pipeline_data['dataset'] = df.to_dict('records')
        pipeline_data['processed_data'] = None
        pipeline_data['preprocessing_applied'] = None
        
        # Return dataset info
        return jsonify({
            'success': True,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'data_types': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'preview': df.head(10).to_dict('records'),
            'missing_values': df.isnull().sum().to_dict()
        })
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/preprocess', methods=['POST'])
def preprocess_data():
    """Apply preprocessing to the dataset"""
    try:
        data = request.json
        preprocessing_type = data.get('type')  # 'standardization' or 'normalization'
        target_column = data.get('target_column')
        
        if pipeline_data['dataset'] is None:
            return jsonify({'error': 'No dataset uploaded'}), 400
        
        df = pd.DataFrame(pipeline_data['dataset'])
        
        # Separate features and target
        if target_column not in df.columns:
            return jsonify({'error': 'Target column not found'}), 400
        
        feature_columns = [col for col in df.columns if col != target_column]
        X = df[feature_columns].select_dtypes(include=[np.number])
        y = df[target_column]
        
        # Convert target to discrete classes if needed
        target_note = None
        if not pd.api.types.is_numeric_dtype(y):
            # Categorical string target -> encode
            y = pd.Categorical(y).codes
            target_note = "Target was categorical text and was encoded to numeric classes."
        else:
            # Numeric target: ensure it's suitable for classification
            unique_vals = pd.unique(y)
            unique_count = len(unique_vals)
            is_integer_like = np.all(np.equal(np.mod(unique_vals, 1), 0))

            if unique_count > 20 or not is_integer_like:
                # Continuous target: bin into 4 quantiles for classification
                y_binned, bins = pd.qcut(y, q=4, labels=False, duplicates='drop', retbins=True)
                y = y_binned
                target_note = (
                    "Target appeared continuous; it was binned into quartiles for classification. "
                    f"Bins: {bins.tolist()}"
                )
            elif unique_count <= 1:
                return jsonify({'error': 'Target column has only one class; cannot train a classifier.'}), 400
            else:
                # Integer-like classes are fine
                y = y.astype(int)
        
        # Apply preprocessing
        if preprocessing_type == 'standardization':
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            pipeline_data['preprocessing_applied'] = 'StandardScaler'
        elif preprocessing_type == 'normalization':
            scaler = MinMaxScaler()
            X_scaled = scaler.fit_transform(X)
            pipeline_data['preprocessing_applied'] = 'MinMaxScaler'
        else:
            X_scaled = X.values
            pipeline_data['preprocessing_applied'] = None
        
        # Store processed data
        X_df = pd.DataFrame(X_scaled, columns=X.columns)
        pipeline_data['processed_data'] = {
            'features': X_df.to_dict('records'),
            'target': y.tolist(),
            'feature_columns': X.columns.tolist()
        }
        pipeline_data['target_column'] = target_column
        pipeline_data['feature_columns'] = X.columns.tolist()
        
        response = {
            'success': True,
            'preprocessing_type': preprocessing_type,
            'feature_count': len(X.columns),
            'sample_count': len(X),
            'preview': {
                'features': X_df.head(5).to_dict('records'),
                'target': y.head(5).tolist()
            }
        }

        if target_note:
            response['target_note'] = target_note

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'Error preprocessing data: {str(e)}'}), 500

@app.route('/api/split', methods=['POST'])
def split_data():
    """Perform train-test split"""
    try:
        data = request.json
        test_size = float(data.get('test_size', 0.2))
        
        if pipeline_data['processed_data'] is None:
            return jsonify({'error': 'Please preprocess data first'}), 400
        
        # Reconstruct data
        X_df = pd.DataFrame(pipeline_data['processed_data']['features'])
        y = np.array(pipeline_data['processed_data']['target'])
        
        # Determine safe stratify usage
        unique_labels, label_counts = np.unique(y, return_counts=True)
        stratify_labels = None
        stratify_reason = None

        if len(unique_labels) > 1 and label_counts.min() >= 2:
            stratify_labels = y
        else:
            stratify_reason = "Not enough samples per class for stratified split; using random split instead."

        # Perform split
        X_train, X_test, y_train, y_test = train_test_split(
            X_df,
            y,
            test_size=test_size,
            random_state=42,
            stratify=stratify_labels
        )
        
        # Store split data
        pipeline_data['X_train'] = X_train.values.tolist()
        pipeline_data['X_test'] = X_test.values.tolist()
        pipeline_data['y_train'] = y_train.tolist()
        pipeline_data['y_test'] = y_test.tolist()
        
        response = {
            'success': True,
            'train_size': len(X_train),
            'test_size': len(X_test),
            'train_ratio': 1 - test_size,
            'test_ratio': test_size
        }

        if stratify_reason:
            response['note'] = stratify_reason

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': f'Error splitting data: {str(e)}'}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    """Train the selected model"""
    try:
        data = request.json
        model_type = data.get('model_type')  # 'logistic_regression' or 'decision_tree'
        
        if pipeline_data['X_train'] is None:
            return jsonify({'error': 'Please split data first'}), 400
        
        # Reconstruct data
        X_train = np.array(pipeline_data['X_train'])
        X_test = np.array(pipeline_data['X_test'])
        y_train = np.array(pipeline_data['y_train'])
        y_test = np.array(pipeline_data['y_test'])
        
        # Train model
        if model_type == 'logistic_regression':
            model = LogisticRegression(random_state=42, max_iter=1000)
            pipeline_data['model_type'] = 'Logistic Regression'
        elif model_type == 'decision_tree':
            model = DecisionTreeClassifier(random_state=42)
            pipeline_data['model_type'] = 'Decision Tree Classifier'
        else:
            return jsonify({'error': 'Invalid model type'}), 400
        
        model.fit(X_train, y_train)
        pipeline_data['model'] = model
        
        # Make predictions
        y_pred = model.predict(X_test)
        pipeline_data['predictions'] = y_pred.tolist()
        
        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)
        pipeline_data['accuracy'] = float(accuracy)
        
        # Generate classification report
        report = classification_report(y_test, y_pred, output_dict=True)
        
        # Generate confusion matrix visualization
        cm = confusion_matrix(y_test, y_pred)
        cm_base64 = generate_confusion_matrix(cm, pipeline_data['model_type'])
        
        return jsonify({
            'success': True,
            'model_type': pipeline_data['model_type'],
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix_image': cm_base64,
            'predictions_count': len(y_pred)
        })
    except Exception as e:
        return jsonify({'error': f'Error training model: {str(e)}'}), 500

def generate_confusion_matrix(cm, model_type):
    """Generate confusion matrix visualization"""
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=True)
    plt.title(f'Confusion Matrix - {model_type}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Convert to base64
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.read()).decode('utf-8')
    plt.close()
    
    return img_base64

@app.route('/api/pipeline/status', methods=['GET'])
def get_pipeline_status():
    """Get current pipeline status"""
    return jsonify({
        'dataset_uploaded': pipeline_data['dataset'] is not None,
        'preprocessing_applied': pipeline_data['preprocessing_applied'],
        'data_split': pipeline_data['X_train'] is not None,
        'model_trained': pipeline_data['model'] is not None,
        'accuracy': pipeline_data['accuracy']
    })

@app.route('/api/reset', methods=['POST'])
def reset_pipeline():
    """Reset the entire pipeline"""
    global pipeline_data
    pipeline_data = {
        'dataset': None,
        'processed_data': None,
        'preprocessing_applied': None,
        'X_train': None,
        'X_test': None,
        'y_train': None,
        'y_test': None,
        'target_column': None,
        'feature_columns': None,
        'model': None,
        'model_type': None,
        'predictions': None,
        'accuracy': None
    }
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

