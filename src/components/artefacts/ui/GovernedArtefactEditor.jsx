import React, { useState, useEffect, useRef } from 'react'
import { ExclamationTriangleIcon, XMarkIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline'
import ArtefactImportService from '../../../services/ArtefactImportService'
import ArtefactPage from './ArtefactPage'
import ArtefactSaveButton from './ArtefactSaveButton'
import ArtefactApprovalSection from './ArtefactApprovalSection'
import { useArtefactSave } from '../hooks/useArtefactSave'

/**
 * GovernedArtefactEditor
 * 
 * A wrapper component that enforces standard governance behavior for artefacts.
 * It handles:
 * - Approval Section rendering and state
 * - Post-approval "Soft Lock" behavior (Banner + Modified Status)
 * - Automatic status calculation (Not Started, In Progress, Approved, Approved - Modified)
 * - Saving logic
 * 
 * @param {Object} artefact The artefact object from App.jsx
 * @param {Function} onSave Global save handler
 * @param {Function} onBack Back navigation handler
 * @param {string} title Artefact Title
 * @param {string} description Artefact Description
 * @param {React.ReactNode} actions Custom actions (like Export, Guidance) to Add to the header
 * @param {Function} children Render prop or child component for the actual form content. Receives { data, onDataChange }
 * @param {Object} initialData Default structure for the content (excluding approval)
 */
const GovernedArtefactEditor = ({
    projectId,
    artefact,
    onSave,
    onBack,
    title,
    description,
    actions,
    children,
    initialData = {},

    processLoadedContent,
    customApproval = false, // New prop to control approval section placement
    hideGlobalSave = false, // New prop to conditionally hide the global save button
    fullWidth = false // New prop to remove max-width constraint
}) => {
    // Top-level state for the *Content* of the artefact (excluding approval)
    const [contentData, setContentData] = useState(initialData)

    // Import Logic State
    const [importPromptShown, setImportPromptShown] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false) // For Conflict/Choice (Case C)
    const [showNoImportsModal, setShowNoImportsModal] = useState(false) // For No Upstream (Case A)
    const [showApprovedWarningModal, setShowApprovedWarningModal] = useState(false) // For Approved (Case D)

    // Tracks which sources are available
    const [importCandidates, setImportCandidates] = useState([])

    // Top-level state for *Approval*
    const [approval, setApproval] = useState({
        approverName: '',
        approvalDate: '',
        signature: '',
        isApproved: false,
        timestamp: null
    })

    const [isApprovalOpen, setIsApprovalOpen] = useState(true)
    const [showModifiedBanner, setShowModifiedBanner] = useState(false)

    // We need a baseline to detect if content has changed since approval
    // This is separate from the "dirty check" for saving. 
    // This is for the "Modified after Approval" logic.
    const approvedSnapshot = useRef(null)

    // Load initial data
    useEffect(() => {
        console.log('GovernedArtefactEditor: Syncing artefact prop:', artefact)
        if (artefact && artefact.content) {
            const { approval: savedApproval, ...restContent } = artefact.content

            // 1. Load Content
            // Merge with initialData to ensure structure exists
            let mergedContent = { ...initialData, ...(restContent || {}) }
            console.log('GovernedArtefactEditor: Merged Content Keys:', Object.keys(mergedContent))

            // NORMALIZE: Ensure any legacy rich text values of "<p></p>" are converted to ""
            // This prevents an immediate false dirty state when the RichTexEditor component mounts (which auto-normalizes)
            Object.keys(mergedContent).forEach(key => {
                if (mergedContent[key] === '<p></p>') {
                    mergedContent[key] = ''
                }
            })

            // Allow parent to process/cleanup content (e.g. legacy data migration)
            if (processLoadedContent) {
                mergedContent = processLoadedContent(mergedContent)
            }

            setContentData(mergedContent)

            // 2. Load Approval
            let currentApproval = { ...approval }
            if (savedApproval) {
                setApproval(savedApproval)
                currentApproval = savedApproval

                // If it IS approved, we snapshot the content *as loaded*.
                // Because if it's loaded as Approved, it means it was clean when saved.
                // However, we also rely on the stored `modifiedAfterApproval` flag.
                if (savedApproval.isApproved) {
                    approvedSnapshot.current = JSON.stringify(mergedContent)
                }
            }

            // 3. Reset Dirty Check Baseline
            // We must explicitly tell the hook that this merged state is the "clean" state
            // to prevent "false dirty" flags due to initialData filling in missing fields.
            if (resetBaseline) {
                resetBaseline({ ...mergedContent, approval: currentApproval })
            }

            // 4. Banner Logic
            // If the persisted status says it's modified, show the banner
            // We rely on the wrapper's logic to maintain this truth.
            if (artefact.status === 'Approved' && artefact.modifiedAfterApproval) {
                setShowModifiedBanner(true)
            } else {
                setShowModifiedBanner(false)
            }
        } else {
            // New Artefact
            setContentData(initialData)
        }

        if (artefact) {
            setImportPromptShown(artefact.importPromptShown || false)
        }
    }, [artefact])

    // -- Import Logic --
    // Only fetch candidates when projectId/artefactId matches
    useEffect(() => {
        const fetchCandidates = async () => {
            if (!artefact || !projectId) return
            const candidates = await ArtefactImportService.getAvailableImports(projectId, artefact.id)
            setImportCandidates(candidates)
        }
        fetchCandidates()
    }, [artefact?.id, projectId])

    const handleImportButtonClick = async () => {
        const candidates = importCandidates

        // Case A: No upstream artefacts
        if (candidates.length === 0) {
            setShowNoImportsModal(true)
            return
        }

        // We assume we import from ALL available candidates sequentially 
        // to support PIR+BC combining into Charter.
        startImportFlow(candidates)
    }

    const startImportFlow = (candidates) => {
        // Exclude system fields (Version is the main culprit for false positives)
        const ignoredKeys = ['Version', 'Date', 'Project Owner', 'Project Manager', 'Project Name', 'approval']

        // Robust check for meaningful content
        const hasExistingData = Object.entries(contentData).some(([key, value]) => {
            if (ignoredKeys.includes(key)) return false
            if (value === null || value === undefined) return false

            if (typeof value === 'object') return Object.keys(value).length > 0

            const str = String(value)
            if (!str) return false

            // DOM-based comparison to ignore HTML tags and entities
            if (typeof document !== 'undefined') {
                const temp = document.createElement('div')
                temp.innerHTML = str
                return temp.textContent.trim().length > 0
            }
            return str.replace(/<[^>]*>/g, '').trim().length > 0
        })

        const isApproved = approval.isApproved

        if (!hasExistingData) {
            // Case B: Empty target -> Populate Immediately
            executeImport(candidates, false) // No overwrite needed (it's empty)
        } else {
            // Case C & D: Target has data
            if (isApproved) {
                setShowApprovedWarningModal(true)
            } else {
                setShowImportModal(true) // Case C generic
            }
        }
    }

    const executeImport = async (candidates, overwrite) => {
        try {
            let newContent = { ...contentData }

            // Iterate all candidates and merge
            for (const candidate of candidates) {
                newContent = await ArtefactImportService.importData(projectId, artefact.id, candidate.id, newContent, overwrite)
            }

            // Update Content
            setContentData(newContent)

            // Post Import Behavior
            // Autosave is required "Autosave the imported data".

            // Note: We construct dataToSave to bypass stale closure on `contentData`
            // But we must use the new `newContent` we just created.

            // Calculate Status Logic:
            // "Mark status as In Progress (if previously Not Started)"
            // "If Approved → switch to Approved — Modified"

            let newStatus = approval.isApproved ? 'Approved' : 'In Progress'
            let newModified = approval.isApproved ? true : false

            const dataToSave = {
                content: { ...newContent, approval },
                status: newStatus,
                modifiedAfterApproval: newModified,
                importPromptShown: true
            }

            // Use hook's executeSave with forced update function
            await hookExecuteSave(() => dataToSave, true)

            // Close Modals
            setShowImportModal(false)
            setShowApprovedWarningModal(false)

            // Note: Since we saved, saveStatus will eventually show "Saved" / Success icon in the UI.

        } catch (error) {
            console.error("Import failed", error)
            alert("Failed to import data.")
        }
    }

    // -- Governance Logic --

    const handleContentChange = (field, value) => {
        setContentData(prev => ({ ...prev, [field]: value }))
    }

    // Helper for children that might use detailed structure (like checklist answers)
    // We allow passing a full object update or field/value
    const updateContent = (update) => {
        if (typeof update === 'function') {
            setContentData(prev => update(prev))
        } else {
            // Assume object merge
            setContentData(prev => ({ ...prev, ...update }))
        }
    }

    const handleApprovalChange = (field, value) => {
        setApproval(prev => ({ ...prev, [field]: value }))
    }

    const toggleApproval = () => {
        // Calculate based on current state variables
        const newIsApproved = !approval.isApproved
        // Note: isReapproval logic is handled in handleApprovalToggle, 
        // this function is primarily for the state update part of a standard toggle.

        let newTimestamp = null

        if (newIsApproved) {
            newTimestamp = new Date().toISOString()
            // Side effects can run here because we are in an event handler (or called by one)
            approvedSnapshot.current = JSON.stringify(contentData)
            setShowModifiedBanner(false)
        } else {
            approvedSnapshot.current = null
            setShowModifiedBanner(false)
        }

        setApproval(prev => ({
            ...prev,
            isApproved: newIsApproved,
            timestamp: newTimestamp
        }))
    }

    // Wrapper for the toggle action to handle the async auto-save for re-approval
    const handleApprovalToggle = async () => {
        const isReapproval = approval.isApproved && showModifiedBanner

        // 1. Update Local State (Optimistic)
        let newApprovalState = { ...approval }

        if (isReapproval) {
            // RE-APPROVE FLOW
            newApprovalState.timestamp = new Date().toISOString()

            setApproval(newApprovalState)
            approvedSnapshot.current = JSON.stringify(contentData)
            setShowModifiedBanner(false)

            // 2. Auto-Save immediately
            const dataToSave = {
                content: { ...contentData, approval: newApprovalState },
                status: 'Approved',
                modifiedAfterApproval: false
            }

            hookExecuteSave(() => dataToSave, true)

        } else {
            // STANDARD TOGGLE FLOW
            const newIsApproved = !approval.isApproved
            if (newIsApproved) {
                // APPROVING
                newApprovalState.isApproved = true
                newApprovalState.timestamp = new Date().toISOString()

                setApproval(newApprovalState)
                approvedSnapshot.current = JSON.stringify(contentData)
                setShowModifiedBanner(false)

                const dataToSave = {
                    content: { ...contentData, approval: newApprovalState },
                    status: 'Approved',
                    modifiedAfterApproval: false
                }
                hookExecuteSave(() => dataToSave, true)

            } else {
                // REVOKING
                toggleApproval()
            }
        }
    }

    // -- Saving Logic --

    // Prepare full object for the Hook
    const fullContent = { ...contentData, approval }

    // Use the hook primarily for "Dirty Checking" and "Saving State" (loading/error/success)
    // BUT we will override the executeSave to inject our custom Status Logic
    const { saveStatus, isDirty, executeSave: hookExecuteSave, resetBaseline } = useArtefactSave(fullContent, onSave, artefact)

    const handleSave = () => {
        hookExecuteSave(() => {
            // This function runs inside executeSave
            // We calculate the exact status string to enforce the requirement

            let status = 'Not Started'
            let modifiedAfterApproval = false

            // Helper to check for real content
            const hasContent = (data) => {
                if (!data) return false
                if (Object.keys(data).length === 0) return false
                // Check if values are non-empty
                const hasValues = Object.values(data).some(v => {
                    if (v === null || v === undefined) return false
                    if (typeof v === 'object' && v !== null) {
                        // For nested like answers
                        if (v.answer && v.answer !== 'No') return true // Example for checklist
                        return Object.keys(v).length > 0
                    }
                    // For strings (including rich text), strip HTML and whitespace
                    const stripped = String(v).replace(/<[^>]*>/g, '').trim()
                    return stripped.length > 0
                })
                return hasValues
            }

            if (approval.isApproved) {
                status = 'Approved'

                // -- modification detection --
                // 1. If we just toggled approval ON in this session (timestamp different from loaded), it's clean.
                // 2. If it was already approved, did content change vs snapshot?

                const currentContentStr = JSON.stringify(contentData)

                // If we have a snapshot (meaning it was approved previously or just now), compare
                if (approvedSnapshot.current && currentContentStr !== approvedSnapshot.current) {
                    // It changed!
                    modifiedAfterApproval = true
                } else {
                    // It matches the snapshot
                    modifiedAfterApproval = false
                }
            } else {
                status = hasContent(contentData) ? 'In Progress' : 'Not Started'
                modifiedAfterApproval = false
            }

            return {
                ...artefact,
                content: fullContent,
                status,
                modifiedAfterApproval,
                importPromptShown // Persist this flag
            }
        })
    }

    // Effect to update banner visibility after save (based on returned/updated artefact prop)
    useEffect(() => {
        if (artefact?.status === 'Approved' && artefact?.modifiedAfterApproval) {
            setShowModifiedBanner(true)
        } else {
            setShowModifiedBanner(false)
        }
    }, [artefact])


    const [showExitModal, setShowExitModal] = useState(false)

    const handleBack = () => {
        if (isDirty) {
            setShowExitModal(true)
        } else {
            onBack()
        }
    }

    return (
        <>
            <ArtefactPage
                title={title}
                description={description}
                onBack={handleBack}
                fullWidth={fullWidth}
                actions={
                    <>
                        {/* Import Button */}
                        <button
                            onClick={handleImportButtonClick}
                            className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 mr-2 transition-colors shadow-sm"
                            title="Import data from earlier steps"
                        >
                            <ArrowDownOnSquareIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Import data from earlier steps
                        </button>

                        {actions}
                        {!hideGlobalSave && (
                            <ArtefactSaveButton
                                onSave={handleSave}
                                status={saveStatus}
                                isDirty={isDirty}
                                label="Artefact"
                            />
                        )}
                    </>
                }
                banner={showModifiedBanner && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md shadow-sm relative">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-medium">This artefact was previously approved.</span>{' '}
                                    You have made changes. If they are material, update the approval section.
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowModifiedBanner(false)}
                                        className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            >
                <div className="space-y-8">
                    {/* Content Injection */}
                    {children && (typeof children === 'function'
                        ? children({
                            data: contentData,
                            onDataChange: updateContent,
                            handleContentChange,
                            // Pass approval props for custom placement
                            approval,
                            onUpdateApproval: handleApprovalChange,
                            onToggleApproval: handleApprovalToggle,
                            isApprovalOpen,
                            setIsApprovalOpen: (val) => setIsApprovalOpen(val)
                        })
                        : React.cloneElement(children, { data: contentData, onDataChange: updateContent, handleContentChange })
                    )}

                    {/* Standard Approval Section (only if not handled by child) */}
                    {!customApproval && (
                        <ArtefactApprovalSection
                            approvalState={approval}
                            onUpdate={handleApprovalChange}
                            onToggleApproval={handleApprovalToggle}
                            isOpen={isApprovalOpen}
                            onToggle={() => setIsApprovalOpen(!isApprovalOpen)}
                            isModified={showModifiedBanner}
                        />
                    )}
                </div>
            </ArtefactPage>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
                        <p className="text-gray-500 mb-6">You have unsaved changes. Are you sure you want to leave without saving?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Leave Without Saving
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Case A: No Imports Modal */}
            {showNoImportsModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Data</h3>
                        <p className="text-gray-600 mb-6">
                            No earlier artefacts found in this project.
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowNoImportsModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Case C: Import Options Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Data</h3>
                        <p className="text-gray-600 mb-6">
                            Some fields already contain information. <br />
                            How would you like to import data?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeImport(importCandidates, false)}
                                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                            >
                                Fill Empty Fields Only
                            </button>
                            <button
                                onClick={() => executeImport(importCandidates, true)}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                            >
                                Overwrite All Fields
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Case D: Approved Warning Modal */}
            {showApprovedWarningModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-6 border-l-4 border-l-yellow-400">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Import Data</h3>
                                <p className="text-gray-600 text-sm">
                                    This artefact is approved. Importing data will place it into “Approved — Modified”.
                                    <br /><br />
                                    Some fields already contain information. How would you like to proceed?
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowApprovedWarningModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeImport(importCandidates, false)}
                                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                            >
                                Fill Empty Only
                            </button>
                            <button
                                onClick={() => executeImport(importCandidates, true)}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                            >
                                Overwrite All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default GovernedArtefactEditor
