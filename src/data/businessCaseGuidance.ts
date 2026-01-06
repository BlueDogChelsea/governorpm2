export const BUSINESS_CASE_GUIDANCE = {
    'context': {
        title: '1. Business Context',
        content: `
### Business Justification
Explain the reasoning behind the project. Why is this project needed now? What specific business problem or opportunity does it address?

### Current Situation
Describe the current state (AS-IS). What are the existing processes, systems, or issues? 

### Impact of Doing Nothing
What are the consequences if this project is not undertaken? (e.g., loss of market share, non-compliance, operational inefficiencies).

### Strategic Fit
- **Strategic Alignment**: How does this project align with the organization's goals and strategy?
- **Regulatory Drivers**: Are there any legal or regulatory requirements driving this project?
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
    'planning': {
        title: '4. Cost & Planning',
        content: `
### Cost & Benefit Plan
- **Cost Summary**: Estimated total cost of ownership (TCO).
- **Benefit Summary**: quantified value of expected benefits.
- **Financial Justification**: ROI, NPV, or Payback Period analysis (if applicable).

### Roadmap
- **Dates**: Planned Start and Target Delivery dates.
- **Major Milestones**: Key points in the timeline (e.g., seeking approval, prototype, go-live).

### Impact Analysis
- **Dependencies**: Dependencies on other projects, systems, or external factors.
- **Synergies**: Potential for shared resources or benefits with other initiatives.
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
