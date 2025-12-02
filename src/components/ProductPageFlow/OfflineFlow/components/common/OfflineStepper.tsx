/**
 * Offline Stepper
 * Kasko/TSS Stepper ile aynı yapıda
 */

'use client';

import { OfflineBranchConfig } from '../../config/offlineConstants';

interface OfflineStepperProps {
  branchConfig: OfflineBranchConfig;
  activeStep: number;
}

const OfflineStepper = ({ branchConfig, activeStep }: OfflineStepperProps) => {
  return (
    <div className="pp-stepper pp-offline-stepper">
      {branchConfig.steps.map((step, index) => (
        <div
          key={step.id}
          className={`pp-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}
        >
          <div className="pp-step-visual">
            <span>{index + 1}</span>
          </div>
          <div className="pp-step-label">
            {step.label.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfflineStepper;

