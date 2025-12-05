import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'

const BusinessCase = ({ artefact, onSave, onBack, onOpenGuidance }) => {
    // Define sections structure
    const sections = [
        {
            id: 'justification',
            title: '1. Project Justification & Impact',
            fields: ['Business Justification', 'Current Situation / Problem', 'Impact of Doing Nothing'],
            type: 'multi-textarea',
            placeholders: {
                'Business Justification': 'Describe the business justification for the project.',
                'Current Situation / Problem': 'Describe the current situation or problem to be addressed.',
                'Impact of Doing Nothing': 'Describe the impact if the project does not proceed (do-nothing scenario).'
            }
        },
        {
            id: 'alignment',
            title: '2. Strategic Alignment',
            fields: ['Strategic Alignment', 'Regulatory / Compliance Drivers'],
            type: 'multi-textarea',
            placeholders: {
                'Strategic Alignment': 'Describe how the project aligns with organisational strategy, goals, policies, or priorities.',
                'Regulatory / Compliance Drivers': 'Describe any relevant regulatory or compliance drivers.'
            }
        },
        {
            id: 'alternatives',
            title: '3. Alternatives Considered',
            customRender: true
        },
        {
            id: 'solution',
            title: '4. Proposed Solution Overview',
            fields: ['Solution Overview', 'High-level Scope', 'Key Deliverables', 'Expected Benefits'],
            type: 'multi-textarea',
            placeholders: {
                'Solution Overview': 'Overview of the chosen solution.',
                'High-level Scope': 'Describe the high-level scope.',
                'Key Deliverables': 'List key deliverables.',
                'Expected Benefits': 'Describe expected benefits (qualitative or quantitative).'
            }
        },
        {
            id: 'success_criteria',
            title: '5. Success Criteria',
            fields: ['Critical Success Criteria', 'General Success Criteria'],
            type: 'multi-textarea',
            placeholders: {
                'Critical Success Criteria': 'List measurable criteria critical for success.',
                'General Success Criteria': 'List other general success criteria.'
            }
        },
        {
            id: 'costs_benefits',
            title: '6. Costs & Benefits (High-Level)',
            fields: ['Cost Summary', 'Benefit Summary', 'Justification (Optional)'],
            type: 'multi-textarea',
            placeholders: {
                'Cost Summary': 'High-level cost summary (narrative).',
                'Benefit Summary': 'High-level benefit summary.',
                'Justification (Optional)': 'Optional: cost/benefit justification text.'
            }
        },
        {
            id: 'synergies',
            title: '7. Synergies and Interdependencies',
            fields: ['Dependencies', 'Synergies', 'Interdependencies'],
            type: 'multi-textarea',
            placeholders: {
                'Dependencies': 'Dependencies with other initiatives, projects, systems, or business processes.',
                'Synergies': 'Identified synergies.',
                'Interdependencies': 'External or internal interdependencies.'
            }
        },
        {
            id: 'roadmap',
            title: '8. High-Level Roadmap',
            fields: ['Start Date', 'Target Delivery Date', 'Major Milestones'],
            type: 'mixed'
        }
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
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Business Case</title>
            <style>
                body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
                h1 { font-size: 16pt; color: #2E74B5; }
                h2 { font-size: 14pt; color: #2E74B5; margin-top: 18pt; }
                h3 { font-size: 12pt; color: #1F4E79; margin-top: 12pt; }
                h4 { font-size: 11pt; font-weight: bold; margin-top: 10pt; }
                .field-label { font-weight: bold; margin-bottom: 4px; color: #444; }
                .field-content { margin-bottom: 12pt; }
            </style>
            </head>
            <body>
            <h1>Business Case</h1>
        `

        // Helper to render field block safely
        const renderField = (label, value) => {
            return `
                <div class="field-block">
                    <div class="field-label">${label}:</div>
                    <div class="field-content">${value || '<p>N/A</p>'}</div>
                </div>
            `
        }

        // Custom render for Sections
        sections.forEach(section => {
            htmlContent += `<h2>${section.title}</h2>`

            if (section.id === 'alternatives') {
                ['A', 'B', 'C'].forEach(alt => {
                    htmlContent += `<h3>Alternative ${alt}</h3>`
                    htmlContent += renderField('Description', content[`Alt${alt}_Description`])

                    htmlContent += `<h4>SWOT Analysis</h4>`
                    htmlContent += renderField('Strengths', content[`Alt${alt}_Strengths`])
                    htmlContent += renderField('Weaknesses', content[`Alt${alt}_Weaknesses`])
                    htmlContent += renderField('Opportunities', content[`Alt${alt}_Opportunities`])
                    htmlContent += renderField('Threats', content[`Alt${alt}_Threats`])

                    htmlContent += renderField('Viability Assessment', content[`Alt${alt}_Qualitative`])
                })
                htmlContent += `<h3>Chosen Alternative</h3>`
                htmlContent += renderField('Choice', content['Chosen_Alternative']) // Text input, but acts as string
                htmlContent += renderField('Rationale', content['Chosen_Rationale'])
                htmlContent += renderField('Summary', content['Chosen_Summary'])
            } else if (section.fields) {
                // Determine which fields are skipped in generic loop if needed
                section.fields.forEach(field => {
                    // Start Date / Target Date are inputs, preserve as text
                    // Milestones is rich text
                    // But content[field] is just a string.
                    // If it's a date "2023-01-01", showing as html is fine.
                    htmlContent += renderField(field, content[field])
                })
            }
        })

        htmlContent += '</body></html>'

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Business_Case_${content['Project Name'] || 'Project'}_v${content['Version'] || '1.0'}.doc`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
            title="Business Case"
            description="Justify the project investment and strategy (PM² Template 5.3)"
            actions={<CustomActions />}
            initialData={{
                'Version': '1.0'
            }}
        >
            {({ data, handleContentChange }) => {
                dataRef.current = data

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
                                        {section.fields && section.fields.map(field =>
                                            renderTextArea(field, field, section.placeholders ? section.placeholders[field] : '')
                                        )}
                                    </div>
                                )}
                            </ArtefactSection>
                        ))}
                    </div>
                )
            }}
        </GovernedArtefactEditor>
    )
}

export default BusinessCase
