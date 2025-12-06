---
description: Implement Artefact Data Propagation (Import/Pre-fill)
---

# Tasks

- [x] Create `ArtefactImportService.js` to handle data mapping logic.
- [x] Implement checking logic in `ArtefactImportService.getAvailableImports`.
- [x] Implement mapping logic in `ArtefactImportService.importData` for ISI->PIR and PIR->BC.
- [x] Update `GovernedArtefactEditor.jsx` to:
    - [x] Check for imports on mount (if status is Not Started and prompts not shown).
    - [x] Display "Pre-Fill" modal if imports available.
    - [x] Add "Import Data" manual button to header.
    - [x] Handle data import and persist `importPromptShown` flag.
    - [ ] Verify functionality with manual testing (User Action).

# Notes
- ISI -> PIR mapping copies stakeholders to "Key Stakeholders" rich text field.
- PIR -> BC mapping copies specific text fields.
- Import logic respects "Overwrite" vs "Missing Only" (default).
