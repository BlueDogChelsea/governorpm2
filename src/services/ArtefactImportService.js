
const ARTEFACT_IDS = {
    ISI: 'initial-stakeholder-identification',
    PIR: 'project-initiation-request',
    BC: 'business-case'
}

/**
 * Service to handle data propagation between artefacts
 */
const ArtefactImportService = {

    /**
     * Check if there are available sources to import from for a given artefact
     * @param {string|number} projectId
     * @param {string} artefactId 
     * @returns {Promise<Array<{id: string, name: string}>>} List of available sources
     */
    getAvailableImports: async (projectId, artefactId) => {
        if (!window.electronAPI || !projectId) return []

        const available = []

        try {
            if (artefactId === ARTEFACT_IDS.PIR) {
                // Check for ISI
                // projects/${projectId}/initialStakeholders.json
                const isiExists = await window.electronAPI.checkFileExists(`projects/${projectId}/initialStakeholders.json`)
                if (isiExists) {
                    available.push({ id: ARTEFACT_IDS.ISI, name: 'Initial Stakeholder Identification' })
                }
            } else if (artefactId === ARTEFACT_IDS.BC) {
                // Check for PIR
                // We need to read artefacts.json to find the PIR and see if it has content
                const artefacts = await window.electronAPI.readJSON(`projects/${projectId}/artefacts.json`) || []
                const pir = artefacts.find(a => a.id === ARTEFACT_IDS.PIR)

                // Check if PIR has meaningful content (not just empty fields)
                if (pir && pir.content && Object.keys(pir.content).length > 2) {
                    // Simple heuristic: if it has content keys other than maybe just default empties
                    // Better check: check specific fields
                    const hasData = Object.values(pir.content).some(v => v && v !== '' && v !== '<p></p>')
                    if (hasData) {
                        available.push({ id: ARTEFACT_IDS.PIR, name: 'Project Initiation Request' })
                    }
                }
            }
        } catch (err) {
            console.error("Error checking for imports:", err)
        }

        return available
    },

    /**
     * Perform the import mapping
     * @param {string|number} projectId
     * @param {string} targetArtefactId 
     * @param {string} sourceId 
     * @param {Object} currentContent - The current content of the target (to avoid overwriting)
     * @param {boolean} overwrite - Whether to force overwrite
     * @returns {Promise<Object>} The new merged content
     */
    importData: async (projectId, targetArtefactId, sourceId, currentContent, overwrite = false) => {
        if (!window.electronAPI || !projectId) return currentContent

        let newContent = { ...currentContent }

        try {
            if (targetArtefactId === ARTEFACT_IDS.PIR && sourceId === ARTEFACT_IDS.ISI) {
                // Load ISI Data
                const isiData = await window.electronAPI.readJSON(`projects/${projectId}/initialStakeholders.json`)
                if (isiData) {
                    newContent = mapISIToPIR(isiData, newContent, overwrite)
                }
            } else if (targetArtefactId === ARTEFACT_IDS.BC && sourceId === ARTEFACT_IDS.PIR) {
                // Load PIR Data
                const artefacts = await window.electronAPI.readJSON(`projects/${projectId}/artefacts.json`) || []
                const pir = artefacts.find(a => a.id === ARTEFACT_IDS.PIR)
                if (pir && pir.content) {
                    newContent = mapPIRToBC(pir.content, newContent, overwrite)
                }
            }
        } catch (err) {
            console.error("Error importing data:", err)
            throw err
        }

        return newContent
    }
}

// -- Mapping Logic --

// Helper to safely merge fields
const mergeField = (target, key, value, overwrite) => {
    // If value is null/undefined/empty, don't import anything (unless we want to clear it? No, usually we import *data*)
    if (value === null || value === undefined || value === '') return

    // If target is empty, copy.
    // If target has value, only copy if overwrite is true.
    const targetValue = target[key]
    const isTargetEmpty = targetValue === undefined || targetValue === null || targetValue === '' || targetValue === '<p></p>'

    if (isTargetEmpty || overwrite) {
        target[key] = value
    }
}

