/**
 * TSS Stepper
 * Kasko Stepper ile aynı yapıda
 */

'use client';

import { TSS_STEPS } from '../../config/tssConstants';

interface TssStepperProps {
    activeStep: number;
}

const TssStepper = ({ activeStep }: TssStepperProps) => {
    return (
        <div className="pp-stepper">
            {TSS_STEPS.map((step, index) => (
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

export default TssStepper;
