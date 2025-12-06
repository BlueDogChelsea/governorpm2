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
    processLoadedContent

}) => {
    // Top-level state for the *Content* of the artefact (excluding approval)
    const [contentData, setContentData] = useState(initialData)

    // Import Logic State
    const [importPromptShown, setImportPromptShown] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [showManualImport, setShowManualImport] = useState(false)
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
        if (artefact && artefact.content) {
            const { approval: savedApproval, ...restContent } = artefact.content

            // 1. Load Content
            // Merge with initialData to ensure structure exists
            let mergedContent = { ...initialData, ...(restContent || {}) }

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
    useEffect(() => {
        const checkImports = async () => {
            if (!artefact || !artefact.id) return
            // Wait for projectId to be available
            if (!projectId && projectId !== 0) return

            // 1. Should we prompt?
            // Only if NOT prompted before and status is Not Started (clean)
            // And we verify content is actually empty (apart from maybe initialData structure)
            if (artefact.importPromptShown) return
            if (artefact.status !== 'Not Started') return

            // Check if we have candidates
            const candidates = await ArtefactImportService.getAvailableImports(projectId, artefact.id)
            if (candidates.length > 0) {
                setImportCandidates(candidates)
                setShowImportModal(true)
            }
        }
        checkImports()
    }, [artefact?.id, projectId]) // Run when ID loads or project ID updates

    const handleImport = async (sourceId, overwrite = false) => {
        if (!sourceId) return

        try {
            const newContent = await ArtefactImportService.importData(projectId, artefact.id, sourceId, contentData, overwrite)

            // Update Content
            setContentData(newContent)

            // Update Flags
            setImportPromptShown(true)
            setShowImportModal(false)
            setShowManualImport(false)

            // Note: isDirty will naturally become true via useEffect on contentData change
        } catch (error) {
            console.error("Import failed", error)
            alert("Failed to import data.")
        }
    }

    const handleDeclineImport = () => {
        setImportPromptShown(true)
        setShowImportModal(false)

        // Persist the flag immediately so we don't prompt again even if they don't save content
        // We create a shallow copy with the flag updated and save it
        if (onSave) {
            // We use the raw artefact + flag. We don't want to save "content" if they didn't touch it?
            // Actually, if we just update the flag, we should probably save the whole state as it is.
            const updatedArtefact = {
                ...artefact,
                importPromptShown: true
            }
            onSave(updatedArtefact)
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
            // Keep existing name/signature/date unless we want to force update?
            // Requirement: "Update the approval section (approver name, date, signature)" -> implies keeps current input
            // But usually implies updating the *timestamp* of approval. 
            // The prompt says "Update the approval section" -> likely means commit the values.

            setApproval(newApprovalState)
            approvedSnapshot.current = JSON.stringify(contentData)
            setShowModifiedBanner(false)

            // 2. Auto-Save immediately
            // We need to pass the NEW state to the save function because state updates are async
            // Hook's executeSave uses `content` from closure, which might be stale if we just set it.
            // But `handleSave` uses `hookExecuteSave` which uses `fullContent`...
            // `fullContent` depends on `approval` state.
            // We need to bypass the stale state issue.
            // `useArtefactSave` takes `content` as argument.
            // We can pass the new content to `executeSave`'s `prepareDataFn` but that's for *modification*.

            // Fix: We'll construct the data to save explicitly
            const dataToSave = {
                content: { ...contentData, approval: newApprovalState },
                status: 'Approved',
                modifiedAfterApproval: false
            }

            // Call the raw onSave from props directly?
            // Or use hook? Hook handles "saving" status.
            // Hook `executeSave` allows `prepareDataFn`. 
            // `prepareDataFn` receives `content` (stale). We can just ignore it and return our new data.

            // We need to access `hookExecuteSave`.
            hookExecuteSave(() => dataToSave, true)

        } else {
            // STANDARD TOGGLE FLOW (Mark Approved / Unmark)
            toggleApproval()
            // Standard flow doesn't auto-save per requirement (only re-approve does explicitly), 
            // but usually "Mark as Approved" implies saving? 
            // Requirement 5: "The same auto-save on approval". 
            // So YES, we should auto-save on ANY approval.

            // Let's unify.
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
                // REVOKING (User unchecked)
                // Just update state, let them click save? Or auto-save?
                // "Approval action should be a single click" -> implies the positive action.
                // Unchecking usually requires manual save or auto-save.
                // Let's stick to state update for unchecking to be safe, or consistency?
                // Let's just do state update for revocation.
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
                    if (typeof v === 'object' && v !== null) {
                        // For nested like answers
                        if (v.answer && v.answer !== 'No') return true // Example for checklist
                        return Object.keys(v).length > 0
                    }
                    return v && v !== ''
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
                actions={
                    <>
                        <button
                            onClick={async () => {
                                const candidates = await ArtefactImportService.getAvailableImports(projectId, artefact.id)
                                setImportCandidates(candidates)
                                setShowManualImport(true)
                            }}
                            className="text-gray-500 hover:text-blue-600 transition-colors mr-2 p-2 rounded-full hover:bg-gray-100"
                            title="Import Data..."
                        >
                            <ArrowDownOnSquareIcon className="h-5 w-5" />
                        </button>
                        {actions}
                        <ArtefactSaveButton
                            onSave={handleSave}
                            status={saveStatus}
                            isDirty={isDirty}
                            label="Artefact"
                        />
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
                        ? children({ data: contentData, onDataChange: updateContent, handleContentChange })
                        : React.cloneElement(children, { data: contentData, onDataChange: updateContent, handleContentChange })
                    )}

                    {/* Standard Approval Section */}
                    <ArtefactApprovalSection
                        approvalState={approval}
                        onUpdate={handleApprovalChange}
                        onToggleApproval={handleApprovalToggle}
                        isOpen={isApprovalOpen}
                        onToggle={() => setIsApprovalOpen(!isApprovalOpen)}
                        isModified={showModifiedBanner}
                    />
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


            {/* Initial Import Prompt Modal */}
            {
                showImportModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-Fill This Artefact?</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Governor can pre-fill this artefact using information from earlier lifecycle artefacts (e.g., {importCandidates.map(c => c.name).join(', ')}).
                                <br /><br />
                                Would you like to import available information?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleDeclineImport}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    No, Start Blank
                                </button>
                                <button
                                    onClick={() => handleImport(importCandidates[0]?.id)} // Default to first available
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Yes, Pre-Fill
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Manual Import Modal */}
            {
                showManualImport && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
                                <button onClick={() => setShowManualImport(false)} className="text-gray-400 hover:text-gray-500">
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            {importCandidates.length === 0 ? (
                                <p className="text-gray-500 mb-6">No previous artefacts found to import from.</p>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">Select source to import from:</p>
                                    <select id="importSource" className="w-full border-gray-300 rounded-md shadow-sm">
                                        {importCandidates.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>

                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600 mb-2">Import options:</p>
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => {
                                                    const select = document.getElementById('importSource')
                                                    handleImport(select.value, false) // Default: Do not overwrite
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                                            >
                                                Import Missing Only
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to overwrite matching fields? Existing data will be replaced.")) {
                                                        const select = document.getElementById('importSource')
                                                        handleImport(select.value, true)
                                                    }
                                                }}
                                                className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                            >
                                                Overwrite All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default GovernedArtefactEditor
