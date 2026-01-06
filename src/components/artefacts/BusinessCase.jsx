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
                                    <label className="block text-sm font-medium text-gray-700">Category (PM²)</label>
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
                                <label className="block text-sm font-medium text-gray-700">Milestone ID / Name</label>
                                <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" value={formData.id} onChange={(e) => handleChange('id', e.target.value)} placeholder="e.g. M1 - Prototype Approval" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
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

// -- Sidebar Structure --
const SIDEBAR_STRUCTURE = [
    {
        title: '1. Business Context',
        id: 'context',
        description: 'Justification & Strategy'
    },
    {
        title: '2. Analysis of Alternatives',
        id: 'alternatives',
        description: 'Options & Decision'
    },
    {
        title: '3. Proposed Solution',
        id: 'solution',
        description: 'Scope & Outcomes'
    },
    {
        title: '4. Cost & Planning',
        id: 'planning',
        description: 'Roadmap & Financials'
    },
    {
        title: '5. Governance',
        id: 'governance',
        description: 'Approval & Sign-Off'
    }
]

const BusinessCase = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // -- State --
    const [activeSectionId, setActiveSectionId] = useState('context')
    const [alternativesTab, setAlternativesTab] = useState('A')
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(true)

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    // Cost Modal State
    const [isCostModalOpen, setIsCostModalOpen] = useState(false)
    const [editingCostIndex, setEditingCostIndex] = useState(null)
    const [currentCostData, setCurrentCostData] = useState(null)

    // Milestone Modal State
    const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
    const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null)
    const [currentMilestoneData, setCurrentMilestoneData] = useState(null)

    // Data Ref for Export
    const dataRef = useRef({})

    // -- Export Logic --
    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = dataRef.current

        if (format === 'html') {
            const html = await DocumentGenerator.generateDocument(
                { ...content, projectName: ProjectService.getActiveProject()?.name },
                businessCaseSchema,
                businessCaseTemplate,
                format,
                'preview'
            )
            setPreviewHtml(html)
            setShowPreview(true)
        } else {
            const projName = ProjectService.getActiveProject()?.name || 'Project'
            DocumentGenerator.generateDocument(
                { ...content, projectName: projName },
                businessCaseSchema,
                businessCaseTemplate,
                format,
                `Business_Case_${projName}_v${content['Version'] || '1.0'}`
            )
        }
    }

    // -- Helpers --
    const processLoadedContent = (content) => {
        const { 'Project Name': _, ...rest } = content || {}
        return rest
    }

    // -- Renderers --
    const renderContent = (data, handleContentChange, saveStatus, isDirty, triggerSave, approval, onUpdateApproval, onToggleApproval) => {

        // Cost Handlers
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

        // Milestone Handlers
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

        // Common Field Renderers
        const renderInput = (key, label, type = 'text', placeholder = '') => (
            <ArtefactField key={key} label={label}>
                <ArtefactInput
                    type={type}
                    value={data[key] || ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    placeholder={placeholder}
                />
            </ArtefactField>
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

        const renderDatePicker = (key, label) => (
            <ArtefactField key={key} label={label}>
                <input
                    type="date"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                    value={data[key] || ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                />
            </ArtefactField>
        )

        // Save Button Component for Header
        const SaveBtn = () => (
            <div className="flex items-center">
                <ArtefactSaveButton
                    onSave={triggerSave}
                    status={saveStatus}
                    isDirty={isDirty}
                    label="Changes"
                    variant="green" // Local Green Button
                />
            </div>
        )

        const Header = ({ title }) => (
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <SaveBtn />
            </div>
        )

        // --- SECTION LOGIC ---

        if (activeSectionId === 'context') {
            const domains = ['Human Resources', 'Finance', 'IT / Technical', 'Legal', 'Operations']
            const currentDomains = Array.isArray(data.impactedDomains) ? data.impactedDomains : []

            const handleDomainToggle = (domain) => {
                if (currentDomains.includes(domain)) {
                    handleContentChange('impactedDomains', currentDomains.filter(d => d !== domain))
                } else {
                    handleContentChange('impactedDomains', [...currentDomains, domain])
                }
            }

            return (
                <div className="w-full pb-20 px-2">
                    <Header title="1. Business Context" />
                    <div className="space-y-6">
                        {renderTextArea('Business Justification', 'Business Justification', 'Explain the reasoning behind the project...')}
                        {renderTextArea('Current Situation / Problem', 'Current Situation', 'Describe the current AS-IS state...')}

                        {/* Split Impact Section */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
                            <h4 className="font-bold text-gray-900 mb-4 text-lg">Impact Analysis</h4>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Impacted Domains</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                            <div className="relative flex justify-center"><span className="px-2 bg-gray-50 text-sm text-gray-500 font-medium">Strategic Fit</span></div>
                        </div>

                        {renderTextArea('Strategic Alignment', 'Strategic Alignment', 'Alignment with organizational goals...')}
                        {renderTextArea('Regulatory / Compliance Drivers', 'Regulatory Drivers', 'Legal or regulatory requirements...')}
                    </div>
                </div>
            )
        }

        if (activeSectionId === 'alternatives') {
            return (
                <div className="w-full pb-20 px-2">
                    <Header title="2. Analysis of Alternatives" />

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {[
                                { id: 'A', name: 'Do Nothing (Alt A)' },
                                { id: 'B', name: 'Proposed Solution (Alt B)' },
                                { id: 'Decision', name: 'The Decision' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setAlternativesTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${alternativesTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.name}
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
                                {renderTextArea('AltA_Qualitative', 'Viability Assessment', 'Qualitative assessment...')}
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
            return (
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
            const costRows = Array.isArray(data.costs) ? data.costs : []
            const matrix = {}

            // Initialize Matrix
            categories.forEach(cat => {
                matrix[cat] = { total: 0 }
                years.forEach(y => matrix[cat][y] = 0)
            })

            // Populate
            costRows.forEach(item => {
                const amt = parseFloat(item.amount) || 0
                if (matrix[item.category] && matrix[item.category][item.year] !== undefined) {
                    matrix[item.category][item.year] += amt
                    matrix[item.category].total += amt
                }
            })

            // Milestones
            const milestoneRows = Array.isArray(data.milestones) ?
                [...data.milestones].sort((a, b) => new Date(a.targetDeliveryDate || '9999-12-31') - new Date(b.targetDeliveryDate || '9999-12-31'))
                : []


            return (
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
                                                        {matrix[cat][y] > 0 ? matrix[cat][y].toLocaleString(undefined, { minimumFractionDigits: 0 }) : '-'}
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

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                            <div className="relative flex justify-center"><span className="px-2 bg-gray-50 text-sm text-gray-500 font-medium">Impact</span></div>
                        </div>

                        {renderTextArea('Dependencies', 'Dependencies', 'Dependencies on other projects...')}
                        {renderTextArea('Synergies', 'Synergies', 'Potential synergies...')}
                    </div>
                </div>
            )
        }

        if (activeSectionId === 'governance') {
            return (
                <div className="w-full pb-20 px-2">
                    <Header title="5. Governance" />

                    {/* Formal Roles */}
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
                            isOpen={true} // Always open in this view
                            onToggle={() => { }} // No toggle needed
                            isModified={false} // Handled globally
                        />
                    </div>
                </div>
            )
        }

        return <div className="p-10 text-center text-gray-500">Select a section</div>
    }

    return (
        <>
            <GovernedArtefactEditor
                projectId={projectId}
                artefact={artefact}
                onSave={onSave}
                onBack={onBack}
                title="Business Case"
                description="Justify the project investment and strategy"
                actions={
                    <>
                        <button
                            onClick={() => onOpenGuidance('Initiating Phase', '5.3 Business Case', { tab: 'Artefacts', label: 'Business Case' })}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center mr-2"
                        >
                            <BookOpenIcon className="h-4 w-4 mr-2" />
                            Open PM² Guidance
                        </button>
                        <div className="relative inline-block text-left">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm flex items-center"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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
                customApproval={true} // We handle approval in Section 5
                hideGlobalSave={true} // We provide local save button
                fullWidth={true} // Full screen layout
                processLoadedContent={processLoadedContent}
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
                    dataRef.current = data

                    return (
                        <div className="flex flex-row w-full h-[calc(100vh-160px)] gap-4 bg-gray-50 bg-opacity-50">
                            {/* Left Sidebar - 20% */}
                            <div className="w-1/5 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                                <nav className="p-4 space-y-1">
                                    {SIDEBAR_STRUCTURE.map((item) => {
                                        const isActive = activeSectionId === item.id
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSectionId(item.id)}
                                                className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 mb-1 ${isActive
                                                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 mr-3 rounded-full transition-colors flex-shrink-0 ${isActive ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>
                                                <div className="text-left">
                                                    <span className="block">{item.title}</span>
                                                    <span className={`block text-xs font-normal mt-0.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>{item.description}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>

                            {/* Main Content Area - 50% or Flex-1 */}
                            <div className={`${isGuidanceOpen ? 'w-1/2' : 'flex-1'} flex-shrink-0 overflow-y-auto p-6 bg-gray-50/50 transition-all duration-300`}>
                                {renderContent(data, handleContentChange, saveStatus, isDirty, triggerSave, approval, onUpdateApproval, onToggleApproval)}
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

                            {/* Float Toggle Button if closed */}
                            {!isGuidanceOpen && (
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                                    <button
                                        onClick={() => setIsGuidanceOpen(true)}
                                        className="bg-white border-l border-t border-b border-gray-200 p-2 rounded-l-md shadow-md hover:bg-gray-50 text-blue-600"
                                        title="Open Guidance"
                                    >
                                        <LightBulbIcon className="h-5 w-5" />
                                    </button>
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
