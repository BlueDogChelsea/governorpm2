import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectCharterSchema } from '../../data/schemas/ProjectCharterSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import projectCharterTemplate from '../../templates/ProjectCharterTemplate.json'
import { ProjectService } from '../../services/ProjectService'

const ProjectCharter = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // Use imported schema
    const sections = projectCharterSchema

    const [expandedSections, setExpandedSections] = useState({})
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    // Independent Load State
    const [mergedArtefact, setMergedArtefact] = useState(artefact)

    useEffect(() => {
        // Expand all by default
        const initialExpanded = {}
        sections.forEach(s => initialExpanded[s.id] = true)
        setExpandedSections(initialExpanded)
    }, [])

    // Load Data from projectCharter.json
    useEffect(() => {
        const loadSpecificData = async () => {
            if (window.electronAPI && projectId) {
                try {
                    const data = await window.electronAPI.readJSON(`projects/${projectId}/projectCharter.json`)
                    if (data) {
                        // Merge loaded separate content with the incoming artefact metadata
                        setMergedArtefact(prev => ({
                            ...prev,
                            content: data
                        }))
                    } else {
                        // Logic if file doesn't exist? 
                        // We stick with 'artefact' passed from App or default initialData
                        setMergedArtefact(artefact)
                    }
                } catch (error) {
                    console.error("Failed to load Project Charter data", error)
                }
            }
        }
        loadSpecificData()
    }, [projectId, artefact])
    // note: We include artefact in dependency to ensure we catch updates from App, 
    // but the readJSON might override content if it exists. 
    // Prudence: readJSON is authority for CONTENT. artefact prop is authority for METADATA (status).

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
    }

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
        // 1. Save content to specific file
        if (window.electronAPI && projectId) {
            await window.electronAPI.writeJSON(`projects/${projectId}/projectCharter.json`, updatedArtefact.content)
        }

        // 2. Propagate to generic handler (updates metadata / lists)
        onSave(updatedArtefact)
    }

    const CustomActions = () => (
        <>
            <button
                onClick={() => onOpenGuidance('Initiating Phase', '5.4 Project Charter', { tab: 'Artefacts', label: 'Project Charter' })}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center"
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
    )

    // Calculate initial data
    const initialData = {
        'Version': '1.0',
        ...sections.reduce((acc, section) => {
            if (section.fields) {
                section.fields.forEach(fieldObj => {
                    if (fieldObj.type === 'table') {
                        acc[fieldObj.key] = []
                    } else {
                        acc[fieldObj.key] = ''
                    }
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
            >
                {({ data, handleContentChange }) => {
                    dataRef.current = data
                    const projectName = ProjectService.getActiveProject()?.name || 'Loading...'

                    // Render Rich Text Editor for narrative fields
                    const renderTextArea = (key, label, placeholder) => (
                        <ArtefactField key={key} label={label}>
                            <RichTextEditor
                                value={data[key] || ''}
                                onChange={(html) => handleContentChange(key, html)}
                                placeholder={placeholder}
                            />
                        </ArtefactField>
                    )

                    const renderInput = (key, label, type = 'text') => (
                        <ArtefactField key={key} label={label}>
                            <ArtefactInput
                                type={type}
                                value={data[key] || ''}
                                onChange={(e) => handleContentChange(key, e.target.value)}
                            />
                        </ArtefactField>
                    )

                    const renderTable = (key, label, columns) => {
                        const rows = Array.isArray(data[key]) ? data[key] : []

                        const addRow = () => {
                            const newRow = { id: Date.now().toString() }
                            columns.forEach(col => newRow[col.key] = '')
                            handleContentChange(key, [...rows, newRow])
                        }

                        const removeRow = (index) => {
                            const newRows = [...rows]
                            newRows.splice(index, 1)
                            handleContentChange(key, newRows)
                        }

                        const updateRow = (index, colKey, value) => {
                            const newRows = [...rows]
                            newRows[index] = { ...newRows[index], [colKey]: value }
                            handleContentChange(key, newRows)
                        }

                        return (
                            <div className="mb-8" key={key}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="h-3 w-3 mr-1" />
                                        Add Row
                                    </button>
                                </div>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map(col => (
                                                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {col.label}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500 italic">
                                                        No items added.
                                                    </td>
                                                </tr>
                                            ) : (
                                                rows.map((row, idx) => (
                                                    <tr key={row.id || idx}>
                                                        {columns.map(col => (
                                                            <td key={col.key} className="px-6 py-4 min-w-[200px]">
                                                                {col.type === 'richtext' ? (
                                                                    <RichTextEditor
                                                                        value={row[col.key] || ''}
                                                                        onChange={(html) => updateRow(idx, col.key, html)}
                                                                        className="min-h-[100px]"
                                                                    />
                                                                ) : col.type === 'date' ? (
                                                                    <input
                                                                        type="date"
                                                                        value={row[col.key] || ''}
                                                                        onChange={(e) => updateRow(idx, col.key, e.target.value)}
                                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        value={row[col.key] || ''}
                                                                        onChange={(e) => updateRow(idx, col.key, e.target.value)}
                                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                    />
                                                                )}
                                                            </td>
                                                        ))}
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRow(idx)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
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

                    return (
                        <div className="space-y-8">
                            {/* Auto-Propagated Project Name */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <BookOpenIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <span className="font-bold">Project:</span> {projectName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {sections.map(section => (
                                <ArtefactSection
                                    key={section.id}
                                    id={section.id}
                                    title={section.title}
                                    isOpen={expandedSections[section.id]}
                                    onToggle={toggleSection}
                                >
                                    <div className="space-y-6">
                                        {section.fields && section.fields.map(fieldObj => {
                                            if (fieldObj.type === 'table') {
                                                return renderTable(fieldObj.key, fieldObj.label, fieldObj.columns)
                                            } else if (fieldObj.type === 'richtext' || fieldObj.type === 'textarea') {
                                                return renderTextArea(fieldObj.key, fieldObj.label, fieldObj.placeholder)
                                            } else {
                                                return renderInput(fieldObj.key, fieldObj.label, fieldObj.type)
                                            }
                                        })}
                                    </div>
                                </ArtefactSection>
                            ))}
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
