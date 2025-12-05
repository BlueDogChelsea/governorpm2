import { useState, useEffect, useRef } from 'react'

export const useArtefactSave = (content, onSave, artefact) => {
    const [saveStatus, setSaveStatus] = useState('idle') // idle, saving, success, error
    const [isDirty, setIsDirty] = useState(false)
    const initialContentRef = useRef(null)

    // Update initial content ref when content is first loaded or successfully saved
    useEffect(() => {
        // Initialize ref if empty or if save was successful (re-baseline)
        if (content && (initialContentRef.current === null || saveStatus === 'success')) {
            // Only initialize if we actually have content to snapshot
            // For many artefacts, content might start empty or undefined
            if (Object.keys(content).length > 0 || (Array.isArray(content) && content.length > 0)) {
                // If we haven't initialized yet, OR if we just saved successfully, update the baseline
                if (initialContentRef.current === null || saveStatus === 'success') {
                    initialContentRef.current = JSON.parse(JSON.stringify(content))
                    setIsDirty(false)
                }
            }
        }
    }, [content, saveStatus])

    // Specific effect for initial load of artefact to set baseline if not set
    useEffect(() => {
        if (artefact && artefact.content && initialContentRef.current === null) {
            initialContentRef.current = JSON.parse(JSON.stringify(artefact.content))
        }
    }, [artefact])

    // Check for changes
    useEffect(() => {
        if (initialContentRef.current) {
            const currentString = JSON.stringify(content)
            const initialString = JSON.stringify(initialContentRef.current)
            setIsDirty(currentString !== initialString)
        }
    }, [content])

    const executeSave = async (prepareDataFn = null, force = false) => {
        if (!force && !isDirty && saveStatus !== 'error') return

        setSaveStatus('saving')

        try {
            // Allow component to shape the data before saving
            // If no function provided, use content directly
            const dataToSave = prepareDataFn ? prepareDataFn(content) : { content }
            const finalContent = dataToSave.content || content

            // --- Unified Status Logic ---
            // If dataToSave already contains status/modifiedAfterApproval, use them.
            // Otherwise, calculate them locally (legacy behavior).
            let status = dataToSave.status || 'Not Started'
            let modifiedAfterApproval = dataToSave.modifiedAfterApproval !== undefined ? dataToSave.modifiedAfterApproval : false

            if (!dataToSave.status) {
                // Legacy Logic: Calculate internal status if not provided by caller
                // 1. Check for Approval State
                const approval = finalContent.approval
                const isApproved = approval && approval.isApproved

                // 2. Determine "Fresh Approval" vs "Modification"
                const initialApproval = initialContentRef.current ? initialContentRef.current.approval : null
                const currentTimestamp = approval ? approval.timestamp : null
                const initialTimestamp = initialApproval ? initialApproval.timestamp : null

                // Helper to check if content exists (for Not Started vs In Progress)
                const hasContent = (obj) => {
                    if (!obj) return false
                    if (obj.answers && Object.keys(obj.answers).length > 0) return true // Checklist style
                    if (Object.keys(obj).length > 0 && !obj.answers) return true // PIR style (flat)
                    return false
                }

                if (isApproved) {
                    status = 'Approved'

                    // If timestamp changed (or is new), it's a fresh approval -> not modified
                    if (currentTimestamp !== initialTimestamp) {
                        modifiedAfterApproval = false
                    }
                    // If timestamp is same, but content is dirty -> modified
                    else if (isDirty || artefact?.modifiedAfterApproval) {
                        modifiedAfterApproval = true
                    }
                } else {
                    // Not approved
                    status = hasContent(finalContent) ? 'In Progress' : 'Not Started'
                    modifiedAfterApproval = false
                }
            }

            await onSave({
                ...artefact,
                ...dataToSave,
                status,
                modifiedAfterApproval,
                lastUpdated: new Date().toISOString()
            })

            setSaveStatus('success')

            // Update baseline after successful save
            initialContentRef.current = JSON.parse(JSON.stringify(finalContent))
            setIsDirty(false)

            // Reset to idle after 1.5s
            setTimeout(() => {
                setSaveStatus('idle')
            }, 1500)

        } catch (error) {
            console.error("Save failed:", error)
            setSaveStatus('error')
        }
    }

    return {
        saveStatus,
        isDirty,
        executeSave
    }
}
