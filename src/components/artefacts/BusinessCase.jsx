import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { businessCaseSchema } from '../../data/schemas/BusinessCaseSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import businessCaseTemplate from '../../templates/BusinessCaseTemplate.json'
import { ProjectService } from '../../services/ProjectService'

const BusinessCase = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // Use imported schema
    const sections = businessCaseSchema

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
                { ...content, projectName: ProjectService.getActiveProject()?.name },
                sections,
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
                sections,
                businessCaseTemplate,
                format,
                `Business_Case_${projName}_v${content['Version'] || '1.0'}`
            )
        }
    }

    const CustomActions = () => (
        <>
            <button
                onClick={() => onOpenGuidance('Initiating Phase', '5.3 Business Case', { tab: 'Artefacts', label: 'Business Case' })}
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
                    acc[fieldObj.key] = ''
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
                artefact={artefact}
                onSave={onSave}
                onBack={onBack}
                title="Business Case"
                description="Justify the project investment and strategy"
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

                    const renderAlternative = (letter, labelName = null) => {
                        const prefix = `Alt${letter}`
                        return (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                                <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6 text-lg">{labelName || `Alternative ${letter}`}</h4>

                                <div className="space-y-6">
                                    {renderTextArea(`${prefix}_Description`, 'Description', 'Describe the alternative')}

                                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                        <h5 className="font-semibold text-gray-800 mb-4 block">SWOT Analysis</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {renderTextArea(`${prefix}_Strengths`, 'Strengths', 'Strengths')}
                                            {renderTextArea(`${prefix}_Weaknesses`, 'Weaknesses', 'Weaknesses')}
                                            {renderTextArea(`${prefix}_Opportunities`, 'Opportunities', 'Opportunities')}
                                            {renderTextArea(`${prefix}_Threats`, 'Threats', 'Threats')}
                                        </div>
                                    </div>

                                    {renderTextArea(`${prefix}_Qualitative`, 'Viability Assessment', 'Qualitative assessment of this alternative')}
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
                                    {section.id === 'alternatives' ? (
                                        <div className="space-y-6">
                                            {renderAlternative('A', 'Alternative A (e.g. Do Nothing)')}
                                            {renderAlternative('B', 'Alternative B')}
                                            {renderAlternative('C', 'Alternative C')}

                                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
                                                <h4 className="font-bold text-blue-900 mb-6 text-lg">Chosen Alternative</h4>
                                                <div className="space-y-4">
                                                    {renderInput('Chosen_Alternative', 'Chosen Alternative')}
                                                    {renderTextArea('Chosen_Rationale', 'Rationale for selection', 'Why was this alternative selected?')}
                                                    {renderTextArea('Chosen_Summary', 'Summary of why this alternative is preferred over others', 'Summary of preference')}
                                                </div>
                                            </div>
                                        </div>
                                    ) : section.id === 'roadmap' ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {renderInput('Start Date', 'Start Date', 'date')}
                                                {renderInput('Target Delivery Date', 'Target Delivery Date', 'date')}
                                            </div>
                                            {renderTextArea('Major Milestones', 'Major Milestones', 'List major milestones')}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {section.fields && section.fields.map(fieldObj =>
                                                // Handle various types if needed, but for now most are text/textarea(richtext)
                                                fieldObj.type === 'text' ?
                                                    renderInput(fieldObj.key, fieldObj.label) :
                                                    renderTextArea(fieldObj.key, fieldObj.label, fieldObj.placeholder)
                                            )}
                                        </div>
                                    )}
                                </ArtefactSection>
                            ))}
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
