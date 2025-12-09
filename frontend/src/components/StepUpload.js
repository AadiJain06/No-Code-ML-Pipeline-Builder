import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './StepUpload.css';

const StepUpload = ({ onComplete, pipelineState }) => {
  const [uploading, setUploading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setDatasetInfo(response.data);
        onComplete(1, response.data);
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  }, [onComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  return (
    <div className="step-upload">
      <h2>Step 1: Upload Your Dataset</h2>
      <p className="step-description">
        Upload a CSV or Excel file to get started. The file should contain your features and target variable.
      </p>

      {!datasetInfo ? (
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="upload-status">
              <div className="spinner"></div>
              <p>Uploading and processing file...</p>
            </div>
          ) : (
            <div className="upload-content">
              <p className="upload-text">
                {isDragActive
                  ? 'Drop your file here...'
                  : 'Drag & drop your CSV or Excel file here, or click to select'}
              </p>
              <p className="upload-hint">Supports: .csv, .xls, .xlsx</p>
            </div>
          )}
        </div>
      ) : (
        <div className="dataset-info">
          <div className="info-header">
            <h3>Dataset uploaded successfully</h3>
            <button className="btn-secondary" onClick={() => {
              setDatasetInfo(null);
              setError(null);
            }}>
              Upload Different File
            </button>
          </div>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">Rows</div>
              <div className="info-value">{datasetInfo.rows.toLocaleString()}</div>
            </div>
            <div className="info-card">
              <div className="info-label">Columns</div>
              <div className="info-value">{datasetInfo.columns}</div>
            </div>
          </div>

          <div className="columns-section">
            <h4>Column Names</h4>
            <div className="columns-list">
              {datasetInfo.column_names.map((col, idx) => (
                <span key={idx} className="column-tag">
                  {col} <span className="data-type">({datasetInfo.data_types[col]})</span>
                </span>
              ))}
            </div>
          </div>

          {Object.keys(datasetInfo.missing_values).some(key => datasetInfo.missing_values[key] > 0) && (
            <div className="missing-values">
              <h4>Missing Values</h4>
              <div className="missing-list">
                {Object.entries(datasetInfo.missing_values)
                  .filter(([_, count]) => count > 0)
                  .map(([col, count]) => (
                    <div key={col} className="missing-item">
                      <span className="missing-col">{col}:</span>
                      <span className="missing-count">{count} missing</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="preview-section">
            <h4>Data Preview (First 10 rows)</h4>
            <div className="table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {datasetInfo.column_names.map((col, idx) => (
                      <th key={idx}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datasetInfo.preview.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {datasetInfo.column_names.map((col, colIdx) => (
                        <td key={colIdx}>{row[col]}</td>
                      ))}
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

export default StepUpload;

