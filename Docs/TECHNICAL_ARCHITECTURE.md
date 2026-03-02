# GovernorPM² Technical Architecture & Data Model

## 1. System Architecture Overview

**GovernorPM²** is a desktop application built using **Electron**, **React**, and **Vite**. It functions as a local-first Agency helper for Project Management, specifically storing data on the local file system rather than a cloud database.

### Technology Stack
*   **Runtime**: [Electron](https://www.electronjs.org/) (Chromium + Node.js)
*   **Frontend Framework**: [React](https://react.dev/) (v18)
*   **Bundler**: [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Routing**: React Router
*   **Rich Text**: Tiptap / React-Markdown
*   **Document Generation**: `pdfmake`, `docx`, `html-to-pdfmake`

### Architecture Diagram (Conceptual)
```mermaid
graph TD
    A[Electron Main Process] -- IPC Bridge (FS Access) --> B[Electron Renderer Process]
    B --> C[React App]
    C --> D[Services (ProjectService, DocumentGenerator)]
    D --> E[Components (BusinessCase, ProjectCharter)]
    A -- Reads/Writes --> F[Local File System (JSON)]
```

## 2. Repository Structure

| Directory | Description |
| :--- | :--- |
| **electron/** | Contains the Main Process logic (`main.js`) and the Preload script (`preload.js`). Handles native OS interactions (FileSystem, Shell). |
| **src/** | The source code for the React Renderer process. |
| **src/components/** | UI components, including the core Artefacts (`ProjectCharter.jsx`, `BusinessCase.jsx`). |
| **src/services/** | Business logic layer. `ProjectService.js` handles data persistence, `DocumentGenerator.js` handles PDF/DOCX creation. |
| **projects/** | **(Data Store)** The user's local database. Each project is a subdirectory here. |

## 3. Data Persistence Layer

The application uses a **File-Based JSON Database**. There is no SQL or NoSQL server; all data is stored as plain JSON files in the user's `projects` directory.

### Storage Location
*   **Root Data Folder**: `<Application_Path>/projects/`
*   **Project Folder**: `projects/<project_id>/`

### File Structure per Project
Each project consists of the following key files:

| File | Purpose |
| :--- | :--- |
| `settings.json` | Stores project metadata (Name, Creation Date, ID). |
| `artefacts.json` | **Primary Data Store**. Contains an array of all project artefacts (Business Case, Charter, etc.) and their content. |
| `projectCharter.json` | *Specialized Store*. The Project Charter may save its data here for granular access, or sync back to `artefacts.json`. |
| `logs/*.json` | Dedicated files for lists like `Risks.json`, `Assumptions.json`. |

---

## 4. Field-to-Data Mapping

This section maps the specific UI Screens and Fields seen in the Project Charter to the underlying JSON keys stored in `projectCharter.json` (or the `content` object of the charter in `artefacts.json`).

### 1. Executive Summary
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **1. Executive Summary** | Executive Summary | `executiveSummary` | HTML String (Rich Text) |

### 2. Business Case Considerations
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **2. Considerations** | Business Case Considerations | `businessCaseConsiderations` | HTML String (Rich Text) |

### 3. Project Description
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **3.1 Scope** | Scope Statement | `scopeStatement` | HTML String |
| | In Scope | `scopeIn` | HTML String |
| | Out of Scope | `scopeOut` | HTML String |
| **3.2 Success Criteria** | Success Criteria | `successCriteria` | HTML String |
| **3.3 Stakeholder Needs** | Stakeholder Needs | `stakeholderNeeds` | Array of Objects |
| | *Need Item* | `{ stakeholder, description, priority }` | Object |
| **3.4 Deliverables** | Deliverables | `deliverables` | Array of Objects |
| | *Item* | `{ name, description, type, dueDate }` | Object |
| **3.5 Features** | Features | `features` | Array of Objects |
| | *Item* | `{ name, description, relatedDeliverable }` | Object |
| **3.6 Constraints** | Constraints | `constraints` | Array of Objects |
| | *Item* | `{ description, type }` | Object |
| **3.7 Assumptions** | Assumptions | `assumptions` | Array of Objects |
| | *Item* | `{ description, impact }` | Object |
| **3.8 Risks** | Risks | `risks` | Array of Objects |
| | *Item* | `{ description, likelihood, impact, riskLevel, status, responseStrategy, actionDetails }` | Object |

### 4. Cost & Timing
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **4.1 Cost & Budget** | Cost Items | `costs` | Array of Objects |
| | *Cost Matrix* | `{ category, year, amount, description }` | Object |
| **4.2 Milestones** | Milestones | `milestones` | Array of Objects |
| | *Item* | `{ id, description, targetDeliveryDate }` | Object |
| **4.3 Resources** | Planned Resources | `resources` | Array of Objects |
| | *Item* | `{ id, role, description, quantity }` | Object |

### 6. Governance
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **Roles & Responsibilities** | Project Steering Committee | `psc` | HTML String |
| | Extended Governance | `extendedGovernance` | HTML String |

### 7. Approach
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **Approach** | Methodology | `methodology` | HTML String |
| | Project Change Mgmt | `projectChange` | HTML String |
| | Config Management | `configurationManagement` | HTML String |
| | Organisational Change | `organisationalChange` | HTML String |

### Appendix & Authorization
| Screen Section | UI Label | JSON Key | Data Type |
| :--- | :--- | :--- | :--- |
| **Appendix** | References | `references` | Array of Objects |
| | *Item* | `{ id, title, source }` | Object |
| **Authorization** | Approver Name | `approval.approverName` | String |
| | Approval Date | `approval.approvalDate` | String (ISO Date) |
| | Signature | `approval.signature` | String (Image URL or Text) |

---

## 5. Automated Data Flow Strategy

This section describes the technical mechanism for "automatic data inheritance" between documents. The goal is to ensure that data entered at the start of the project lifecycle flows downstream without re-entry.

### Flow Sequnce
The data naturally flows in this order:
1.  **Stakeholder ID (ISI)** -> 2. **Project Initiation Request (PIR)** -> 3. **Business Case (BC)** -> 4. **Project Charter**.

### Technical Implementation

#### A. Shared Data Repositories (The "Single Source of Truth")
For list-based entities that evolve throughout the project, duplication is avoided by storing them in **Project-Level Logs**, rather than isolating them within individual artefact files.

*   **Risks**: Stored in `logs/Risks.json`.
    *   *Behavior*: If a user adds a risk in the *Business Case*, it is written to `logs/Risks.json`. When the *Project Charter* is opened, it reads from `logs/Risks.json`.
    *   *Deduplication*: The `RiskService` checks incoming risks against existing titles/descriptions in the central log before adding new entries.
*   **Stakeholders**: Stored in `logs/Stakeholders.json` (or central definition).
*   **Assumptions**: Stored in `logs/Assumptions.json`.

#### B. Intelligent Import Service (Field Mapping)
For text-heavy fields (like "Project Background" or "Scope"), we use an **Import Service** (`ArtefactImportService.js`) that runs during the initialization of a new artefact.

**How it works:**
1.  **Trigger**: When the user opens a new document (e.g., *Project Charter*) or clicks "Import Data".
2.  **Source Check**: The service identifies the immediate predecessor (e.g., checks if *Business Case* exists).
3.  **Mapping Execution**: It pulls relevant fields using a defined schema map.

**Example Data Map (PIR -> Business Case):**
| Project Initiation Request (Source) | Business Case (Target) | Logic |
| :--- | :--- | :--- |
| `problem` | `Current Situation / Problem` | Direct Copy (only if target empty) |
| `benefits` | `Expected Benefits` | Direct Copy |
| `stakeholders` | *(Used for Analysis)* | Does not overwrite specific BC fields, but available for reference. |

**Example Data Map (Business Case -> Project Charter):**
| Business Case (Source) | Project Charter (Target) | Logic |
| :--- | :--- | :--- |
| `Critical Success Criteria` | `successCriteria` | Direct Copy |
| `Business Justification` | `businessCaseConsiderations` | Direct Copy |
| `Cost Summary` | `costs` | *Transformation*: Converts summary rows into Cost Matrix line items. |

#### C. Continuous Synchronization (Hybrid Approach)
*   **Initialization Mode**: When a document is first created, it "hydrates" itself with all available upstream data.
*   **Linked Mode**: Specific sections (like the *Risk Log* in the Charter) are not copies but **Live Views** of the project-level data. Editing a risk in the Charter updates the global project risk log, ensuring the *Project Log* remains the master record.
