import React, { useState, useEffect } from 'react'
import {
    ArrowLeftIcon,
    BookOpenIcon,
    ArrowDownTrayIcon,
    LightBulbIcon,
    XMarkIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline'

import StepProjectOwner from './StepProjectOwner'
import StepBusinessManager from './StepBusinessManager'
import StepSolutionProvider from './StepSolutionProvider'
import StepAdditionalStakeholders from './StepAdditionalStakeholders'

import DocumentPreviewModal from '../../artefacts/ui/DocumentPreviewModal'
import { ArtefactField, ArtefactInput } from '../../artefacts/ui/ArtefactFields'
import RichTextEditor from '../../artefacts/ui/RichTextEditor'

// -- Guidance Data (Local) --
const STAKEHOLDER_GUIDANCE = {
    projectOwner: {
        title: 'Project Owner',
        content: 'The Project Owner is the main beneficiary of the project’s outputs and is accountable for the project’s success from a business perspective. The Project Owner represents the organisation that funds the project and ensures that the project remains aligned with strategic objectives.\n\nThe Project Owner is accountable for the Business Case, has decision authority over scope, budget, and major changes, and is ultimately responsible for accepting the project’s deliverables.'
    },
    businessManager: {
        title: 'Business Manager',
        content: 'The Business Manager is responsible for defining and structuring the business justification of the project and acts as the bridge between business needs and project delivery.\n\nThe Business Manager creates the Business Case, ensures stakeholder needs and expected benefits are correctly captured, and supports the Project Owner in benefits definition and validation.'
    },
    solutionProvider: {
        title: 'Solution Provider',
        content: 'The Solution Provider is the organisational unit responsible for delivering the project’s outputs. The Solution Provider represents the supplier side of the project and is accountable for producing the agreed deliverables in line with the Project Charter and Business Case.\n\nThe Solution Provider assigns the Project Manager and Project Core Team and is responsible for ensuring the technical and delivery capability required to implement the solution.'
    },
    additional: {
        title: 'Additional Stakeholders',
        content: 'Additional Stakeholders are individuals or groups that can influence the project or are affected by its outcomes but do not hold a formal PM² governance role.\n\nThese may include users, regulators, suppliers, or impacted organisational units. Their needs and expectations should be identified and considered, and their influence and interest actively managed throughout the project.'
    }
}

// -- Guidance Panel --
const GuidancePanel = ({ sectionId, isOpen, onClose }) => {
    if (!isOpen) return null
    const guidance = STAKEHOLDER_GUIDANCE[sectionId] || {
        title: 'Guidance',
        content: 'Select a section to view PM² guidance.'
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
                        {guidance.content}
                    </div>
                </div>
            </div>
        </div>
    )
}

// -- Stakeholder Modal --
const StakeholderModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ id: '', name: '', role: '', organisation: '', expectations: '' })

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                id: initialData.id || Date.now(),
                name: initialData.name || '',
                role: initialData.role || '',
                organisation: initialData.organisation || '',
                expectations: initialData.expectations || ''
            } : { id: Date.now(), name: '', role: '', organisation: '', expectations: '' })
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{initialData ? 'Edit Stakeholder' : 'Add New Stakeholder'}</h3>
                            <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <ArtefactField label="Name">
                                <ArtefactInput value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Stakeholder Name" autoFocus />
                            </ArtefactField>
                            <ArtefactField label="Role / Function">
                                <ArtefactInput value={formData.role} onChange={(e) => handleChange('role', e.target.value)} placeholder="e.g. End User Representative" />
                            </ArtefactField>
                            <ArtefactField label="Organisation">
                                <ArtefactInput value={formData.organisation} onChange={(e) => handleChange('organisation', e.target.value)} placeholder="e.g. Sales Dept" />
                            </ArtefactField>
                            <ArtefactField label="Expectations">
                                <RichTextEditor value={formData.expectations} onChange={(val) => handleChange('expectations', val)} placeholder="What do they expect?" />
                            </ArtefactField>
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

