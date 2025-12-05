import React from 'react'
import { CheckCircleIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

const ArtefactSaveButton = ({ onSave, status = 'idle', isDirty = false, label = 'Save' }) => {
    return (
        <button
            onClick={onSave}
            disabled={(!isDirty && status !== 'error') || status === 'saving' || status === 'success'}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm flex items-center transition-all duration-200 ${status === 'saving'
                    ? 'bg-slate-400 text-white cursor-wait'
                    : status === 'success'
                        ? 'bg-green-500 text-white'
                        : status === 'error'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : isDirty
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                }`}
        >
            {status === 'saving' && <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />}
            {status === 'success' && <CheckCircleIcon className="h-4 w-4 mr-2" />}
            {status === 'error' && <ExclamationCircleIcon className="h-4 w-4 mr-2" />}
            {status === 'idle' && <CheckCircleIcon className="h-4 w-4 mr-2" />}

            {status === 'saving' && 'Saving...'}
            {status === 'success' && 'Saved ✓'}
            {status === 'error' && 'Save Failed — Retry'}
            {status === 'idle' && (isDirty ? `Save ${label}` : `${label} Saved`)}
        </button>
    )
}

export default ArtefactSaveButton
