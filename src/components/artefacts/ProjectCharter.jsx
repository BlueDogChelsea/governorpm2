import React, { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowDownTrayIcon, BookOpenIcon, PlusIcon, TrashIcon, CheckCircleIcon, PencilSquareIcon, XMarkIcon, LightBulbIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea, ArtefactSelect } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectCharterSchema } from '../../data/schemas/ProjectCharterSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import projectCharterTemplate from '../../templates/ProjectCharterTemplate.json'
import { ProjectService } from '../../services/ProjectService'
import ArtefactApprovalSection from './ui/ArtefactApprovalSection'
import { CHARTER_GUIDANCE } from '../../data/charterGuidance'

// -- Guidance Panel Component --
const GuidancePanel = ({ sectionId, isOpen, onClose }) => {
    if (!isOpen) return null

    const guidance = CHARTER_GUIDANCE[sectionId]
    const displayGuidance = guidance || {
        title: 'Guidance',
        content: 'Select a specific section to see relevant PM² guidance tips and best practices.',
        pm2Ref: null
    }

    return (
        <div className="w-full h-full bg-white overflow-y-auto">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                        PM² Guidance
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 mb-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">{displayGuidance.title}</h4>
                    <div className="text-sm text-gray-700 leading-relaxed font-medium">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props} />
                            }}
                        >
                            {displayGuidance.content}
                        </ReactMarkdown>
                    </div>
                    {displayGuidance.pm2Ref && (
                        <div className="mt-4 pt-3 border-t border-yellow-200/60 text-xs font-semibold text-yellow-800 flex items-center">
                            <BookOpenIcon className="h-3 w-3 mr-1.5" />
                            Ref: {displayGuidance.pm2Ref}
                        </div>
                    )}
                </div>

                {!guidance && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                        <p className="text-xs text-gray-500">Select sections like "Executive Summary" or "Features" to see specific help text.</p>
                    </div>
                )}

                <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-medium">Open PM² Methodology</p>
                    <p className="text-[10px] text-gray-300 mt-1">European Commission</p>
                </div>
            </div>
        </div>
    )
}