const StakeholderWizard = ({ projectId, onBack, onOpenGuidance }) => {
    // 1. Navigation Structure
    const SIDEBAR_STRUCTURE = [
        { id: 'projectOwner', name: 'Project Owner' },
        { id: 'businessManager', name: 'Business Manager' },
        { id: 'solutionProvider', name: 'Solution Provider' },
        { id: 'additional', name: 'Additional Stakeholders' }
    ]

    // 2. State
    const [activeSectionId, setActiveSectionId] = useState('projectOwner')
    const [isGuidanceOpen, setIsGuidanceOpen] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStakeholderId, setEditingStakeholderId] = useState(null)
    const [currentStakeholderData, setCurrentStakeholderData] = useState(null)

    // Data State
    const [data, setData] = useState({
        projectOwner: { name: '', organisation: '', expectations: '' },
        businessManager: { name: '', organisation: '', expectations: '' },
        solutionProvider: { name: '', organisation: '', expectations: '' },
        additionalStakeholders: []
    })
    const [baselineData, setBaselineData] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [saveState, setSaveState] = useState('idle')

    // 3. Load Data
    useEffect(() => {
        const load = async () => {
            if (projectId && window.electronAPI) {
                try {
                    const filePath = `projects/${projectId}/initialStakeholders.json`
                    const loadedData = await window.electronAPI.readJSON(filePath)
                    if (loadedData) {
                        const normalizedData = {
                            projectOwner: { name: '', organisation: '', expectations: '', ...loadedData.projectOwner },
                            businessManager: { name: '', organisation: '', expectations: '', ...loadedData.businessManager },
                            solutionProvider: { name: '', organisation: '', expectations: '', ...loadedData.solutionProvider },
                            additionalStakeholders: loadedData.additionalStakeholders || []
                        }
                        setData(normalizedData)
                        setBaselineData(normalizedData)
                    } else {
                        // Create default if not exists
                        await window.electronAPI.writeJSON(filePath, data)
                        setBaselineData(data)
                    }
                } catch (e) {
                    console.error("Error loading stakeholder data", e)
                }
                setIsLoading(false)
            } else {
                setIsLoading(false)
            }
        }
        load()
    }, [projectId])

    // Detect Changes
    useEffect(() => {
        if (baselineData) {
            const isChanged = JSON.stringify(data) !== JSON.stringify(baselineData)
            setIsDirty(isChanged)
        }
    }, [data, baselineData])

    // 4. Save Logic
    const handleSave = async () => {
        if (saveState === 'saving') return
        setSaveState('saving')
        try {
            if (window.electronAPI && projectId) {
                const filePath = `projects/${projectId}/initialStakeholders.json`
                await window.electronAPI.writeJSON(filePath, data)
            }
            setTimeout(() => {
                setSaveState('success')
                setBaselineData(data) // Update baseline
                setTimeout(() => setSaveState('idle'), 2000)
            }, 800)
        } catch (e) {
            console.error("Save failed", e)
            setSaveState('idle')
        }
    }

    // Modal Handlers
    const handleAddStakeholder = () => {
        setEditingStakeholderId(null)
        setCurrentStakeholderData(null)
        setIsModalOpen(true)
    }

    const handleEditStakeholder = (stakeholder) => {
        setEditingStakeholderId(stakeholder.id)
        setCurrentStakeholderData(stakeholder)
        setIsModalOpen(true)
    }

    const handleModalSave = (formData) => {
        if (editingStakeholderId) {
            setData(d => ({
                ...d,
                additionalStakeholders: d.additionalStakeholders.map(s => s.id === editingStakeholderId ? formData : s)
            }))
        } else {
            setData(d => ({
                ...d,
                additionalStakeholders: [...d.additionalStakeholders, formData]
            }))
        }
        setIsModalOpen(false)
    }

    const renderSaveButton = () => {
        let btnClass = "flex items-center px-4 py-2 text-sm font-medium rounded shadow-sm transition-all "
        let content = <><ArrowDownTrayIcon className="h-4 w-4 mr-2" />Save Changes</>

        switch (saveState) {
            case 'saving':
                btnClass += "bg-gray-400 text-white cursor-not-allowed"
                content = <><ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                break;
            case 'success':
                btnClass += "bg-green-600 text-white"
                content = <><CheckCircleIcon className="h-4 w-4 mr-2" />Saved!</>
                break;
            default: // idle
                if (isDirty) {
                    btnClass += "bg-emerald-600 text-white hover:bg-emerald-700"
                    content = <><ArrowDownTrayIcon className="h-4 w-4 mr-2" />Save Changes</>
                } else {
                    btnClass += "bg-gray-100 text-gray-400 cursor-not-allowed"
                    content = <><CheckCircleIcon className="h-4 w-4 mr-2" />Saved</>
                }
                break;
        }

        return (
            <button onClick={handleSave} disabled={saveState === 'saving' || (!isDirty && saveState === 'idle')} className={btnClass}>
                {content}
            </button>
        )
    }

    // 5. Renderers
    const handlePreview = () => {
        setShowExportMenu(false)
        const html = `
            <div class="p-8 prose max-w-none">
                <h1 class="text-2xl font-bold mb-4">Initial Stakeholder Identification</h1>
                <hr class="my-4"/>
                <h3>Project Owner</h3>
                <p><strong>Name:</strong> ${data.projectOwner.name}</p>
                <p><strong>Organisation:</strong> ${data.projectOwner.organisation}</p>
                <p><strong>Expectations:</strong> ${data.projectOwner.expectations}</p>
                
                <h3>Business Manager</h3>
                <p><strong>Name:</strong> ${data.businessManager.name}</p>
                <p><strong>Organisation:</strong> ${data.businessManager.organisation}</p>
                <p><strong>Expectations:</strong> ${data.businessManager.expectations}</p>

                <h3>Solution Provider</h3>
                <p><strong>Name:</strong> ${data.solutionProvider.name}</p>
                <p><strong>Organisation:</strong> ${data.solutionProvider.organisation}</p>
                <p><strong>Expectations:</strong> ${data.solutionProvider.expectations}</p>

                <h3>Additional Stakeholders</h3>
                <ul>
                    ${data.additionalStakeholders.map(s => `<li><strong>${s.name} (${s.role}):</strong> ${s.expectations}</li>`).join('')}
                </ul>
            </div>
        `
        setPreviewHtml(html)
        setShowPreview(true)
    }

    const renderHeader = (title) => (
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {renderSaveButton()}
        </div>
    )

    const renderActiveContent = () => {
        const activeItem = SIDEBAR_STRUCTURE.find(i => i.id === activeSectionId)

        let content = null;
        switch (activeSectionId) {
            case 'projectOwner':
                content = <StepProjectOwner
                    data={data.projectOwner}
                    onChange={(field, val) => {
                        setData(d => ({ ...d, projectOwner: { ...d.projectOwner, [field]: val } }))
                    }}
                />
                break;
            case 'businessManager':
                content = <StepBusinessManager
                    data={data.businessManager}
                    onChange={(field, val) => {
                        setData(d => ({ ...d, businessManager: { ...d.businessManager, [field]: val } }))
                    }}
                />
                break;
            case 'solutionProvider':
                content = <StepSolutionProvider
                    data={data.solutionProvider}
                    onChange={(field, val) => {
                        setData(d => ({ ...d, solutionProvider: { ...d.solutionProvider, [field]: val } }))
                    }}
                />
                break;
            case 'additional':
                content = <StepAdditionalStakeholders
                    stakeholders={data.additionalStakeholders}
                    onAdd={handleAddStakeholder}
                    onEdit={handleEditStakeholder}
                    onDelete={(id) => {
                        setData(d => ({ ...d, additionalStakeholders: d.additionalStakeholders.filter(s => s.id !== id) }))
                    }}
                />
                break;
            default:
                content = <div>Select a section</div>
        }

        return (
            <div className={`bg-white p-8 rounded-xl border border-gray-200 shadow-sm mx-auto transition-all duration-300 ${isGuidanceOpen ? 'max-w-4xl' : 'max-w-7xl'}`}>
                {renderHeader(activeItem?.name)}
                {content}
            </div>
        )
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>

    return (
        <div className="flex flex-col h-full bg-gray-100">
            {/* Global Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 h-16">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 text-gray-400 hover:text-gray-600">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Initial Stakeholder Identification</h1>
                        <p className="text-xs text-gray-500">PM² Governance Artefact</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />Import data from earlier steps
                    </button>
                    <button
                        onClick={() => onOpenGuidance('Roles & Organisation', null, { tab: 'Lifecycle', label: 'Stakeholder Identification' })}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        <BookOpenIcon className="h-4 w-4 mr-2" />Open PM² Guidance
                    </button>
                    <button
                        onClick={() => setIsGuidanceOpen(!isGuidanceOpen)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                        <LightBulbIcon className="h-4 w-4 mr-2" />{isGuidanceOpen ? 'Hide Guidance' : 'Show Guidance'}
                    </button>

                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <nav className="w-1/5 bg-white border-r border-gray-200 h-full overflow-y-auto p-4">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">STAKEHOLDERS</h3>
                        <div className="space-y-1">
                            {SIDEBAR_STRUCTURE.map(item => (
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
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {renderActiveContent()}
                </main>

                {/* Right Guidance */}
                {isGuidanceOpen && (
                    <aside className="w-[30%] bg-white border-l border-gray-200 h-full overflow-y-auto transition-all shadow-lg">
                        <GuidancePanel sectionId={activeSectionId} isOpen={true} onClose={() => setIsGuidanceOpen(false)} />
                    </aside>
                )}
            </div>

            {/* Modals */}
            <StakeholderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
                initialData={currentStakeholderData}
            />

            <DocumentPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Stakeholder Preview"
                htmlContent={previewHtml}
            />
        </div>
    )
}

export default StakeholderWizard
