import React, { useState, useEffect, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    ArrowDownTrayIcon,
    BookOpenIcon,
    LightBulbIcon,
    XMarkIcon,
    CheckCircleIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    ScaleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea, ArtefactSelect } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import DocumentGenerator from '../../services/DocumentGenerator'
import { businessCaseSchema } from '../../data/schemas/BusinessCaseSchema'
import businessCaseTemplate from '../../templates/BusinessCaseTemplate.json'
import { ProjectService } from '../../services/ProjectService'
import ArtefactApprovalSection from './ui/ArtefactApprovalSection'
import ArtefactSaveButton from './ui/ArtefactSaveButton'
import { BUSINESS_CASE_GUIDANCE } from '../../data/businessCaseGuidance'

// -- Guidance Panel Component --
const GuidancePanel = ({ sectionId, isOpen, onClose }) => {
    if (!isOpen) return null

    const guidance = BUSINESS_CASE_GUIDANCE[sectionId]
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
                                a: ({ node, ...props }) => (
                                    <button
                                        className="text-blue-600 hover:text-blue-800 underline text-left inline"
                                        onClick={() => {
                                            if (window.electronAPI && window.electronAPI.openExternal) {
                                                window.electronAPI.openExternal(props.href)
                                            } else {
                                                window.open(props.href, '_blank')
                                            }
                                        }}
                                    >
                                        {props.children}
                                    </button>
                                )
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
                        <p className="text-xs text-gray-500">Select a section to see specific help text.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// -- Cost Modal Component (Adapted) --
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

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

    const handleSubmit = () => {
        onSave(formData)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{initialData ? 'Edit Cost Item' : 'Add Cost Item'}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
                            <option>Solution Development</option>
                            <option>Maintenance</option>
                            <option>Infrastructure</option>
                            <option>Training</option>
                            <option>Change Management</option>
                            <option>Support</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <select className="mt-1 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={formData.year} onChange={(e) => handleChange('year', e.target.value)}>
                            <option>Year 1</option>
                            <option>Year 2</option>
                            <option>Year 3</option>
                            <option>Year 4</option>
                            <option>Year 5</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (€)</label>
                        <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Cost details..." />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    )
}

// -- Milestone Modal Component (Adapted) --
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

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

    const handleSubmit = () => {
        onSave(formData)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{initialData ? 'Edit Milestone' : 'Add Milestone'}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Milestone ID / Name</label>
                        <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} placeholder="e.g. M1 - Prototype Approval" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Delivery Date</label>
                        <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.targetDeliveryDate} onChange={(e) => handleChange('targetDeliveryDate', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" rows={3} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Milestone deliverables..." />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    )
}

const SIDEBAR_STRUCTURE = [
    {
        title: '1. BUSINESS CONTEXT',
        items: [
            { id: 'context-justification', name: '1.1 Justification & Current State' },
            { id: 'context-impact', name: '1.2 Impact Analysis' },
            { id: 'context-strategy', name: '1.3 Strategic Fit & Synergy' }
        ]
    },
    {
        title: '2. ANALYSIS OF ALTERNATIVES',
        items: [
            { id: 'alternatives', name: '2.1 Options & Decision' }
        ]
    },
    {
        title: '3. PROPOSED SOLUTION',
        items: [
            { id: 'solution', name: '3.1 Scope & Outcomes' }
        ]
    },
    {
        title: '4. COST & BENEFITS',
        items: [
            { id: 'costs', name: '4.1 Financial Plan' }
        ]
    },
    {
        title: '5. ROADMAP & MILESTONES',
        items: [
            { id: 'roadmap', name: '5.1 Timeline' }
        ]
    },
    {
        title: '6. GOVERNANCE',
        items: [
            { id: 'governance', name: '6.1 Approval' }
        ]
    }
]

