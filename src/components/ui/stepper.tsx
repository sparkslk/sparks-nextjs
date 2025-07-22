// src/components/ui/stepper.tsx
"use client";

import { cn } from "@/lib/utils";

interface StepperProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-colors",
                    {
                      "bg-primary border-primary text-primary-foreground":
                        isCurrent,
                      "bg-primary/10 border-primary text-primary": isCompleted,
                      "bg-muted border-muted-foreground/30 text-muted-foreground":
                        isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={cn("text-sm font-medium", {
                      "text-primary": isCurrent || isCompleted,
                      "text-muted-foreground": isUpcoming,
                    })}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn("h-0.5 transition-colors", {
                      "bg-primary": stepNumber < currentStep,
                      "bg-muted": stepNumber >= currentStep,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
