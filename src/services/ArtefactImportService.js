
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
                // ISI is stored at project root typically
                // Use readJSON to check existence since we know it works for this path
                const data = await window.electronAPI.readJSON(`projects/${projectId}/initialStakeholders.json`)
                if (data) {
                    available.push({ id: ARTEFACT_IDS.ISI, name: 'Initial Stakeholder Identification' })
                }
            }

            // Check for PIR (Source for BC and Charter)
            if (artefactId === ARTEFACT_IDS.BC || artefactId === ARTEFACT_IDS.CHARTER) {
                const data = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (data) {
                    available.push({ id: ARTEFACT_IDS.PIR, name: 'Project Initiation Request' })
                }
            }

            // Check for Business Case (Source for Charter)
            if (artefactId === ARTEFACT_IDS.CHARTER) {
                const data = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/${ARTEFACT_IDS.BC}.json`)
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
                const sourceData = await window.electronAPI.readJSON(`projects/${projectId}/initialStakeholders.json`)
                if (sourceData) {
                    newContent = mapISIToPIR(sourceData, newContent, overwrite)
                }
            }

            // Case 2: PIR -> BC
            else if (targetArtefactId === ARTEFACT_IDS.BC && sourceId === ARTEFACT_IDS.PIR) {
                const sourceData = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (sourceData && sourceData.content) {
                    newContent = mapPIRToBC(sourceData.content, newContent, overwrite)
                }
            }

            // Case 3: PIR -> Charter
            else if (targetArtefactId === ARTEFACT_IDS.CHARTER && sourceId === ARTEFACT_IDS.PIR) {
                const sourceData = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/${ARTEFACT_IDS.PIR}.json`)
                if (sourceData && sourceData.content) {
                    newContent = mapPIRToCharter(sourceData.content, newContent, overwrite)
                }
            }

            // Case 4: BC -> Charter
            else if (targetArtefactId === ARTEFACT_IDS.CHARTER && sourceId === ARTEFACT_IDS.BC) {
                const sourceData = await window.electronAPI.readJSON(`projects/${projectId}/artefacts/${ARTEFACT_IDS.BC}.json`)
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

// -- Mapping Logic --

const mergeField = (target, key, value, overwrite) => {
    if (value === null || value === undefined || value === '') return

    const targetValue = target[key]
    const isTargetEmpty = targetValue === undefined || targetValue === null || targetValue === '' || targetValue === '<p></p>'

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
    // PIR.ProblemNeedOpportunity -> BC.BusinessJustification
    mergeField(target, 'Business Justification', pir['problem'], overwrite)

    // PIR.ExpectedBenefits -> BC.ExpectedBenefits
    mergeField(target, 'Expected Benefits', pir['benefits'], overwrite)

    // PIR.Scope.In / Out -> BC.ScopeOverview (Target key: "High-level Scope")
    const inScope = pir['In Scope'] || ''
    const outScope = pir['Out of Scope'] || ''
    let scopeText = ''
    if (inScope) scopeText += `<p><strong>In Scope:</strong></p>${inScope}`
    if (outScope) scopeText += `<p><strong>Out of Scope:</strong></p>${outScope}`

    if (scopeText) {
        mergeField(target, 'High-level Scope', scopeText, overwrite)
    }

    // PIR.KeyStakeholders -> BC.Stakeholders (Target key: "otherStakeholders" in Governance group)
    mergeField(target, 'otherStakeholders', pir['stakeholders'], overwrite)

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
