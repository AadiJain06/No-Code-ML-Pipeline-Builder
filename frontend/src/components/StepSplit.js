import React, { useState } from 'react';
import axios from 'axios';
import './StepSplit.css';

const StepSplit = ({ onComplete, pipelineState, stepId }) => {
  const [testSize, setTestSize] = useState(0.2);
  const [splitting, setSplitting] = useState(false);
  const [splitInfo, setSplitInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleSplit = async () => {
    setSplitting(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/split', {
        test_size: testSize
      });

      if (response.data.success) {
        setSplitInfo(response.data);
        onComplete(stepId, response.data);
      } else {
        setError(response.data.error || 'Split failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error splitting data. Make sure the backend is running.');
    } finally {
      setSplitting(false);
    }
  };

  const splitOptions = [
    { label: '70% Train / 30% Test', value: 0.3 },
    { label: '80% Train / 20% Test', value: 0.2 },
    { label: '75% Train / 25% Test', value: 0.25 },
    { label: '90% Train / 10% Test', value: 0.1 }
  ];

  return (
    <div className="step-split">
      <h2>Step 3: Train-Test Split</h2>
      <p className="step-description">
        Split your dataset into training and testing sets. The training set will be used to train the model, 
        and the testing set will be used to evaluate its performance.
      </p>

      <div className="split-form">
        <div className="form-group">
          <label>Split Ratio</label>
          <div className="split-options">
            {splitOptions.map((option, idx) => (
              <div
                key={idx}
                className={`split-option ${testSize === option.value ? 'selected' : ''}`}
                onClick={() => !splitting && setTestSize(option.value)}
              >
                <div className="split-ratio">{option.label}</div>
              </div>
            ))}
          </div>
          
          <div className="custom-split">
            <label htmlFor="custom-split">Or enter custom test size (0.1 - 0.5):</label>
            <input
              id="custom-split"
              type="number"
              min="0.1"
              max="0.5"
              step="0.05"
              value={testSize}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (val >= 0.1 && val <= 0.5) {
                  setTestSize(val);
                }
              }}
              className="custom-input"
              disabled={splitting}
            />
            <span className="input-hint">Current: {(testSize * 100).toFixed(0)}% test</span>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSplit}
          disabled={splitting}
        >
          {splitting ? (
            <>
              <span className="spinner-small"></span>
              Splitting Data...
            </>
          ) : (
            'Perform Train-Test Split'
          )}
        </button>
      </div>

      {splitInfo && (
        <div className="split-result">
          <div className="result-header">
            <h3>Data split successfully</h3>
          </div>
          
          <div className="split-visualization">
            <div className="split-chart">
              <div className="train-bar" style={{ width: `${splitInfo.train_ratio * 100}%` }}>
                <div className="bar-label">Training Set</div>
                <div className="bar-value">{splitInfo.train_size.toLocaleString()} samples</div>
                <div className="bar-percentage">{(splitInfo.train_ratio * 100).toFixed(0)}%</div>
              </div>
              <div className="test-bar" style={{ width: `${splitInfo.test_ratio * 100}%` }}>
                <div className="bar-label">Testing Set</div>
                <div className="bar-value">{splitInfo.test_size.toLocaleString()} samples</div>
                <div className="bar-percentage">{(splitInfo.test_ratio * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="result-info">
            <div className="result-card train-card">
              <div className="card-content">
                <div className="card-label">Training Set</div>
                <div className="card-value">{splitInfo.train_size.toLocaleString()}</div>
                <div className="card-subtext">samples</div>
              </div>
            </div>
            <div className="result-card test-card">
              <div className="card-content">
                <div className="card-label">Testing Set</div>
                <div className="card-value">{splitInfo.test_size.toLocaleString()}</div>
                <div className="card-subtext">samples</div>
              </div>
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

export default StepSplit;

