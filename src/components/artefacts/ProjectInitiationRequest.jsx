import React, { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    ArrowDownTrayIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowLeftIcon,
    LightBulbIcon,
    XMarkIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { RiskModal, ConstraintModal, AssumptionModal } from './ui/GovernanceModals'

import { ProjectService } from '../../services/ProjectService'
import DocumentGenerator from '../../services/DocumentGenerator'
import { projectInitiationRequestSchema } from '../../data/schemas/ProjectInitiationRequestSchema'
import pirTemplate from '../../templates/PIRTemplate.json'
import { PIR_GUIDANCE } from '../../data/pirGuidance'

// -- Guidance Panel --
const GuidancePanel = ({ sectionId, isOpen, onClose }) => {
    if (!isOpen) return null
    const guidance = PIR_GUIDANCE[sectionId] || {
        title: 'Guidance',
        content: 'Select a section to view PM² guidance.',
        pm2Ref: null
    }

    return (
        <div className="w-full h-full bg-white overflow-y-auto border-l border-gray-200">
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
                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">{guidance.title}</h4>
                    <div className="text-sm text-gray-700 leading-relaxed font-medium">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guidance.content}</ReactMarkdown>
                    </div>
                    {guidance.pm2Ref && (
                        <div className="mt-4 pt-3 border-t border-yellow-200 text-xs text-yellow-800 font-semibold">
                            Ref: {guidance.pm2Ref}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// -- Main Component --
const ProjectInitiationRequest = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // 1. Navigation Structure
    const PIR_SIDEBAR_STRUCTURE = [
        {
            title: 'PROJECT INFORMATION',
            items: [
                { id: 'identity', name: '1.1 Project Identity' },
                { id: 'classification', name: '1.2 Classification & Planning' }
            ]
        },
        {
            title: 'CONTEXT & STRATEGY',
            items: [
                { id: 'context', name: '2.1 Business Need' },
                { id: 'strategy', name: '2.2 Legal & Strategy' },
                { id: 'value', name: '2.3 Outcomes & Value' }
            ]
        },
        {
            title: 'PROJECT FACTORS',
            items: [
                { id: 'risks', name: '3.1 Initial Risks' },
                { id: 'constraints', name: '3.2 Constraints' },
                { id: 'assumptions', name: '3.3 Assumptions' }
            ]
        }
    ]

    // 2. State
    const [activeSectionId, setActiveSectionId] = useState('identity')
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [saveState, setSaveState] = useState('idle')
    const [showPreview, setShowPreview] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    // Data State
    const [data, setData] = useState({
        identity: { projectTitle: '', initiator: '', projectOwner: '', approvingAuthority: '', businessManager: '', solutionProvider: '' },
        meta: { dateOfRequest: '', targetDeliveryDate: '', deliveryType: 'In-house' },
        strategy: { businessNeed: '', legalBasis: '', outcomes: '', successCriteria: '', impact: '' },
        factors: { risks: [], constraints: [], assumptions: [] }
    })
    const [stakeholderData, setStakeholderData] = useState(null)

    // Modal States
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
    const [editingRiskIndex, setEditingRiskIndex] = useState(null)
    const [currentRiskData, setCurrentRiskData] = useState(null)

    const [isConstraintModalOpen, setIsConstraintModalOpen] = useState(false)
    const [editingConstraintIndex, setEditingConstraintIndex] = useState(null)
    const [currentConstraintData, setCurrentConstraintData] = useState(null)

    const [isAssumptionModalOpen, setIsAssumptionModalOpen] = useState(false)
    const [editingAssumptionIndex, setEditingAssumptionIndex] = useState(null)
    const [currentAssumptionData, setCurrentAssumptionData] = useState(null)

    // 3. Load Data
    useEffect(() => {
        const load = async () => {
            if (projectId && window.electronAPI) {
                try {
                    // Load Project Settings for Title
                    const settings = await window.electronAPI.readJSON(`projects/${projectId}/settings.json`)

                    // Load PIR Data
                    const loaded = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/project-initiation-request.json`)

                    // Load Stakeholder Data (Contextual)
                    let stakeholders = null
                    try {
                        stakeholders = await window.electronAPI.readJSON(`projects/${projectId}/initialStakeholders.json`)
                        setStakeholderData(stakeholders)
                    } catch (e) {
                        console.log("No stakeholder data found")
                    }

                    let newData = { ...data }
                    if (loaded && loaded.identity) newData = { ...newData, ...loaded }

                    // Apply Global Project Title
                    if (settings && settings.name) {
                        newData.identity.projectTitle = settings.name
                    }

                    // Pre-populate Roles from Stakeholders if available and not set (or always?) 
                    // Requirement: "Automatically pre-populate... Display... as read-only contextual roles"
                    if (stakeholders) {
                        if (stakeholders.projectOwner?.name) newData.identity.projectOwner = stakeholders.projectOwner.name
                        if (stakeholders.businessManager?.name) newData.identity.businessManager = stakeholders.businessManager.name
                        if (stakeholders.solutionProvider?.name) newData.identity.solutionProvider = stakeholders.solutionProvider.name
                    }

                    setData(newData)
                } catch (e) {
                    console.log("No existing PIR data")
                }
            }
        }
        load()
    }, [projectId])

    // 4. Save Logic
    const handleSaveInternal = async () => {
        if (saveState === 'saving') return
        setSaveState('saving')
        try {
            if (window.electronAPI && projectId) {
                await window.electronAPI.ensureFolder(`projects/${projectId}/artefacts`)
                await window.electronAPI.writeJSON(`projects/${projectId}/artefacts/project-initiation-request.json`, data)
            }
            if (onSave) onSave({ ...artefact, status: 'In Progress' })
            setTimeout(() => {
                setSaveState('success')
                setTimeout(() => setSaveState('idle'), 2000)
            }, 800)
        } catch (e) {
            console.error("Save failed", e)
            setSaveState('idle')
        }
    }

    const SaveButton = () => {
        let btnClass = "flex items-center px-4 py-2 text-sm font-medium rounded shadow-sm transition-all "
        let content = <><ArrowDownTrayIcon className="h-4 w-4 mr-2" />Save</>

        switch (saveState) {
            case 'saving':
                btnClass += "bg-gray-400 text-white cursor-not-allowed"
                content = <><ArrowDownTrayIcon className="h-4 w-4 mr-2" />Saving...</>
                break;
            case 'success':
                btnClass += "bg-white text-green-600 border border-green-500"
                content = <><CheckCircleIcon className="h-4 w-4 mr-2" />Saved!</>
                break;
            default: // idle
                btnClass += "bg-green-600 text-white hover:bg-green-700"
                content = <><ArrowDownTrayIcon className="h-4 w-4 mr-2" />Save</>
                break;
        }

        return (
            <button
                onClick={handleSaveInternal}
                disabled={saveState === 'saving'}
                className={btnClass}
            >
                {content}
            </button>
        )
    }

    // -- Modal Handlers --
    // Risk
    const handleRiskSave = (riskData) => {
        const newRisks = [...data.factors.risks]
        if (editingRiskIndex !== null) {
            newRisks[editingRiskIndex] = riskData
        } else {
            newRisks.push(riskData)
        }
        setData(d => ({ ...d, factors: { ...d.factors, risks: newRisks } }))
        setIsRiskModalOpen(false)
        setEditingRiskIndex(null)
    }
    const handleDeleteRisk = (idx) => {
        const newRisks = data.factors.risks.filter((_, i) => i !== idx)
        setData(d => ({ ...d, factors: { ...d.factors, risks: newRisks } }))
    }

    // Constraint
    const handleConstraintSave = (itemData) => {
        const newItems = [...data.factors.constraints]
        if (editingConstraintIndex !== null) {
            newItems[editingConstraintIndex] = itemData
        } else {
            newItems.push(itemData)
        }
        setData(d => ({ ...d, factors: { ...d.factors, constraints: newItems } }))
        setIsConstraintModalOpen(false)
        setEditingConstraintIndex(null)
    }
    const handleDeleteConstraint = (idx) => {
        const newItems = data.factors.constraints.filter((_, i) => i !== idx)
        setData(d => ({ ...d, factors: { ...d.factors, constraints: newItems } }))
    }

    // Assumption
    const handleAssumptionSave = (itemData) => {
        const newItems = [...data.factors.assumptions]
        if (editingAssumptionIndex !== null) {
            newItems[editingAssumptionIndex] = itemData
        } else {
            newItems.push(itemData)
        }
        setData(d => ({ ...d, factors: { ...d.factors, assumptions: newItems } }))
        setIsAssumptionModalOpen(false)
        setEditingAssumptionIndex(null)
    }
    const handleDeleteAssumption = (idx) => {
        const newItems = data.factors.assumptions.filter((_, i) => i !== idx)
        setData(d => ({ ...d, factors: { ...d.factors, assumptions: newItems } }))
    }


    // 5. Export & Preview
    const prepareExportData = () => {
        const listToHtml = (items) => items?.map(i => `<li><strong>${i.description}</strong> ${i.impact ? `(Impact: ${i.impact})` : ''}</li>`).join('') || ''
        return {
            'Project Name': data.identity.projectTitle,
            'Date': data.meta.dateOfRequest,
            'Project Owner': data.identity.projectOwner,
            'Initiator': data.identity.initiator,
            'problem': data.strategy.businessNeed,
            'alignment': data.strategy.legalBasis,
            'benefits': data.strategy.outcomes,
            'risks': `<ul>${listToHtml(data.factors.risks)}</ul>`,
            'constraints': `<ul>${listToHtml(data.factors.constraints)}</ul>`,
            'assumptions': `<ul>${listToHtml(data.factors.assumptions)}</ul>`
        }
    }

    const handleExport = (format) => {
        setShowExportMenu(false)
        const content = prepareExportData()
        const sections = projectInitiationRequestSchema
        const projName = ProjectService.getActiveProject()?.name || data.identity.projectTitle || 'Project'
        DocumentGenerator.generateDocument({ ...content, projectName: projName }, sections, pirTemplate, format, `PIR_${projName}`)
    }

    const handlePreview = () => {
        setShowExportMenu(false)
        const content = prepareExportData()
        const html = `
            <div class="p-8 prose max-w-none">
                <h1 class="text-2xl font-bold mb-4">${data.identity.projectTitle || 'Project'} - Project Initiation Request</h1>
                <p><strong>Initiator:</strong> ${data.identity.initiator || '-'}</p>
                <p><strong>Date:</strong> ${data.meta.dateOfRequest || '-'}</p>
                <p><strong>Owner:</strong> ${data.identity.projectOwner || '-'}</p>
                <hr class="my-4"/>
                <h3>Business Need</h3>
                <div>${content.problem || 'Not defined'}</div>
                <h3>Legal Basis</h3>
                <div>${content.alignment || 'Not defined'}</div>
                <h3>Outcomes</h3>
                <div>${content.benefits || 'Not defined'}</div>
                <h3>Risks</h3>
                ${content.risks}
                <h3>Constraints</h3>
                ${content.constraints}
                <h3>Assumptions</h3>
                ${content.assumptions}
            </div>
        `
        setPreviewHtml(html)
        setShowPreview(true)
    }

    const renderActiveContent = () => {
        let activeItemTitle = ''
        PIR_SIDEBAR_STRUCTURE.forEach(g => g.items.forEach(i => { if (i.id === activeSectionId) activeItemTitle = i.name }))

        const CardHeader = () => (
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">{activeItemTitle}</h2>
                <SaveButton />
            </div>
        )

        switch (activeSectionId) {
            case 'identity': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                            <input
                                className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-500 cursor-not-allowed border"
                                value={data.identity.projectTitle}
                                readOnly={true}
                                placeholder="Project Title set in Settings"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Initiator <span className="text-red-500">*</span></label>
                            <input
                                className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                value={data.identity.initiator}
                                onChange={e => setData(d => ({ ...d, identity: { ...d.identity, initiator: e.target.value } }))}
                                placeholder="Name of person initiating the request"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Owner (PO)</label>
                            <input
                                className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-600 cursor-not-allowed border"
                                value={data.identity.projectOwner}
                                readOnly={true}
                                placeholder="Defined in Stakeholder Identification"
                            />
                            {!data.identity.projectOwner && <p className="text-xs text-amber-600 mt-1">Not yet defined in Stakeholder Identification</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Approving Authority</label>
                            <input
                                className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                                value={data.identity.approvingAuthority}
                                onChange={e => setData(d => ({ ...d, identity: { ...d.identity, approvingAuthority: e.target.value } }))}
                                placeholder="Who signs off?"
                            />
                        </div>
                        {/* Read-Only Contextual Roles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Business Manager (Context)</label>
                            <input
                                className="block w-full rounded-md border border-gray-100 shadow-sm p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={data.identity.businessManager || ''}
                                readOnly={true}
                                placeholder="Defined in Stakeholder Identification"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Solution Provider (Context)</label>
                            <input
                                className="block w-full rounded-md border border-gray-100 shadow-sm p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={data.identity.solutionProvider || ''}
                                readOnly={true}
                                placeholder="Defined in Stakeholder Identification"
                            />
                        </div>
                    </div>
                </div>
            )
            case 'classification': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Request</label>
                            <input type="date" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={data.meta.dateOfRequest} onChange={e => setData(d => ({ ...d, meta: { ...d.meta, dateOfRequest: e.target.value } }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Delivery Date</label>
                            <input type="date" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={data.meta.targetDeliveryDate} onChange={e => setData(d => ({ ...d, meta: { ...d.meta, targetDeliveryDate: e.target.value } }))} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                            <select className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={data.meta.deliveryType} onChange={e => setData(d => ({ ...d, meta: { ...d.meta, deliveryType: e.target.value } }))}>
                                <option>In-house Development</option>
                                <option>Outsourced / Vendor</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>
            )
            // Sections 2.1-2.3 (Context) unchanged in logic, just re-rendering
            case 'context': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="space-y-6">
                        <label className="block text-sm font-medium text-gray-700">Business Need / Problem Statement</label>
                        <RichTextEditor
                            value={data.strategy.businessNeed}
                            onChange={v => setData(d => ({ ...d, strategy: { ...d.strategy, businessNeed: v } }))}
                            placeholder="Describe the current problem and why this project is needed..."
                        />
                    </div>
                </div>
            )
            case 'strategy': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Legal Basis</label>
                            <textarea className="w-full rounded-md border-gray-300 p-2 border h-24"
                                value={data.strategy.legalBasis} onChange={e => setData(d => ({ ...d, strategy: { ...d.strategy, legalBasis: e.target.value } }))} />
                        </div>
                    </div>
                </div>
            )
            case 'value': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Outcomes</label>
                            <RichTextEditor value={data.strategy.outcomes} onChange={v => setData(d => ({ ...d, strategy: { ...d.strategy, outcomes: v } }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Success Criteria</label>
                            <div className="text-xs text-gray-500 mb-2">These will populate the Project Charter.</div>
                            <RichTextEditor value={data.strategy.successCriteria} onChange={v => setData(d => ({ ...d, strategy: { ...d.strategy, successCriteria: v } }))} />
                        </div>
                    </div>
                </div>
            )
            // Sections 3.1-3.3 (Factors) - NEW IMPLEMENTATION
            case 'risks': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center">
                            <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <p className="text-sm text-blue-800">Identify high-level risks. These can be promoted to the Risk Log later.</p>
                        </div>
                        <button onClick={() => { setEditingRiskIndex(null); setCurrentRiskData(null); setIsRiskModalOpen(true) }} className="mt-3 sm:mt-0 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            + Add Risk
                        </button>
                    </div>
                    <div className="space-y-3">
                        {data.factors.risks.map((risk, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{risk.description || 'No description'}</h4>
                                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded">Impact: {risk.impact}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded">Likelihood: {risk.likelihood}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingRiskIndex(idx); setCurrentRiskData(risk); setIsRiskModalOpen(true) }} className="text-gray-400 hover:text-blue-500 p-1">
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteRisk(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.factors.risks.length === 0 && (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                No risks identified yet.
                            </div>
                        )}
                    </div>
                </div>
            )
            case 'constraints': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="flex justify-end mb-6">
                        <button onClick={() => { setEditingConstraintIndex(null); setCurrentConstraintData(null); setIsConstraintModalOpen(true) }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            + Add Constraint
                        </button>
                    </div>
                    <div className="space-y-3">
                        {data.factors.constraints.map((c, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{c.description}</h4>
                                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.type}</span>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingConstraintIndex(idx); setCurrentConstraintData(c); setIsConstraintModalOpen(true) }} className="text-gray-400 hover:text-blue-500 p-1">
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteConstraint(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
            case 'assumptions': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="flex justify-end mb-6">
                        <button onClick={() => { setEditingAssumptionIndex(null); setCurrentAssumptionData(null); setIsAssumptionModalOpen(true) }} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                            + Add Assumption
                        </button>
                    </div>
                    <div className="space-y-3">
                        {data.factors.assumptions.map((a, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{a.description}</h4>
                                        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Impact if false: {a.impact}</span>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingAssumptionIndex(idx); setCurrentAssumptionData(a); setIsAssumptionModalOpen(true) }} className="text-gray-400 hover:text-blue-500 p-1">
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteAssumption(idx)} className="text-gray-400 hover:text-red-500 p-1">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
            default: return <div>Select a section</div>
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Global Header Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 h-16">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-600"><ArrowLeftIcon className="h-5 w-5" /></button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Project Initiation Request</h1>
                        <p className="text-xs text-gray-500">PM² Governance Artefact</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />Import data from earlier steps
                    </button>
                    <button onClick={() => onOpenGuidance('Initiating Phase', '5.2 Project Initiation Request', { tab: 'Artefacts', label: 'Project Initiation Request' })} className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <BookOpenIcon className="h-4 w-4 mr-2" />Open PM² Guidance
                    </button>
                    <button onClick={() => setIsGuidanceOpen(!isGuidanceOpen)} className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <LightBulbIcon className="h-4 w-4 mr-2" />{isGuidanceOpen ? 'Hide Guidance' : 'Show Guidance'}
                    </button>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                            Export
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                                <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">PDF</button>
                                <button onClick={() => handleExport('docx')} className="block w-full text-left px-4 py-2 hover:bg-gray-50">DOCX</button>
                                <button onClick={handlePreview} className="block w-full text-left px-4 py-2 hover:bg-gray-50">HTML Preview</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Three-Pane Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Nav (20%) */}
                <nav className="w-1/5 bg-white border-r border-gray-200 h-full overflow-y-auto p-4">
                    {PIR_SIDEBAR_STRUCTURE.map((group, i) => (
                        <div key={i} className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.title}</h3>
                            <div className="space-y-1">
                                {group.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSectionId(item.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeSectionId === item.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className={`w-2 h-2 mr-3 rounded-full ${activeSectionId === item.id ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Center Content (Flexible) */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {renderActiveContent()}
                </main>

                {/* Right Guidance (30% Collapsible) */}
                {isGuidanceOpen && (
                    <aside className="w-[30%] bg-white border-l border-gray-200 h-full overflow-y-auto transition-all shadow-lg">
                        <GuidancePanel sectionId={activeSectionId} isOpen={true} onClose={() => setIsGuidanceOpen(false)} />
                    </aside>
                )}
            </div>

            <DocumentPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="PIR Preview"
                htmlContent={previewHtml}
            />

            {/* Modals */}
            <RiskModal
                isOpen={isRiskModalOpen}
                onClose={() => setIsRiskModalOpen(false)}
                onSave={handleRiskSave}
                initialData={currentRiskData}
            />
            <ConstraintModal
                isOpen={isConstraintModalOpen}
                onClose={() => setIsConstraintModalOpen(false)}
                onSave={handleConstraintSave}
                initialData={currentConstraintData}
            />
            <AssumptionModal
                isOpen={isAssumptionModalOpen}
                onClose={() => setIsAssumptionModalOpen(false)}
                onSave={handleAssumptionSave}
                initialData={currentAssumptionData}
            />
        </div>
    )
}

export default ProjectInitiationRequest
