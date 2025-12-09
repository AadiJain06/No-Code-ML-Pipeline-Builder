import React, { useState } from 'react';
import './App.css';
import PipelineBuilder from './components/PipelineBuilder';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="hero-eyebrow">
          <span></span>
          Orange-inspired visual workflow
        </div>
        <div className="app-title">
          <h1>No-Code ML Pipeline Builder</h1>
          <p>Build, inspect, and iterate on machine learning workflows with an interactive canvas inspired by Orange Data Mining.</p>
        </div>
        <div className="hero-actions">
          <button className="btn-cta">Start a new flow</button>
          <button className="btn-ghost">Upload dataset</button>
        </div>
        <div className="hero-stats">
          <div className="stat-chip"><strong>5 steps</strong> guided pipeline</div>
          <div className="stat-chip"><strong>Live</strong> previews & metrics</div>
          <div className="stat-chip"><strong>Drag & drop</strong> dataset upload</div>
        </div>
      </header>
      <PipelineBuilder />
    </div>
  );
}

export default App;

