import React, { useState } from 'react';
import './PipelineBuilder.css';
import StepUpload from './StepUpload';
import StepPreprocess from './StepPreprocess';
import StepSplit from './StepSplit';
import StepModel from './StepModel';
import StepResults from './StepResults';
import PipelineFlow from './PipelineFlow';

const PipelineBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [pipelineState, setPipelineState] = useState({
    upload_dataset: null,
    preprocess: null,
    split_data: null,
    select_model: null,
    view_results: null
  });

  const updatePipelineState = (step, data) => {
    setPipelineState(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const steps = [
    { id: 1, name: 'Upload Dataset', component: StepUpload },
    { id: 2, name: 'Preprocess', component: StepPreprocess },
    { id: 3, name: 'Split Data', component: StepSplit },
    { id: 4, name: 'Select Model', component: StepModel },
    { id: 5, name: 'View Results', component: StepResults }
  ];

  const handleStepComplete = (stepId, data) => {
    const stepKeys = ['upload_dataset', 'preprocess', 'split_data', 'select_model', 'view_results'];
    updatePipelineState(stepKeys[stepId - 1], data);
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleStepChange = (stepId) => {
    // Allow going back to previous steps if they're already completed
    const stepKeys = ['upload_dataset', 'preprocess', 'split_data', 'select_model', 'view_results'];
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    // Always allow going to step 1, or to current/previous steps
    if (stepId === 1 || stepId <= currentStep) {
      setCurrentStep(stepId);
      return;
    }
    
    // For future steps, check if previous step is completed
    if (stepIndex > 0) {
      const prevStepKey = stepKeys[stepIndex - 1];
      if (pipelineState[prevStepKey]) {
        setCurrentStep(stepId);
      }
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="pipeline-builder">
      <div className="pipeline-container">
        <PipelineFlow 
          steps={steps} 
          currentStep={currentStep} 
          pipelineState={pipelineState}
          onStepClick={handleStepChange}
        />
        
        <div className="step-content">
          <CurrentStepComponent
            pipelineState={pipelineState}
            onComplete={handleStepComplete}
            stepId={currentStep}
          />
        </div>
      </div>
    </div>
  );
};

export default PipelineBuilder;

