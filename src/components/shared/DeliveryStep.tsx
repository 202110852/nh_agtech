import { Check } from 'lucide-react'
import type { TrackingStep } from '../../data/mockData'

interface DeliveryStepProps {
  step: TrackingStep
  isLast: boolean
}

export function DeliveryStep({ step, isLast }: DeliveryStepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step.completed
              ? 'bg-primary text-white'
              : step.active
                ? 'bg-primary-light ring-2 ring-primary text-primary'
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          {step.completed ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{step.id.replace('s', '')}</span>}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-12 ${step.completed ? 'bg-primary' : 'bg-gray-200'}`} />
        )}
      </div>
      <div className={`pb-8 ${step.active ? '' : 'opacity-70'}`}>
        <h4 className={`font-semibold ${step.active ? 'text-primary' : 'text-gray-900'}`}>
          {step.label}
        </h4>
        <p className="mt-0.5 text-sm text-muted">{step.description}</p>
        {step.timestamp && (
          <p className="mt-1 text-xs text-gray-400">{step.timestamp}</p>
        )}
      </div>
    </div>
  )
}
