import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// -- Risk Modal Component --
export const RiskModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        description: '',
        likelihood: 'Medium',
        impact: 'Medium',
        riskLevel: 'Medium',
        status: 'Open',
        responseStrategy: 'Mitigate',
        actionDetails: ''
    })

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                description: initialData.description || '',
                likelihood: initialData.likelihood || 'Medium',
                impact: initialData.impact || 'Medium',
                riskLevel: initialData.riskLevel || 'Medium',
                status: initialData.status || 'Open',
                responseStrategy: initialData.responseStrategy || 'Mitigate',
                actionDetails: initialData.actionDetails || ''
            } : {
                description: '',
                likelihood: 'Medium',
                impact: 'Medium',
                riskLevel: 'Medium',
                status: 'Open',
                responseStrategy: 'Mitigate',
                actionDetails: ''
            })
        }
    }, [isOpen, initialData])

    // Auto-calculate Level
    useEffect(() => {
        if (!isOpen) return
        const val = (v) => v === 'High' ? 3 : v === 'Medium' ? 2 : 1
        const score = val(formData.likelihood) * val(formData.impact)
        let newLevel = 'Medium'
        if (score >= 6) newLevel = 'High'
        else if (score >= 3) newLevel = 'Medium'
        else newLevel = 'Low'
        setFormData(prev => ({ ...prev, riskLevel: newLevel }))
    }, [formData.likelihood, formData.impact, isOpen])

    const handleChange = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Risk' : 'Add New Risk'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Risk Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Likelihood</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.likelihood} onChange={(e) => handleChange('likelihood', e.target.value)}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Impact</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.impact} onChange={(e) => handleChange('impact', e.target.value)}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Level (Auto)</label>
                                    <input type="text" disabled className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm p-2 text-gray-500" value={formData.riskLevel} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                                        <option>Open</option><option>Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Response Strategy</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.responseStrategy} onChange={(e) => handleChange('responseStrategy', e.target.value)}>
                                        <option>Avoid</option><option>Mitigate</option><option>Transfer</option><option>Accept</option><option>Contingency</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Action Details</label>
                                    <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.actionDetails} onChange={(e) => handleChange('actionDetails', e.target.value)} placeholder="Action to take..." />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={() => onSave(formData)}>Save</button>
                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// -- Constraint Modal Component --
export const ConstraintModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ description: '', type: 'Budget' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                description: initialData.description || '',
                type: initialData.type || 'Budget'
            } : { description: '', type: 'Budget' })
        }
    }, [isOpen, initialData])

    const handleChange = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Constraint' : 'Add Constraint'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Constraint Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
                                    <option>Budget</option><option>Schedule</option><option>Technical</option><option>Legal</option><option>Resource</option><option>Regulatory</option><option>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={() => onSave(formData)}>Save</button>
                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// -- Assumption Modal Component --
export const AssumptionModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ description: '', impact: 'Medium' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                description: initialData.description || '',
                impact: initialData.impact || 'Medium'
            } : { description: '', impact: 'Medium' })
        }
    }, [isOpen, initialData])

    const handleChange = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Assumption' : 'Add Assumption'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assumption Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Impact if False</label>
                                <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.impact} onChange={(e) => handleChange('impact', e.target.value)}>
                                    <option>High</option><option>Medium</option><option>Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={() => onSave(formData)}>Save</button>
                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
