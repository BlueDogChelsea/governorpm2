import React, { useState, useEffect, useMemo, useRef } from 'react'
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
    XMarkIcon
} from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'

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

// -- Helpers --
const StakeholderSelector = ({ label, value, onChange, placeholder }) => {
    const OPTIONS = [
        { id: '1', name: 'Dr. Maria Gonzalez', role: 'Head of Digital' },
        { id: '2', name: 'John Smith', role: 'IT Director' },
        { id: '3', name: 'Steering Committee', role: 'Board' },
    ]
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder={placeholder}
                value={value?.name || value || ''}
                onChange={(e) => onChange(e.target.value)}
                list={`list-${label.replace(/\s/g, '')}`}
            />
            <datalist id={`list-${label.replace(/\s/g, '')}`}>
                {OPTIONS.map(opt => <option key={opt.id} value={opt.name}>{opt.role}</option>)}
            </datalist>
        </div>
    )
}

const ListBuilder = ({ label, items = [], onItemAdd, onItemRemove, placeholder }) => {
    const [newItem, setNewItem] = useState('')
    const handleAdd = () => { if (newItem.trim()) { onItemAdd(newItem); setNewItem('') } }
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <span className="text-xs text-gray-400">{items.length} items</span>
            </div>
            <div className="space-y-2 mb-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start bg-gray-50 p-3 rounded border border-gray-200">
                        <span className="flex-1 text-sm text-gray-700">{typeof item === 'string' ? item : item.description}</span>
                        <button type="button" onClick={() => onItemRemove(idx)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
                    placeholder={placeholder}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button type="button" onClick={handleAdd} className="px-3 py-2 bg-blue-50 text-blue-700 rounded border border-blue-100 hover:bg-blue-100"><PlusIcon className="h-4 w-4 mr-1 inline" />Add</button>
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
    const [showExportMenu, setShowExportMenu] = useState(false) // Fix missing state
    const [saveState, setSaveState] = useState('idle')
    const [showPreview, setShowPreview] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [data, setData] = useState({
        identity: { projectTitle: '', initiator: '', projectOwner: '', approvingAuthority: '' },
        meta: { dateOfRequest: '', targetDeliveryDate: '', methodology: 'Standard', deliveryType: 'In-house' },
        strategy: { businessNeed: '', legalBasis: '', outcomes: '', successCriteria: '', impact: '' },
        factors: { risks: [], constraints: [], assumptions: [] }
    })

    // 3. Load Data
    useEffect(() => {
        const load = async () => {
            if (projectId && window.electronAPI) {
                try {
                    // Load Project Settings for Title
                    const settings = await window.electronAPI.readJSON(`projects/${projectId}/settings.json`)

                    const loaded = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/project-initiation-request.json`)
                    let newData = { ...data }
                    if (loaded && loaded.identity) newData = { ...newData, ...loaded }

                    // Override Project Title from Global Context
                    if (settings && settings.name) {
                        newData.identity.projectTitle = settings.name
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

    // 5. Renderers
    const prepareExportData = () => {
        const listToHtml = (items) => items?.map(i => `<li>${typeof i === 'string' ? i : i.description}</li>`).join('') || ''
        return {
            'Project Name': data.identity.projectTitle,
            'Date': data.meta.dateOfRequest,
            'Project Owner': data.identity.projectOwner,
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
        // Simple HTML generation for preview
        const html = `
            <div class="p-8 prose max-w-none">
                <h1 class="text-2xl font-bold mb-4">${data.identity.projectTitle} - Project Initiation Request</h1>
                <p><strong>Date:</strong> ${data.meta.dateOfRequest}</p>
                <p><strong>Owner:</strong> ${data.identity.projectOwner}</p>
                <hr class="my-4"/>
                <h3>Business Need</h3>
                <div>${content.problem}</div>
                <h3>Legal Basis</h3>
                <div>${content.alignment}</div>
                <h3>Outcomes</h3>
                <div>${content.benefits}</div>
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
        // Find Active Item for Title
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
                                className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 text-gray-500 cursor-not-allowed border focus:ring-blue-500 focus:border-blue-500"
                                value={data.identity.projectTitle}
                                readOnly={true}
                                placeholder="Project Title set in Global Context"
                            />
                        </div>
                        <StakeholderSelector
                            label="Project Owner (PO)"
                            placeholder="Search for PO..."
                            value={data.identity.projectOwner}
                            onChange={v => setData(d => ({ ...d, identity: { ...d.identity, projectOwner: v } }))}
                        />
                        <StakeholderSelector
                            label="Approving Authority"
                            placeholder="Who signs off?"
                            value={data.identity.approvingAuthority}
                            onChange={v => setData(d => ({ ...d, identity: { ...d.identity, approvingAuthority: v } }))}
                        />
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
                            <select className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                value={data.meta.methodology} onChange={e => setData(d => ({ ...d, meta: { ...d.meta, methodology: e.target.value } }))}>
                                <option>Standard PM²</option>
                                <option>PM² Agile</option>
                                <option>Lite / Quick</option>
                            </select>
                        </div>
                        <div>
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
            case 'risks': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                        <p className="text-sm text-red-800">Note: Risks added here will be available to import into the full Risk Log.</p>
                    </div>
                    <ListBuilder
                        label="Initial Risks"
                        placeholder="Add a risk description..."
                        items={data.factors.risks}
                        onItemAdd={txt => setData(d => ({ ...d, factors: { ...d.factors, risks: [...d.factors.risks, { description: txt }] } }))}
                        onItemRemove={idx => setData(d => ({ ...d, factors: { ...d.factors, risks: d.factors.risks.filter((_, i) => i !== idx) } }))}
                    />
                </div>
            )
            case 'constraints': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <ListBuilder
                        label="Constraints"
                        placeholder="Add a constraint..."
                        items={data.factors.constraints}
                        onItemAdd={txt => setData(d => ({ ...d, factors: { ...d.factors, constraints: [...d.factors.constraints, { description: txt }] } }))}
                        onItemRemove={idx => setData(d => ({ ...d, factors: { ...d.factors, constraints: d.factors.constraints.filter((_, i) => i !== idx) } }))}
                    />
                </div>
            )
            case 'assumptions': return (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
                    <CardHeader />
                    <ListBuilder
                        label="Assumptions"
                        placeholder="Add an assumption..."
                        items={data.factors.assumptions}
                        onItemAdd={txt => setData(d => ({ ...d, factors: { ...d.factors, assumptions: [...d.factors.assumptions, { description: txt }] } }))}
                        onItemRemove={idx => setData(d => ({ ...d, factors: { ...d.factors, assumptions: d.factors.assumptions.filter((_, i) => i !== idx) } }))}
                    />
                </div>
            )
            default: return <div>Select a section</div>
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* 6. Global Header Toolbar (Matches Charter) */}
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

            {/* 7. Three-Pane Layout */}
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
        </div >
    )
}

export default ProjectInitiationRequest
