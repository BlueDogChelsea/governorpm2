import React, { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, BookOpenIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import ArtefactSection from './ui/ArtefactSection'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from './ui/ArtefactFields'
import RichTextEditor from './ui/RichTextEditor'
import DocumentPreviewModal from './ui/DocumentPreviewModal'
import { projectInitiationRequestSchema } from '../../data/schemas/ProjectInitiationRequestSchema'
import DocumentGenerator from '../../services/DocumentGenerator'
import pirTemplate from '../../templates/PIRTemplate.json'
import { ProjectService } from '../../services/ProjectService'
import WizardStepper from '../ui/WizardStepper'
import ArtefactApprovalSection from './ui/ArtefactApprovalSection'

// Map schema sections effectively 1-to-1 to wizard steps + Approval
const wizardSteps = [
    // 1-14 match schema sections by index approximately
    ...projectInitiationRequestSchema.map((item, index) => ({
        id: index,
        name: item.title.replace(/^\d+\.\s*/, ''), // Remove numbering for cleaner tabs
        schemaId: item.id
    })),
    // 15th step
    { id: 14, name: 'Approval', schemaId: 'approval' }
]

const ProjectInitiationRequest = ({ projectId, artefact, onSave, onBack, onOpenGuidance }) => {
    // Schema is ordered array
    const sections = projectInitiationRequestSchema

    const [showExportMenu, setShowExportMenu] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    // Wizard State
    // Persist position in sessionStorage
    const [currentStep, setCurrentStep] = useState(() => {
        if (!projectId) return 0
        const savedStep = sessionStorage.getItem(`pir_wizard_step_${projectId}`)
        return savedStep ? parseInt(savedStep, 10) : 0
    })

    // Persist current step
    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem(`pir_wizard_step_${projectId}`, currentStep)
        }
    }, [currentStep, projectId])

    const dataRef = React.useRef({})

    const handleExport = async (format) => {
        setShowExportMenu(false)
        const content = dataRef.current

        if (format === 'html') {
            const html = await DocumentGenerator.generateDocument(
                { ...content, projectName: ProjectService.getActiveProject()?.name },
                sections,
                pirTemplate,
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
                pirTemplate,
                format,
                `PIR_${projName}_v${content['Version'] || '1.0'}`
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

    const processLoadedContent = (content) => {
        const { 'Project Name': _, ...rest } = content || {}
        return rest
    }

    // Scroll top on step change
    useEffect(() => {
        // const mainContainer = document.querySelector('main > div') // Helper to find scroll container if needed
        // if (mainContainer) mainContainer.scrollTo(0, 0)
    }, [currentStep])


    return (
        <>
            <GovernedArtefactEditor
                projectId={projectId}
                artefact={artefact}
                onSave={onSave}
                onBack={onBack}
                title="Project Initiation Request"
                description="Define the project foundation (PM² Template)"
                actions={<CustomActions />}
                initialData={initialData}
                processLoadedContent={processLoadedContent}
                customApproval={true} // Enable custom approval rendering
            >
                {({
                    data,
                    handleContentChange,
                    approval,
                    onUpdateApproval,
                    onToggleApproval,
                    isApprovalOpen,
                    setIsApprovalOpen
                }) => {
                    // Update ref for export
                    dataRef.current = data
                    const projectName = ProjectService.getActiveProject()?.name || 'Loading...'

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

                    // Get current Schema Section
                    const isApprovalStep = currentStep === 14
                    const currentSchemaSection = !isApprovalStep ? sections[currentStep] : null

                    return (
                        <div className="flex flex-col min-h-[600px]">
                            {/* Sticky Stepper */}
                            <div className="sticky top-0 bg-white z-20 pb-4 mb-4 border-b border-gray-100 -mx-4 px-4">
                                <WizardStepper
                                    steps={wizardSteps}
                                    currentStep={currentStep}
                                    onStepClick={setCurrentStep}
                                />
                            </div>

                            {/* Main Content Area */}
                            <div className="space-y-8 flex-1">

                                {/* Always show Project Name on Step 0 or globally? Let's show globally for context or Step 0 only? 
                                    User said "similar ui to that implemented for Initial Stakeholder Identification".
                                    ISI doesn't show Project Name in form body, but PIR used to. 
                                    Let's keep it in Step 0 (Project Information).
                                */}
                                {currentStep === 0 && (
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
                                )}

                                {isApprovalStep ? (
                                    <div className="max-w-4xl mx-auto pt-6">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Artefact Approval</h3>
                                        <ArtefactApprovalSection
                                            approvalState={approval}
                                            onUpdate={onUpdateApproval}
                                            onToggleApproval={onToggleApproval}
                                            isOpen={true} // Always open in this step
                                            onToggle={() => { }} // Disable toggle
                                            isModified={false} // Banner is handled globally
                                        />
                                    </div>
                                ) : (
                                    /* Render Standard Schema Section */
                                    <div className="max-w-4xl mx-auto">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">{currentSchemaSection.title}</h3>
                                        {currentSchemaSection.fields && currentSchemaSection.fields[0].placeholder ? (
                                            <p className="text-sm text-gray-500 mb-6">{currentSchemaSection.fields[0].placeholder.split('...')[0]}...</p>
                                        ) : null}

                                        <div className="space-y-6 bg-white rounded-lg p-1">
                                            {currentSchemaSection.fields.map(fieldObj => {
                                                const { key, label, type, placeholder } = fieldObj
                                                if (type === 'richtext') return renderRichText(key, label || null, placeholder)
                                                if (type === 'textarea') return renderTextArea(key, label, placeholder)
                                                if (type === 'date') return renderInput(key, label || 'Date', 'date')
                                                return renderInput(key, label || key, 'text')
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Navigation */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                                <button
                                    onClick={() => {
                                        if (currentStep > 0) setCurrentStep(prev => prev - 1)
                                        else onBack()
                                    }}
                                    className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                >
                                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                    {currentStep === 0 ? 'Back to Menu' : 'Back'}
                                </button>

                                {currentStep < wizardSteps.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentStep(prev => prev + 1)}
                                        className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4 ml-2" />
                                    </button>
                                ) : null}
                            </div>
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
