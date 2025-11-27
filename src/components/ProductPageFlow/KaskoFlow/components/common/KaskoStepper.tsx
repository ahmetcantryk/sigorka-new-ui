/**
 * Kasko Flow - Stepper Bileşeni
 */

'use client';

import { KASKO_STEPS } from '../../config/kaskoConstants';

interface KaskoStepperProps {
  activeStep: number;
}

const KaskoStepper = ({ activeStep }: KaskoStepperProps) => {
  return (
    <div className="pp-stepper">
      {KASKO_STEPS.map((step) => (
        <div
          key={step.id}
          className={`pp-step ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
        >
          <div className="pp-step-visual">
            <span>{step.id + 1}</span>
          </div>
          <div className="pp-step-label">
            {step.label.map((text, index) => (
              <span key={index}>{text}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KaskoStepper;

