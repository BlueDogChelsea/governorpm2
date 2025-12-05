import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

const ArtefactSection = ({ id, title, children, isOpen, onToggle }) => {
    // Local state fallback if not controlled, though typical usage is controlled
    const [localOpen, setLocalOpen] = useState(true)

    // Determine if controlled or uncontrolled
    const isControlled = isOpen !== undefined && onToggle !== undefined
    const openState = isControlled ? isOpen : localOpen

    const handleToggle = () => {
        if (isControlled) {
            onToggle(id)
        } else {
            setLocalOpen(!localOpen)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden mb-8 last:mb-0">
            <button
                onClick={handleToggle}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors text-left"
            >
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {openState ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
            </button>

            {openState && (
                <div className="p-6 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    )
}

export default ArtefactSection
