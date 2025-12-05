import React from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const ArtefactPage = ({ title, description, children, onBack, actions, banner }) => {
    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm flex flex-col">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            {description && <p className="text-sm text-gray-500">{description}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-3 items-center">
                        {actions}
                    </div>
                </div>
                {/* Persistent Banner Region */}
                {banner && (
                    <div className="px-6 pb-4">
                        {banner}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full">
                {children}
            </div>
        </div>
    )
}

export default ArtefactPage