const BusinessCase = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // -- State --
    const [alternativesTab, setAlternativesTab] = useState('A') // A, B, Decision
    const [activeSectionId, setActiveSectionId] = useState('context-justification')
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(true)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    // Cost Modal State
    const [isCostModalOpen, setIsCostModalOpen] = useState(false)
    const [currentCostData, setCurrentCostData] = useState(null)
    const [editingCostIndex, setEditingCostIndex] = useState(null)

    // Milestone Modal State
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
    const [currentMilestoneData, setCurrentMilestoneData] = useState(null)
    const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null)

    // Debug
    useEffect(() => {
        console.log('BusinessCase Mounted', { projectId, artefact })
        return () => console.log('BusinessCase Unmounted')
    }, [projectId, artefact])


    const processLoadedContent = (content) => {
        // Ensure lists exist
        const processed = { ...content }
        if (!Array.isArray(processed.costs)) processed.costs = []
        if (!Array.isArray(processed.milestones)) processed.milestones = []
        if (!Array.isArray(processed.impactedDomains)) processed.impactedDomains = []
        // Init new fields
        if (!processed.dependencies) processed.dependencies = ''
        if (!processed.synergies) processed.synergies = ''
        if (!processed.regulatoryDrivers) processed.regulatoryDrivers = ''
        if (!processed.impactDoingNothing) processed.impactDoingNothing = ''
        return processed
    }

    const handleExport = async (format) => {
        setShowExportMenu(false)
        if (!artefact) return

        // Prepare content with defaults
        const content = {
            ...artefact.content,
            projectName: ProjectService.getActiveProject()?.name || 'Project',
            // Ensure lists are present
            costs: Array.isArray(artefact.content?.costs) ? artefact.content.costs : [],
            milestones: Array.isArray(artefact.content?.milestones) ? artefact.content.milestones : [],
            impactedDomains: Array.isArray(artefact.content?.impactedDomains) ? artefact.content.impactedDomains : [],

            // Map Approval Fields
            approverName: artefact.approval?.approverName || '',
            approvalDate: artefact.approval?.date || '',
            signature: artefact.approval?.signature || ''
        }

        if (format === 'html') {
            try {
                const html = await DocumentGenerator.generateDocument(
                    content,
                    businessCaseSchema,
                    businessCaseTemplate,
                    'html',
                    'preview'
                )
                setPreviewHtml(html)
                setShowPreview(true)
            } catch (error) {
                console.error('Preview failed:', error)
            }
        } else {
            try {
                const projName = content.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
                await DocumentGenerator.generateDocument(
                    content,
                    businessCaseSchema,
                    businessCaseTemplate,
                    format,
                    `BusinessCase_${projName}_v${content['Version'] || '1.0'}`
                )
            } catch (error) {
                console.error('Export failed:', error)
            }
        }
    }

    // Helper: Map new IDs to Guidance Keys
    const getGuidanceId = (sectionId) => {
        return sectionId || 'context-justification'
    }

    return (
        <>
            <GovernedArtefactEditor
                projectId={projectId}
                artefact={artefact}
                onSave={onSave}
                onBack={onBack}
                title="Business Case"
                description="Justify the investment and detail the proposed solution."
                schema={businessCaseSchema}
                template={businessCaseTemplate}
                customApproval={true}
                hideGlobalSave={true}
                fullWidth={true}
                processLoadedContent={processLoadedContent}
                actions={
                    <>
                        <button
                            onClick={() => onOpenGuidance && onOpenGuidance('Initiating Phase', '5.3 Business Case', { tab: 'Artefacts', label: 'Business Case' })}
                            className="flex items-center text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg text-sm px-4 py-2 mr-2 border border-blue-200 transition-colors"
                        >
                            <BookOpenIcon className="h-5 w-5 mr-2" />
                            Open PM² Guidance
                        </button>
                        <button
                            onClick={() => setIsGuidanceOpen(!isGuidanceOpen)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors mr-2 shadow-sm ${isGuidanceOpen
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <LightBulbIcon className={`h-5 w-5 mr-2 ${isGuidanceOpen ? 'text-yellow-500' : 'text-gray-500'}`} />
                            {isGuidanceOpen ? 'Hide Guidance' : 'Show Guidance'}
                        </button>
                        <div className="relative inline-block text-left">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 mr-2 transition-colors shadow-sm"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                                Export
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download PDF</button>
                                        <button onClick={() => handleExport('docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download DOCX</button>
                                        <button onClick={() => handleExport('html')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Preview (HTML)</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                }
            >
                {({
                    data,
                    handleContentChange,
                    approval,
                    onUpdateApproval,
                    onToggleApproval,
                    isDirty,
                    saveStatus,
                    triggerSave
                }) => {

                    // Defensive check
                    if (!data) return <div className="p-8 text-center text-gray-500">Loading Business Case...</div>

                    // --- Render Helpers ---
                    const Header = ({ title }) => {
                        const isSaving = saveStatus === 'saving'
                        // Clean/Saved state is when not saving and not dirty
                        const showSaved = !isDirty && !isSaving

                        return (
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                                <button
                                    onClick={triggerSave}
                                    disabled={isSaving}
                                    className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 border ${isSaving
                                        ? 'border-gray-300 text-gray-500 bg-gray-100 cursor-wait'
                                        : showSaved
                                            ? 'border-gray-200 text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600'
                                            : 'border-transparent text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transform hover:scale-105'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : showSaved ? (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5 mr-1.5 text-emerald-500" />
                                            Saved
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )
                    }

                    const renderInput = (key, label, type = 'text', placeholder = '') => (
                        <div key={key} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <ArtefactInput
                                type={type}
                                value={data[key] || ''}
                                onChange={(e) => handleContentChange(key, e.target.value)}
                                placeholder={placeholder}
                            />
                        </div>
                    )

                    const renderTextArea = (key, label, placeholder = '') => (
                        <ArtefactField key={key} label={label}>
                            <RichTextEditor
                                value={data[key] || ''}
                                onChange={(html) => handleContentChange(key, html)}
                                placeholder={placeholder}
                            />
                        </ArtefactField>
                    )

                    // --- Handlers for Complex Data ---
                    const handleOpenAddCost = () => {
                        setEditingCostIndex(null)
                        setCurrentCostData(null)
                        setIsCostModalOpen(true)
                    }

                    const handleOpenEditCost = (index, item) => {
                        setEditingCostIndex(index)
                        setCurrentCostData(item)
                        setIsCostModalOpen(true)
                    }

                    const handleSaveCost = (costItem) => {
                        const list = Array.isArray(data.costs) ? data.costs : []
                        const newList = [...list]
                        if (editingCostIndex !== null) {
                            newList[editingCostIndex] = { ...newList[editingCostIndex], ...costItem }
                        } else {
                            newList.push({ ...costItem, id: Date.now().toString() })
                        }
                        handleContentChange('costs', newList)
                        setIsCostModalOpen(false)
                    }

                    const handleDeleteCost = (index) => {
                        const list = Array.isArray(data.costs) ? data.costs : []
                        handleContentChange('costs', list.filter((_, i) => i !== index))
                    }

                    const handleOpenAddMilestone = () => {
                        setEditingMilestoneIndex(null)
                        setCurrentMilestoneData(null)
                        setIsMilestoneModalOpen(true)
                    }

                    const handleOpenEditMilestone = (index, item) => {
                        setEditingMilestoneIndex(index)
                        setCurrentMilestoneData(item)
                        setIsMilestoneModalOpen(true)
                    }

                    const handleSaveMilestone = (mileItem) => {
                        const list = Array.isArray(data.milestones) ? data.milestones : []
                        const newList = [...list]
                        if (editingMilestoneIndex !== null) {
                            newList[editingMilestoneIndex] = { ...newList[editingMilestoneIndex], ...mileItem }
                        } else {
                            newList.push({ ...mileItem, id: Date.now().toString() })
                        }
                        handleContentChange('milestones', newList)
                        setIsMilestoneModalOpen(false)
                    }

                    const handleDeleteMilestone = (index) => {
                        const list = Array.isArray(data.milestones) ? data.milestones : []
                        handleContentChange('milestones', list.filter((_, i) => i !== index))
                    }

                    const handleDomainToggle = (domain) => {
                        const currentDomains = Array.isArray(data.impactedDomains) ? data.impactedDomains : []
                        if (currentDomains.includes(domain)) {
                            handleContentChange('impactedDomains', currentDomains.filter(d => d !== domain))
                        } else {
                            handleContentChange('impactedDomains', [...currentDomains, domain])
                        }
                    }

                    // --- Main Content Switch ---
                    let content = null

                    if (activeSectionId === 'context-justification') {
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="1.1 Justification & Current State" />
                                <div className="space-y-6">
                                    {renderTextArea('businessJustification', 'Business Justification', 'e.g. Market demand requires a 20% reduction in processing time...')}
                                    {renderTextArea('currentSituation', 'Current Situation (AS-IS)', 'e.g. Processes are currently manual and decentralized, leading to data fragmentation...')}
                                    {/* New Field as per Request */}
                                    {renderTextArea('impactDoingNothing', 'Impact of Doing Nothing', 'e.g. Continued loss of market share, risk of non-compliance fines, or operational bottlenecks...')}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'context-impact') {
                        const domains = [
                            'Human Resources', 'Finance', 'IT / Technical', 'Legal', 'Operations', 'Sales / Marketing'
                        ]
                        const currentDomains = Array.isArray(data.impactedDomains) ? data.impactedDomains : []
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="1.2 Impact Analysis" />
                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Impacted Domains</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {domains.map(d => (
                                                <label key={d} className="inline-flex items-center space-x-2 p-2 rounded bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                        checked={currentDomains.includes(d)}
                                                        onChange={() => handleDomainToggle(d)}
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium">{d}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {renderTextArea('impactOnBusiness', 'Impact on Processes & Strategy', 'e.g. Requires a complete re-engineering of the procurement workflow...')}
                                    {renderTextArea('impactOnStakeholders', 'Impact on Users & Staff', 'e.g. Staff will need retraining on the new platform; daily workload will decrease by 2 hours...')}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'context-strategy') {
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="1.3 Strategic Fit & Synergy" />
                                <div className="space-y-6">
                                    {renderTextArea('strategicFit', 'Strategic Alignment', 'e.g. Directly supports the \'Digital Transformation 2025\' pillar by automating core services...')}
                                    {renderTextArea('regulatoryDrivers', 'Regulatory Drivers', 'e.g. GDPR Compliance, Financial Reporting Standards (IFRS), ISO 27001...')}

                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6 space-y-4">
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Impact & Interdependencies</h4>
                                        {renderTextArea('dependencies', 'Dependencies', 'e.g. We cannot commence UAT until the \'Cloud Migration Project\' is complete...')}
                                        {renderTextArea('synergies', 'Synergies', 'e.g. This solution can utilize the same hosting infrastructure as Project X...')}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'alternatives') {
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="2. Analysis of Alternatives" />
                                <div className="mb-6 border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        {['A', 'B', 'Decision'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setAlternativesTab(tab)}
                                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${alternativesTab === tab
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                {tab === 'A' ? 'Do Nothing (Alt A)' : tab === 'B' ? 'Proposed Solution (Alt B)' : 'The Decision'}
                                            </button>
                                        ))}
                                    </nav>
                                </div>

                                <div className="space-y-6">
                                    {alternativesTab === 'A' && (
                                        <div className="space-y-6">
                                            {renderTextArea('AltA_Description', 'Description (Do Nothing)', 'e.g. The legacy system remains in place; manual workarounds continue with high risk of data error...')}
                                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <h5 className="font-semibold text-gray-800 mb-4 block">SWOT Analysis (Alt A)</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {renderTextArea('AltA_Strengths', 'Strengths', 'e.g. Zero implementation cost; staff are already familiar...')}
                                                    {renderTextArea('AltA_Weaknesses', 'Weaknesses', 'e.g. Increasing maintenance costs; security vulnerabilities...')}
                                                    {renderTextArea('AltA_Opportunities', 'Opportunities', 'e.g. Zero immediate cost allows budget reallocation to urgent maintenance...')}
                                                    {renderTextArea('AltA_Threats', 'Threats', 'e.g. Risk of total system failure increases by 15% year-over-year...')}
                                                </div>
                                            </div>
                                            {renderTextArea('AltA_Qualitative', 'Qualitative Analysis', 'e.g. High risk of failure due to end-of-life support expiring in 2026...')}
                                        </div>
                                    )}

                                    {alternativesTab === 'B' && (
                                        <div className="space-y-6">
                                            {renderTextArea('AltB_Description', 'Description (Proposed Solution)', 'e.g. Develop a custom cloud-native application integrated with the corporate User Directory...')}
                                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <h5 className="font-semibold text-gray-800 mb-4 block">SWOT Analysis (Alt B)</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {renderTextArea('AltB_Strengths', 'Strengths', 'e.g. Modern architecture supports 10k+ concurrent users; Native mobile support...')}
                                                    {renderTextArea('AltB_Weaknesses', 'Weaknesses', 'e.g. High initial upfront cost; 3-month learning curve for staff...')}
                                                    {renderTextArea('AltB_Opportunities', 'Opportunities', 'e.g. Enables future AI integration; Opens new revenue channel in Asia...')}
                                                    {renderTextArea('AltB_Threats', 'Threats', 'e.g. Dependency on 3rd party vendor API pricing...')}
                                                </div>
                                            </div>
                                            {renderTextArea('AltB_Qualitative', 'Viability Assessment', 'e.g. Highly viable; Vendor guarantees 99.9% SLA and migration support...')}
                                        </div>
                                    )}

                                    {alternativesTab === 'Decision' && (
                                        <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
                                            {renderInput('Chosen_Alternative', 'Chosen Alternative', 'text', 'e.g. Alternative B')}
                                            {renderTextArea('Chosen_Rationale', 'Rationale for Selection', 'e.g. Option B offers the best balance of long-term flexibility vs. immediate implementation cost...')}
                                            {renderTextArea('Chosen_Summary', 'Preference Summary', 'e.g. Key stakeholders unanimously prefer Option B due to the superior mobile experience...')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'solution') {
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="3. Proposed Solution" />
                                <div className="space-y-6">
                                    {renderTextArea('Solution Overview', 'Solution Overview', 'e.g. A centralized Project Management Dashboard that consolidates data from Finance and HR systems...')}
                                    {renderTextArea('High-level Scope', 'High-Level Scope', 'e.g. IN SCOPE: Core Modules, Reporting, User Training. OUT OF SCOPE: Mobile App (Phase 2), Legacy Data Migration...')}
                                    {renderTextArea('Key Deliverables', 'Key Deliverables', 'e.g. 1. Working Software v1.0, 2. User Manuals, 3. Admin Training Session, 4. Final Security Audit Report...')}
                                    {renderTextArea('Expected Benefits', 'Expected Benefits', 'e.g. 30% reduction in weekly reporting time; Real-time visibility of budget spend; Improved compliance audit scores...')}

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                                        <div className="relative flex justify-center"><span className="px-2 bg-gray-50 text-sm text-gray-500 font-medium">Success Measures</span></div>
                                    </div>

                                    {renderTextArea('Critical Success Criteria', 'Critical Success Criteria', 'e.g. System adoption by 80% of Project Managers within the first 3 months...')}
                                    {renderTextArea('General Success Criteria', 'General Success Criteria', 'e.g. Positive user feedback score > 4.5/5; Zero critical bugs at Go-Live...')}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'costs') {
                        // Cost Matrix Calculation
                        const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
                        const categories = ['Solution Development', 'Maintenance', 'Infrastructure', 'Training', 'Change Management', 'Support', 'Other']
                        const costRows = Array.isArray(data?.costs) ? data.costs : []
                        const matrix = {}

                        // Initialize Matrix
                        categories.forEach(cat => {
                            matrix[cat] = { total: 0 }
                            years.forEach(y => matrix[cat][y] = 0)
                        })

                        // Populate
                        costRows.forEach(item => {
                            if (!item || !item.category) return
                            const amt = parseFloat(item.amount) || 0
                            if (matrix[item.category] && matrix[item.category][item.year] !== undefined) {
                                matrix[item.category][item.year] += amt
                                matrix[item.category].total += amt
                            }
                        })

                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="4. Cost & Benefits" />
                                <div className="space-y-8">

                                    {/* Cost Engine */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                                    <ChartBarIcon className="h-5 w-5 mr-2 text-gray-500" />
                                                    Projected Costs Matrix
                                                </h3>
                                                <p className="text-xs text-gray-500 font-medium">Auto-calculated 5-Year Projection</p>
                                            </div>
                                            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Category</th>
                                                        {years.map(y => <th key={y} className="px-2 py-2 text-right font-semibold text-gray-600">{y}</th>)}
                                                        <th className="px-3 py-2 text-right font-bold text-gray-800">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {categories.map(cat => (
                                                        <tr key={cat}>
                                                            <td className="px-3 py-2 font-medium text-gray-900">{cat}</td>
                                                            {years.map(y => (
                                                                <td key={y} className="px-2 py-2 text-right text-gray-600">
                                                                    {matrix[cat][y] > 0 ? (matrix[cat][y]).toLocaleString(undefined, { minimumFractionDigits: 0 }) : '-'}
                                                                </td>
                                                            ))}
                                                            <td className="px-3 py-2 text-right font-bold text-gray-900">
                                                                {matrix[cat].total > 0 ? (matrix[cat].total).toLocaleString(undefined, { minimumFractionDigits: 0 }) : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                                        <td className="px-3 py-2 text-gray-900">GRAND TOTAL</td>
                                                        {years.map(y => {
                                                            const yTotal = categories.reduce((sum, cat) => sum + matrix[cat][y], 0)
                                                            return <td key={y} className="px-2 py-2 text-right text-gray-900">{yTotal > 0 ? yTotal.toLocaleString() : '-'}</td>
                                                        })}
                                                        <td className="px-3 py-2 text-right text-gray-900">
                                                            {categories.reduce((sum, cat) => sum + matrix[cat].total, 0).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Cost List Builder */}
                                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="block text-lg font-medium text-gray-900 flex items-center">
                                                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                                                    Cost Breakdown Items
                                                </label>
                                                <button type="button" onClick={handleOpenAddCost} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                                    <PlusIcon className="h-4 w-4 mr-1.5" /> Add Item
                                                </button>
                                            </div>
                                            {costRows.length === 0 ? <p className="text-gray-500 text-sm italic">No cost items added.</p> : (
                                                <div className="space-y-3">
                                                    {costRows.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded hover:bg-gray-50">
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="font-bold text-gray-800 text-sm">{item.category}</span>
                                                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item.year}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600">{item.description}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="font-mono font-bold text-gray-900">{parseFloat(item.amount).toLocaleString()}</span>
                                                                <div className="flex space-x-1">
                                                                    <button onClick={() => handleOpenEditCost(idx, item)} className="p-1 text-gray-400 hover:text-blue-600"><PencilSquareIcon className="h-4 w-4" /></button>
                                                                    <button onClick={() => handleDeleteCost(idx)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {renderTextArea('Benefit Summary', 'Benefit Summary', 'e.g. Projected savings of €1.2M over 5 years due to automation efficiencies; Reduction of FTE effort by 20%...')}
                                    {renderTextArea('Justification (Optional)', 'Financial Justification (ROI/NPV)', 'e.g. ROI expected within 18 months; Net Present Value (NPV) positive by Year 2. Internal Rate of Return (IRR) estimated at 12%.')}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'roadmap') {
                        // Milestones
                        const milestoneRows = Array.isArray(data?.milestones) ?
                            [...data.milestones].sort((a, b) => {
                                const dA = new Date(a.targetDeliveryDate || '9999-12-31')
                                const dB = new Date(b.targetDeliveryDate || '9999-12-31')
                                return dA - dB
                            })
                            : []

                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="5. Roadmap & Milestones" />
                                <div className="space-y-8">
                                    {/* Milestone List Builder */}
                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="block text-lg font-medium text-gray-900">Milestones</label>
                                            <button type="button" onClick={handleOpenAddMilestone} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                                <PlusIcon className="h-5 w-5 mr-1.5" /> Add Milestone
                                            </button>
                                        </div>

                                        {milestoneRows.length === 0 ? (
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
                                                        {milestoneRows.map((item, idx) => (
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
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'governance') {
                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="6. Governance" />
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8 space-y-6">
                                    <h4 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Key Core Roles</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Project Owner (PO)</h5>
                                            <div className="space-y-3">
                                                {renderInput('PO_Name', 'Name', 'text', 'e.g. Dr. Maria Gonzalez')}
                                                {renderInput('PO_Title', 'Title', 'text', 'e.g. Head of Digital Transformation')}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Solution Provider (SP)</h5>
                                            <div className="space-y-3">
                                                {renderInput('SP_Name', 'Name', 'text', 'e.g. John Doe (IT Services)')}
                                                {renderInput('SP_Title', 'Title', 'text', 'e.g. Senior Solution Architect')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-900">Approving Authority</h4>
                                        <p className="text-sm text-gray-500">Formal sign-off for the Business Case.</p>
                                    </div>
                                    <ArtefactApprovalSection
                                        approvalState={approval}
                                        onUpdate={onUpdateApproval}
                                        onToggleApproval={onToggleApproval}
                                        isOpen={true}
                                        onToggle={() => { }}
                                        isModified={false}
                                        approverPlaceholder="e.g. Steering Committee Chair"
                                        signaturePlaceholder="e.g. /s/ Digitally Signed by [Name]"
                                    />
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div className="flex h-full bg-gray-100">
                            {/* Left Sidebar Navigation */}
                            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                                <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                                    {SIDEBAR_STRUCTURE.map((group, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
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
                                                            <span className={`w-2 h-2 mr-3 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'}`}></span>
                                                            {item.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Content Area */}
                            <div className={`${isGuidanceOpen ? 'w-full lg:w-3/5' : 'w-full'} flex-1 overflow-y-auto p-6 transition-all duration-300`}>
                                {content}
                            </div>

                            {/* Right Guidance Panel */}
                            {isGuidanceOpen && (
                                <div className="w-80 lg:w-1/3 flex-shrink-0 bg-white border-l border-gray-200 overflow-hidden transition-all duration-300">
                                    <GuidancePanel
                                        sectionId={getGuidanceId(activeSectionId)}
                                        isOpen={true}
                                        onClose={() => setIsGuidanceOpen(false)}
                                    />
                                </div>
                            )}

                            {/* Modals */}
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

                        </div>
                    )
                }}
            </GovernedArtefactEditor >

            <DocumentPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Business Case Preview"
                htmlContent={previewHtml}
            />
        </>
    )
}

export default BusinessCase
