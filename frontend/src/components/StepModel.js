import React, { useState } from 'react';
import axios from 'axios';
import './StepModel.css';

const StepModel = ({ onComplete, pipelineState, stepId }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [training, setTraining] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleTrain = async () => {
    if (!selectedModel) {
      setError('Please select a model');
      return;
    }

    setTraining(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/train', {
        model_type: selectedModel
      });

      if (response.data.success) {
        setModelInfo(response.data);
        onComplete(stepId, response.data);
      } else {
        setError(response.data.error || 'Training failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error training model. Make sure the backend is running.');
    } finally {
      setTraining(false);
    }
  };

  const models = [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      description: 'Linear model for classification. Fast and interpretable, works well for linearly separable data.',
      color: '#1f5fbf'
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree Classifier',
      description: 'Tree-based model that makes decisions by splitting data. Good for non-linear relationships.',
      color: '#1f5fbf'
    }
  ];

  return (
    <div className="step-model">
      <h2>Step 4: Select & Train Model</h2>
      <p className="step-description">
        Choose a machine learning model to train on your preprocessed data. The model will learn patterns 
        from your training set and be evaluated on the test set.
      </p>

      <div className="model-selection">
        <div className="model-options">
          {models.map((model) => (
            <div
              key={model.id}
              className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => !training && setSelectedModel(model.id)}
              style={{
                borderColor: selectedModel === model.id ? model.color : '#dee2e6',
                boxShadow: selectedModel === model.id ? `0 0 0 3px ${model.color}20` : 'none'
              }}
            >
              <div className="model-name">{model.name}</div>
              <div className="model-description">{model.description}</div>
              {selectedModel === model.id && (
                <div className="selected-badge" style={{ background: model.color }}>
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={handleTrain}
          disabled={training || !selectedModel}
        >
          {training ? (
            <>
              <span className="spinner-small"></span>
              Training Model...
            </>
          ) : (
            'Train Model'
          )}
        </button>
      </div>

      {modelInfo && (
        <div className="training-result">
          <div className="result-header">
            <h3>Model trained successfully</h3>
          </div>
          
          <div className="accuracy-display">
            <div className="accuracy-circle">
              <div className="accuracy-value">{(modelInfo.accuracy * 100).toFixed(2)}%</div>
              <div className="accuracy-label">Accuracy</div>
            </div>
          </div>

          <div className="model-details">
            <div className="detail-item">
              <span className="detail-label">Model Type:</span>
              <span className="detail-value">{modelInfo.model_type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Test Samples:</span>
              <span className="detail-value">{modelInfo.predictions_count.toLocaleString()}</span>
            </div>
          </div>

          {modelInfo.confusion_matrix_image && (
            <div className="confusion-matrix-section">
              <h4>Confusion Matrix</h4>
              <div className="matrix-container">
                <img
                  src={`data:image/png;base64,${modelInfo.confusion_matrix_image}`}
                  alt="Confusion Matrix"
                  className="confusion-matrix-img"
                />
              </div>
            </div>
          )}

          {modelInfo.classification_report && (
            <div className="classification-report">
              <h4>Classification Report</h4>
              <div className="report-table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {Object.keys(modelInfo.classification_report)
                        .filter(key => key !== 'accuracy' && key !== 'macro avg' && key !== 'weighted avg')
                        .map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['precision', 'recall', 'f1-score'].map((metric) => (
                      <tr key={metric}>
                        <td className="metric-name">{metric}</td>
                        {Object.keys(modelInfo.classification_report)
                          .filter(key => key !== 'accuracy' && key !== 'macro avg' && key !== 'weighted avg')
                          .map((key) => (
                            <td key={key}>
                              {modelInfo.classification_report[key][metric]?.toFixed(3) || 'N/A'}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default StepModel;