// -- Risk Modal Component --
const RiskModal = ({ isOpen, onClose, onSave, initialData }) => {
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

// -- Need Modal Component --
const NeedModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ stakeholder: '', description: '', priority: 'Medium' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                stakeholder: initialData.stakeholder || '',
                description: initialData.description || '',
                priority: initialData.priority || 'Medium'
            } : { stakeholder: '', description: '', priority: 'Medium' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Stakeholder Need' : 'Add Stakeholder Need'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stakeholder / Group</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.stakeholder} onChange={(e) => handleChange('stakeholder', e.target.value)} placeholder="e.g. Finance Team" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Need Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={4} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe the need..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                                    <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
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

// -- Deliverable Modal Component --
const DeliverableModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ name: '', description: '', type: 'Report', dueDate: '' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                name: initialData.name || '',
                description: initialData.description || '',
                type: initialData.type || 'Report',
                dueDate: initialData.dueDate || ''
            } : { name: '', description: '', type: 'Report', dueDate: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Deliverable' : 'Add Deliverable'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deliverable Name</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
                                        <option>Report</option><option>Software</option><option>Service</option><option>Hardware</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
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

// -- Feature Modal Component --
const FeatureModal = ({ isOpen, onClose, onSave, initialData, availableDeliverables = [] }) => {
    const [formData, setFormData] = useState({ name: '', description: '', relatedDeliverable: '' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                name: initialData.name || '',
                description: initialData.description || '',
                relatedDeliverable: initialData.relatedDeliverable || ''
            } : { name: '', description: '', relatedDeliverable: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Feature' : 'Add Feature'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Feature Name</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Related Deliverable</label>
                                <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.relatedDeliverable} onChange={(e) => handleChange('relatedDeliverable', e.target.value)}>
                                    <option value="">-- Select Deliverable (Optional) --</option>
                                    {availableDeliverables.map((d, i) => (
                                        <option key={d.id || i} value={d.name}>{d.name}</option>
                                    ))}
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

// -- Constraint Modal Component --
const ConstraintModal = ({ isOpen, onClose, onSave, initialData }) => {
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
                                    <option>Budget</option><option>Schedule</option><option>Technical</option><option>Legal</option><option>Resource</option><option>Other</option>
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
const AssumptionModal = ({ isOpen, onClose, onSave, initialData }) => {
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

// -- Cost Modal Component --
const CostModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ category: 'Solution Development', year: 'Year 1', amount: '', description: '' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                category: initialData.category || 'Solution Development',
                year: initialData.year || 'Year 1',
                amount: initialData.amount || '',
                description: initialData.description || ''
            } : { category: 'Solution Development', year: 'Year 1', amount: '', description: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Cost Item' : 'Add Cost Item'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
                                        <option>Solution Development</option><option>Maintenance</option><option>Support</option><option>Training</option><option>Infrastructure</option><option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Year</label>
                                    <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.year} onChange={(e) => handleChange('year', e.target.value)}>
                                        <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Year 5</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
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

// -- Milestone Modal Component --
const MilestoneModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ id: '', description: '', targetDeliveryDate: '' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                id: initialData.id || '',
                description: initialData.description || '',
                targetDeliveryDate: initialData.targetDeliveryDate || ''
            } : { id: '', description: '', targetDeliveryDate: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Milestone' : 'Add Milestone'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Milestone ID</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} placeholder="e.g. M1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Milestone Description</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Delivery Date</label>
                                <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.targetDeliveryDate} onChange={(e) => handleChange('targetDeliveryDate', e.target.value)} />
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

// -- Resource Modal Component --
const ResourceModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ id: '', role: '', description: '', quantity: '' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                id: initialData.id || '',
                role: initialData.role || '',
                description: initialData.description || '',
                quantity: initialData.quantity || ''
            } : { id: '', role: '', description: '', quantity: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Resource' : 'Add Resource'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} placeholder="e.g. R1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role / Profile</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.role} onChange={(e) => handleChange('role', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description / Skills</label>
                                <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity / FTE</label>
                                <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} step="0.1" />
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

// Define the Sidebar Structure
const SIDEBAR_STRUCTURE = [
    {
        title: '1. Executive Summary',
        items: [
            { id: 'summary', name: 'Executive Summary', fields: ['executiveSummary'] }
        ]
    },
    {
        title: '2. Considerations on Business Case',
        items: [
            { id: 'businessCase', name: '2. Considerations on Business Case', fields: ['businessCaseConsiderations'] }
        ]
    },
    {
        title: '3. Project Description',
        items: [
            { id: 'scope', name: '3.1 Scope', fields: ['scopeStatement', 'scopeIn', 'scopeOut'] },
            { id: 'success', name: '3.2 Success Criteria', fields: ['successCriteria'] },
            { id: 'needs', name: '3.3 Stakeholder Needs', fields: ['stakeholderNeeds'] },
            { id: 'deliverables', name: '3.4 Deliverables', fields: ['deliverables'] },
            { id: 'features', name: '3.5 Features', fields: ['features'] },
            { id: 'constraints', name: '3.6 Constraints', fields: ['constraints'] },
            { id: 'assumptions', name: '3.7 Assumptions', fields: ['assumptions'] },
            { id: 'risks', name: '3.8 Risks', fields: ['risks'] }
        ]
    },
    {
        title: '4. Cost & Timing',
        items: [
            { id: 'budget', name: '4.1 Cost & Budget', fields: ['costs'] },
            { id: 'milestones', name: '4.2 Milestones', fields: ['milestones'] },
            { id: 'resources', name: '4.3 Planned Resources', fields: ['resources'] }
        ]
    },
    {
        title: '6. Governance',
        items: [
            { id: 'governance', name: 'Roles & Responsibilities', fields: ['psc', 'extendedGovernance'] }
        ]
    },
    {
        title: '7. Approach',
        items: [
            { id: 'approach', name: 'Methodology & Change', fields: ['methodology', 'projectChange', 'configurationManagement', 'organisationalChange'] }
        ]
    },
    {
        title: 'Appendix',
        items: [
            { id: 'refs', name: 'References', fields: ['references'] }
        ]
    },
    {
        title: 'Authorization',
        items: [
            { id: 'approval', name: 'Sign-Off / Approval', fields: ['approval'] }
        ]
    }
]

const ProjectCharter = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // -- State --
    const [activeSectionId, setActiveSectionId] = useState('scope') // Default to 'Scope' (per user goal)
    const [mergedArtefact, setMergedArtefact] = useState(artefact)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(false)

    // Risk Modal State
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
    const [editingRiskIndex, setEditingRiskIndex] = useState(null)
    const [currentRiskData, setCurrentRiskData] = useState(null)

    // Need Modal State
    const [isNeedModalOpen, setIsNeedModalOpen] = useState(false)
    const [editingNeedIndex, setEditingNeedIndex] = useState(null)
    const [currentNeedData, setCurrentNeedData] = useState(null)

    // Deliverable Modal State
    const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false)
    const [editingDeliverableIndex, setEditingDeliverableIndex] = useState(null)
    const [currentDeliverableData, setCurrentDeliverableData] = useState(null)

    // Feature Modal State
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
    const [editingFeatureIndex, setEditingFeatureIndex] = useState(null)
    const [currentFeatureData, setCurrentFeatureData] = useState(null)

    // Constraint Modal State
    const [isConstraintModalOpen, setIsConstraintModalOpen] = useState(false)
    const [editingConstraintIndex, setEditingConstraintIndex] = useState(null)
    const [currentConstraintData, setCurrentConstraintData] = useState(null)

    // Assumption Modal State
    const [isAssumptionModalOpen, setIsAssumptionModalOpen] = useState(false)
    const [editingAssumptionIndex, setEditingAssumptionIndex] = useState(null)
    const [currentAssumptionData, setCurrentAssumptionData] = useState(null)

    // Cost Modal State
    const [isCostModalOpen, setIsCostModalOpen] = useState(false)
    const [editingCostIndex, setEditingCostIndex] = useState(null)
    const [currentCostData, setCurrentCostData] = useState(null)

    // Milestone Modal State
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
    const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null)
    const [currentMilestoneData, setCurrentMilestoneData] = useState(null)

    // Resource Modal State
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
    const [editingResourceIndex, setEditingResourceIndex] = useState(null)
    const [currentResourceData, setCurrentResourceData] = useState(null)

    const dataRef = React.useRef({})

    // -- Derived State (Field Map) --
    // Flattens the schema to map key -> fieldDefinition
    const fieldMap = useMemo(() => {
        const map = {}
        projectCharterSchema.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    map[field.key] = field
                })
            }
        })
        return map
    }, [])

    // -- Load / Sync Logic --
    useEffect(() => {
        const loadSpecificData = async () => {
            if (window.electronAPI && projectId) {
                try {
                    const data = await window.electronAPI.readJSON(`projects/${projectId}/projectCharter.json`)
                    console.log('ProjectCharter: Loaded data from file:', data)
                    if (data) {
                        setMergedArtefact(data)
                    } else {
                        console.log('ProjectCharter: No data file found, using prop artefact')
                        setMergedArtefact(artefact)
                    }
                } catch (error) {
                    console.error("Failed to load Project Charter data", error)
                }
            }
        }
        loadSpecificData()
    }, [projectId, artefact])

    // -- Actions --
    const handleInternalSave = async (currentData) => {
        const inputData = currentData || dataRef.current

        // Robustness: Determine if inputData is the full artefact or just the content
        let fullArtefactToSave
        if (inputData.content && inputData.id && inputData.phase) {
            fullArtefactToSave = inputData
        } else {
            // It's likely just the content object (e.g. from Approval section save)
            // Wrap it in the current artefact shell
            fullArtefactToSave = {
                ...mergedArtefact,
                content: inputData
            }
        }

        if (window.electronAPI && projectId) {
            // 1. Write to file
            await window.electronAPI.writeJSON(`projects/${projectId}/projectCharter.json`, fullArtefactToSave)

            // 2. Read back to ensure UI is in sync with disk (fixes glitch)
            const freshData = await window.electronAPI.readJSON(`projects/${projectId}/projectCharter.json`)
            if (freshData) {
                setMergedArtefact(freshData)
            }
        }
        onSave(fullArtefactToSave)
    }

    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = dataRef.current
        const sections = projectCharterSchema
        if (format === 'html') {
            const html = await DocumentGenerator.generateDocument(
                { ...content, projectName: ProjectService.getActiveProject()?.name },
                sections,
                projectCharterTemplate,
                format,
                'preview'
            )
            setPreviewHtml(html)
            setShowPreview(true)
        } else {
            const projName = ProjectService.getActiveProject()?.name || 'Project'
            DocumentGenerator.generateDocument(
                { ...content, projectName: projName },
                sections,
                projectCharterTemplate,
                format,
                `Project_Charter_${projName}_v${content['Version'] || '1.0'}`
            )
        }
    }

    const CustomActions = () => (
        <>
            <button
                onClick={() => onOpenGuidance('Initiating Phase', '5.4 Project Charter', { tab: 'Artefacts', label: 'Project Charter' })}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center"
            >
                <BookOpenIcon className="h-4 w-4 mr-2" /> Open PM² Guidance
            </button>
            <button
                onClick={() => setIsGuidanceOpen(!isGuidanceOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center mr-2 ${isGuidanceOpen
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
            >
                <LightBulbIcon className={`h-4 w-4 mr-2 ${isGuidanceOpen ? 'text-yellow-500' : 'text-gray-400'}`} />
                {isGuidanceOpen ? 'Hide Guidance' : 'Show Guidance'}
            </button>
            <div className="relative inline-block text-left">
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm flex items-center">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Export
                </button>
                {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                            <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download PDF</button>
                            <button onClick={() => handleExport('docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download DOCX</button>
                            <button onClick={() => handleExport('html')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Preview (HTML)</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )

    const initialData = {
        'Version': '1.0',
        ...projectCharterSchema.reduce((acc, section) => {
            if (section.fields) {
                section.fields.forEach(fieldObj => {
                    if (fieldObj.type === 'table') acc[fieldObj.key] = []
                    else if (fieldObj.type === 'pscMatrix') acc[fieldObj.key] = fieldObj.structure
                    else acc[fieldObj.key] = ''
                })
            }
            return acc
        }, {})
    }

    const processLoadedContent = (content) => {
        const { 'Project Name': _, ...rest } = content || {}
        return rest
    }

    return (
        <>
            <GovernedArtefactEditor
                key={mergedArtefact?.lastUpdated || 'init'}
                projectId={projectId}
                artefact={mergedArtefact}
                onSave={handleInternalSave}
                onBack={onBack}
                title="Project Charter"
                description="Define the project scope, objectives, and participants"
                actions={<CustomActions />}
                initialData={initialData}
                processLoadedContent={processLoadedContent}
                customApproval={true}
                hideGlobalSave={true}
                fullWidth={true}
            >
                {({ data, handleContentChange, approval, onUpdateApproval, onToggleApproval, isDirty, saveStatus, triggerSave }) => {
                    dataRef.current = { ...data, approval }

                    const SaveButton = () => {
                        const isSaving = saveStatus === 'saving'
                        const isSuccess = saveStatus === 'success' && !isDirty

                        let btnClass = "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"

                        if (isSaving) {
                            btnClass += " border-gray-300 text-gray-500 bg-gray-100 cursor-wait"
                            return (
                                <button disabled className={btnClass}>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </button>
                            )
                        }

                        if (isDirty) {
                            // Dirty State
                            btnClass += " border-transparent text-white bg-green-600 hover:bg-green-700 shadow-md transform hover:scale-105"
                            return (
                                <button onClick={triggerSave} className={btnClass}>
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Save Changes
                                </button>
                            )
                        }

                        // Clean / Saved State
                        btnClass += " border-gray-200 text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
                        return (
                            <button onClick={triggerSave} className={btnClass} title="No unsaved changes">
                                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                                Saved
                            </button>
                        )
                    }

                    // -- Auto Fill Logic (Existing) --
                    // We invoke this when specific sections are active
                    useEffect(() => {
                        if (activeSectionId === 'governance' && projectId && window.electronAPI) {
                            const tryAutoFill = async () => {
                                try {
                                    const asiData = await window.electronAPI.readJSON(`projects/${projectId}/initialStakeholders.json`)
                                    if (!asiData) return

                                    // 1. PSC Matrix Auto-Fill
                                    if (data.psc) {
                                        const pscData = data.psc
                                        const isPoEmpty = !pscData.requestorSide?.po?.name
                                        const isBmEmpty = !pscData.requestorSide?.bm?.name
                                        const isSpEmpty = !pscData.providerSide?.sp?.name

                                        if (isPoEmpty || isBmEmpty || isSpEmpty) {
                                            let newPsc = { ...pscData }
                                            let modified = false
                                            if (isPoEmpty && asiData.projectOwner?.name) { newPsc.requestorSide.po.name = asiData.projectOwner.name; modified = true }
                                            if (isBmEmpty && asiData.businessManager?.name) { newPsc.requestorSide.bm.name = asiData.businessManager.name; modified = true }
                                            if (isSpEmpty && asiData.additionalStakeholders) {
                                                const sp = asiData.additionalStakeholders.find(s => s.role && s.role.toLowerCase().includes('solution provider'))
                                                if (sp) { newPsc.providerSide.sp.name = sp.name; modified = true }
                                            }
                                            if (modified) handleContentChange('psc', newPsc)
                                        }
                                    }

                                    // 2. Extended Governance Auto-Fill
                                    if (data.extendedGovernance && data.extendedGovernance.length === 0) {
                                        if (asiData.additionalStakeholders && asiData.additionalStakeholders.length > 0) {
                                            const pscRoles = ['project owner', 'business manager', 'solution provider', 'project manager']
                                            const filtered = asiData.additionalStakeholders.filter(s => {
                                                const role = (s.role || '').toLowerCase()
                                                return !pscRoles.some(pr => role.includes(pr))
                                            })
                                            if (filtered.length > 0) {
                                                const newRows = filtered.map(s => ({
                                                    id: Date.now() + Math.random().toString(),
                                                    role: s.role,
                                                    name: s.name,
                                                    organisation: s.organisation || ''
                                                }))
                                                handleContentChange('extendedGovernance', newRows)
                                            }
                                        }
                                    }
                                } catch (e) { console.warn("Failed to auto-fill Governance data", e) }
                            }
                            tryAutoFill()
                        }
                        // eslint-disable-next-line react-hooks/exhaustive-deps
                    }, [activeSectionId, projectId])

                    // -- Risk Handlers --
                    const handleOpenAddRisk = () => {
                        setEditingRiskIndex(null)
                        setCurrentRiskData(null)
                        setIsRiskModalOpen(true)
                    }

                    const handleOpenEditRisk = (index, risk) => {
                        setEditingRiskIndex(index)
                        setCurrentRiskData(risk)
                        setIsRiskModalOpen(true)
                    }

                    const handleSaveRisk = (riskData) => {
                        const currentRisks = Array.isArray(data.risks) ? data.risks : []
                        const newRisks = [...currentRisks]

                        if (editingRiskIndex !== null) {
                            // Edit
                            newRisks[editingRiskIndex] = { ...newRisks[editingRiskIndex], ...riskData }
                        } else {
                            // Add
                            newRisks.push({ id: Date.now().toString(), ...riskData })
                        }

                        handleContentChange('risks', newRisks)
                        setIsRiskModalOpen(false)
                    }

                    const handleDeleteRisk = (index) => {
                        const currentRisks = Array.isArray(data.risks) ? data.risks : []
                        const newRisks = currentRisks.filter((_, i) => i !== index)
                        handleContentChange('risks', newRisks)
                    }

                    // -- Renderers --
                    const renderInput = (key, label, type = 'text') => (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={key}>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
                            <input
                                type={type}
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={data[key] || ''}
                                onChange={(e) => handleContentChange(key, e.target.value)}
                            />
                        </div>
                    )

                    const renderTextArea = (key, label, placeholder) => (
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={key}>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
                            <RichTextEditor
                                value={data[key] || ''}
                                onChange={(html) => handleContentChange(key, html)}
                                placeholder={placeholder}
                                className="min-h-[200px]"
                            />
                        </div>
                    )

                    const renderTable = (key, label, columns) => {
                        const rows = Array.isArray(data[key]) ? data[key] : []
                        const addRow = () => {
                            const newRow = { id: Date.now().toString() }
                            columns.forEach(col => newRow[col.key] = col.type === 'select' && col.options ? col.options[1] : '')
                            handleContentChange(key, [...rows, newRow])
                        }
                        const removeRow = (index) => {
                            const newRows = [...rows]; newRows.splice(index, 1); handleContentChange(key, newRows)
                        }
                        const updateRow = (index, colKey, value) => {
                            const newRows = [...rows]; newRows[index] = { ...newRows[index], [colKey]: value }; handleContentChange(key, newRows)
                        }

                        const stripHtml = (html) => {
                            if (!html) return ''
                            const tmp = document.createElement("DIV"); tmp.innerHTML = html; return tmp.textContent || tmp.innerText || ""
                        }

                        const getPriorityColor = (value) => {
                            if (!value) return 'bg-gray-100 text-gray-800'
                            if (value.includes('High')) return 'bg-red-100 text-red-800 border-red-200'
                            if (value.includes('Medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            if (value.includes('Low')) return 'bg-green-100 text-green-800 border-green-200'
                            return 'bg-gray-100 text-gray-800'
                        }

                        const isUrl = (text) => {
                            if (typeof text !== 'string') return false
                            const trimmed = text.trim()
                            // Check for http, https, or www at the start
                            return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.')
                        }

                        const getUrl = (text) => {
                            const trimmed = text.trim()
                            if (trimmed.startsWith('www.')) return `https://${trimmed}`
                            return trimmed
                        }

                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={key}>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-lg font-medium text-gray-900">{label}</label>
                                    <button type="button" onClick={addRow} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-4 w-4 mr-1.5" /> Add Row
                                    </button>
                                </div>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map(col => <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>)}
                                                <th className="px-6 py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rows.length === 0 ? (
                                                <tr><td colSpan={columns.length + 1} className="px-6 py-8 text-center text-sm text-gray-500 italic">No items added. <button onClick={addRow} className="text-blue-600 hover:underline">Add one now</button></td></tr>
                                            ) : rows.map((row, idx) => (
                                                <tr key={row.id || idx} className="align-top hover:bg-gray-50">
                                                    {columns.map(col => {
                                                        const rawValue = row[col.key] || ''
                                                        const displayValue = (col.type !== 'richtext' && typeof rawValue === 'string' && rawValue.includes('<')) ? stripHtml(rawValue) : rawValue

                                                        // Check if this is a URL field (specifically for Source / Link or generally if it looks like a URL)
                                                        const hasExternalLink = (col.key === 'sourceOrLink' || isUrl(displayValue)) && isUrl(displayValue)

                                                        return (
                                                            <td key={col.key} className="px-6 py-4 min-w-[200px]">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-grow">
                                                                        {col.type === 'richtext' ? <RichTextEditor value={row[col.key] || ''} onChange={(html) => updateRow(idx, col.key, html)} className="min-h-[100px]" /> :
                                                                            col.type === 'textarea' ? <ArtefactTextarea rows={3} value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="resize-y text-sm" /> :
                                                                                col.type === 'select' ? <ArtefactSelect value={row[col.key] || col.options?.[0] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className={`text-sm ${col.key === 'priority' ? `border ${getPriorityColor(row[col.key])} bg-opacity-20` : ''}`}>{col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</ArtefactSelect> :
                                                                                    col.type === 'date' ? <ArtefactInput type="date" value={row[col.key] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="text-sm" /> :
                                                                                        <ArtefactInput type="text" value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="text-sm" />}
                                                                    </div>
                                                                    {hasExternalLink && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                const url = getUrl(displayValue)
                                                                                if (window.electronAPI && window.electronAPI.openExternal) {
                                                                                    window.electronAPI.openExternal(url)
                                                                                } else {
                                                                                    window.open(url, '_blank')
                                                                                }
                                                                            }}
                                                                            className="flex-shrink-0 p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                                            title="Open External Link"
                                                                        >
                                                                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )
                                                    })}

                                                    <td className="px-6 py-4 text-right"><button onClick={() => removeRow(idx)} className="text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    const renderRisksList = (fieldDef) => {
                        const rows = Array.isArray(data.risks) ? data.risks : []

                        const getBadgeColor = (val) => {
                            if (val === 'High') return 'bg-red-100 text-red-800'
                            if (val === 'Medium') return 'bg-yellow-100 text-yellow-800'
                            if (val === 'Low') return 'bg-green-100 text-green-800'
                            return 'bg-gray-100 text-gray-800'
                        }

                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button
                                        type="button"
                                        onClick={handleOpenAddRisk}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-1.5" />
                                        Add Risk
                                    </button>
                                </div>

                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                        <p className="text-sm text-gray-500 mb-2">No high-level risks identified yet.</p>
                                        <p className="text-xs text-gray-400">Click 'Add Risk' to define constraints.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((risk, idx) => (
                                            <div key={risk.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(risk.riskLevel)}`}>
                                                            Lvl: {risk.riskLevel || 'N/A'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(risk.likelihood)}`}>
                                                            Like: {risk.likelihood || 'N/A'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor(risk.impact)}`}>
                                                            Imp: {risk.impact || 'N/A'}
                                                        </span>
                                                        {risk.status === 'Closed' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                                                                Closed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-900 text-sm line-clamp-2">
                                                        {risk.description || 'No description provided.'}
                                                    </p>
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">Strategy:</span> {risk.responseStrategy || '-'}</p>
                                                        <p className="text-xs text-gray-600 line-clamp-2"><span className="font-semibold text-gray-700">Action:</span> {risk.actionDetails || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleOpenEditRisk(idx, risk)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRisk(idx)}
                                                        className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Need Logic --
                    const handleOpenAddNeed = () => { setEditingNeedIndex(null); setCurrentNeedData(null); setIsNeedModalOpen(true) }
                    const handleOpenEditNeed = (index, item) => { setEditingNeedIndex(index); setCurrentNeedData(item); setIsNeedModalOpen(true) }
                    const handleSaveNeed = (formData) => {
                        const list = Array.isArray(data.stakeholderNeeds) ? data.stakeholderNeeds : []
                        const newList = [...list]
                        if (editingNeedIndex !== null) newList[editingNeedIndex] = { ...newList[editingNeedIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('stakeholderNeeds', newList)
                        setIsNeedModalOpen(false)
                    }
                    const handleDeleteNeed = (index) => {
                        const list = Array.isArray(data.stakeholderNeeds) ? data.stakeholderNeeds : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('stakeholderNeeds', newList)
                    }

                    const renderNeedsList = (fieldDef) => {
                        const rawRows = Array.isArray(data.stakeholderNeeds) ? data.stakeholderNeeds : []
                        const rows = [...rawRows].sort((a, b) => {
                            const priorityMap = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
                            // Extract main priority word if it has extra text (legacy support)
                            const getP = (p) => {
                                if (!p) return 99
                                if (p.includes('Critical')) return 0
                                if (p.includes('High')) return 1
                                if (p.includes('Medium')) return 2
                                if (p.includes('Low')) return 3
                                return 99
                            }
                            return getP(a.priority) - getP(b.priority)
                        })

                        const getPriorityBadge = (p) => {
                            if (!p) return 'bg-gray-100 text-gray-800'
                            if (p.includes('Critical')) return 'bg-red-100 text-red-800'
                            if (p.includes('High')) return 'bg-orange-100 text-orange-800'
                            if (p.includes('Medium')) return 'bg-blue-100 text-blue-800'
                            if (p.includes('Low')) return 'bg-gray-100 text-gray-800'
                            return 'bg-gray-100 text-gray-800'
                        }
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddNeed} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Need
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No stakeholder needs added.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="font-bold text-sm text-gray-900">{item.stakeholder || 'Unknown Stakeholder'}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(item.priority)}`}>{item.priority}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm line-clamp-3">{item.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button onClick={() => handleOpenEditNeed(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteNeed(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Deliverables Logic --
                    const handleOpenAddDeliverable = () => { setEditingDeliverableIndex(null); setCurrentDeliverableData(null); setIsDeliverableModalOpen(true) }
                    const handleOpenEditDeliverable = (index, item) => { setEditingDeliverableIndex(index); setCurrentDeliverableData(item); setIsDeliverableModalOpen(true) }
                    const handleSaveDeliverable = (formData) => {
                        const list = Array.isArray(data.deliverables) ? data.deliverables : []
                        const newList = [...list]
                        if (editingDeliverableIndex !== null) newList[editingDeliverableIndex] = { ...newList[editingDeliverableIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('deliverables', newList)
                        setIsDeliverableModalOpen(false)
                    }
                    const handleDeleteDeliverable = (index) => {
                        const list = Array.isArray(data.deliverables) ? data.deliverables : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('deliverables', newList)
                    }

                    const renderDeliverablesList = (fieldDef) => {
                        const rows = Array.isArray(data.deliverables) ? data.deliverables : []
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddDeliverable} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Deliverable
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No deliverables added.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">{item.name || 'Untitled'}</h4>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">{item.type || 'Report'}</span>
                                                        {item.dueDate && <span className="text-xs text-gray-500 ml-2">Due: {item.dueDate}</span>}
                                                    </div>
                                                    <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button onClick={() => handleOpenEditDeliverable(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteDeliverable(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Feature Logic --
                    const handleOpenAddFeature = () => { setEditingFeatureIndex(null); setCurrentFeatureData(null); setIsFeatureModalOpen(true) }
                    const handleOpenEditFeature = (index, item) => { setEditingFeatureIndex(index); setCurrentFeatureData(item); setIsFeatureModalOpen(true) }
                    const handleSaveFeature = (formData) => {
                        const list = Array.isArray(data.features) ? data.features : []
                        const newList = [...list]
                        if (editingFeatureIndex !== null) newList[editingFeatureIndex] = { ...newList[editingFeatureIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('features', newList)
                        setIsFeatureModalOpen(false)
                    }
                    const handleDeleteFeature = (index) => {
                        const list = Array.isArray(data.features) ? data.features : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('features', newList)
                    }

                    const renderFeaturesList = (fieldDef) => {
                        const rows = Array.isArray(data.features) ? data.features : []
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddFeature} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Feature
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No features added.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name || 'Untitled Feature'}</h4>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
                                                    {item.relatedDeliverable && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            Relates to: {item.relatedDeliverable}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button onClick={() => handleOpenEditFeature(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteFeature(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Constraint Logic --
                    const handleOpenAddConstraint = () => { setEditingConstraintIndex(null); setCurrentConstraintData(null); setIsConstraintModalOpen(true) }
                    const handleOpenEditConstraint = (index, item) => { setEditingConstraintIndex(index); setCurrentConstraintData(item); setIsConstraintModalOpen(true) }
                    const handleSaveConstraint = (formData) => {
                        const list = Array.isArray(data.constraints) ? data.constraints : []
                        const newList = [...list]
                        if (editingConstraintIndex !== null) newList[editingConstraintIndex] = { ...newList[editingConstraintIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('constraints', newList)
                        setIsConstraintModalOpen(false)
                    }
                    const handleDeleteConstraint = (index) => {
                        const list = Array.isArray(data.constraints) ? data.constraints : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('constraints', newList)
                    }

                    const renderConstraintsList = (fieldDef) => {
                        const rows = Array.isArray(data.constraints) ? data.constraints : []
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddConstraint} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Constraint
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No constraints defined.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">{item.type || 'Constraint'}</span>
                                                    </div>
                                                    <p className="text-gray-900 text-sm">{item.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button onClick={() => handleOpenEditConstraint(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteConstraint(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Assumption Logic --
                    const handleOpenAddAssumption = () => { setEditingAssumptionIndex(null); setCurrentAssumptionData(null); setIsAssumptionModalOpen(true) }
                    const handleOpenEditAssumption = (index, item) => { setEditingAssumptionIndex(index); setCurrentAssumptionData(item); setIsAssumptionModalOpen(true) }
                    const handleSaveAssumption = (formData) => {
                        const list = Array.isArray(data.assumptions) ? data.assumptions : []
                        const newList = [...list]
                        if (editingAssumptionIndex !== null) newList[editingAssumptionIndex] = { ...newList[editingAssumptionIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('assumptions', newList)
                        setIsAssumptionModalOpen(false)
                    }
                    const handleDeleteAssumption = (index) => {
                        const list = Array.isArray(data.assumptions) ? data.assumptions : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('assumptions', newList)
                    }

                    const renderAssumptionsList = (fieldDef) => {
                        const rows = Array.isArray(data.assumptions) ? data.assumptions : []
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddAssumption} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Assumption
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No assumptions defined.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {rows.map((item, idx) => (
                                            <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-1 pr-6">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="font-bold text-gray-500 text-xs uppercase tracking-wide">Impact:</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.impact === 'High' ? 'bg-red-100 text-red-800' : item.impact === 'Low' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.impact || 'Medium'}</span>
                                                    </div>
                                                    <p className="text-gray-900 text-sm">{item.description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    <button onClick={() => handleOpenEditAssumption(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                    <button onClick={() => handleDeleteAssumption(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Cost & Budget Logic --
                    const handleOpenAddCost = () => { setEditingCostIndex(null); setCurrentCostData(null); setIsCostModalOpen(true) }
                    const handleOpenEditCost = (index, item) => { setEditingCostIndex(index); setCurrentCostData(item); setIsCostModalOpen(true) }
                    const handleSaveCost = (formData) => {
                        const list = Array.isArray(data.costs) ? data.costs : []
                        const newList = [...list]
                        if (editingCostIndex !== null) newList[editingCostIndex] = { ...newList[editingCostIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('costs', newList)
                        setIsCostModalOpen(false)
                    }
                    const handleDeleteCost = (index) => {
                        const list = Array.isArray(data.costs) ? data.costs : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('costs', newList)
                    }

                    const renderCostsSection = (fieldDef) => {
                        const rows = Array.isArray(data.costs) ? data.costs : []

                        // Calculate Matrix (TCO)
                        const years = ['Year 1', 'Year 2', 'Year 3']
                        const categories = ['Solution Development', 'Maintenance', 'Support', 'Training', 'Infrastructure', 'Other']
                        const matrix = {}

                        // Initialize
                        categories.forEach(cat => {
                            matrix[cat] = { total: 0 }
                            years.forEach(y => matrix[cat][y] = 0)
                        })

                        // Aggregate
                        rows.forEach(item => {
                            const amt = parseFloat(item.amount) || 0
                            if (matrix[item.category] && item.year) {
                                if (matrix[item.category][item.year] !== undefined) {
                                    matrix[item.category][item.year] += amt
                                    matrix[item.category].total += amt
                                }
                            }
                        })

                        return (
                            <div className="space-y-8" key={fieldDef.key}>
                                {/* 4.1.1 Projected Costs Matrix */}
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Projected Costs Matrix</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Calculated TCO Matrix (Auto-generated from Breakdown)</p>
                                    </div>
                                    <div className="overflow-x-auto bg-white rounded-md border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    {years.map(y => <th key={y} className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">{y}</th>)}
                                                    <th className="px-4 py-2 text-right font-bold text-gray-700 uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {categories.map(cat => (
                                                    <tr key={cat}>
                                                        <td className="px-4 py-2 font-medium text-gray-900">{cat}</td>
                                                        {years.map(y => (
                                                            <td key={y} className="px-4 py-2 text-right text-gray-600">
                                                                {matrix[cat][y] > 0 ? matrix[cat][y].toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-2 text-right font-bold text-gray-900">
                                                            {matrix[cat].total > 0 ? matrix[cat].total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Grand Total Row */}
                                                <tr className="bg-gray-50 font-bold">
                                                    <td className="px-4 py-2 text-gray-900">GRAND TOTAL</td>
                                                    {years.map(y => {
                                                        const yTotal = categories.reduce((sum, cat) => sum + matrix[cat][y], 0)
                                                        return <td key={y} className="px-4 py-2 text-right text-gray-900">{yTotal > 0 ? yTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
                                                    })}
                                                    <td className="px-4 py-2 text-right text-gray-900">
                                                        {categories.reduce((sum, cat) => sum + matrix[cat].total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 4.1.2 Cost Breakdown (List) */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="block text-lg font-medium text-gray-900">Cost Breakdown</label>
                                        <button type="button" onClick={handleOpenAddCost} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                            <PlusIcon className="h-5 w-5 mr-1.5" /> Add Cost Item
                                        </button>
                                    </div>
                                    {rows.length === 0 ? (
                                        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No cost items added.</p></div>
                                    ) : (
                                        <div className="space-y-4">
                                            {rows.map((item, idx) => (
                                                <div key={item.id || idx} className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex-1 pr-6">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-bold text-gray-900 text-sm">{item.category}</span>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{item.year}</span>
                                                            </div>
                                                            <span className="font-mono font-bold text-gray-900">
                                                                {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm text-left">{item.description}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                                        <button onClick={() => handleOpenEditCost(idx, item)} className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
                                                        <button onClick={() => handleDeleteCost(idx)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    // -- Milestone Logic --
                    const handleOpenAddMilestone = () => { setEditingMilestoneIndex(null); setCurrentMilestoneData(null); setIsMilestoneModalOpen(true) }
                    const handleOpenEditMilestone = (index, item) => { setEditingMilestoneIndex(index); setCurrentMilestoneData(item); setIsMilestoneModalOpen(true) }
                    const handleSaveMilestone = (formData) => {
                        const list = Array.isArray(data.milestones) ? data.milestones : []
                        const newList = [...list]
                        if (editingMilestoneIndex !== null) newList[editingMilestoneIndex] = { ...newList[editingMilestoneIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('milestones', newList)
                        setIsMilestoneModalOpen(false)
                    }
                    const handleDeleteMilestone = (index) => {
                        const list = Array.isArray(data.milestones) ? data.milestones : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('milestones', newList)
                    }

                    const renderMilestonesList = (fieldDef) => {
                        const rawRows = Array.isArray(data.milestones) ? data.milestones : []
                        const rows = [...rawRows].sort((a, b) => {
                            if (!a.targetDeliveryDate) return 1
                            if (!b.targetDeliveryDate) return -1
                            return new Date(a.targetDeliveryDate) - new Date(b.targetDeliveryDate)
                        })
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddMilestone} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Milestone
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No milestones defined.</p></div>
                                ) : (
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-40">Target Date</th>
                                                    <th className="px-6 py-3 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {rows.map((item, idx) => (
                                                    <tr key={item.id || idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{item.id}</td>
                                                        <td className="px-6 py-4 text-gray-900">{item.description}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.targetDeliveryDate}</td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <button onClick={() => handleOpenEditMilestone(idx, item)} className="text-blue-600 hover:text-blue-900 mr-3"><PencilSquareIcon className="h-5 w-5 inline" /></button>
                                                            <button onClick={() => handleDeleteMilestone(idx)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5 inline" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    // -- Resources Logic --
                    const handleOpenAddResource = () => { setEditingResourceIndex(null); setCurrentResourceData(null); setIsResourceModalOpen(true) }
                    const handleOpenEditResource = (index, item) => { setEditingResourceIndex(index); setCurrentResourceData(item); setIsResourceModalOpen(true) }
                    const handleSaveResource = (formData) => {
                        const list = Array.isArray(data.resources) ? data.resources : []
                        const newList = [...list]
                        if (editingResourceIndex !== null) newList[editingResourceIndex] = { ...newList[editingResourceIndex], ...formData }
                        else newList.push({ id: Date.now().toString(), ...formData })
                        handleContentChange('resources', newList)
                        setIsResourceModalOpen(false)
                    }
                    const handleDeleteResource = (index) => {
                        const list = Array.isArray(data.resources) ? data.resources : []
                        const newList = list.filter((_, i) => i !== index)
                        handleContentChange('resources', newList)
                    }

                    const renderResourcesList = (fieldDef) => {
                        const rows = Array.isArray(data.resources) ? data.resources : []
                        return (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6" key={fieldDef.key}>
                                <div className="flex justify-between items-center mb-6">
                                    <label className="block text-lg font-medium text-gray-900">{fieldDef.label}</label>
                                    <button type="button" onClick={handleOpenAddResource} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                        <PlusIcon className="h-5 w-5 mr-1.5" /> Add Resource
                                    </button>
                                </div>
                                {rows.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"><p className="text-sm text-gray-500">No resources defined.</p></div>
                                ) : (
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Role / Profile</th>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description / Skills</th>
                                                    <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-20">Qty/FTE</th>
                                                    <th className="px-6 py-3 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {rows.map((item, idx) => (
                                                    <tr key={item.id || idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-bold text-gray-900">{item.id}</td>
                                                        <td className="px-6 py-4 font-medium text-gray-900">{item.role}</td>
                                                        <td className="px-6 py-4 text-gray-600">{item.description}</td>
                                                        <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            <button onClick={() => handleOpenEditResource(idx, item)} className="text-blue-600 hover:text-blue-900 mr-3"><PencilSquareIcon className="h-5 w-5 inline" /></button>
                                                            <button onClick={() => handleDeleteResource(idx)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5 inline" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    }
                    const renderPSCMatrix = (key, label, structure) => {
                        const pscData = data[key] || structure
                        const updatePscRole = (side, roleKey, value) => {
                            const newData = { ...pscData, [side]: { ...pscData[side], [roleKey]: { ...pscData[side][roleKey], name: value } } }
                            handleContentChange(key, newData)
                        }
                        return (
                            <div key={key} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">{label}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <div className="text-center mb-4 pb-2 border-b border-blue-200"><h5 className="font-bold text-blue-800">Requestor Side (Client)</h5></div>
                                        {['po', 'bm'].map(roleKey => (
                                            <div key={roleKey} className="bg-white p-4 rounded shadow-sm mb-4 border-l-4 border-blue-400">
                                                <h6 className="font-bold text-gray-900 text-sm">{pscData.requestorSide[roleKey].role}</h6>
                                                <p className="text-xs text-gray-500 mb-2">{pscData.requestorSide[roleKey].responsibilities}</p>
                                                <input type="text" className="w-full text-sm border-gray-300 rounded" value={pscData.requestorSide[roleKey].name} onChange={(e) => updatePscRole('requestorSide', roleKey, e.target.value)} placeholder="Name..." />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                        <div className="text-center mb-4 pb-2 border-b border-indigo-200"><h5 className="font-bold text-indigo-800">Provider Side (Builder)</h5></div>
                                        {['sp', 'pm'].map(roleKey => (
                                            <div key={roleKey} className="bg-white p-4 rounded shadow-sm mb-4 border-l-4 border-indigo-400">
                                                <h6 className="font-bold text-gray-900 text-sm">{pscData.providerSide[roleKey].role}</h6>
                                                <p className="text-xs text-gray-500 mb-2">{pscData.providerSide[roleKey].responsibilities}</p>
                                                <input type="text" className="w-full text-sm border-gray-300 rounded" value={pscData.providerSide[roleKey].name} onChange={(e) => updatePscRole('providerSide', roleKey, e.target.value)} placeholder="Name..." />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    // -- Main Layout Construction --
                    const renderActiveContent = () => {
                        // Find the active item node
                        let activeItem = null
                        SIDEBAR_STRUCTURE.forEach(group => {
                            const found = group.items.find(i => i.id === activeSectionId)
                            if (found) activeItem = found
                        })

                        if (!activeItem) return <div className="p-8 text-center text-gray-500">Select a section</div>

                        // Special Case: Approval
                        if (activeSectionId === 'approval') {
                            return (
                                <div className="w-full mx-auto pt-0 px-4">
                                    <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                                        <h2 className="text-2xl font-bold text-gray-900">Sign-Off & Approval</h2>
                                        <SaveButton />
                                    </div>
                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                        <ArtefactApprovalSection
                                            approvalState={approval}
                                            onUpdate={onUpdateApproval}
                                            onToggleApproval={onToggleApproval}
                                            isOpen={true}
                                            onToggle={() => { }}
                                            isModified={false}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        // Generic Field Rendering
                        return (
                            <div className="w-full pb-20 px-2">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">{activeItem.name}</h2>
                                    <SaveButton />
                                </div>
                                <div className="space-y-6">
                                    {activeItem.fields.map(fieldKey => {
                                        const fieldDef = fieldMap[fieldKey]
                                        if (!fieldDef) return null

                                        // CUSTOM RENDERERS
                                        if (fieldKey === 'risks') return renderRisksList(fieldDef)
                                        if (fieldKey === 'stakeholderNeeds') return renderNeedsList(fieldDef)
                                        if (fieldKey === 'deliverables') return renderDeliverablesList(fieldDef)
                                        if (fieldKey === 'features') return renderFeaturesList(fieldDef)
                                        if (fieldKey === 'constraints') return renderConstraintsList(fieldDef)
                                        if (fieldKey === 'costs') return renderCostsSection(fieldDef)
                                        if (fieldKey === 'milestones') return renderMilestonesList(fieldDef)
                                        if (fieldKey === 'resources') return renderResourcesList(fieldDef)
                                        if (fieldKey === 'assumptions') return renderAssumptionsList(fieldDef)

                                        if (fieldDef.type === 'table') return renderTable(fieldDef.key, fieldDef.label, fieldDef.columns)
                                        if (fieldDef.type === 'richtext' || fieldDef.type === 'textarea') return renderTextArea(fieldDef.key, fieldDef.label, fieldDef.placeholder)
                                        if (fieldDef.type === 'pscMatrix') return renderPSCMatrix(fieldDef.key, fieldDef.label, fieldDef.structure)
                                        return renderInput(fieldDef.key, fieldDef.label, fieldDef.type)
                                    })}
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div className="flex flex-row w-full h-[calc(100vh-160px)] gap-4 bg-gray-50 bg-opacity-50">
                            {/* Left Sidebar - 20% */}
                            <div className="w-1/5 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                                <nav className="p-4 space-y-8">
                                    {SIDEBAR_STRUCTURE.map((group, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                                {group.title}
                                            </h3>
                                            <div className="space-y-1">
                                                {group.items.map(item => {
                                                    const isActive = activeSectionId === item.id
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setActiveSectionId(item.id)}
                                                            className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                                                                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            <span className={`w-2 h-2 mr-3 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-gray-400'}`}></span>
                                                            {item.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content Area - 50% or Flex-1 */}
                            <div className={`${isGuidanceOpen ? 'w-1/2' : 'flex-1'} flex-shrink-0 overflow-y-auto p-6 bg-gray-50/50 transition-all duration-300`}>
                                {renderActiveContent()}
                            </div>

                            {/* Right Sidebar: Guidance Panel - 30% or Hidden */}
                            {isGuidanceOpen && (
                                <div className="w-[30%] flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 overflow-y-auto">
                                    <GuidancePanel
                                        sectionId={activeSectionId}
                                        isOpen={true}
                                        onClose={() => setIsGuidanceOpen(false)}
                                    />
                                </div>
                            )}

                            <RiskModal
                                isOpen={isRiskModalOpen}
                                onClose={() => setIsRiskModalOpen(false)}
                                onSave={handleSaveRisk}
                                initialData={currentRiskData}
                            />
                            <NeedModal
                                isOpen={isNeedModalOpen}
                                onClose={() => setIsNeedModalOpen(false)}
                                onSave={handleSaveNeed}
                                initialData={currentNeedData}
                            />
                            <DeliverableModal
                                isOpen={isDeliverableModalOpen}
                                onClose={() => setIsDeliverableModalOpen(false)}
                                onSave={handleSaveDeliverable}
                                initialData={currentDeliverableData}
                            />
                            <FeatureModal
                                isOpen={isFeatureModalOpen}
                                onClose={() => setIsFeatureModalOpen(false)}
                                onSave={handleSaveFeature}
                                initialData={currentFeatureData}
                                availableDeliverables={Array.isArray(data.deliverables) ? data.deliverables : []}
                            />
                            <ConstraintModal
                                isOpen={isConstraintModalOpen}
                                onClose={() => setIsConstraintModalOpen(false)}
                                onSave={handleSaveConstraint}
                                initialData={currentConstraintData}
                            />
                            <AssumptionModal
                                isOpen={isAssumptionModalOpen}
                                onClose={() => setIsAssumptionModalOpen(false)}
                                onSave={handleSaveAssumption}
                                initialData={currentAssumptionData}
                            />
                            <CostModal
                                isOpen={isCostModalOpen}
                                onClose={() => setIsCostModalOpen(false)}
                                onSave={handleSaveCost}
                                initialData={currentCostData}
                            />
                            <MilestoneModal
                                isOpen={isMilestoneModalOpen}
                                onClose={() => setIsMilestoneModalOpen(false)}
                                onSave={handleSaveMilestone}
                                initialData={currentMilestoneData}
                            />
                            <ResourceModal
                                isOpen={isResourceModalOpen}
                                onClose={() => setIsResourceModalOpen(false)}
                                onSave={handleSaveResource}
                                initialData={currentResourceData}
                            />
                        </div>
                    )
                }}
            </GovernedArtefactEditor>
            <DocumentPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Project Charter Preview"
                htmlContent={previewHtml}
            />
        </>
    )
}

export default ProjectCharter
