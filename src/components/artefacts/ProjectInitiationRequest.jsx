import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectInitiationRequestSchema } from '../../data/schemas/ProjectInitiationRequestSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import pirTemplate from '../../templates/PIRTemplate.json'

const ProjectInitiationRequest = ({ artefact, onSave, onBack, onOpenGuidance }) => {
    // Use imported schema
    const sections = projectInitiationRequestSchema

    const [expandedSections, setExpandedSections] = useState({})
    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        // Expand all by default
        const initialExpanded = {}
        sections.forEach(s => initialExpanded[s.id] = true)
        setExpandedSections(initialExpanded)
    }, [])

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const dataRef = React.useRef({})

    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = dataRef.current

        if (format === 'html') {
            const html = await DocumentGenerator.generateDocument(
                content,
                sections,
                pirTemplate,
                format,
                'preview'
            )
            setPreviewHtml(html)
            setShowPreview(true)
        } else {
            DocumentGenerator.generateDocument(
                content,
                sections,
                pirTemplate,
                format,
                `PIR_${content['Project Name'] || 'Project'}_v${content['Version'] || '1.0'}`
            )
        }
    }

    const CustomActions = () => (
        <>
            <button
                onClick={() => onOpenGuidance('Initiating Phase', '5.2 Project Initiation Request', { tab: 'Artefacts', label: 'Project Initiation Request' })}
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
        'Project Name': artefact?.name || '',
        'Date': new Date().toISOString().split('T')[0],
        'Version': '1.0',
        ...sections.reduce((acc, section) => {
            if (section.fields) {
                section.fields.forEach(fieldObj => {
                    acc[fieldObj.key] = ''
                })
            }
            return acc
        }, {})
    }

    return (
        <>
            <GovernedArtefactEditor
                artefact={artefact}
                onSave={onSave}
                onBack={onBack}
                title="Project Initiation Request"
                description="Define the project foundation (PM² Template)"
                actions={<CustomActions />}
                initialData={initialData}
            >
                {({ data, handleContentChange }) => {
                    // Update ref for export
                    dataRef.current = data

                    const renderInput = (key, label, type = "text") => (
                        <ArtefactField key={key} label={label}>
                            <ArtefactInput
                                type={type}
                                value={data[key] || ''}
                                onChange={(e) => handleContentChange(key, e.target.value)}
                            />
                        </ArtefactField>
                    )

                    const renderTextArea = (key, label, placeholder, rows = 4) => (
                        <ArtefactField key={key} label={label}>
                            <ArtefactTextarea
                                value={data[key] || ''}
                                onChange={(e) => handleContentChange(key, e.target.value)}
                                rows={rows}
                                placeholder={placeholder}
                            />
                        </ArtefactField>
                    )

                    const renderRichText = (key, label, placeholder) => (
                        <ArtefactField key={key} label={label}>
                            <RichTextEditor
                                value={data[key] || ''}
                                onChange={(html) => handleContentChange(key, html)}
                                placeholder={placeholder}
                            />
                        </ArtefactField>
                    )

                    return (
                        <div className="space-y-8">
                            {sections.map(section => (
                                <ArtefactSection
                                    key={section.id}
                                    id={section.id}
                                    title={section.title}
                                    isOpen={expandedSections[section.id]}
                                    onToggle={toggleSection}
                                >
                                    <div className={section.type === 'multi-richtext' ? "space-y-6" : section.type === 'mixed' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
                                        {section.fields.map(fieldObj => {
                                            // Determine type based on fieldObj.type
                                            const { key, label, type, placeholder } = fieldObj

                                            if (type === 'richtext') {
                                                return renderRichText(key, label || null, placeholder)
                                            } else if (type === 'textarea') {
                                                return renderTextArea(key, label, placeholder)
                                            } else if (type === 'date') {
                                                return renderInput(key, label || 'Date', 'date')
                                            } else {
                                                return renderInput(key, label || key, 'text')
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
                title="Project Initiation Request Preview"
                htmlContent={previewHtml}
            />
        </>
    )
}

export default ProjectInitiationRequest
