export const businessCaseSchema = [
    {
        id: 'justification',
        title: '1. Business Context & Justification',
        fields: [
            { key: 'businessJustification', label: 'Business Justification', type: 'textarea', placeholder: 'Describe the business justification...' },
            { key: 'currentSituation', label: 'Current Situation (AS-IS)', type: 'textarea', placeholder: 'Describe the current situation...' },
            { key: 'impactDoingNothing', label: 'Impact of Doing Nothing', type: 'textarea', placeholder: 'Describe the impact if the project does not proceed...' }
        ]
    },
    {
        id: 'impact',
        title: '2. Impact Analysis',
        fields: [
            { key: 'impactedDomains', label: 'Impacted Domains', type: 'list', group: 'Domains' },
            { key: 'impactOnBusiness', label: 'Impact on Processes & Strategy', type: 'textarea' },
            { key: 'impactOnStakeholders', label: 'Impact on Users & Staff', type: 'textarea' }
        ]
    },
    {
        id: 'alignment',
        title: '3. Strategic Alignment',
        fields: [
            { key: 'strategicFit', label: 'Strategic Alignment', type: 'textarea', placeholder: 'Describe how the project aligns...' },
            { key: 'regulatoryDrivers', label: 'Regulatory / Compliance Drivers', type: 'textarea' },
            { key: 'dependencies', label: 'Dependencies', type: 'textarea' },
            { key: 'synergies', label: 'Synergies', type: 'textarea' }
        ]
    },
    {
        id: 'alternatives',
        title: '4. Analysis of Alternatives',
        fields: [
            // Alternative A
            { key: 'AltA_Description', label: 'Description', group: 'Do Nothing (Alt A)', type: 'textarea' },
            { key: 'AltA_Strengths', label: 'Strengths', group: 'Do Nothing (Alt A)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltA_Weaknesses', label: 'Weaknesses', group: 'Do Nothing (Alt A)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltA_Opportunities', label: 'Opportunities', group: 'Do Nothing (Alt A)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltA_Threats', label: 'Threats', group: 'Do Nothing (Alt A)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltA_Qualitative', label: 'Viability Assessment', group: 'Do Nothing (Alt A)', type: 'textarea' },
            // Alternative B
            { key: 'AltB_Description', label: 'Description', group: 'Proposed Solution (Alt B)', type: 'textarea' },
            { key: 'AltB_Strengths', label: 'Strengths', group: 'Proposed Solution (Alt B)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltB_Weaknesses', label: 'Weaknesses', group: 'Proposed Solution (Alt B)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltB_Opportunities', label: 'Opportunities', group: 'Proposed Solution (Alt B)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltB_Threats', label: 'Threats', group: 'Proposed Solution (Alt B)', subGroup: 'SWOT', type: 'textarea' },
            { key: 'AltB_Qualitative', label: 'Viability Assessment', group: 'Proposed Solution (Alt B)', type: 'textarea' },
            // Chosen
            { key: 'Chosen_Alternative', label: 'Chosen Alternative', group: 'The Decision', type: 'text' },
            { key: 'Chosen_Rationale', label: 'Rationale for Selection', group: 'The Decision', type: 'textarea' },
            { key: 'Chosen_Summary', label: 'Preference Summary', group: 'The Decision', type: 'textarea' }
        ]
    },
    {
        id: 'solution',
        title: '5. Proposed Solution',
        fields: [
            { key: 'Solution Overview', label: 'Solution Overview', type: 'textarea' },
            { key: 'High-level Scope', label: 'High-level Scope', type: 'textarea' },
            { key: 'Key Deliverables', label: 'Key Deliverables', type: 'textarea' },
            { key: 'Expected Benefits', label: 'Expected Benefits', type: 'textarea' },
            { key: 'Critical Success Criteria', label: 'Critical Success Criteria', type: 'textarea', group: 'Success Measures' },
            { key: 'General Success Criteria', label: 'General Success Criteria', type: 'textarea', group: 'Success Measures' }
        ]
    },
    {
        id: 'costs_benefits',
        title: '6. Costs & Benefits',
        fields: [
            { key: 'costs', label: 'Cost Matrix', type: 'costMatrix' },
            { key: 'Benefit Summary', label: 'Benefit Summary', type: 'textarea' },
            { key: 'Justification (Optional)', label: 'Financial Justification', type: 'textarea' }
        ]
    },
    {
        id: 'roadmap',
        title: '7. Roadmap',
        fields: [
            {
                key: 'milestones',
                label: 'Major Milestones',
                type: 'table',
                columns: [
                    { label: 'ID', key: 'id' },
                    { label: 'Milestone', key: 'description' },
                    { label: 'Target Date', key: 'targetDeliveryDate' }
                ]
            }
        ]
    },
    {
        id: 'governance',
        title: '8. Governance & Approvals',
        fields: [
            // key core roles
            { key: 'PO_Name', label: 'Name', group: 'Project Owner (PO)', type: 'text' },
            { key: 'PO_Title', label: 'Title', group: 'Project Owner (PO)', type: 'text' },
            { key: 'SP_Name', label: 'Name', group: 'Solution Provider (SP)', type: 'text' },
            { key: 'SP_Title', label: 'Title', group: 'Solution Provider (SP)', type: 'text' },
            // authorization
            { key: 'approverName', label: 'Authorized By', group: 'Authorization', type: 'text' },
            { key: 'approvalDate', label: 'Date', group: 'Authorization', type: 'text' },
            { key: 'signature', label: 'Signature', group: 'Authorization', type: 'text' }
        ]
    }
];
