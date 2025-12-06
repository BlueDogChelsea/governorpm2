export const ProjectService = {
    async getProjects() {
        if (!window.electronAPI) return [];

        await window.electronAPI.ensureFolder('projects');
        const projectIds = await window.electronAPI.listDir('projects');

        const projects = [];
        for (const id of projectIds) {
            try {
                const settings = await window.electronAPI.readJSON(`projects/${id}/settings.json`);
                projects.push({
                    id,
                    name: settings.name || id,
                    ...settings
                });
            } catch (e) {
                console.error(`Failed to load project ${id}`, e);
                projects.push({ id, name: id });
            }
        }
        return projects;
    },

    async createProject(name) {
        if (!window.electronAPI) return null;

        const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await window.electronAPI.ensureFolder(`projects/${id}`);

        // Initialise settings
        const settings = {
            name,
            createdAt: new Date().toISOString()
        };
        await window.electronAPI.writeJSON(`projects/${id}/settings.json`, settings);

        // Initialise empty artefacts (optional, but good practice per requirements)
        // We generally rely on the App to create them if missing, but let's be safe.
        await window.electronAPI.writeJSON(`projects/${id}/artefacts.json`, []);
        // Logs
        await window.electronAPI.ensureFolder(`projects/${id}/logs`);
        const logTypes = ['Risks', 'Assumptions', 'Issues', 'Dependencies'];
        for (const type of logTypes) {
            await window.electronAPI.writeJSON(`projects/${id}/logs/${type}.json`, []);
        }

        return id;
    },

    async deleteProject(id) {
        if (!window.electronAPI) return false;
        return await window.electronAPI.deletePath(`projects/${id}`);
    },

    async renameProject(id, newName) {
        if (!window.electronAPI) return false;
        const settings = await window.electronAPI.readJSON(`projects/${id}/settings.json`);
        settings.name = newName;
        await window.electronAPI.writeJSON(`projects/${id}/settings.json`, settings);
        return true;
    },

    async migrateLegacyData() {
        if (!window.electronAPI) return null;

        await window.electronAPI.ensureFolder('projects');
        const projects = await window.electronAPI.listDir('projects');

        // If projects exist, assume migration done or not needed
        if (projects.length > 0) return null;

        // Check if legacy data exists
        const hasLegacyArtefacts = await window.electronAPI.pathExists('data/artefacts.json');

        if (!hasLegacyArtefacts) {
            // No legacy data, just create a default empty project
            const id = await this.createProject('My First Project');
            return id;
        }

        // Migrate
        const defaultId = 'default';
        await window.electronAPI.ensureFolder(`projects/${defaultId}`);

        // Create settings
        await window.electronAPI.writeJSON(`projects/${defaultId}/settings.json`, {
            name: "My First Project",
            createdAt: new Date().toISOString(),
            migratedAt: new Date().toISOString()
        });

        // Copy files
        // Since we don't have a direct 'copy' or 'move' API in the subset I added, 
        // we'll read and write.

        // Artefacts
        const artefacts = await window.electronAPI.readJSON('data/artefacts.json');
        await window.electronAPI.writeJSON(`projects/${defaultId}/artefacts.json`, artefacts);

        // Logs
        await window.electronAPI.ensureFolder(`projects/${defaultId}/logs`);
        const logTypes = ['Risks', 'Assumptions', 'Issues', 'Dependencies'];
        for (const type of logTypes) {
            const data = await window.electronAPI.readJSON(`data/logs/${type}.json`);
            if (data && Array.isArray(data)) {
                await window.electronAPI.writeJSON(`projects/${defaultId}/logs/${type}.json`, data);
            } else {
                await window.electronAPI.writeJSON(`projects/${defaultId}/logs/${type}.json`, []);
            }
        }

        return defaultId;
    }
};
