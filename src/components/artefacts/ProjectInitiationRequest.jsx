import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'

const ProjectInitiationRequest = ({ artefact, onSave, onBack, onOpenGuidance }) => {
    // Define sections structure
    const sections = [
        { id: 'projectInfo', title: '1. Project Information', fields: ['Project Name', 'Date', 'Version', 'Project Owner', 'Project Manager'] },
        { id: 'background', title: '2. Background / Context', type: 'textarea', placeholder: 'Describe the reason why a project should be initiated. Think of the situation that the project will address in terms of responding to a business need, or providing an answer to a problem or taking advantage of an opportunity. The context of the project can be described by a combination of any of the above scenarios.' },
        { id: 'problem', title: '3. Problem / Need / Opportunity', type: 'textarea', placeholder: 'Describe the impact that the current situation or proposed solution will have internally (processes, people, culture) and externally (stakeholders). Keep this at a high level.' },
        { id: 'benefits', title: '4. Expected Benefits & Success Criteria', type: 'textarea', placeholder: 'Identify and describe at a high level the main outcomes expected from the project. Outcomes reflect the results of change the project will implement. Link measurable benefits directly to the outcomes.\n\nDescribe the high-level success criteria of the proposed project. Criteria may relate to scope, schedule, costs, quality, or benefits.' },
        { id: 'objectives', title: '5. Project Objectives', type: 'textarea', placeholder: 'Define the project objectives. The objectives should be Specific, Measurable, Achievable, Relevant, and Time-bound (SMART).' },
        { id: 'scope', title: '6. Scope', fields: ['In Scope', 'Out of Scope'], type: 'multi-textarea', placeholders: { 'In Scope': 'Define what is included in the project scope.', 'Out of Scope': 'Define what is explicitly excluded from the project scope.' } },
        { id: 'stakeholders', title: '7. Key Stakeholders', type: 'textarea', placeholder: 'List the key stakeholders (people or groups) who are affected by the project or who can influence it.' },
        { id: 'assumptions', title: '8. Assumptions', type: 'textarea', placeholder: 'Describe project assumptions related to business, technology, resources, organisational environment, expectations, scope, or schedules. Assumptions are treated as true at this stage but must be validated. Unvalidated assumptions may become risks.' },
        { id: 'constraints', title: '9. Constraints', type: 'textarea', placeholder: 'Describe any key constraints such as schedule, budget, resources, required products or technologies, decisions, compliance requirements, or organisational/external constraints.' },
        { id: 'risks', title: '10. Initial Risks', type: 'textarea', placeholder: 'Add any initial risks identified. Focus on business risks.' },
        { id: 'effort', title: '11. Estimated Effort, Cost, and Timeline', fields: ['Estimated Effort (Man-days)', 'Estimated Cost (€)', 'Target Start Date', 'Target End Date'], type: 'mixed' },
        { id: 'approach', title: '12. Delivery Approach', type: 'textarea', placeholder: 'Describe the chosen delivery approach (e.g. In-house, Outsourced, COTS, Custom Development, Agile, Waterfall, etc.)' },
        { id: 'dependencies', title: '13. Dependencies and Interfaces', type: 'textarea', placeholder: 'List any known dependencies or interfaces with other projects, systems or organizational units.' },
        { id: 'alignment', title: '14. Strategic Alignment', type: 'textarea', placeholder: 'The legal basis, if any, for the Project Initiation Request. Provide the link to the organisation’s strategic goals. Can be in the form of a directive coming from senior management.' }
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

    // Export Logic needs access to current content. 
    // Since content is now managed by the wrapper, we need a way to access it for export.
    // However, the action button is passed TO the wrapper.
    // Solution: The wrapper children render prop pattern allows us to render the form, 
    // but the Buttons are passed as props (actions). 
    // This makes it hard for the Export button to access the data unless we hoist state or use ref.

    // Better approach for PIR with Wrapper:
    // The Wrapper can expose the current data via a ref or we just pass the Export function 
    // into the children render prop and render the buttons there? 
    // No, Actions prop is for header.
    // Let's modify the wrapper to let us pass a function for actions that receives data?
    // OR: just let the Export button be inside the children area at the top?
    // OR: GovernedArtefactEditor could accept "getActions(data)" prop instead of static node.

    // Going with "getActions" pattern in the local component logic here:
    // We will render the ACTIONS inside the child function to have closure over `data`.
    // But the Wrapper puts actions in the header.

    // Alternative: We recreate the Export logic to read from `artefact` prop (which might be stale if not saved?)
    // No, user wants to export current state.

    // Let's adjust the implementation to put the Export button inside the form area OR 
    // pass a `actions={ (data) => ... }` function to GovernedArtefactEditor?
    // I will stick to putting the export button inside the main content area for now 
    // OR I will modify GovernedArtefactEditor to accept render-prop for actions.
    // Let's modify Wrapper in next step if generic, but for now let's just use the `artefact` prop 
    // for export (last saved state) as a fallback, or better:
    // We can define the Actions component *inside* the render prop and use a Portal? Too complex.

    // Simplest: Pass `actions` as a function `(data) => Node`. 
    // I need to update GovernedArtefactEditor first.
    // Wait, I can't easily update the previous file without a new tool call.
    // Let's assume I will update GovernedArtefactEditor to handle `typeof actions === 'function'`.

    // Actually, I'll just render the buttons inside the form at the top. The "Actions" prop of standard `ArtefactPage` 
    // puts them in the header.
    // Let's try to pass `actions` that *references* a ref we pass to the child?
    // const dataRef = useRef({})
    // <Wrapper actions={<ExportButton dataRef={dataRef}/>}>
    //   {({data}) => { dataRef.current = data; return <Form/> }}
    // </Wrapper>
    // This works.

    const dataRef = React.useRef({})

    const handleExport = () => {
        const content = dataRef.current
        // Simple HTML to Word export
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Project Initiation Request</title></head>
            <body>
            <h1>Project Initiation Request</h1>
        `

        sections.forEach(section => {
            htmlContent += `<h2>${section.title}</h2>`

            if (section.fields) {
                section.fields.forEach(field => {
                    htmlContent += `<p><strong>${field}:</strong> ${content[field] || ''}</p>`
                })
            } else {
                htmlContent += `<p>${(content[section.id] || '').replace(/\n/g, '<br>')}</p>`
            }
        })

        // Note: Approval is not in `content` here, it lives in Wrapper.
        // If we want to export approval, we need access to it.
        // The wrapper separates them.
        // If export needs approval, maybe Export should check `artefact.content.approval` (saved) 
        // or we need the wrapper to expose approval too.

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
                'Version': '1.0'
            }}
        >
            {({ data, handleContentChange }) => {
                // Update ref for export
                dataRef.current = data

                const renderField = (label, isTextArea = false, placeholder = '') => {
                    const isDate = label.includes('Date')
                    return (
                        <ArtefactField key={label} label={label}>
                            {isTextArea ? (
                                <ArtefactTextarea
                                    value={data[label] || ''}
                                    onChange={(e) => handleContentChange(label, e.target.value)}
                                    rows={4}
                                    placeholder={placeholder}
                                />
                            ) : (
                                <ArtefactInput
                                    type={isDate ? "date" : "text"}
                                    value={data[label] || ''}
                                    onChange={(e) => handleContentChange(label, e.target.value)}
                                />
                            )}
                        </ArtefactField>
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
                                {section.fields ? (
                                    section.type === 'multi-textarea' ? (
                                        section.fields.map(field => renderField(field, true, section.placeholders ? section.placeholders[field] : ''))
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {section.fields.map(field => renderField(field))}
                                        </div>
                                    )
                                ) : (
                                    <ArtefactField>
                                        <ArtefactTextarea
                                            value={data[section.id] || ''}
                                            onChange={(e) => handleContentChange(section.id, e.target.value)}
                                            rows={6}
                                            placeholder={section.placeholder}
                                            className="min-h-[150px]"
                                        />
                                    </ArtefactField>
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
