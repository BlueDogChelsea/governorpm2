# Artefact Interaction Standard (Based on Project Charter)

## Purpose

This document defines the canonical interaction and layout standard embodied by the **Project Charter** page in Governor.
It is treated as the authoritative reference for how Initiating-phase artefacts should behave and present themselves.

This standard is descriptive, not aspirational. It captures what *is* implemented and relied upon, not proposed improvements.

---

## Scope of Inspection

This standard is derived from inspection of the existing Project Charter implementation and covers:

- Page layout and navigation
- Global (top-row) artefact actions
- Section-level save behaviour
- Visual and interaction consistency for artefact editing

No behavioural changes are implied by this document.

---

## 1. Page Layout and Navigation

### 1.1 Left-hand Index (Table of Contents)

- The Project Charter uses a persistent left-hand index that lists all sections and subsections.
- The index represents the logical structure of the artefact rather than a sequential workflow.
- Selecting an item in the index loads the corresponding section into the main content area.
- The currently selected section is visually highlighted to maintain orientation.
- Navigation is non-linear: users may move freely between sections without completion requirements.

### 1.2 Main Content Area

- The main content area displays a single artefact section at a time.
- Each section contains its own input fields and controls.
- Section identity is stable: navigating away and returning does not reset content.

---

## 2. Top Action Row (Global Artefact Controls)

The Project Charter defines a standard top-row action area that applies to the artefact as a whole.

### 2.1 Import Data from Earlier Steps

- Imports relevant data from upstream artefacts (e.g. PIR, Business Case).
- Import behaviour respects existing content and does not blindly overwrite user-entered data.
- This action operates at the artefact level, not per section.

### 2.2 Open PM² Guidance

- Opens the PM² guidance at the **Project Charter** section.
- Guidance opens in a way that preserves user context.
- A breadcrumb or navigation mechanism is provided that returns the user **exactly** to the Project Charter page.
- This behaviour is considered mandatory for all future artefacts.

### 2.3 Show / Hide Guidance

- Toggles the visibility of inline or side-by-side guidance.
- Does not affect artefact data or navigation state.

### 2.4 Export Actions

- Allows export of the artefact (e.g. PDF, DOCX).
- Export operates on the complete artefact, not on individual sections.

---

## 3. Section-level Save Behaviour

### 3.1 Save Changes Button

- Each section provides a **Save Changes** action.
- Saving is explicit and user-initiated.
- Save operations persist changes made within the active section.

### 3.2 Persistence Semantics

- Section-level saves update the underlying artefact data store.
- Saving one section does not implicitly modify other sections.
- Navigating between sections does not automatically trigger saves.

This behaviour defines the expected save contract for artefact editing.

---

## 4. Visual and Interaction Consistency

### 4.1 Input Styling

- Input fields follow a consistent visual style across all sections.
- Spacing, labels, and grouping are uniform.
- Rich text areas and plain text inputs are visually distinct but aligned.

### 4.2 Editing Experience

- The artefact behaves as a structured document editor rather than a wizard.
- Users are encouraged to work non-linearly and iteratively.
- There is no enforced completion order.

---

## 5. Constraints

This document intentionally does **not**:

- Propose new behaviour or improvements
- Redesign interactions
- Modify data models or storage
- Introduce workflow or validation logic

It exists solely to document and stabilise the interaction standard already established by the Project Charter.

---

## Status

This document is the current authoritative reference for Initiating-phase artefact interaction behaviour.

Future artefacts should conform to this standard unless an explicit, documented deviation is agreed.
