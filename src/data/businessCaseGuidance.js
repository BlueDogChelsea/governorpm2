export const BUSINESS_CASE_GUIDANCE = {
    'context-justification': {
        title: '1.1 Justification & Current State',
        content: `
### Business Justification
Explain the reasoning behind the project. Why is this project needed now? What specific business problem or opportunity does it address?

### Current Situation (AS-IS)
Describe the current state. What are the existing processes, systems, or issues?

### Impact of Doing Nothing
What are the consequences if this project is not undertaken? (e.g., loss of market share, non-compliance, operational inefficiencies).
`,
        pm2Ref: 'PM² Business Case'
    },
    'context-impact': {
        title: '1.2 Impact Analysis',
        content: `
### Impacted Domains
Select the functional areas of the organization that will be affected by this project.

### Impact on Processes & Strategy
Describe the organizational impact.
* Does this change how we work?
* Does it support a new strategic goal?

### Impact on Users & Staff
Describe the impact from a stakeholder perspective.
* Will staff require training?
* Will workflows change for end-users?
`,
        pm2Ref: 'PM² Business Case'
    },
    'context-strategy': {
        title: '1.3 Strategic Fit & Synergy',
        content: `
### Strategic Alignment
How does this project align with the organization's goals and strategy? Link to specific strategic pillars if possible.

### Regulatory Drivers
Are there any legal or regulatory requirements driving this project? (e.g., GDPR, Financial Compliance).

### Interdependencies & Synergies
* **Dependencies:** List other projects or systems this initiative relies on.
* **Synergies:** Can this project share resources or benefits with other initiatives?
`,
        pm2Ref: 'PM² Business Case'
    },
    'alternatives': {
        title: '2. Analysis of Alternatives',
        content: `
### Analysis of Alternatives
Compare different approaches to achieving the project objectives. You should typically consider:
- **Do Nothing (Alternative A)**: The baseline scenario.
- **Proposed Solution (Alternative B)**: The recommended approach.
- **Other Alternatives**: Partial solutions or different technologies (optional).

### SWOT Analysis
For each alternative, analyze:
- **Strengths**: Internal positive attributes.
- **Weaknesses**: Internal negative attributes.
- **Opportunities**: External positive factors.
- **Threats**: External negative factors.

### The Decision
Clearly state the chosen alternative and the rationale for its selection. Why is it better than the others in terms of cost, benefits, risk, and strategic alignement?
`,
        pm2Ref: 'PM² Business Case'
    },
    'solution': {
        title: '3. Proposed Solution',
        content: `
### Solution Overview
Provide a high-level description of the proposed solution. What will be built or changed?

### Scope
- **High-Level Scope**: What is included in the project?
- **Key Deliverables**: What are the tangible outputs?

### Expected Benefits
Describe the tangible and intangible benefits (e.g., cost savings, increased revenue, improved satisfaction).

### Success Measures
- **Critical Success Criteria**: The essential conditions that must be met for the project to be considered a success.
- **General Success Criteria**: Additional measures of success.
`,
        pm2Ref: 'PM² Business Case'
    },
    'costs': {
        title: '4. Cost & Benefits',
        content: `
### Cost & Benefit Plan
- **Cost Summary**: Estimated total cost of ownership (TCO) and breakdown of expenses.
- **Benefit Summary**: Quantified value of expected benefits (tangible and intangible).
- **Financial Justification**: ROI (Return on Investment), NPV (Net Present Value), or Payback Period analysis to justify the investment.
`,
        pm2Ref: 'PM² Business Case'
    },
    'roadmap': {
        title: '5. Roadmap & Milestones',
        content: `
### Roadmap
- **Dates**: Planned Start Date and Target Delivery Date.
- **Major Milestones**: Key points in the timeline (e.g., seeking approval, prototype, go-live).

### Impact Analysis
- **Dependencies**: Dependencies on other projects, systems, or external factors that could affect delivery.
- **Synergies**: Potential for shared resources, reusable components, or aligned benefits with other initiatives.
`,
        pm2Ref: 'PM² Business Case'
    },
    'governance': {
        title: '5. Governance',
        content: `
### Governance & Approval
The Business Case must be formally approved by the Project Owner or Steering Committee before the project can proceed to the Planning phase.

- **Approver**: Title/Name of the person authorizing the Business Case.
- **Date**: Date of approval.
`,
        pm2Ref: 'PM² Business Case'
    }
}
