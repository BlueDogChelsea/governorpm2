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
    TrashIcon
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

const BusinessCase = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // -- State --
    const [alternativesTab, setAlternativesTab] = useState('A') // A, B, Decision
    const [activeSectionId, setActiveSectionId] = useState('context')
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(true)
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
        return processed
    }

    const navigationItems = [
        { id: 'context', name: '1. Business Context' },
        { id: 'alternatives', name: '2. Alternatives' },
        { id: 'solution', name: '3. Proposed Solution' },
        { id: 'planning', name: '4. Cost & Planning' },
        { id: 'governance', name: '5. Governance' }
    ]



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
                            onClick={() => onOpenGuidance && onOpenGuidance('Initiating Phase', 'Business Case', { tab: 'Artefacts', label: 'Business Case' })}
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
                        <button
                            onClick={async () => {
                                if (!artefact) return
                                try {
                                    const html = await DocumentGenerator.generateForPreview(
                                        'business-case',
                                        'Business Case',
                                        artefact.content || {}, // Pass content safely
                                        ProjectService.getActiveProject()?.name || 'Project'
                                    )
                                    setPreviewHtml(html)
                                    setShowPreview(true)
                                } catch (error) {
                                    console.error('Preview failed:', error)
                                }
                            }}
                            className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 mr-2 transition-colors shadow-sm"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Preview / Export
                        </button>
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
                    const Header = ({ title }) => (
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <button
                                onClick={triggerSave}
                                disabled={saveStatus === 'saving'}
                                className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${saveStatus === 'saved'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent'
                                    }`}
                            >
                                {saveStatus === 'saving' ? (
                                    <>Saving...</>
                                ) : saveStatus === 'saved' ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                                        Saved!
                                    </>
                                ) : (
                                    <>Save Changes</>
                                )}
                            </button>
                        </div>
                    )

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

                    if (activeSectionId === 'context') {
                        const domains = [
                            'Human Resources', 'Finance', 'IT / Technical', 'Legal', 'Operations', 'Sales / Marketing'
                        ]
                        const currentDomains = Array.isArray(data.impactedDomains) ? data.impactedDomains : []

                        content = (
                            <div className="w-full pb-20 px-2">
                                <Header title="1. Business Context" />
                                <div className="space-y-6">
                                    {renderTextArea('businessJustification', 'Business Justification', 'Why is this project needed now?')}
                                    {renderTextArea('currentSituation', 'Current Situation (AS-IS)', 'Describe existing processes...')}

                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
                                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Impact Analysis</h4>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Domains</label>
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
                                        <div className="space-y-4">
                                            {renderTextArea('impactOnBusiness', 'Impact on Processes & Strategy', 'How does doing nothing affect the business strategy?')}
                                            {renderTextArea('impactOnStakeholders', 'Impact on Users & Staff', 'How are people affected?')}
                                        </div>
                                    </div>

                                    {renderTextArea('strategicFit', 'Strategic Fit', 'Alignment with organizational goals...')}
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
                                            {renderTextArea('AltA_Description', 'Description (Do Nothing)', 'Describe the baseline scenario...')}
                                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <h5 className="font-semibold text-gray-800 mb-4 block">SWOT Analysis (Alt A)</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {renderTextArea('AltA_Strengths', 'Strengths')}
                                                    {renderTextArea('AltA_Weaknesses', 'Weaknesses')}
                                                    {renderTextArea('AltA_Opportunities', 'Opportunities')}
                                                    {renderTextArea('AltA_Threats', 'Threats')}
                                                </div>
                                            </div>
                                            {renderTextArea('AltA_Qualitative', 'Qualitative Analysis', 'Risks and issues of doing nothing...')}
                                        </div>
                                    )}

                                    {alternativesTab === 'B' && (
                                        <div className="space-y-6">
                                            {renderTextArea('AltB_Description', 'Description (Proposed Solution)', 'Describe the proposed solution...')}
                                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <h5 className="font-semibold text-gray-800 mb-4 block">SWOT Analysis (Alt B)</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {renderTextArea('AltB_Strengths', 'Strengths')}
                                                    {renderTextArea('AltB_Weaknesses', 'Weaknesses')}
                                                    {renderTextArea('AltB_Opportunities', 'Opportunities')}
                                                    {renderTextArea('AltB_Threats', 'Threats')}
                                                </div>
                                            </div>
                                            {renderTextArea('AltB_Qualitative', 'Viability Assessment', 'Qualitative assessment...')}
                                        </div>
                                    )}

                                    {alternativesTab === 'Decision' && (
                                        <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-100">
                                            {renderInput('Chosen_Alternative', 'Chosen Alternative', 'text', 'e.g. Alternative B')}
                                            {renderTextArea('Chosen_Rationale', 'Rationale for Selection', 'Why was this alternative selected?')}
                                            {renderTextArea('Chosen_Summary', 'Preference Summary', 'Summary of why this is preferred...')}
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
                                    {renderTextArea('Solution Overview', 'Solution Overview', 'High-level description...')}
                                    {renderTextArea('High-level Scope', 'High-Level Scope', 'What is included...')}
                                    {renderTextArea('Key Deliverables', 'Key Deliverables', 'Tangible outputs...')}
                                    {renderTextArea('Expected Benefits', 'Expected Benefits', 'Tangible and intangible benefits...')}

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                                        <div className="relative flex justify-center"><span className="px-2 bg-gray-50 text-sm text-gray-500 font-medium">Success Measures</span></div>
                                    </div>

                                    {renderTextArea('Critical Success Criteria', 'Critical Success Criteria', 'Essential conditions for success...')}
                                    {renderTextArea('General Success Criteria', 'General Success Criteria', 'Additional measures...')}
                                </div>
                            </div>
                        )
                    }

                    if (activeSectionId === 'planning') {
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
                                <Header title="4. Cost & Planning" />
                                <div className="space-y-8">

                                    {/* Cost Engine */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-gray-900">Projected Costs Matrix</h3>
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
                                                <label className="block text-lg font-medium text-gray-900">Cost Breakdown Items</label>
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

                                    {renderTextArea('Benefit Summary', 'Benefit Summary', 'Quantified benefits...')}
                                    {renderTextArea('Justification (Optional)', 'Financial Justification (Optional)', 'ROI, NPV...')}

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                                        <div className="relative flex justify-center"><span className="px-2 bg-gray-50 text-sm text-gray-500 font-medium">Roadmap</span></div>
                                    </div>

                                    {/* Milestone List Builder */}
                                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-lg font-medium text-gray-900">Major Milestones</label>
                                            <button type="button" onClick={handleOpenAddMilestone} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Milestone
                                            </button>
                                        </div>

                                        {milestoneRows.length === 0 ? <p className="text-gray-500 text-sm italic">No milestones defined.</p> : (
                                            <div className="space-y-3">
                                                {milestoneRows.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            <div className="flex-shrink-0 w-32">
                                                                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded block text-center">
                                                                    {item.targetDeliveryDate || 'No Date'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-gray-900">{item.id}</p>
                                                                <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-1 ml-4">
                                                            <button onClick={() => handleOpenEditMilestone(idx, item)} className="p-1 text-gray-400 hover:text-blue-600"><PencilSquareIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDeleteMilestone(idx)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                ))}
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
                                <Header title="5. Governance" />
                                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8 space-y-6">
                                    <h4 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Key Core Roles</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Project Owner (PO)</h5>
                                            <div className="space-y-3">
                                                {renderInput('PO_Name', 'Name')}
                                                {renderInput('PO_Title', 'Title')}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                            <h5 className="font-bold text-gray-800 text-sm mb-3">Solution Provider (SP)</h5>
                                            <div className="space-y-3">
                                                {renderInput('SP_Name', 'Name')}
                                                {renderInput('SP_Title', 'Title')}
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
                                    />
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div className="flex h-full bg-gray-100">
                            {/* Left Sidebar Navigation */}
                            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                    <div className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3">Sections</div>
                                    {navigationItems.map(item => {
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
                                </nav>
                                <div className="px-4 py-4 border-t border-gray-100">
                                    <ArtefactSaveButton
                                        onSave={triggerSave}
                                        status={saveStatus}
                                        isDirty={isDirty}
                                        label="Changes"
                                    />
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className={`${isGuidanceOpen ? 'w-full lg:w-3/5' : 'w-full'} flex-1 overflow-y-auto p-6 transition-all duration-300`}>
                                {content}
                            </div>

                            {/* Right Guidance Panel */}
                            {isGuidanceOpen && (
                                <div className="w-80 lg:w-1/3 flex-shrink-0 bg-white border-l border-gray-200 overflow-hidden transition-all duration-300">
                                    <GuidancePanel
                                        sectionId={activeSectionId}
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
            </GovernedArtefactEditor>

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
