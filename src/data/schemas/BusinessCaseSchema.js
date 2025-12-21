export const businessCaseSchema = [
    {
        id: 'justification',
        title: '1. Project Justification & Impact',
        fields: [
            { key: 'Business Justification', label: 'Business Justification', type: 'textarea', placeholder: 'Describe the business justification...' },
            { key: 'Current Situation / Problem', label: 'Current Situation / Problem', type: 'textarea', placeholder: 'Describe the current situation...' },
            { key: 'Impact of Doing Nothing', label: 'Impact of Doing Nothing', type: 'textarea', placeholder: 'Describe the impact if the project does not proceed...' }
        ]
    },
    {
        id: 'alignment',
        title: '2. Strategic Alignment',
        fields: [
            { key: 'Strategic Alignment', label: 'Strategic Alignment', type: 'textarea', placeholder: 'Describe how the project aligns...' },
            { key: 'Regulatory / Compliance Drivers', label: 'Regulatory / Compliance Drivers', type: 'textarea', placeholder: 'Describe any relevant drivers...' }
        ]
    },
    {
        id: 'alternatives',
        title: '3. Alternatives Considered',
        // The UI performs custom rendering, but we list all fields here for the template engine.
        // We us 'group' metadata to help structure the output.
        fields: [
            // Alternative A
            { key: 'AltA_Description', label: 'Description', group: 'Alternative A', type: 'textarea' },
            { key: 'AltA_Strengths', label: 'Strengths', group: 'Alternative A', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltA_Weaknesses', label: 'Weaknesses', group: 'Alternative A', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltA_Opportunities', label: 'Opportunities', group: 'Alternative A', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltA_Threats', label: 'Threats', group: 'Alternative A', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltA_Qualitative', label: 'Viability Assessment', group: 'Alternative A', type: 'textarea' },
            // Alternative B
            { key: 'AltB_Description', label: 'Description', group: 'Alternative B', type: 'textarea' },
            { key: 'AltB_Strengths', label: 'Strengths', group: 'Alternative B', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltB_Weaknesses', label: 'Weaknesses', group: 'Alternative B', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltB_Opportunities', label: 'Opportunities', group: 'Alternative B', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltB_Threats', label: 'Threats', group: 'Alternative B', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltB_Qualitative', label: 'Viability Assessment', group: 'Alternative B', type: 'textarea' },
            // Alternative C
            { key: 'AltC_Description', label: 'Description', group: 'Alternative C', type: 'textarea' },
            { key: 'AltC_Strengths', label: 'Strengths', group: 'Alternative C', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltC_Weaknesses', label: 'Weaknesses', group: 'Alternative C', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltC_Opportunities', label: 'Opportunities', group: 'Alternative C', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltC_Threats', label: 'Threats', group: 'Alternative C', subGroup: 'SWOT Analysis', type: 'textarea' },
            { key: 'AltC_Qualitative', label: 'Viability Assessment', group: 'Alternative C', type: 'textarea' },
            // Chosen
            { key: 'Chosen_Alternative', label: 'Chosen Alternative', group: 'Chosen Alternative', type: 'text' },
            { key: 'Chosen_Rationale', label: 'Rationale for selection', group: 'Chosen Alternative', type: 'textarea' },
            { key: 'Chosen_Summary', label: 'Summary', group: 'Chosen Alternative', type: 'textarea' }
        ]
    },
    {
        id: 'solution',
        title: '4. Proposed Solution Overview',
        fields: [
            { key: 'Solution Overview', label: 'Solution Overview', type: 'textarea', placeholder: 'Overview of the chosen solution.' },
            { key: 'High-level Scope', label: 'High-level Scope', type: 'textarea', placeholder: 'Describe the high-level scope.' },
            { key: 'Key Deliverables', label: 'Key Deliverables', type: 'textarea', placeholder: 'List key deliverables.' },
            { key: 'Expected Benefits', label: 'Expected Benefits', type: 'textarea', placeholder: 'Describe expected benefits.' }
        ]
    },
    {
        id: 'success_criteria',
        title: '5. Success Criteria',
        fields: [
            { key: 'Critical Success Criteria', label: 'Critical Success Criteria', type: 'textarea', placeholder: 'List measurable criteria...' },
            { key: 'General Success Criteria', label: 'General Success Criteria', type: 'textarea', placeholder: 'List other general success criteria.' }
        ]
    },
    {
        id: 'costs_benefits',
        title: '6. Costs & Benefits (High-Level)',
        fields: [
            { key: 'Cost Summary', label: 'Cost Summary', type: 'textarea', placeholder: 'High-level cost summary.' },
            { key: 'Benefit Summary', label: 'Benefit Summary', type: 'textarea', placeholder: 'High-level benefit summary.' },
            { key: 'Justification (Optional)', label: 'Justification (Optional)', type: 'textarea', placeholder: 'Optional justification.' }
        ]
    },
    {
        id: 'synergies',
        title: '7. Synergies and Interdependencies',
        fields: [
            { key: 'Dependencies', label: 'Dependencies', type: 'textarea', placeholder: 'Dependencies with other initiatives...' },
            { key: 'Synergies', label: 'Synergies', type: 'textarea', placeholder: 'Identified synergies.' },
            { key: 'Interdependencies', label: 'Interdependencies', type: 'textarea', placeholder: 'External or internal interdependencies.' }
        ]
    },
    {
        id: 'roadmap',
        title: '8. High-Level Roadmap',
        fields: [
            { key: 'Start Date', label: 'Start Date', type: 'date' },
            { key: 'Target Delivery Date', label: 'Target Delivery Date', type: 'date' },
            { key: 'Major Milestones', label: 'Major Milestones', type: 'textarea', placeholder: 'List major milestones' }
        ]
    }
];
