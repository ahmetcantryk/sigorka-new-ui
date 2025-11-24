import { Box, useMediaQuery, useTheme } from '@mui/material';

interface MobileStepperProps {
  steps: string[];
  activeStep: number;
}

export default function MobileStepper({ steps, activeStep }: MobileStepperProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <div className="flex items-center justify-center">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center">
            <div 
              className={`
                flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                ${index < activeStep ? 'bg-primary text-white' : 
                  index === activeStep ? 'bg-primary text-white' : 
                  'bg-gray-200 text-gray-700'}
              `}
            >
              {index + 1}
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div 
                className={`mx-2 h-1 w-6 
                  ${index < activeStep ? 'bg-primary' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>
    </Box>
  );
} 