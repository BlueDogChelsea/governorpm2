import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'

const ProjectInitiationRequest = ({ artefact, onSave, onBack, onOpenGuidance }) => {
    // Define sections structure
    const sections = [
        { id: 'projectInfo', title: '1. Project Information', fields: ['Project Name', 'Date', 'Version', 'Project Owner', 'Project Manager'] },
        { id: 'background', title: '2. Background / Context', type: 'richtext', placeholder: 'Describe the reason why a project should be initiated. Think of the situation that the project will address in terms of responding to a business need, or providing an answer to a problem or taking advantage of an opportunity. The context of the project can be described by a combination of any of the above scenarios.' },
        { id: 'problem', title: '3. Problem / Need / Opportunity', type: 'richtext', placeholder: 'Describe the impact that the current situation or proposed solution will have internally (processes, people, culture) and externally (stakeholders). Keep this at a high level.' },
        { id: 'benefits', title: '4. Expected Benefits & Success Criteria', type: 'richtext', placeholder: 'Identify and describe at a high level the main outcomes expected from the project. Outcomes reflect the results of change the project will implement. Link measurable benefits directly to the outcomes.\n\nDescribe the high-level success criteria of the proposed project. Criteria may relate to scope, schedule, costs, quality, or benefits.' },
        { id: 'objectives', title: '5. Project Objectives', type: 'richtext', placeholder: 'Define the project objectives. The objectives should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).' },
        { id: 'scope', title: '6. Scope', fields: ['In Scope', 'Out of Scope'], type: 'multi-richtext', placeholders: { 'In Scope': 'Define what is included in the project scope.', 'Out of Scope': 'Define what is explicitly excluded from the project scope.' } },
        { id: 'stakeholders', title: '7. Key Stakeholders', type: 'textarea', placeholder: 'List the key stakeholders (people or groups) who are affected by the project or who can influence it.' },
        { id: 'assumptions', title: '8. Assumptions', type: 'richtext', placeholder: 'Describe project assumptions related to business, technology, resources, organisational environment, expectations, scope, or schedules. Assumptions are treated as true at this stage but must be validated. Unvalidated assumptions may become risks.' },
        { id: 'constraints', title: '9. Constraints', type: 'richtext', placeholder: 'Describe any key constraints such as schedule, budget, resources, required products or technologies, decisions, compliance requirements, or organisational/external constraints.' },
        { id: 'risks', title: '10. Initial Risks', type: 'richtext', placeholder: 'Add any initial risks identified. Focus on business risks.' },
        { id: 'effort', title: '11. Estimated Effort, Cost, and Timeline', fields: ['Estimated Effort (Man-days)', 'Estimated Cost (€)', 'Target Start Date', 'Target End Date'], type: 'mixed' },
        { id: 'approach', title: '12. Delivery Approach', type: 'richtext', placeholder: 'Describe the chosen delivery approach (e.g. In-house, Outsourced, COTS, Custom Development, Agile, Waterfall, etc.)' },
        { id: 'dependencies', title: '13. Dependencies and Interfaces', type: 'richtext', placeholder: 'List any known dependencies or interfaces with other projects, systems or organizational units.' },
        { id: 'alignment', title: '14. Strategic Alignment', type: 'richtext', placeholder: 'The legal basis, if any, for the Project Initiation Request. Provide the link to the organisation’s strategic goals. Can be in the form of a directive coming from senior management.' }
    ]

    const [expandedSections, setExpandedSections] = useState({})

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

    const handleExport = () => {
        const content = dataRef.current
        // Simple HTML to Word export
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Project Initiation Request</title>
            <style>
                body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
                h1 { font-size: 16pt; color: #2E74B5; }
                h2 { font-size: 14pt; color: #2E74B5; margin-top: 18pt; }
                h3 { font-size: 12pt; color: #1F4E79; margin-top: 12pt; }
                .field-label { font-weight: bold; margin-bottom: 4px; color: #444; }
                .field-content { margin-bottom: 12pt; }
            </style>
            </head>
            <body>
            <h1>Project Initiation Request</h1>
        `

        // Helper to render field block
        const renderField = (label, value, isRichText = false) => {
            // For rich text, value is already HTML (e.g. <p>...</p>). We shouldn't wrap it in <p> again.
            return `
                <div class="field-block">
                    <div class="field-label">${label}:</div>
                    <div class="field-content">${value || (isRichText ? '<p>N/A</p>' : 'N/A')}</div>
                </div>
            `
        }

        sections.forEach(section => {
            htmlContent += `<h2>${section.title}</h2>`

            if (section.fields) {
                // Check if it's a multi-richtext section (Scope) or mixed
                const isMultiRich = section.type === 'multi-richtext'

                section.fields.forEach(field => {
                    // Start/End Dates, Effort, etc are mixed but simple text
                    // Scope fields are rich text if isMultiRich
                    // We need to know if a specific field is rich text.
                    // Based on "sections" config:
                    // Scope (multi-richtext) -> all fields rich
                    // Effort (mixed) -> all fields simple inputs

                    if (isMultiRich) {
                        htmlContent += renderField(field, content[field], true)
                    } else {
                        // Fallback for simple fields
                        htmlContent += renderField(field, content[field], false)
                    }
                })
            } else {
                // Single field sections
                const isRich = section.type === 'richtext'
                // Use section.id as key
                htmlContent += `<div class="field-content">${content[section.id] || (isRich ? '<p>N/A</p>' : 'N/A')}</div>`
            }
        })

        htmlContent += '</body></html>'

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `PIR_${content['Project Name'] || 'Project'}_v${content['Version'] || '1.0'}.doc`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
            <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm flex items-center"
            >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
            </button>
        </>
    )

    return (
        <GovernedArtefactEditor
            artefact={artefact}
            onSave={onSave}
            onBack={onBack}
            title="Project Initiation Request"
            description="Define the project foundation (PM² Template)"
            actions={<CustomActions />}
            initialData={{
                'Project Name': artefact?.name || '',
                'Date': new Date().toISOString().split('T')[0],
                'Version': '1.0',
                // Generate default empty strings for all section fields to prevent false dirty states
                ...sections.reduce((acc, section) => {
                    if (section.fields) {
                        section.fields.forEach(field => acc[field] = '')
                    } else {
                        acc[section.id] = ''
                    }
                    return acc
                }, {})
            }}
        >
            {({ data, handleContentChange }) => {
                // Update ref for export
                dataRef.current = data

                const renderInput = (label, type = "text") => (
                    <ArtefactField key={label} label={label}>
                        <ArtefactInput
                            type={type}
                            value={data[label] || ''}
                            onChange={(e) => handleContentChange(label, e.target.value)}
                        />
                    </ArtefactField>
                )

                const renderTextArea = (key, label, placeholder, rows = 4) => (
                    <ArtefactField key={label || key} label={label}>
                        <ArtefactTextarea
                            value={data[key] || ''}
                            onChange={(e) => handleContentChange(key, e.target.value)}
                            rows={rows}
                            placeholder={placeholder}
                        />
                    </ArtefactField>
                )

                const renderRichText = (key, label, placeholder) => (
                    <ArtefactField key={label || key} label={label}>
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
                                {section.fields ? (
                                    <div className={section.type === 'multi-richtext' ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
                                        {section.fields.map(field => {
                                            if (section.type === 'multi-richtext') {
                                                const placeholder = section.placeholders ? section.placeholders[field] : ''
                                                return renderRichText(field, field, placeholder)
                                            } else {
                                                // Mixed types (Project Info, Effort)
                                                // We can infer type from field name loosely
                                                const isDate = field.includes('Date')
                                                return renderInput(field, isDate ? 'date' : 'text')
                                            }
                                        })}
                                    </div>
                                ) : (
                                    // Single field sections
                                    section.type === 'richtext' ? (
                                        renderRichText(section.id, null, section.placeholder)
                                    ) : (
                                        renderTextArea(section.id, null, section.placeholder, 6)
                                    )
                                )}
                            </ArtefactSection>
                        ))}
                    </div>
                )
            }}
        </GovernedArtefactEditor>
    )
}

export default ProjectInitiationRequest
