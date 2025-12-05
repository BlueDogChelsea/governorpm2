import React from 'react'

export const ArtefactField = ({ label, children, helpText, className = "" }) => {
    return (
        <div className={`bg-slate-50 p-4 rounded-xl border border-slate-100 ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    {label}
                </label>
            )}
            {children}
            {helpText && <p className="mt-2 text-xs text-gray-500 ml-1">{helpText}</p>}
        </div>
    )
}

export const ArtefactInput = ({ className = "", ...props }) => {
    return (
        <input
            className={`w-full rounded-lg border-[1.5px] border-slate-300 bg-white p-3 text-gray-900 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all ${className}`}
            {...props}
        />
    )
}

export const ArtefactTextarea = ({ className = "", ...props }) => {
    return (
        <textarea
            className={`w-full rounded-lg border-[1.5px] border-slate-300 bg-white p-3 text-gray-900 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all min-h-[120px] resize-y ${className}`}
            {...props}
        />
    )
}

export const ArtefactSelect = ({ className = "", children, ...props }) => {
    return (
        <select
            className={`w-full rounded-lg border-[1.5px] border-slate-300 bg-white p-3 text-gray-900 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all ${className}`}
            {...props}
        >
            {children}
        </select>
    )
}
