import React, { useState, useEffect, useRef } from 'react'
import {
    ArrowDownTrayIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { ProjectService } from '../../services/ProjectService'
import DocumentGenerator from '../../services/DocumentGenerator'
import { projectInitiationRequestSchema } from '../../data/schemas/ProjectInitiationRequestSchema'
import pirTemplate from '../../templates/PIRTemplate.json'

// -- Styled Components & UI Helpers --

const GuidanceToggle = ({ text }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="relative inline-block ml-2">
            <InformationCircleIcon
                className="h-4 w-4 text-blue-400 cursor-pointer hover:text-blue-600"
                onClick={() => setIsOpen(!isOpen)}
            />
            {isOpen && (
                <div className="absolute z-10 w-64 p-3 mt-1 -ml-2 text-xs text-slate-600 bg-white border border-blue-100 rounded-lg shadow-lg z-50">
                    {text}
                    <div className="absolute top-0 left-2 w-2 h-2 -mt-1 bg-white border-t border-l border-blue-100 transform rotate-45"></div>
                </div>
            )}
        </div>
    )
}

const StakeholderSelector = ({ label, value, onChange, placeholder }) => {
    const OPTIONS = [
        { id: '1', name: 'Dr. Maria Gonzalez', role: 'Head of Digital' },
        { id: '2', name: 'John Smith', role: 'IT Director' },
        { id: '3', name: 'Sarah Jones', role: 'Compliance Officer' },
        { id: '4', name: 'Steering Committee', role: 'Board' },
    ]

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder={placeholder}
                    value={value?.name || value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    list={`list-${label.replace(/\s/g, '')}`}
                />
                <datalist id={`list-${label.replace(/\s/g, '')}`}>
                    {OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.name}>{opt.role}</option>
                    ))}
                </datalist>
            </div>
        </div>
    )
}

