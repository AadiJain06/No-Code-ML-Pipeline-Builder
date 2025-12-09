import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StepResults.css';

const StepResults = ({ pipelineState }) => {
  const [pipelineStatus, setPipelineStatus] = useState(null);

  useEffect(() => {
    fetchPipelineStatus();
  }, []);

  const fetchPipelineStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pipeline/status');
      setPipelineStatus(response.data);
    } catch (err) {
      console.error('Error fetching pipeline status:', err);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:5000/api/reset');
      window.location.reload();
    } catch (err) {
      console.error('Error resetting pipeline:', err);
    }
  };

  if (!pipelineState.select_model) {
    return (
      <div className="step-results">
        <h2>Step 5: View Results</h2>
        <div className="no-results">
          <p>Please complete all previous steps to view results.</p>
        </div>
      </div>
    );
  }

  const modelInfo = pipelineState.select_model;

  return (
    <div className="step-results">
      <h2>Step 5: Pipeline Results</h2>
      <p className="step-description">
        Congratulations! Your ML pipeline has been completed. Review the results below.
      </p>

      <div className="results-summary">
        <div className="summary-card">
          <div className="summary-content">
            <div className="summary-label">Model Accuracy</div>
            <div className="summary-value">{(modelInfo.accuracy * 100).toFixed(2)}%</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div className="summary-label">Model Type</div>
            <div className="summary-value">{modelInfo.model_type}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-content">
            <div className="summary-label">Test Samples</div>
            <div className="summary-value">{modelInfo.predictions_count.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {modelInfo.confusion_matrix_image && (
        <div className="results-section">
          <h3>Confusion Matrix</h3>
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
        <div className="results-section">
          <h3>Detailed Classification Report</h3>
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(modelInfo.classification_report)
                  .filter(key => key !== 'accuracy' && key !== 'macro avg' && key !== 'weighted avg')
                  .map((key) => {
                    const report = modelInfo.classification_report[key];
                    return (
                      <tr key={key}>
                        <td className="class-name">{key}</td>
                        <td>{report.precision?.toFixed(3) || 'N/A'}</td>
                        <td>{report.recall?.toFixed(3) || 'N/A'}</td>
                        <td>{report['f1-score']?.toFixed(3) || 'N/A'}</td>
                        <td>{report.support || 'N/A'}</td>
                      </tr>
                    );
                  })}
                <tr className="summary-row">
                  <td><strong>Accuracy</strong></td>
                  <td colSpan="3"></td>
                  <td><strong>{modelInfo.accuracy.toFixed(3)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="pipeline-complete">
        <h3>Pipeline complete</h3>
        <p>Your machine learning pipeline has been successfully executed.</p>
        <button className="btn-reset" onClick={handleReset}>
          Start New Pipeline
        </button>
      </div>
    </div>
  );
};

export default StepResults;

