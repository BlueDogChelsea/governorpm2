export const projectCharterSchema = [
    {
        id: 'executive_summary',
        title: '1. Executive Summary',
        fields: [
            { key: 'executiveSummary', label: 'Executive Summary', type: 'richtext', placeholder: 'Provide a summary of the project charter...' }
        ]
    },
    {
        id: 'business_case_considerations',
        title: '2. Considerations on Business Case',
        fields: [
            { key: 'businessCaseConsiderations', label: 'Considerations on the Business Case', type: 'richtext', placeholder: 'Describe considerations regarding the Business Case...' }
        ]
    },
    {
        id: 'project_description',
        title: '3. Project Description',
        fields: [
            // 3.1 Scope
            { key: 'scopeStatement', label: 'Scope Statement', group: '3.1 Scope', type: 'richtext', placeholder: 'Define the project scope...' },
            { key: 'scopeIn', label: 'Includes (In Scope)', group: '3.1 Scope', type: 'richtext', placeholder: 'What is included in the scope?' },
            { key: 'scopeOut', label: 'Excludes (Out of Scope)', group: '3.1 Scope', type: 'richtext', placeholder: 'What is excluded from the scope?' },

            // 3.2 Success Criteria
            { key: 'successCriteria', label: 'Success Criteria', group: '3.2 Success Criteria', type: 'richtext', placeholder: 'Define success criteria...' },

            // 3.3 Stakeholder Needs
            {
                key: 'stakeholderNeeds',
                label: 'Stakeholder and User Needs',
                group: '3.3 Stakeholder Needs',
                type: 'table',
                columns: [
                    { key: 'stakeholder', label: 'Stakeholder / Group', type: 'text', placeholder: 'e.g., Finance Team, Client Proxy...' },
                    { key: 'description', label: 'Need Description', type: 'textarea' },
                    {
                        key: 'priority',
                        label: 'Priority',
                        type: 'select',
                        options: ['Critical', 'High', 'Medium', 'Low']
                    }
                ]
            },

            // 3.4 Deliverables
            {
                key: 'deliverables',
                label: 'Deliverables',
                group: '3.4 Deliverables',
                type: 'table',
                columns: [
                    { key: 'name', label: 'Deliverable Name', type: 'text' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    {
                        key: 'type',
                        label: 'Type',
                        type: 'select',
                        options: ['Report', 'Software', 'Service', 'Hardware', 'Other']
                    },
                    { key: 'dueDate', label: 'Due Date', type: 'date' }
                ]
            },

            // 3.5 Features
            {
                key: 'features',
                label: 'Features',
                group: '3.5 Features',
                type: 'table',
                columns: [
                    { key: 'name', label: 'Feature Name', type: 'text' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'relatedDeliverable', label: 'Related Deliverable', type: 'select', options: [] }
                ]
            },

            // 3.6 Constraints
            {
                key: 'constraints',
                label: 'Constraints',
                group: '3.6 Constraints',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Constraint Description', type: 'textarea' },
                    {
                        key: 'type',
                        label: 'Type',
                        type: 'select',
                        options: ['Budget', 'Schedule', 'Technical', 'Legal', 'Resource', 'Other']
                    }
                ]
            },

            // 3.7 Assumptions
            {
                key: 'assumptions',
                label: 'Assumptions',
                group: '3.7 Assumptions',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Assumption Description', type: 'textarea' },
                    {
                        key: 'impact',
                        label: 'Impact if False',
                        type: 'select',
                        options: ['High', 'Medium', 'Low']
                    }
                ]
            },

            // 3.8 Risks
            {
                key: 'risks',
                label: 'Risks',
                group: '3.8 Risks',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Risk Description', type: 'text' },
                    { key: 'status', label: 'Status', type: 'text' },
                    { key: 'likelihood', label: 'Likelihood', type: 'text' },
                    { key: 'impact', label: 'Impact', type: 'text' },
                    { key: 'riskLevel', label: 'Level', type: 'text' },
                    { key: 'owner', label: 'Owner', type: 'text' },
                    { key: 'responseStrategy', label: 'Response Strategy', type: 'text' },
                    { key: 'actionDetails', label: 'Action Details', type: 'text' }
                ]
            }
        ]
    },
    {
        id: 'cost_timing',
        title: '4. Cost & Timing',
        fields: [
            // 4.1 Cost & Budget
            {
                key: 'costs',
                label: 'Cost Breakdown',
                group: '4.1 Cost & Budget',
                type: 'table',
                columns: [
                    { key: 'category', label: 'Category', type: 'select', options: ['Solution Development', 'Maintenance', 'Support', 'Training', 'Infrastructure', 'Other'] },
                    { key: 'year', label: 'Year', type: 'select', options: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'] },
                    { key: 'amount', label: 'Amount', type: 'number' },
                    { key: 'description', label: 'Description', type: 'text' }
                ]
            },

            // 4.2 Milestones
            {
                key: 'milestones',
                label: 'Timing & Milestones',
                group: '4.2 Milestones',
                type: 'table',
                columns: [
                    { key: 'id', label: 'ID', type: 'text' },
                    { key: 'description', label: 'Milestone Description', type: 'text' },
                    { key: 'targetDeliveryDate', label: 'Target Delivery Date', type: 'date' }
                ]
            },

            // 4.3 Planned Resources
            {
                key: 'resources',
                label: 'Planned Resources',
                group: '4.3 Planned Resources',
                type: 'table',
                columns: [
                    { key: 'id', label: 'ID', type: 'text' },
                    { key: 'role', label: 'Role / Profile', type: 'text' },
                    { key: 'description', label: 'Description / Skills', type: 'textarea' },
                    { key: 'quantity', label: 'Quantity / FTE', type: 'number' }
                ]
            }
        ]
    },
    {
        id: 'governance',
        title: '6. Governance',
        fields: [
            {
                key: 'psc',
                label: 'Project Steering Committee (PSC)',
                group: 'Roles & Responsibilities',
                type: 'pscMatrix',
                structure: {
                    requestorSide: {
                        po: { role: 'Project Owner', name: '', responsibilities: 'Sets objectives, owns the Business Case' },
                        bm: { role: 'Business Manager', name: '', responsibilities: 'Represents the users, ensures benefits realization' }
                    },
                    providerSide: {
                        sp: { role: 'Solution Provider', name: '', responsibilities: 'Assumes overall accountability for IT/Deliverables' },
                        pm: { role: 'Project Manager', name: '', responsibilities: 'Manages the project day-to-day' }
                    }
                }
            },
            {
                key: 'extendedGovernance',
                label: 'Extended Governance',
                group: 'Roles & Responsibilities',
                type: 'table',
                columns: [
                    { key: 'role', label: 'Role', type: 'text' },
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'organisation', label: 'Organisation', type: 'text' }
                ]
            }
        ]
    },
    {
        id: 'approach',
        title: '7. Approach',
        fields: [
            // Methodology & Change
            { key: 'methodology', label: 'Methodology', group: 'Methodology & Change', type: 'richtext', placeholder: 'Describe the project methodology...' },
            { key: 'projectChange', label: 'Project Change Management', group: 'Methodology & Change', type: 'richtext', placeholder: 'How usage of changes will be managed...' },
            { key: 'configurationManagement', label: 'Configuration Management', group: 'Methodology & Change', type: 'richtext', placeholder: 'Configuration management approach...' },
            { key: 'organisationalChange', label: 'Organisational Change', group: 'Methodology & Change', type: 'richtext', placeholder: 'Organisational change management...' }
        ]
    },
    {
        id: 'appendix',
        title: 'Appendix',
        fields: [
            {
                key: 'references',
                label: 'References',
                type: 'table',
                columns: [
                    { key: 'title', label: 'Title', type: 'text' },
                    { key: 'sourceOrLink', label: 'Source / Link', type: 'text' }
                ]
            }
        ]
    },
    {
        id: 'authorization',
        title: 'Authorization',
        fields: [
            {
                key: 'approval',
                label: 'Sign-Off / Approval',
                type: 'approval'
            }
        ]
    }
];
