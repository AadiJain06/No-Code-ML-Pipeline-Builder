import React from 'react';
import './PipelineFlow.css';

const PipelineFlow = ({ steps, currentStep, pipelineState, onStepClick }) => {
  const getStepStatus = (stepId) => {
    const stepKeys = ['upload_dataset', 'preprocess', 'split_data', 'select_model', 'view_results'];
    const stepKey = stepKeys[stepId - 1];
    
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    if (pipelineState[stepKey]) return 'completed';
    return 'pending';
  };

  return (
    <div className="pipeline-flow">
      <div className="flow-line"></div>
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isClickable = status === 'completed' || status === 'active' || index === 0;
        
        return (
          <div
            key={step.id}
            className={`flow-step ${status} ${isClickable ? 'clickable' : ''}`}
            onClick={() => isClickable && onStepClick(step.id)}
          >
            <div className="step-circle">
              {status === 'completed' ? (
                <span className="step-number">Done</span>
              ) : (
                <span className="step-number">{step.id}</span>
              )}
            </div>
            <div className="step-label">{step.name}</div>
            {status === 'active' && <div className="step-indicator"></div>}
          </div>
        );
      })}
    </div>
  );
};

export default PipelineFlow;

