export const projectInitiationRequestSchema = [
    {
        id: 'projectInfo',
        title: '1. Project Information',
        fields: ['Project Name', 'Date', 'Version', 'Project Owner', 'Project Manager'],
        type: 'mixed'
    },
    {
        id: 'background',
        title: '2. Background / Context',
        type: 'richtext',
        placeholder: 'Describe the reason why a project should be initiated...'
    },
    {
        id: 'problem',
        title: '3. Problem / Need / Opportunity',
        type: 'richtext',
        placeholder: 'Describe the impact...'
    },
    {
        id: 'benefits',
        title: '4. Expected Benefits & Success Criteria',
        type: 'richtext',
        placeholder: 'Identify and describe at a high level...'
    },
    {
        id: 'objectives',
        title: '5. Project Objectives',
        type: 'richtext',
        placeholder: 'Define the project objectives...'
    },
    {
        id: 'scope',
        title: '6. Scope',
        fields: ['In Scope', 'Out of Scope'],
        type: 'multi-richtext',
        placeholders: {
            'In Scope': 'Define what is included...',
            'Out of Scope': 'Define what is explicitly excluded...'
        }
    },
    {
        id: 'stakeholders',
        title: '7. Key Stakeholders',
        type: 'textarea',
        placeholder: 'List the key stakeholders...'
    },
    {
        id: 'assumptions',
        title: '8. Assumptions',
        type: 'richtext',
        placeholder: 'Describe project assumptions...'
    },
    {
        id: 'constraints',
        title: '9. Constraints',
        type: 'richtext',
        placeholder: 'Describe any key constraints...'
    },
    {
        id: 'risks',
        title: '10. Initial Risks',
        type: 'richtext',
        placeholder: 'Add any initial risks identified...'
    },
    {
        id: 'effort',
        title: '11. Estimated Effort, Cost, and Timeline',
        fields: ['Estimated Effort (Man-days)', 'Estimated Cost (€)', 'Target Start Date', 'Target End Date'],
        type: 'mixed'
    },
    {
        id: 'approach',
        title: '12. Delivery Approach',
        type: 'richtext',
        placeholder: 'Describe the chosen delivery approach...'
    },
    {
        id: 'dependencies',
        title: '13. Dependencies and Interfaces',
        type: 'richtext',
        placeholder: 'List any known dependencies...'
    },
    {
        id: 'alignment',
        title: '14. Strategic Alignment',
        type: 'richtext',
        placeholder: 'The legal basis, if any...'
    }
];
