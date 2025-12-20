
const ARTEFACT_IDS = {
    ISI: 'initial-stakeholder-identification',
    PIR: 'project-initiation-request',
    BC: 'business-case',
    CHARTER: 'projectCharter'
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
            // Check for ISI (Source for PIR)
            if (artefactId === ARTEFACT_IDS.PIR) {
                const data = await readSourceArtefact(projectId, ARTEFACT_IDS.ISI, `projects/${projectId}/initialStakeholders.json`)
                if (data) {
                    available.push({ id: ARTEFACT_IDS.ISI, name: 'Initial Stakeholder Identification' })
                }
            }

            // Check for PIR (Source for BC and Charter)
            if (artefactId === ARTEFACT_IDS.BC || artefactId === ARTEFACT_IDS.CHARTER) {
                const data = await readSourceArtefact(projectId, ARTEFACT_IDS.PIR, `projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (data) {
                    available.push({ id: ARTEFACT_IDS.PIR, name: 'Project Initiation Request' })
                }
            }

            // Check for Business Case (Source for Charter)
            if (artefactId === ARTEFACT_IDS.CHARTER) {
                const data = await readSourceArtefact(projectId, ARTEFACT_IDS.BC, `projects/${projectId}/artefacts/${ARTEFACT_IDS.BC}.json`)
                if (data) {
                    available.push({ id: ARTEFACT_IDS.BC, name: 'Business Case' })
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
            // Case 1: ISI -> PIR
            if (targetArtefactId === ARTEFACT_IDS.PIR && sourceId === ARTEFACT_IDS.ISI) {
                const sourceData = await readSourceArtefact(projectId, ARTEFACT_IDS.ISI, `projects/${projectId}/initialStakeholders.json`)
                if (sourceData) {
                    newContent = mapISIToPIR(sourceData, newContent, overwrite)
                }
            }

            // Case 2: PIR -> BC
            else if (targetArtefactId === ARTEFACT_IDS.BC && sourceId === ARTEFACT_IDS.PIR) {
                const sourceData = await readSourceArtefact(projectId, ARTEFACT_IDS.PIR, `projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (sourceData && sourceData.content) {
                    newContent = mapPIRToBC(sourceData.content, newContent, overwrite)
                }
            }

            // Case 3: PIR -> Charter
            else if (targetArtefactId === ARTEFACT_IDS.CHARTER && sourceId === ARTEFACT_IDS.PIR) {
                const sourceData = await readSourceArtefact(projectId, ARTEFACT_IDS.PIR, `projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (sourceData && sourceData.content) {
                    newContent = mapPIRToCharter(sourceData.content, newContent, overwrite)
                }
            }

            // Case 4: BC -> Charter
            else if (targetArtefactId === ARTEFACT_IDS.CHARTER && sourceId === ARTEFACT_IDS.BC) {
                const sourceData = await readSourceArtefact(projectId, ARTEFACT_IDS.BC, `projects/${projectId}/artefacts/${ARTEFACT_IDS.BC}.json`)
                if (sourceData && sourceData.content) {
                    newContent = mapBCToCharter(sourceData.content, newContent, overwrite)
                }
            }

        } catch (err) {
            console.error("Error importing data:", err)
            throw err
        }

        return newContent
    }
}

// -- Helpers --

/**
 * Reads artefact data from either a direct file (legacy/split) or the central artefacts.json (modern/monolithic)
 */
const readSourceArtefact = async (projectId, artefactId, legacyPath) => {
    if (!window.electronAPI) return null

    // 1. Try legacy/direct path
    try {
        const data = await window.electronAPI.readJSON(legacyPath)
        if (data) return data
    } catch (e) {
        // Continue to fallback
    }

    // 2. Try artefacts.json
    try {
        const artefacts = await window.electronAPI.readJSON(`projects/${projectId}/artefacts.json`)
        if (artefacts && Array.isArray(artefacts)) {
            // Special handling for ISI: ISI is NOT typically in artefacts.json, but check just in case specific ID matches?
            // Actually, for ISI, the ID is 'initial-stakeholder-identification'. 
            // If it's not there, find returns undefined.
            const art = artefacts.find(a => a.id === artefactId)
            if (art) return art
        }
    } catch (e) {
        console.warn(`Failed to read artefacts.json for project ${projectId}`, e)
    }

    return null
}

// -- Mapping Logic --

const mergeField = (target, key, value, overwrite) => {
    // Helper for robust empty check
    const isFieldContentEmpty = (val) => {
        if (val === null || val === undefined) return true
        if (typeof val === 'object') return Object.keys(val).length === 0
        const str = String(val)
        if (!str) return true

        if (typeof document !== 'undefined') {
            const div = document.createElement('div')
            div.innerHTML = str
            return div.textContent.trim().length === 0
        }
        return str.replace(/<[^>]*>/g, '').trim().length === 0
    }

    if (isFieldContentEmpty(value)) return

    const targetValue = target[key]
    const isTargetEmpty = isFieldContentEmpty(targetValue)

    if (isTargetEmpty || overwrite) {
        target[key] = value
    }
}

// 4.1 Identify Stakeholders -> PIR
const mapISIToPIR = (isi, target, overwrite) => {
    // 1. Key Stakeholders (Block) -> PIR.stakeholders
    // Formatted with newlines to ensure editor parsing treats it as block content
    let pieces = []

    // Add Project Owner
    if (isi.projectOwner && isi.projectOwner.name) {
        let label = 'Project Owner'
        let text = `${label}: ${isi.projectOwner.name}`
        if (isi.projectOwner.organisation) text += ` (${isi.projectOwner.organisation})`
        pieces.push(`<li><strong>${text}</strong></li>`)
    }

    // Add Business Manager
    if (isi.businessManager && isi.businessManager.name) {
        let label = 'Business Manager'
        let text = `${label}: ${isi.businessManager.name}`
        if (isi.businessManager.organisation) text += ` (${isi.businessManager.organisation})`
        pieces.push(`<li><strong>${text}</strong></li>`)
    }

    // Add Additional Stakeholders
    if (isi.additionalStakeholders && isi.additionalStakeholders.length > 0) {
        isi.additionalStakeholders.forEach(s => {
            let label = s.role || 'Stakeholder'
            let text = `${label}: ${s.name}`
            if (s.organisation) text += ` (${s.organisation})`
            pieces.push(`<li>${text}</li>`)
        })
    }

    if (pieces.length > 0) {
        // Wrap in UL without newlines to match editor behavior
        const html = `<ul>${pieces.join('')}</ul>`
        mergeField(target, 'stakeholders', html, overwrite)
    }

    // 2. Project Owner -> PIR.Project Owner
    if (isi.projectOwner && isi.projectOwner.name) {
        mergeField(target, 'Project Owner', isi.projectOwner.name, overwrite)
    }

    // 3. Business Manager -> PIR.Project Manager (if empty)
    if (isi.businessManager && isi.businessManager.name) {
        mergeField(target, 'Project Manager', isi.businessManager.name, overwrite)
    }

    return target
}

// 4.2 PIR → Business Case
const mapPIRToBC = (pir, target, overwrite) => {
    // 1. PIR.Problem -> BC "Current Situation / Problem"
    mergeField(target, 'Current Situation / Problem', pir['problem'], overwrite)

    // 2. PIR.ExpectedBenefits -> BC "Expected Benefits"
    mergeField(target, 'Expected Benefits', pir['benefits'], overwrite)

    // 3. PIR.Background -> BC "Business Justification"
    mergeField(target, 'Business Justification', pir['background'], overwrite)

    // 4. PIR.StrategicAlignment -> BC "Strategic Alignment"
    mergeField(target, 'Strategic Alignment', pir['alignment'], overwrite)

    // 5. PIR.Dependencies -> BC "Dependencies"
    mergeField(target, 'Dependencies', pir['dependencies'], overwrite)

    // 6. PIR.Scope (In + Out) -> BC "High-level Scope"
    const inScope = pir['In Scope'] || ''
    const outScope = pir['Out of Scope'] || ''

    let scopeText = ''
    if (inScope) scopeText += `<h3>In Scope</h3>${inScope}`
    if (outScope) scopeText += `<h3>Out of Scope</h3>${outScope}`

    if (scopeText) {
        mergeField(target, 'High-level Scope', scopeText, overwrite)
    }

    // Explicitly do NOT import other fields (Project Owner, Manager, Dates, etc)
    // The previous mapping for 'otherStakeholders' is removed as requested.

    return target
}

// 4.3 PIR → Project Charter
const mapPIRToCharter = (pir, target, overwrite) => {
    // PIR.ProjectObjectives -> Charter.Objectives (Target key: executiveSummary)
    mergeField(target, 'executiveSummary', pir['objectives'], overwrite)

    // PIR.Scope.In -> Charter.ProjectScope (Target key: 'scopeIn')
    mergeField(target, 'scopeIn', pir['In Scope'], overwrite)

    // PIR.KeyStakeholders -> Charter.ProjectOrganisation (Target key: rolesResponsibilities)
    mergeField(target, 'rolesResponsibilities', pir['stakeholders'], overwrite)

    return target
}

// 4.4 Business Case → Charter
const mapBCToCharter = (bc, target, overwrite) => {
    // BC.BusinessJustification -> Charter.Justification (Target key: 'businessCaseConsiderations')
    mergeField(target, 'businessCaseConsiderations', bc['Business Justification'], overwrite)

    // BC.MajorMilestones -> Charter.HighLevelRoadmap
    // Skip complex table mapping for now to avoid breaking UI.

    // BC.SuccessCriteria -> Charter.SuccessCriteria (Target key: 'successCriteria')
    mergeField(target, 'successCriteria', bc['Critical Success Criteria'], overwrite)

    return target
}

export default ArtefactImportService
