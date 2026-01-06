export interface GuidanceItem {
    title: string;
    content: string;
    pm2Ref: string;
}

export const CHARTER_GUIDANCE: Record<string, GuidanceItem> = {
    // --- Section 1 ---
    'summary': {
        title: 'Executive Summary',
        content: "Think of this as your project's 'Elevator Pitch'. If a stakeholder only reads one page, this is it.\n\nBriefly describe the problem, the proposed solution, and the key benefits. Focus on the 'Why' and 'What', not the 'How'.\n\n**Tip:** Write this section last, after you have defined the details!",
        pm2Ref: 'Section 1'
    },
    // --- Section 2 ---
    'businessCase': {
        title: 'Considerations on the Business Case',
        content: "This section bridges the gap between the original Business Case and the current reality.\n\n* Re-validate Urgency: Is the problem still urgent? What happens if we do nothing?\n* External Changes: Have new laws, market shifts, or tech changes occurred since the Business Case was approved?\n* Impact: confirm that the expected benefits are still realistic.",
        pm2Ref: 'Section 2'
    },
    // --- Section 3: Project Description ---
    'scope': {
        title: 'Project Scope',
        content: "Define the boundaries clearly to prevent 'Scope Creep'.\n\n* In Scope: What specific outputs WILL this project deliver?\n* Out of Scope: What are you explicitly NOT doing? (e.g., 'We will build the website, but not the mobile app').\n* Scope Statement: Try to summarize the scope in one or two sentences.",
        pm2Ref: 'Section 3.1'
    },
    'success': {
        title: 'Success Criteria',
        content: "How will we know when we are done and if we succeeded?\n\nDefine measurable goals. Avoid vague wishes like 'Improve communication'. Instead, use 'Reduce email volume by 20%' or 'All 500 staff trained by Q4'.\n\nDistinguish between Project Success (on time/budget) and Product Success (users actually like it).",
        pm2Ref: 'Section 3.2'
    },
    'needs': {
        title: 'Stakeholder Needs',
        content: "Who are you building this for?\n\nList the key groups (e.g., 'Finance Team', 'End Customers') and describe exactly what they need. Rank these needs by priority. This ensures you are solving real problems for real people.",
        pm2Ref: 'Section 3.3'
    },
    'deliverables': {
        title: 'Deliverables',
        content: "List the tangible items you will hand over to the Project Owner.\n\nExamples: 'A finalized policy document', 'A new server', 'A training workshop', 'A software application'.\n\nNote: Do not list internal project management docs (like this Charter) here—focus on the final product.",
        pm2Ref: 'Section 3.4'
    },
    'features': {
        title: 'Features',
        content: "What high-level capabilities must the solution have?\n\nFocus on User Capabilities (e.g., 'Users can generate monthly PDF reports') rather than technical specs (e.g., 'React PDF library').\n\nKeep it high-level; detailed requirements come later in the Planning Phase.",
        pm2Ref: 'Section 3.5'
    },
    'constraints': {
        title: 'Constraints',
        content: "What are the non-negotiable limitations holding you back?\n\n* Budget: 'Capped at €50k'\n* Time: 'Must be live before the new regulation starts on Jan 1st'\n* Resources: 'Must use existing internal staff only'\n* Technical: 'Must integrate with the legacy SAP system'",
        pm2Ref: 'Section 3.6'
    },
    'assumptions': {
        title: 'Assumptions',
        content: "What are you taking for granted as 'true' right now?\n\nExamples: 'The API will be available by June', 'Staff will be available for training'.\n\nWarning: If an assumption turns out to be false, it becomes a Risk. Validate them as soon as possible.",
        pm2Ref: 'Section 3.7'
    },
    'risks': {
        title: 'Risks',
        content: "What could go wrong?\n\nIdentify the top 3-5 high-level threats (e.g., 'Vendor might go bankrupt', 'Key stakeholder might resign').\n\nYou don't need a full mitigation plan yet, but you must acknowledge these dangers now. Link to the detailed Risk Log if needed.",
        pm2Ref: 'Section 3.8'
    },
    // --- Section 4: Cost & Timing ---
    'budget': {
        title: 'Cost & Budget',
        content: "Outline the financing structure.\n\n* TCO: What is the Total Cost of Ownership (Development + Maintenance)?\n* Budget: Break it down by year or phase if possible.\n* Resources: Include costs for hardware, software licenses, and external consultancy.",
        pm2Ref: 'Section 4.1'
    },
    'milestones': {
        title: 'Milestones',
        content: "What are the major checkpoints?\n\nList key dates such as:\n* Project Kick-off\n* Approvals (Phase Gates)\n* Major Deliverable Handovers\n* Project End Date",
        pm2Ref: 'Section 4.2'
    },
    'resources': {
        title: 'Planned Resources',
        content: "Who and what do you need?\n\n* Human: '2 Developers, 1 Analyst (50%)'\n* Equipment: '3 Laptops, 1 Test Server'\n* Facilities: 'Meeting room for weekly workshops'\n\nDescribe how you will acquire these resources.",
        pm2Ref: 'Section 4.3'
    },
    // --- Section 6: Governance ---
    'governance': {
        title: 'Roles & Responsibilities',
        content: "Who is in charge?\n\nDefine the project structure:\n* Project Owner (PO): Who pays/decides?\n* Project Manager (PM): Who runs it daily?\n* Business Manager (BM): Who represents the users?\n* Steering Committee: Who resolves big issues?\n\nRefer to standard PM² roles if applicable.",
        pm2Ref: 'Section 6.2'
    },
    // --- Section 7: Approach ---
    'approach': {
        title: 'Methodology & Change',
        content: "How will we manage the work?\n\n* Methodology: Are you using standard PM²? Agile? Waterfall? Note any deviations.\n* Change Management: How will you handle changes to the scope? (Usually via a Change Request Form and approval by the Steering Committee).",
        pm2Ref: 'Section 5'
    },
    // --- Appendices ---
    'refs': {
        title: 'References',
        content: "Link to any related documents, such as the Project Initiation Request, Business Case, or external regulatory documents.",
        pm2Ref: 'Appendix 1'
    }
};
