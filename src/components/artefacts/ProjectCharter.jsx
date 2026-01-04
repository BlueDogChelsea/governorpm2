import React, { useState, useEffect, useMemo } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon, PlusIcon, TrashIcon, CheckCircleIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea, ArtefactSelect } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectCharterSchema } from '../../data/schemas/ProjectCharterSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import projectCharterTemplate from '../../templates/ProjectCharterTemplate.json'
import { ProjectService } from '../../services/ProjectService'
import ArtefactApprovalSection from './ui/ArtefactApprovalSection'

// -- Risk Modal Component --
const RiskModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        description: '',
        likelihood: 'Medium',
        impact: 'Medium',
        riskLevel: 'Medium',
        status: 'Open'
    })

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                description: initialData.description || '',
                likelihood: initialData.likelihood || 'Medium',
                impact: initialData.impact || 'Medium',
                riskLevel: initialData.riskLevel || 'Medium',
                status: initialData.status || 'Open'
            } : {
                description: '',
                likelihood: 'Medium',
                impact: 'Medium',
                riskLevel: 'Medium',
                status: 'Open'
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
    const [formData, setFormData] = useState({ stakeholder: '', description: '', priority: 'Medium (Important)' })
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                stakeholder: initialData.stakeholder || '',
                description: initialData.description || '',
                priority: initialData.priority || 'Medium (Important)'
            } : { stakeholder: '', description: '', priority: 'Medium (Important)' })
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
                                    <option>High (Critical)</option><option>Medium (Important)</option><option>Low (Desirable)</option>
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

// Define the Sidebar Structure
const SIDEBAR_STRUCTURE = [
    {
        title: '1. Executive Summary',
        items: [
            { id: 'summary', name: 'Executive Summary', fields: ['executiveSummary', 'businessCaseConsiderations'] }
        ]
    },
    {
        title: '3. Project Description',
        items: [
            { id: 'scope', name: 'Scope', fields: ['scopeStatement', 'scopeIn', 'scopeOut'] },
            { id: 'success', name: 'Success Criteria', fields: ['successCriteria'] },
            { id: 'needs', name: 'Stakeholder Needs', fields: ['stakeholderNeeds'] },
            { id: 'deliverables', name: 'Deliverables & Specs', fields: ['deliverables', 'features', 'constraints', 'assumptions'] },
            { id: 'risks', name: 'Risks', fields: ['risks'] }
        ]
    },
    {
        title: '4. Cost & Timing',
        items: [
            { id: 'budget', name: 'Budget & Resources', fields: ['costSummary', 'costTable', 'resources'] },
            { id: 'milestones', name: 'Milestones', fields: ['milestones'] }
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
                    if (data) {
                        setMergedArtefact(prev => ({ ...prev, content: data }))
                    } else {
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
        const contentToSave = currentData || dataRef.current
        if (window.electronAPI && projectId) {
            await window.electronAPI.writeJSON(`projects/${projectId}/projectCharter.json`, contentToSave)
        }
        onSave({ ...mergedArtefact, content: contentToSave })
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
            >
                {({ data, handleContentChange, approval, onUpdateApproval, onToggleApproval }) => {
                    dataRef.current = data

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
                                                        return (
                                                            <td key={col.key} className="px-6 py-4 min-w-[200px]">
                                                                {col.type === 'richtext' ? <RichTextEditor value={row[col.key] || ''} onChange={(html) => updateRow(idx, col.key, html)} className="min-h-[100px]" /> :
                                                                    col.type === 'textarea' ? <ArtefactTextarea rows={3} value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="resize-y text-sm" /> :
                                                                        col.type === 'select' ? <ArtefactSelect value={row[col.key] || col.options?.[0] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className={`text-sm ${col.key === 'priority' ? `border ${getPriorityColor(row[col.key])} bg-opacity-20` : ''}`}>{col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</ArtefactSelect> :
                                                                            col.type === 'date' ? <ArtefactInput type="date" value={row[col.key] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="text-sm" /> :
                                                                                <ArtefactInput type="text" value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="text-sm" />}
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
                        const rows = Array.isArray(data.stakeholderNeeds) ? data.stakeholderNeeds : []
                        const getPriorityBadge = (p) => {
                            if (p?.includes('High')) return 'bg-red-100 text-red-800'
                            if (p?.includes('Medium')) return 'bg-yellow-100 text-yellow-800'
                            if (p?.includes('Low')) return 'bg-green-100 text-green-800'
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
                                <div className="max-w-4xl mx-auto pt-0">
                                    <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                                        <h2 className="text-2xl font-bold text-gray-900">Sign-Off & Approval</h2>
                                        <button
                                            onClick={() => handleInternalSave(data)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            Save Changes
                                        </button>
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
                            <div className="max-w-5xl mx-auto pb-20">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">{activeItem.name}</h2>
                                    <button
                                        onClick={() => handleInternalSave(data)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {activeItem.fields.map(fieldKey => {
                                        const fieldDef = fieldMap[fieldKey]
                                        if (!fieldDef) return null

                                        // CUSTOM RENDERERS
                                        if (fieldKey === 'risks') return renderRisksList(fieldDef)
                                        if (fieldKey === 'stakeholderNeeds') return renderNeedsList(fieldDef)
                                        if (fieldKey === 'deliverables') return renderDeliverablesList(fieldDef)

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
                        <div className="flex flex-1 h-full -mx-8 -my-8 relative bg-gray-50 bg-opacity-50">
                            {/* Left Sidebar */}
                            <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto h-[calc(100vh-160px)] sticky top-0">
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

                            {/* Main Content Area */}
                            <div className="flex-1 overflow-y-auto h-[calc(100vh-160px)] p-10 bg-gray-50/50">
                                {renderActiveContent()}
                            </div>

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
