export const projectInitiationRequestSchema = [
    {
        id: 'projectInfo',
        title: '1. Project Information',
        fields: [
            { key: 'Project Name', label: 'Project Name', type: 'text' },
            { key: 'Date', label: 'Date', type: 'date' },
            { key: 'Version', label: 'Version', type: 'text' },
            { key: 'Project Owner', label: 'Project Owner', type: 'text' },
            { key: 'Project Manager', label: 'Project Manager', type: 'text' }
        ]
    },
    {
        id: 'background',
        title: '2. Background / Context',
        fields: [
            { key: 'background', label: 'Background / Context', type: 'richtext', placeholder: 'Describe the reason why a project should be initiated...' }
        ]
    },
    {
        id: 'problem',
        title: '3. Problem / Need / Opportunity',
        fields: [
            { key: 'problem', label: 'Problem / Need / Opportunity', type: 'richtext', placeholder: 'Describe the impact...' }
        ]
    },
    {
        id: 'benefits',
        title: '4. Expected Benefits & Success Criteria',
        fields: [
            { key: 'benefits', label: 'Expected Benefits & Success Criteria', type: 'richtext', placeholder: 'Identify and describe at a high level...' }
        ]
    },
    {
        id: 'objectives',
        title: '5. Project Objectives',
        fields: [
            { key: 'objectives', label: 'Project Objectives', type: 'richtext', placeholder: 'Define the project objectives...' }
        ]
    },
    {
        id: 'scope',
        title: '6. Scope',
        fields: [
            { key: 'In Scope', label: 'In Scope', type: 'richtext', placeholder: 'Define what is included...' },
            { key: 'Out of Scope', label: 'Out of Scope', type: 'richtext', placeholder: 'Define what is explicitly excluded...' }
        ]
    },
    {
        id: 'stakeholders',
        title: '7. Key Stakeholders',
        fields: [
            { key: 'stakeholders', label: 'Key Stakeholders', type: 'textarea', placeholder: 'List the key stakeholders...' }
        ]
    },
    {
        id: 'assumptions',
        title: '8. Assumptions',
        fields: [
            { key: 'assumptions', label: 'Assumptions', type: 'richtext', placeholder: 'Describe project assumptions...' }
        ]
    },
    {
        id: 'constraints',
        title: '9. Constraints',
        fields: [
            { key: 'constraints', label: 'Constraints', type: 'richtext', placeholder: 'Describe any key constraints...' }
        ]
    },
    {
        id: 'risks',
        title: '10. Initial Risks',
        fields: [
            { key: 'risks', label: 'Initial Risks', type: 'richtext', placeholder: 'Add any initial risks identified...' }
        ]
    },
    {
        id: 'effort',
        title: '11. Estimated Effort, Cost, and Timeline',
        fields: [
            { key: 'Estimated Effort (Man-days)', label: 'Estimated Effort (Man-days)', type: 'text' },
            { key: 'Estimated Cost (€)', label: 'Estimated Cost (€)', type: 'text' },
            { key: 'Target Start Date', label: 'Target Start Date', type: 'date' },
            { key: 'Target End Date', label: 'Target End Date', type: 'date' }
        ]
    },
    {
        id: 'approach',
        title: '12. Delivery Approach',
        fields: [
            { key: 'approach', label: 'Delivery Approach', type: 'richtext', placeholder: 'Describe the chosen delivery approach...' }
        ]
    },
    {
        id: 'dependencies',
        title: '13. Dependencies and Interfaces',
        fields: [
            { key: 'dependencies', label: 'Dependencies and Interfaces', type: 'richtext', placeholder: 'List any known dependencies...' }
        ]
    },
    {
        id: 'alignment',
        title: '14. Strategic Alignment',
        fields: [
            { key: 'alignment', label: 'Strategic Alignment', type: 'richtext', placeholder: 'The legal basis, if any...' }
        ]
    }
];
