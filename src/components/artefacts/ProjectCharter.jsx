import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon, PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactField, ArtefactInput, ArtefactTextarea, ArtefactSelect } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectCharterSchema } from '../../data/schemas/ProjectCharterSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import projectCharterTemplate from '../../templates/ProjectCharterTemplate.json'
import { ProjectService } from '../../services/ProjectService'
import WizardStepper from '../ui/WizardStepper'
import ArtefactApprovalSection from './ui/ArtefactApprovalSection'

// Map schema sections effectively 1-to-1 to wizard steps + Approval
const wizardSteps = [
    ...projectCharterSchema.map((item, index) => ({
        id: index,
        name: item.title.replace(/^\d+\.\s*/, ''),
        schemaId: item.id
    })),
    { id: projectCharterSchema.length, name: 'Approval', schemaId: 'approval' }
]

// -- Helper Component for Step Content to safely use Hooks --
const StepContent = ({ section, data, onUpdate, projectId }) => {

    // Auto-Fill Logic (Side Effect)
    useEffect(() => {
        if (!section || !projectId || !window.electronAPI) return

        const tryAutoFill = async () => {
            if (section.id === 'governance_stakeholders') {
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

                            if (isPoEmpty && asiData.projectOwner?.name) {
                                newPsc.requestorSide.po.name = asiData.projectOwner.name
                                modified = true
                            }
                            if (isBmEmpty && asiData.businessManager?.name) {
                                newPsc.requestorSide.bm.name = asiData.businessManager.name
                                modified = true
                            }
                            // Attempt to find Solution Provider
                            if (isSpEmpty && asiData.additionalStakeholders) {
                                const sp = asiData.additionalStakeholders.find(s => s.role && s.role.toLowerCase().includes('solution provider'))
                                if (sp) {
                                    newPsc.providerSide.sp.name = sp.name
                                    modified = true
                                }
                            }

                            if (modified) onUpdate('psc', newPsc)
                        }
                    }

                    // 2. Extended Governance Auto-Fill
                    // Only fill if empty to avoid overwriting
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
                                onUpdate('extendedGovernance', newRows)
                            }
                        }
                    }

                } catch (e) {
                    console.warn("Failed to auto-fill Governance data", e)
                }
            }
        }
        tryAutoFill()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [section.id, projectId])

    // -- Renderers --

    const stripHtml = (html) => {
        if (!html) return ''
        const tmp = document.createElement("DIV")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
    }

    const renderInput = (key, label, type = 'text') => (
        <ArtefactField key={key} label={label}>
            <ArtefactInput
                type={type}
                value={data[key] || ''}
                onChange={(e) => onUpdate(key, e.target.value)}
            />
        </ArtefactField>
    )

    const renderTextArea = (key, label, placeholder) => (
        <ArtefactField key={key} label={label}>
            <RichTextEditor
                value={data[key] || ''}
                onChange={(html) => onUpdate(key, html)}
                placeholder={placeholder}
            />
        </ArtefactField>
    )

    const renderTable = (key, label, columns) => {
        const rows = Array.isArray(data[key]) ? data[key] : []

        const addRow = () => {
            const newRow = { id: Date.now().toString() }
            columns.forEach(col => newRow[col.key] = col.type === 'select' && col.options ? col.options[1] : '')
            onUpdate(key, [...rows, newRow])
        }

        const removeRow = (index) => {
            const newRows = [...rows]
            newRows.splice(index, 1)
            onUpdate(key, newRows)
        }

        const updateRow = (index, colKey, value) => {
            const newRows = [...rows]
            newRows[index] = { ...newRows[index], [colKey]: value }
            onUpdate(key, newRows)
        }

        const getColWidth = (colKey) => {
            if (colKey === 'description') return 'w-1/2'
            if (colKey === 'priority') return 'w-1/5 min-w-[200px]'
            return ''
        }

        const getPriorityColor = (value) => {
            if (!value) return 'bg-gray-100 text-gray-800'
            if (value.includes('High')) return 'bg-red-100 text-red-800 border-red-200'
            if (value.includes('Medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            if (value.includes('Low')) return 'bg-green-100 text-green-800 border-green-200'
            return 'bg-gray-100 text-gray-800'
        }

        return (
            <div className="mb-8" key={key}>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <button type="button" onClick={addRow} className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="h-3 w-3 mr-1" /> Add Row
                    </button>
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getColWidth(col.key)}`}>
                                        {col.label}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500 italic">No items added.</td>
                                </tr>
                            ) : (
                                rows.map((row, idx) => (
                                    <tr key={row.id || idx} className="align-top">
                                        {columns.map(col => {
                                            const rawValue = row[col.key] || ''
                                            const displayValue = (col.type !== 'richtext' && typeof rawValue === 'string' && rawValue.includes('<')) ? stripHtml(rawValue) : rawValue
                                            return (
                                                <td key={col.key} className="px-6 py-4 min-w-[200px]">
                                                    {col.type === 'richtext' ? (
                                                        <RichTextEditor value={row[col.key] || ''} onChange={(html) => updateRow(idx, col.key, html)} className="min-h-[100px]" />
                                                    ) : col.type === 'textarea' ? (
                                                        <ArtefactTextarea rows={3} value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} placeholder={col.placeholder || ''} className="resize-y text-sm" />
                                                    ) : col.type === 'select' ? (
                                                        <ArtefactSelect value={row[col.key] || col.options?.[0] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className={`text-sm ${col.key === 'priority' ? `border ${getPriorityColor(row[col.key])} bg-opacity-20 font-medium` : ''}`}>
                                                            {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </ArtefactSelect>
                                                    ) : col.type === 'date' ? (
                                                        <ArtefactInput type="date" value={row[col.key] || ''} onChange={(e) => updateRow(idx, col.key, e.target.value)} className="text-sm" />
                                                    ) : (
                                                        <ArtefactInput type="text" value={displayValue} onChange={(e) => updateRow(idx, col.key, e.target.value)} placeholder={col.placeholder || ''} className="text-sm" />
                                                    )}
                                                </td>
                                            )
                                        })}
                                        <td className="px-6 py-4 text-right align-middle">
                                            <button type="button" onClick={() => removeRow(idx)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderPSCMatrix = (key, label, structure) => {
        const pscData = data[key] || structure

        const updatePscRole = (side, roleKey, value) => {
            const newData = {
                ...pscData,
                [side]: {
                    ...pscData[side],
                    [roleKey]: {
                        ...pscData[side][roleKey],
                        name: value
                    }
                }
            }
            onUpdate(key, newData)
        }

        return (
            <div key={key} className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Requestor Side */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="text-center mb-4 pb-2 border-b border-blue-200">
                            <h5 className="font-bold text-blue-800">Requestor Side (Client)</h5>
                        </div>
                        {['po', 'bm'].map(roleKey => {
                            const role = pscData.requestorSide[roleKey]
                            return (
                                <div key={roleKey} className={`bg-white p-4 rounded shadow-sm mb-4 border-l-4 ${roleKey === 'po' ? 'border-blue-600' : 'border-blue-400'}`}>
                                    <h6 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1 flex justify-between">
                                        {role.role} <span className="text-gray-400 text-xs">({roleKey.toUpperCase()})</span>
                                    </h6>
                                    <p className="text-xs text-gray-500 italic mb-2">{role.responsibilities}</p>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={role.name}
                                        onChange={(e) => updatePscRole('requestorSide', roleKey, e.target.value)}
                                        placeholder="Enter name..."
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Provider Side */}
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <div className="text-center mb-4 pb-2 border-b border-indigo-200">
                            <h5 className="font-bold text-indigo-800">Provider Side (Builder)</h5>
                        </div>
                        {['sp', 'pm'].map(roleKey => {
                            const role = pscData.providerSide[roleKey]
                            return (
                                <div key={roleKey} className={`bg-white p-4 rounded shadow-sm mb-4 border-l-4 ${roleKey === 'sp' ? 'border-indigo-600' : 'border-indigo-400'}`}>
                                    <h6 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1 flex justify-between">
                                        {role.role} <span className="text-gray-400 text-xs">({roleKey.toUpperCase()})</span>
                                    </h6>
                                    <p className="text-xs text-gray-500 italic mb-2">{role.responsibilities}</p>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        value={role.name}
                                        onChange={(e) => updatePscRole('providerSide', roleKey, e.target.value)}
                                        placeholder="Enter name..."
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-white rounded-lg p-1">
            {section.fields && section.fields.map(fieldObj => {
                if (fieldObj.type === 'table') {
                    return renderTable(fieldObj.key, fieldObj.label, fieldObj.columns)
                } else if (fieldObj.type === 'richtext' || fieldObj.type === 'textarea') {
                    return renderTextArea(fieldObj.key, fieldObj.label, fieldObj.placeholder)
                } else if (fieldObj.type === 'pscMatrix') {
                    return renderPSCMatrix(fieldObj.key, fieldObj.label, fieldObj.structure)
                } else {
                    return renderInput(fieldObj.key, fieldObj.label, fieldObj.type)
                }
            })}
        </div>
    )
}

const ProjectCharter = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    const sections = projectCharterSchema
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [mergedArtefact, setMergedArtefact] = useState(artefact)
    const [currentStep, setCurrentStep] = useState(() => {
        if (!projectId) return 0
        const savedStep = sessionStorage.getItem(`pc_wizard_step_${projectId}`)
        return savedStep ? parseInt(savedStep, 10) : 0
    })

    useEffect(() => {
        if (projectId) sessionStorage.setItem(`pc_wizard_step_${projectId}`, currentStep)
    }, [currentStep, projectId])

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

    const dataRef = React.useRef({})

    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = dataRef.current
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

    const handleInternalSave = async (updatedArtefact) => {
        if (window.electronAPI && projectId) {
            await window.electronAPI.writeJSON(`projects/${projectId}/projectCharter.json`, updatedArtefact.content)
        }
        onSave(updatedArtefact)
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
        ...sections.reduce((acc, section) => {
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
                    const projectName = ProjectService.getActiveProject()?.name || 'Loading...'
                    const isApprovalStep = currentStep === wizardSteps.length - 1
                    const currentSchemaSection = !isApprovalStep ? sections[currentStep] : null

                    return (
                        <div className="flex flex-col min-h-[600px]">
                            <div className="sticky top-0 bg-white z-20 pb-4 mb-4 border-b border-gray-100 -mx-4 px-4">
                                <WizardStepper steps={wizardSteps} currentStep={currentStep} onStepClick={setCurrentStep} />
                            </div>

                            <div className="space-y-8 flex-1">
                                {isApprovalStep ? (
                                    <div className="max-w-4xl mx-auto pt-6">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Artefact Approval</h3>
                                        <ArtefactApprovalSection
                                            approvalState={approval}
                                            onUpdate={onUpdateApproval}
                                            onToggleApproval={onToggleApproval}
                                            isOpen={true}
                                            onToggle={() => { }}
                                            isModified={false}
                                        />
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">{currentSchemaSection.title}</h3>
                                        {currentStep === 0 && (
                                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                                <div className="flex">
                                                    <div className="flex-shrink-0"><BookOpenIcon className="h-5 w-5 text-blue-400" /></div>
                                                    <div className="ml-3"><p className="text-sm text-blue-700"><span className="font-bold">Project:</span> {projectName}</p></div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Use Safe StepContent Wrapper */}
                                        <StepContent
                                            section={currentSchemaSection}
                                            data={data}
                                            onUpdate={handleContentChange}
                                            projectId={projectId}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                                <button
                                    onClick={() => {
                                        if (currentStep > 0) setCurrentStep(prev => prev - 1)
                                        else onBack()
                                    }}
                                    className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                                >
                                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                    {currentStep === 0 ? 'Back to Menu' : 'Back'}
                                </button>
                                {currentStep < wizardSteps.length - 1 && (
                                    <button
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                        className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                                    >
                                        Next <ChevronRightIcon className="h-4 w-4 ml-2" />
                                    </button>
                                )}
                            </div>
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
