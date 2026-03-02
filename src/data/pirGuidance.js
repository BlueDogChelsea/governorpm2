export const PIR_GUIDANCE = {
    // --- 1. Project Information ---
    'identity': {
        title: 'Project Identity',
        content: "Basic project identification.\n\n* **Project Title**: The official name of the initiative.\n* **Project Owner (PO)**: The person who funds/owns the outcome. They Chair the Steering Committee.\n* **Approving Authority**: The person/body who must sign off on this request (often the PO or a Program Board).",
        pm2Ref: 'Section 1.1'
    },
    'classification': {
        title: 'Classification & Planning',
        content: "Define the type and timing of the project.\n\n* **Methodology**: \n  * *Standard*: Full PM² governance (Charter, Plans, etc).\n  * *Agile*: PM²-Agile (Backlog, Sprints).\n  * *Lite*: Simplified governance for small efforts.\n* **Target Delivery**: When must the project go live? This drives the schedule backward.",
        pm2Ref: 'Section 1.2'
    },

    // --- 2. Context & Strategy ---
    'context': {
        title: 'Business Need / Problem',
        content: "**Why are we doing this?**\n\nDescribe the current situation and the problem to be solved. Do not describe the solution yet.\n\n*Example*: 'Current manual processing of invoices leads to a 2-week delay in payments and 5% error rate.'",
        pm2Ref: 'Section 2.1'
    },
    'strategy': {
        title: 'Legal Basis',
        content: "**Is this mandatory?**\n\n* **Legal Basis**: Reference specific laws, regulations, or board decisions that mandate this project.\n* **Regulatory**: mandated by external bodies?",
        pm2Ref: 'Section 2.2'
    },

    // --- 3. Value Proposition ---
    'value': {
        title: 'Outcomes & Success Criteria',
        content: "**What good looks like.**\n\n* **Outcomes**: The tangible changes (e.g. 'Staff can work from home').\n* **Success Criteria**: Measurable targets (e.g. 'System supports 500 concurrent users'). This data will populate your Project Charter later.",
        pm2Ref: 'Section 2.3'
    },

    // --- 4. Project Factors ---
    'risks': {
        title: 'Initial Risks',
        content: "**What could go wrong?**\n\nIdentify high-level risks that might stop the project from starting.\n\n*Example*: 'Lack of budget approval', 'Key technical resource unavailable'.\n\n*Note*: These will automatically flow into the Risk Log.",
        pm2Ref: 'Section 3.1'
    },
    'constraints': {
        title: 'Constraints',
        content: "**What limits us?**\n\nNon-negotiable restrictions.\n\n* **Budget**: Maximum spending limit.\n* **Time**: Hard deadlines.\n* **Resources**: 'Must use internal team'.",
        pm2Ref: 'Section 3.2'
    },
    'assumptions': {
        title: 'Assumptions',
        content: "**What are we assuming is true?**\n\nFactors you believe to be true but haven't verified.\n\n*Example*: 'The data center will be ready by June'.\n*Tip*: If an assumption fails, it becomes a risk/issue.",
        pm2Ref: 'Section 3.3'
    }
}