const mapISIToPIR = (isi, target, overwrite) => {
    // Destination: Section 7 (Key Stakeholders) -> "Key Stakeholders"
    // Format as HTML list

    let html = ''

    const addStakeholder = (label, person) => {
        if (person && person.name) {
            html += `<p><strong>${label}:</strong> ${person.name}`
            if (person.organisation) html += ` (${person.organisation})`
            html += `</p>`
        }
    }

    addStakeholder('Project Owner', isi.projectOwner)
    addStakeholder('Business Manager', isi.businessManager)
    addStakeholder('Solution Provider', isi.solutionProvider)

    if (isi.additionalStakeholders && isi.additionalStakeholders.length > 0) {
        html += `<p><strong>Other Stakeholders:</strong></p><ul>`
        isi.additionalStakeholders.forEach(s => {
            html += `<li>${s.name}`
            const details = []
            if (s.role) details.push(s.role)
            if (s.organisation) details.push(s.organisation)
            if (details.length > 0) html += ` (${details.join(', ')})`
            html += `</li>`
        })
        html += `</ul>`
    }

    mergeField(target, 'Key Stakeholders', html, overwrite)
    return target
}

const mapPIRToBC = (pir, target, overwrite) => {
    // 1. Project Name
    mergeField(target, 'Project Name', pir['Project Name'], overwrite)

    // 2. Sections 2&3 (PIR) -> Current Situation / Problem (BC)
    // PIR: "Background / Context" -> BC: "Background / Context" (Assuming key matches or mapping needed)
    // Let's check keys based on Schema implies.
    // Assuming keys are typically the Label or close to it.
    // The prompt says: "Section 2 & 3 -> BC: Current Situation / Problem"

    // PIR Keys (inferred from prompt/usage):
    // "Background / Context"
    // "Problem / Need / Opportunity"

    // BC Keys:
    // "Background / Context" (?) -> Let's check BC Schema or Component
    // "Problem / Need / Opportunity" (?) 

    // Checking previous file dumps:
    // PIR has `projectInitiationRequestSchema`.
    // BC has `businessCaseSchema`.

    // I will assume keys match the prompt descriptions for now.
    // If keys defined in schema are slightly different, I might miss them.
    // However, the rule is "Map by field key". So if the keys match, it works.
    // Only where keys differ do we need explicit logic.

    // Prompt Mappings:

    // Direct Key Matches (Ideal):
    mergeField(target, 'Project Name', pir['Project Name'], overwrite)
    mergeField(target, 'Background / Context', pir['Background / Context'], overwrite)
    mergeField(target, 'Problem / Need / Opportunity', pir['Problem / Need / Opportunity'], overwrite)

    // Section 4 -> BC Expected Benefits
    // PIR: "Expected Benefits & Success Criteria"
    // BC: "Expected Benefits & Success Criteria" (Check if splitting needed? Prompt says Section 4 -> BC: Expected Benefits)
    mergeField(target, 'Expected Benefits & Success Criteria', pir['Expected Benefits & Success Criteria'], overwrite)

    // Section 5 -> BC Objectives / Scope
    // PIR: "Project Objectives", "In Scope", "Out of Scope"
    // BC: "Project Objectives", "In Scope", "Out of Scope"
    mergeField(target, 'Project Objectives', pir['Project Objectives'], overwrite)
    mergeField(target, 'In Scope', pir['In Scope'], overwrite)
    mergeField(target, 'Out of Scope', pir['Out of Scope'], overwrite)

    // Section 14 -> BC Strategic Alignment
    mergeField(target, 'Strategic Alignment', pir['Strategic Alignment'], overwrite)

    // Silent skipping for others.

    return target
}

export default ArtefactImportService
