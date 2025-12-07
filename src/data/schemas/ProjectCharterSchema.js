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
        title: '2. Considerations on the Business Case',
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

            // 3.3 Stakeholder and User Needs (Repeating)
            {
                key: 'stakeholderNeeds',
                label: 'Stakeholder and User Needs',
                group: '3.3 Stakeholder and User Needs',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Description', type: 'richtext' },
                    { key: 'priority', label: 'Priority', type: 'text' }
                ]
            },

            // 3.4 Deliverables (Repeating)
            {
                key: 'deliverables',
                label: 'Deliverables',
                group: '3.4 Deliverables',
                type: 'table',
                columns: [
                    { key: 'name', label: 'Deliverable Name', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' }
                ]
            },

            // 3.5 Features (Repeating)
            {
                key: 'features',
                label: 'Features',
                group: '3.5 Features',
                type: 'table',
                columns: [
                    { key: 'featureText', label: 'Feature', type: 'text' },
                    { key: 'relatedNeedId', label: 'Related Need ID', type: 'text' },
                    { key: 'deliverablesText', label: 'Related Deliverables', type: 'text' }
                ]
            },

            // 3.6 Constraints
            { key: 'constraints', label: 'Constraints', group: '3.6 Constraints', type: 'richtext', placeholder: 'List project constraints...' },

            // 3.7 Assumptions
            { key: 'assumptions', label: 'Assumptions', group: '3.7 Assumptions', type: 'richtext', placeholder: 'List project assumptions...' },

            // 3.8 Risks (Repeating)
            {
                key: 'risks',
                label: 'Risks',
                group: '3.8 Risks',
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
        title: '4. Cost, Timing, Resources',
        fields: [
            // 4.1 Cost Summary
            { key: 'costSummary', label: 'Cost Summary', group: '4.1 Cost Summary', type: 'richtext', placeholder: 'Summarise the costs...' },
            {
                key: 'costTable',
                label: 'Cost Breakdown',
                group: '4.1 Cost Summary',
                type: 'table',
                columns: [
                    { key: 'year', label: 'Year/Period', type: 'text' },
                    { key: 'budgetLine', label: 'Budget Line', type: 'text' },
                    { key: 'amount', label: 'Amount', type: 'text' }
                ]
            },

            // 4.2 Timing & Milestones
            {
                key: 'milestones',
                label: 'Timing & Milestones',
                group: '4.2 Timing & Milestones',
                type: 'table',
                columns: [
                    { key: 'description', label: 'Milestone', type: 'text' },
                    { key: 'targetDate', label: 'Target Date', type: 'date' }
                ]
            },

            // 4.3 Planned Resources
            {
                key: 'resources',
                label: 'Planned Resources',
                group: '4.3 Planned Resources',
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
        title: '5. Approach',
        fields: [
            // 5.1 Methodology
            { key: 'methodology', label: 'Methodology', group: '5.1 Methodology', type: 'richtext', placeholder: 'Describe the project methodology...' },

            // 5.2 Change Management
            { key: 'projectChange', label: 'Project Change Management', group: '5.2 Change Management', type: 'richtext', placeholder: 'How usage of changes will be managed...' },
            { key: 'configurationManagement', label: 'Configuration Management', group: '5.2 Change Management', type: 'richtext', placeholder: 'Configuration management approach...' },
            { key: 'organisationalChange', label: 'Organisational Change', group: '5.2 Change Management', type: 'richtext', placeholder: 'Organisational change management...' }
        ]
    },
    {
        id: 'governance_stakeholders',
        title: '6. Governance & Stakeholders',
        fields: [
            { key: 'governanceStructure', label: 'Governance Structure', type: 'richtext', placeholder: 'Describe the governance structure...' },
            { key: 'rolesResponsibilities', label: 'Roles & Responsibilities', type: 'richtext', placeholder: 'Define roles and responsibilities...' },
            { key: 'otherStakeholders', label: 'Other Stakeholders', type: 'richtext', placeholder: 'List other key stakeholders...' }
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
