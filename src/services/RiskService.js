export const promoteCharterRisks = (charterData, currentRaidLog) => {
    // Check if charter data has risks
    if (!charterData || !charterData.risks || !Array.isArray(charterData.risks)) {
        return [];
    }

    const newRisks = [];
    const currentTitles = new Set(currentRaidLog.map(r => r.title));
    const currentDescriptions = new Set(currentRaidLog.map(r => r.description));

    charterData.risks.forEach(charterRisk => {
        // Construct the title: Truncate description to 50 chars + "..."
        let title = charterRisk.description || "Untitled Risk";
        if (title.length > 50) {
            title = title.substring(0, 50) + "...";
        }

        // Check for duplicates based on description or title
        // The requirement says: "check if a risk with the same description already exists"
        if (currentDescriptions.has(charterRisk.description)) {
            return;
        }

        // Map fields
        const newRisk = {
            id: crypto.randomUUID(),
            type: "RISK",
            title: title,
            description: charterRisk.description,
            likelihood: charterRisk.likelihood, // Mapped from likelihood
            impact: charterRisk.impact,         // Mapped from impact
            level: charterRisk.riskLevel,       // Mapped from level (Charter uses riskLevel)
            status: "Open",
            owner: charterRisk.owner || "Unassigned", // Default to Unassigned or existing owner
            notes: "Imported from Project Charter during initiation.",
            dateLogged: new Date().toISOString().split('T')[0], // Mapped to dateLogged (ISO string date part typically used in input type='date')
        };

        newRisks.push(newRisk);
    });

    return newRisks;
};
