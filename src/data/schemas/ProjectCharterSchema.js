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
        title: '2. Business Case and Success Criteria',
        fields: [
            { key: 'businessCaseConsiderations', label: 'Considerations on the Business Case', type: 'richtext', placeholder: 'Describe considerations regarding the Business Case...' },
            { key: 'successCriteria', label: 'Success Criteria', group: '2.1 Success Criteria', type: 'richtext', placeholder: 'Define success criteria...' }
        ]
    },
    {
        id: 'project_scope',
        title: '3. Project Scope',
        fields: [
            { key: 'scopeStatement', label: 'Scope Statement', group: '3.1 Scope', type: 'richtext', placeholder: 'Define the project scope...' },
            { key: 'scopeIn', label: 'Includes (In Scope)', group: '3.1 Scope', type: 'richtext', placeholder: 'What is included in the scope?' },
            { key: 'scopeOut', label: 'Excludes (Out of Scope)', group: '3.1 Scope', type: 'richtext', placeholder: 'What is excluded from the scope?' }
        ]
    },
    {
        id: 'stakeholder_needs',
        title: '4. Stakeholder and User Needs',
        fields: [
            {
                key: 'stakeholderNeeds',
                label: 'Stakeholder and User Needs',
                group: '4.1 Stakeholder and User Needs',
                type: 'table',
                columns: [
                    { key: 'stakeholder', label: 'Stakeholder / Group', type: 'text', placeholder: 'e.g., Finance Team, Client Proxy...' },
                    { key: 'description', label: 'Need Description', type: 'textarea' },
                    {
                        key: 'priority',
                        label: 'Priority',
                        type: 'select',
                        options: ['High (Critical)', 'Medium (Important)', 'Low (Desirable)']
                    }
                ]
            }
        ]
    },
    {
        id: 'project_description',
        title: '5. Project Description',
        fields: [
            // 5.1 Deliverables (Repeating)
            {
                key: 'deliverables',
                label: 'Deliverables',
                group: '5.1 Deliverables',
                type: 'table',
                columns: [
                    { key: 'name', label: 'Deliverable Name', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' }
                ]
            },

            // 5.2 Features (Repeating)
            {
                key: 'features',
                label: 'Features',
                group: '5.2 Features',
                type: 'table',
                columns: [
                    { key: 'featureText', label: 'Feature', type: 'text' },
                    { key: 'relatedNeedId', label: 'Related Need ID', type: 'text' },
                    { key: 'deliverablesText', label: 'Related Deliverables', type: 'text' }
                ]
            },

            // 5.3 Constraints
            { key: 'constraints', label: 'Constraints', group: '5.3 Constraints', type: 'richtext', placeholder: 'List project constraints...' },

            // 5.4 Assumptions
            { key: 'assumptions', label: 'Assumptions', group: '5.4 Assumptions', type: 'richtext', placeholder: 'List project assumptions...' },

            // 5.5 Risks (Repeating)
            {
                key: 'risks',
                label: 'Risks',
                group: '5.5 Risks',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Risk Description', type: 'text' },
                    { key: 'status', label: 'Status', type: 'text' }, // Select?
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
        id: 'cost_timing_resources',
        title: '6. Cost, Timing, Resources',
        fields: [
            // 6.1 Cost Summary
            { key: 'costSummary', label: 'Cost Summary', group: '6.1 Cost Summary', type: 'richtext', placeholder: 'Summarise the costs...' },
            {
                key: 'costTable',
                label: 'Cost Breakdown',
                group: '6.1 Cost Summary',
                type: 'table',
                columns: [
                    { key: 'year', label: 'Year/Period', type: 'text' },
                    { key: 'budgetLine', label: 'Budget Line', type: 'text' },
                    { key: 'amount', label: 'Amount', type: 'text' }
                ]
            },

            // 6.2 Timing & Milestones
            {
                key: 'milestones',
                label: 'Timing & Milestones',
                group: '6.2 Timing & Milestones',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Milestone', type: 'text' },
                    { key: 'targetDate', label: 'Target Date', type: 'date' }
                ]
            },

            // 6.3 Planned Resources
            {
                key: 'resources',
                label: 'Planned Resources',
                group: '6.3 Planned Resources',
                type: 'table',
                columns: [
                    { key: 'requirement', label: 'Resource Requirement', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' }
                ]
            }
        ]
    },
    {
        id: 'approach',
        title: '7. Approach',
        fields: [
            // 7.1 Methodology
            { key: 'methodology', label: 'Methodology', group: '7.1 Methodology', type: 'richtext', placeholder: 'Describe the project methodology...' },

            // 7.2 Change Management
            { key: 'projectChange', label: 'Project Change Management', group: '7.2 Change Management', type: 'richtext', placeholder: 'How usage of changes will be managed...' },
            { key: 'configurationManagement', label: 'Configuration Management', group: '7.2 Change Management', type: 'richtext', placeholder: 'Configuration management approach...' },
            { key: 'organisationalChange', label: 'Organisational Change', group: '7.2 Change Management', type: 'richtext', placeholder: 'Organisational change management...' }
        ]
    },
    {
        id: 'governance_stakeholders',
        title: '8. Governance & Stakeholders',
        fields: [
            {
                key: 'psc',
                label: 'Project Steering Committee (PSC)',
                group: '8.1 PSC Matrix',
                type: 'pscMatrix', // Custom type handled in component
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
                group: '8.2 Extended Governance',
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
        id: 'references',
        title: 'Appendix 1: References & Related Documents',
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
    }
];
