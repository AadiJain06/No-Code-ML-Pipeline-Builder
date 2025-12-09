import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StepPreprocess.css';

const StepPreprocess = ({ onComplete, pipelineState, stepId }) => {
  const [targetColumn, setTargetColumn] = useState('');
  const [preprocessingType, setPreprocessingType] = useState('');
  const [processing, setProcessing] = useState(false);
  const [preprocessInfo, setPreprocessInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pipelineState.upload_dataset?.column_names) {
      // Auto-select first column as target if not set
      if (!targetColumn && pipelineState.upload_dataset.column_names.length > 0) {
        setTargetColumn(pipelineState.upload_dataset.column_names[0]);
      }
    }
  }, [pipelineState.upload_dataset, targetColumn]);

  const handlePreprocess = async () => {
    if (!targetColumn) {
      setError('Please select a target column');
      return;
    }

    if (!preprocessingType) {
      setError('Please select a preprocessing method');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/preprocess', {
        type: preprocessingType,
        target_column: targetColumn
      });

      if (response.data.success) {
        setPreprocessInfo(response.data);
        onComplete(stepId, response.data);
      } else {
        setError(response.data.error || 'Preprocessing failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error preprocessing data. Make sure the backend is running.');
    } finally {
      setProcessing(false);
    }
  };

  const columns = pipelineState.upload_dataset?.column_names || [];

  return (
    <div className="step-preprocess">
      <h2>Step 2: Data Preprocessing</h2>
      <p className="step-description">
        Select your target variable and choose a preprocessing method to normalize or standardize your features.
      </p>

      <div className="preprocess-form">
        <div className="form-group">
          <label htmlFor="target-column">
            Target Column <span className="required">*</span>
          </label>
          <select
            id="target-column"
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            className="form-select"
            disabled={processing}
          >
            <option value="">Select target column...</option>
            {columns.map((col, idx) => (
              <option key={idx} value={col}>
                {col}
              </option>
            ))}
          </select>
          <small className="form-hint">
            The column you want to predict (dependent variable)
          </small>
        </div>

        <div className="form-group">
          <label>
            Preprocessing Method <span className="required">*</span>
          </label>
          <div className="preprocessing-options">
            <div
              className={`option-card ${preprocessingType === 'standardization' ? 'selected' : ''}`}
              onClick={() => !processing && setPreprocessingType('standardization')}
            >
              <div className="option-title">Standardization</div>
              <div className="option-description">
                Scales features to have mean=0 and std=1 (StandardScaler)
              </div>
            </div>

            <div
              className={`option-card ${preprocessingType === 'normalization' ? 'selected' : ''}`}
              onClick={() => !processing && setPreprocessingType('normalization')}
            >
              <div className="option-title">Normalization</div>
              <div className="option-description">
                Scales features to range [0, 1] (MinMaxScaler)
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handlePreprocess}
          disabled={processing || !targetColumn || !preprocessingType}
        >
          {processing ? (
            <>
              <span className="spinner-small"></span>
              Processing...
            </>
          ) : (
            'Apply Preprocessing'
          )}
        </button>
      </div>

      {preprocessInfo && (
        <div className="preprocess-result">
          <div className="result-header">
            <h3>Preprocessing applied successfully</h3>
          </div>
          
          <div className="result-info">
            <div className="result-item">
              <span className="result-label">Method:</span>
              <span className="result-value">{preprocessInfo.preprocessing_type}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Features:</span>
              <span className="result-value">{preprocessInfo.feature_count}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Samples:</span>
              <span className="result-value">{preprocessInfo.sample_count.toLocaleString()}</span>
            </div>
          </div>

          <div className="preview-section">
            <h4>Processed Data Preview</h4>
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(preprocessInfo.preview.features[0] || {}).map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {preprocessInfo.preview.features.slice(0, 5).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {Object.values(row).map((val, colIdx) => (
                        <td key={colIdx}>{typeof val === 'number' ? val.toFixed(4) : val}</td>
                      ))}
                      <td>{preprocessInfo.preview.target[rowIdx]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

export default StepPreprocess;

