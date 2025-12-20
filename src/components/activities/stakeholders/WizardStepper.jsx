import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

const steps = [
    { id: 0, name: 'Project Owner' },
    { id: 1, name: 'Business Manager' },
    { id: 2, name: 'Solution Provider' },
    { id: 3, name: 'Additional' },
    { id: 4, name: 'Review' },
]

const WizardStepper = ({ currentStep, onStepClick }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => {
                    const isCompleted = step.id < currentStep
                    const isCurrent = step.id === currentStep

                    return (
                        <li
                            key={step.name}
                            className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative cursor-pointer group`}
                            onClick={() => onStepClick(step.id)}
                        >
                            {stepIdx !== steps.length - 1 && (
                                <div className="absolute top-4 left-0 -right-8 sm:-right-20 flex items-center" aria-hidden="true">
                                    <div className={`h-0.5 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                </div>
                            )}
                            <div className="relative flex flex-col items-center">
                                <span className="h-9 flex items-center" aria-hidden="true">
                                    {isCompleted ? (
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-800 transition-colors">
                                            <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                        </span>
                                    ) : isCurrent ? (
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full">
                                            <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                                        </span>
                                    ) : (
                                        <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400 transition-colors">
                                            <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" />
                                        </span>
                                    )}
                                </span>
                                <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {step.name}
                                </span>
                            </div>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export default WizardStepper
