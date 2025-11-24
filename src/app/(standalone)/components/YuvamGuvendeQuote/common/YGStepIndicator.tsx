import React from 'react';

interface Step {
  id: number;
  name: string;
}

interface YGStepIndicatorProps {
  steps: Step[];
  activeStep: number;
}

export default function YGStepIndicator({ steps, activeStep }: YGStepIndicatorProps) {
  return (
    <div className="yg-step-indicator">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`yg-step-item ${
              index === activeStep
                ? 'active'
                : index < activeStep
                ? 'completed'
                : ''
            }`}
          >
            <div className="yg-step-circle">
              <span className="yg-step-number">{step.id}</span>
            </div>
            <span className="yg-step-label">{step.name}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="yg-step-connector"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