const ListBuilder = ({ label, items = [], onItemAdd, onItemRemove, placeholder }) => {
    const [newItem, setNewItem] = useState('')

    const handleAdd = () => {
        if (!newItem.trim()) return
        onItemAdd(newItem)
        setNewItem('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <span className="text-xs text-gray-400">{items.length} items</span>
            </div>

            <div className="space-y-2 mb-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-start group bg-gray-50 p-2 rounded border border-gray-200">
                        <span className="flex-1 text-sm text-gray-700">{typeof item === 'string' ? item : item.description}</span>
                        <button
                            onClick={() => onItemRemove(idx)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder={placeholder}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none"
                >
                    <PlusIcon className="h-4 w-4 mr-1" /> Add
                </button>
            </div>
        </div>
    )
}

// -- Main Component --

const ProjectInitiationRequest = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // -- State --
    const [activeSection, setActiveSection] = useState('identity')
    const [saveState, setSaveState] = useState('idle') // idle, saving, success
    const [showExportMenu, setShowExportMenu] = useState(false)

    // PM2 Data Model for PIR
    const [data, setData] = useState({
        identity: {
            projectTitle: '',
            initiator: '',
            projectOwner: '',
            solutionProvider: '',
            approvingAuthority: '',
            referenceNumber: ''
        },
        strategy: {
            businessNeed: '',
            legalBasis: '',
            outcomes: '',
            impact: ''
        },
        factors: {
            risks: [],
            constraints: [],
            assumptions: []
        },
        meta: {
            status: 'Draft',
            version: '1.0'
        }
    })

    const contentRef = useRef(null)
    const sectionRefs = useRef({})

    // -- Effects --
    useEffect(() => {
        // Load Data
        const load = async () => {
            if (projectId && window.electronAPI) {
                try {
                    // Try specialized file first
                    const loaded = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/project-initiation-request.json`)
                    if (loaded && loaded.identity) {
                        setData(prev => ({ ...prev, ...loaded }))
                    } else {
                        // Fallback: Try monolithic artefacts.json content if migrating
                        // Or just use defaults
                        if (artefact && artefact.content) {
                            // TODO: Add migration logic from flat content to nested if needed
                            // For now assume new structure or empty
                        }
                    }
                } catch (e) {
                    console.log("No existing PIR, starting fresh")
                }
            }
        }
        load()
    }, [projectId, artefact])

    // -- Actions --
    const handleSaveInternal = async () => {
        if (saveState === 'saving') return
        setSaveState('saving')

        try {
            if (window.electronAPI && projectId) {
                await window.electronAPI.ensureFolder(`projects/${projectId}/artefacts`)
                await window.electronAPI.writeJSON(`projects/${projectId}/artefacts/project-initiation-request.json`, data)
            }

            // Sync back to parent/monolithic for status tracking (optional but good)
            if (onSave) {
                // We pass a simplified version or just the status update to the parent
                onSave({ ...artefact, status: 'In Progress' })
            }

            // Artificial delay for UX "feel"
            setTimeout(() => {
                setSaveState('success')
                setTimeout(() => setSaveState('idle'), 2000)
            }, 800)
        } catch (e) {
            console.error("Save failed", e)
            setSaveState('idle')
        }
    }

    const scrollToSection = (id) => {
        setActiveSection(id)
        if (sectionRefs.current[id]) {
            sectionRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const prepareExportData = () => {
        // Map Nested State -> Flat Schema Keys
        const listToHtml = (items) => {
            if (!items || items.length === 0) return ''
            return `<ul>${items.map(i => `<li>${typeof i === 'string' ? i : i.description}</li>`).join('')}</ul>`
        }

        return {
            'Project Name': data.identity.projectTitle,
            'Date': new Date().toISOString().split('T')[0],
            'Version': data.meta.version,
            'Project Owner': data.identity.projectOwner,
            'Project Manager': data.identity.initiator, // Mapping Initiator to Manager roughly
            'problem': data.strategy.businessNeed,
            'alignment': data.strategy.legalBasis,
            'benefits': data.strategy.outcomes,
            'risks': listToHtml(data.factors.risks),
            'constraints': listToHtml(data.factors.constraints),
            'assumptions': listToHtml(data.factors.assumptions),
            // Default others
            'background': '',
            'objectives': '',
            'In Scope': '',
            'Out of Scope': '',
            'stakeholders': '',
            'approach': '',
            'dependencies': ''
        }
    }

    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = prepareExportData()
        const sections = projectInitiationRequestSchema

        if (format === 'html') {
            // Preview Logic
            // Not implemented fully in this View version yet, rely on download for now or implement modal
            console.log("HTML Preview request")
        } else {
            const projName = ProjectService.getActiveProject()?.name || 'Project'
            DocumentGenerator.generateDocument(
                { ...content, projectName: projName },
                sections,
                pirTemplate,
                format,
                `PIR_${projName}_v${data.meta.version}`
            )
        }
    }

    // -- Sub-Renderers --

    const renderNav = () => {
        const sections = [
            { id: 'identity', label: '1. Project Identity', sub: ['1.1 Basics', '1.2 Roles'] },
            { id: 'strategy', label: '2. Strategic Fit', sub: ['2.1 Need', '2.2 Outcomes'] },
            { id: 'factors', label: '3. Project Factors', sub: ['3.1 Risks', '3.2 Constraints'] },
        ]

        return (
            <nav className="w-72 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
                <div className="px-4 py-4 mb-2">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Outline</h2>
                </div>
                {sections.map(section => (
                    <div key={section.id} className="mb-2">
                        <button
                            onClick={() => scrollToSection(section.id)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${activeSection === section.id
                                ? 'bg-blue-50 text-blue-700 border-blue-600'
                                : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            {section.label}
                        </button>
                        {activeSection === section.id && (
                            <div className="bg-blue-50/50">
                                {section.sub.map(s => (
                                    <div key={s} className="pl-8 py-2 text-xs text-blue-600/80 cursor-default">{s}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        )
    }

    const renderHeader = () => (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
            <div className="flex items-center">
                <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Project Initiation Request</h1>
                    <p className="text-xs text-gray-500">PM² Governance Artefact</p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={() => { }} // Import logic placeholder
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Import Data
                </button>
                <button
                    onClick={() => onOpenGuidance('Initiating Phase', '5.2 Project Initiation Request', { tab: 'Artefacts', label: 'Project Initiation Request' })}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    Open PM² Guidance
                </button>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Export
                    </button>
                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="py-1">
                                <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download PDF</button>
                                <button onClick={() => handleExport('docx')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download DOCX</button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSaveInternal}
                    disabled={saveState === 'saving'}
                    className={`flex items-center px-4 py-1.5 text-sm font-medium text-white rounded shadow-sm transition-all ${saveState === 'success'
                        ? 'bg-white text-green-600 border border-green-500' // Success State
                        : saveState === 'saving'
                            ? 'bg-gray-400 cursor-not-allowed' // Saving State
                            : 'bg-emerald-600 hover:bg-emerald-700' // Idle State
                        }`}
                >
                    {saveState === 'success' ? (
                        <>
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            {saveState === 'saving' ? 'Saving...' : 'Save Changes'}
                        </>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {renderHeader()}

            <div className="flex flex-1 overflow-hidden">
                {renderNav()}

                <main
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-8 space-y-8"
                >
                    {/* SECTION 1: IDENTITY */}
                    <div id="identity" ref={el => sectionRefs.current['identity'] = el} className="scroll-mt-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">1. PROJECT INFORMATION</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="e.g. Digital Transformation 2026"
                                        value={data.identity.projectTitle}
                                        onChange={e => setData(d => ({ ...d, identity: { ...d.identity, projectTitle: e.target.value } }))}
                                    />
                                </div>

                                <StakeholderSelector
                                    label="Initiator / Requestor"
                                    placeholder="Who is asking for this?"
                                    value={data.identity.initiator}
                                    onChange={val => setData(d => ({ ...d, identity: { ...d.identity, initiator: val } }))}
                                />

                                <StakeholderSelector
                                    label="Project Owner"
                                    placeholder="Who will own the outcome?"
                                    value={data.identity.projectOwner}
                                    onChange={val => setData(d => ({ ...d, identity: { ...d.identity, projectOwner: val } }))}
                                />

                                <StakeholderSelector
                                    label="Solution Provider"
                                    placeholder="Who will build/deliver it?"
                                    value={data.identity.solutionProvider}
                                    onChange={val => setData(d => ({ ...d, identity: { ...d.identity, solutionProvider: val } }))}
                                />

                                <StakeholderSelector
                                    label="Approving Authority"
                                    placeholder="Who signs the check?"
                                    value={data.identity.approvingAuthority}
                                    onChange={val => setData(d => ({ ...d, identity: { ...d.identity, approvingAuthority: val } }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: STRATEGY */}
                    <div id="strategy" ref={el => sectionRefs.current['strategy'] = el} className="scroll-mt-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">2. STRATEGIC FIT</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        2.1 Business Need / Problem
                                        <GuidanceToggle text="Describe the business problem or opportunity. Why are we doing this now?" />
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="The current system is obsolete..."
                                        value={data.strategy.businessNeed}
                                        onChange={e => setData(d => ({ ...d, strategy: { ...d.strategy, businessNeed: e.target.value } }))}
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        2.2 Legal Basis
                                        <GuidanceToggle text="Is this required by law, regulation, or policy? Cite the specific mandate." />
                                    </label>
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="e.g. GDPR Compliance Directive 2016/679"
                                        value={data.strategy.legalBasis}
                                        onChange={e => setData(d => ({ ...d, strategy: { ...d.strategy, legalBasis: e.target.value } }))}
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                        2.3 Expected Outcomes
                                        <GuidanceToggle text="What will change? Be specific about the end state." />
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="1. Automated reporting reduction by 50%..."
                                        value={data.strategy.outcomes}
                                        onChange={e => setData(d => ({ ...d, strategy: { ...d.strategy, outcomes: e.target.value } }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: FACTORS */}
                    <div id="factors" ref={el => sectionRefs.current['factors'] = el} className="scroll-mt-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">3. PROJECT FACTORS</h3>

                            <ListBuilder
                                label="3.1 Initial Risks"
                                placeholder="Add a risk (e.g. Budget cuts may delay start)..."
                                items={data.factors.risks}
                                onItemAdd={(txt) => setData(d => ({ ...d, factors: { ...d.factors, risks: [...d.factors.risks, { description: txt }] } }))}
                                onItemRemove={(idx) => setData(d => ({ ...d, factors: { ...d.factors, risks: d.factors.risks.filter((_, i) => i !== idx) } }))}
                            />

                            <ListBuilder
                                label="3.2 Constraints"
                                placeholder="Add a constraint (e.g. Must complete by Dec 31)..."
                                items={data.factors.constraints}
                                onItemAdd={(txt) => setData(d => ({ ...d, factors: { ...d.factors, constraints: [...d.factors.constraints, { description: txt }] } }))}
                                onItemRemove={(idx) => setData(d => ({ ...d, factors: { ...d.factors, constraints: d.factors.constraints.filter((_, i) => i !== idx) } }))}
                            />

                            <ListBuilder
                                label="3.3 Assumptions"
                                placeholder="Add an assumption (e.g. Staff will be trained)..."
                                items={data.factors.assumptions}
                                onItemAdd={(txt) => setData(d => ({ ...d, factors: { ...d.factors, assumptions: [...d.factors.assumptions, { description: txt }] } }))}
                                onItemRemove={(idx) => setData(d => ({ ...d, factors: { ...d.factors, assumptions: d.factors.assumptions.filter((_, i) => i !== idx) } }))}
                            />
                        </div>
                    </div>

                    {/* Footer Spacer */}
                    <div className="h-24"></div>
                </main>
            </div>
        </div>
    )
}

export default ProjectInitiationRequest
