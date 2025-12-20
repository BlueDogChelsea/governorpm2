import React, { useEffect, useRef } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

const WizardStepper = ({ steps, currentStep, onStepClick }) => {
    const scrollRef = useRef(null)

    // Auto-scroll to active step
    useEffect(() => {
        if (scrollRef.current) {
            const activeStepEl = scrollRef.current.children[currentStep]
            if (activeStepEl) {
                activeStepEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }, [currentStep])

    return (
        <nav aria-label="Progress" className="w-full overflow-x-auto pb-4 no-scrollbar">
            <ol role="list" ref={scrollRef} className="flex items-center min-w-max px-4">
                {steps.map((step, stepIdx) => {
                    const isCompleted = stepIdx < currentStep
                    const isCurrent = stepIdx === currentStep

                    return (
                        <li
                            key={step.id}
                            className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative cursor-pointer group`}
                            onClick={() => onStepClick(step.id)} // Pass ID or Index? Usually ID for flexibility, but index is easier for linear wizards. Let's assume onStepClick handles the ID.
                        >
                            {stepIdx !== steps.length - 1 && (
                                <div className="absolute top-4 left-0 -right-8 sm:-right-20 flex items-center" aria-hidden="true">
                                    <div className={`h-0.5 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                </div>
                            )}
                            <div className="relative flex flex-col items-center group">
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
                                <span className={`mt-2 text-xs font-medium whitespace-nowrap ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
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
