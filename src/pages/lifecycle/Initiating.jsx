import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'


const Initiating = ({ projectId, artefacts, onOpenArtefact, onOpenActivity, onOpenGuidance, onOpenLogs }) => {
    // Activity Persistence State
    const [activityStatus, setActivityStatus] = useState({})
    const [expandedActivity, setExpandedActivity] = useState(null)
    const [showProcessDiagram, setShowProcessDiagram] = useState(false)

    // Load activity status on mount/project change
    useEffect(() => {
        const loadActivityStatus = async () => {
            if (window.electronAPI && projectId) {
                try {
                    const status = await window.electronAPI.readJSON(`projects/${projectId}/activities_status.json`)
                    setActivityStatus(status || {})
                } catch (err) {
                    // Ignore error if file doesn't exist
                    setActivityStatus({})
                }
            }
        }
        loadActivityStatus()
    }, [projectId])

    // Save activity status helper
    const updateActivityStatus = async (activityId, isCompleted) => {
        const newStatus = { ...activityStatus, [activityId]: isCompleted }
        setActivityStatus(newStatus)

        if (window.electronAPI && projectId) {
            try {
                await window.electronAPI.writeJSON(`projects/${projectId}/activities_status.json`, newStatus)
            } catch (err) {
                console.warn("Failed to save activity status", err)
            }
        }
    }

    // Toggle PM2 Text
    const togglePM2Text = (id) => {
        if (expandedActivity === id) {
            setExpandedActivity(null)
        } else {
            setExpandedActivity(id)
        }
    }



    // Helper to render Artefact Status Chip
    const renderArtefactStatus = (id) => {
        const art = artefacts.find(a => a.id === id)
        if (!art) {
            return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Not Started</span>
        }
        const { status, modifiedAfterApproval } = art
        let displayStatus = status
        let colorClass = 'bg-gray-100 text-gray-600'

        if (status === 'In Progress') colorClass = 'bg-blue-100 text-blue-700'
        else if (status === 'Approved' || status === 'Completed') {
            if (modifiedAfterApproval) {
                displayStatus = 'Approved — Modified'
                colorClass = 'bg-yellow-100 text-yellow-800'
            } else {
                displayStatus = 'Approved'
                colorClass = 'bg-green-100 text-green-700'
            }
        }

        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{displayStatus}</span>
    }

    // Phase Gate Logic
    const checklistArtefact = artefacts.find(a => a.id === 'initiating-phase-exit-checklist')
    const checklistContent = (checklistArtefact && checklistArtefact.content) || {}
    let isGateSignedOff = false
    if (checklistContent.approval && checklistContent.approval.isApproved) {
        isGateSignedOff = true
    }

    // Define Activities
    const activitiesList = [
        {
            id: 'initiating-meeting',
            title: 'Initiating Meeting',
            summary: 'Hold an initial meeting to align expectations, scope boundaries, roles, and next steps.',
            description: 'The Initiating Meeting aligns stakeholders on the project’s purpose, expectations, high-level scope, constraints, roles, and next steps. It ensures a shared understanding of the project’s intent before formal initiation activities begin.',
            pm2Config: { section: '5.1' },
            guidance: { topic: 'Initiating Phase', section: '5.1 Initiating Meeting' },
            hasCheckbox: true,
            buttons: []
        },
        {
            id: 'identify-stakeholders',
            title: 'Identify Key Stakeholders',
            summary: 'Identify key stakeholders, governance bodies, and their roles and responsibilities.',
            description: 'This activity identifies the individuals and groups who have an interest in, influence over, or responsibility within the project. It clarifies their roles, expectations, and involvement, helping shape project governance and ensuring early engagement.',
            pm2Config: { section: '4' },
            guidance: { topic: 'Roles & Organisation', section: '4.1 Project Stakeholders' },
            hasCheckbox: true,
            buttons: [
                { label: 'Open Initial Stakeholder Identification', action: () => onOpenActivity('stakeholder-identification'), primary: true }
            ]
        },
        {
            id: 'document-idea',
            title: 'Document the Idea / Need (Project Initiation Request)',
            summary: 'Capture the problem, need, or opportunity motivating the project.',
            description: 'The purpose of this activity is to capture the problem, need, or opportunity that motivates the project. It describes the context, the drivers behind the initiative, and why the organisation is considering investment at this stage.',
            pm2Config: { section: '5.2' },
            guidance: { topic: 'Initiating Phase', section: '5.2 Project Initiation Request' },
            hasCheckbox: false,
            buttons: []
        },
        {
            id: 'create-business-justification',
            title: 'Create Business Justification',
            summary: 'Develop the high-level reasoning and expected benefits for the project.',
            description: 'This activity defines the high-level justification for the project, outlining expected benefits, strategic alignment, and critical success factors. It frames the reasoning that decision-makers will later evaluate in the Business Case.',
            pm2Config: { section: '5.3' },
            guidance: { topic: 'Initiating Phase', section: '5.3 Business Case' },
            hasCheckbox: false,
            buttons: []
        },
        {
            id: 'define-scope',
            title: 'Define Scope & Organisation',
            summary: 'Define high-level scope boundaries, roles, and governance structure.',
            description: 'This activity establishes the project’s high-level scope boundaries, identifies key deliverables, clarifies governance structures, and outlines initial responsibilities. It provides an early view of how the project will be organised and controlled.',
            pm2Config: { section: '5.4' },
            guidance: { topic: 'Initiating Phase', section: '5.4 Project Charter' },
            hasCheckbox: false,
            buttons: []
        },
        {
            id: 'stage-gate',
            title: 'Stage Gate — Ready for Planning (RfP)',
            summary: 'Confirm completion of the Initiation Phase and approve continuation into Planning.',
            description: 'The Stage Gate confirms that Initiation activities are complete and that the project is viable to proceed to Planning. It validates outputs such as the PIR, Business Case, and Charter, and ensures the necessary approvals are obtained.',
            pm2Config: { section: '5.5' },
            guidance: { topic: 'Initiating Phase', section: '5.5 Phase Gate RfP (Ready for Planning)' },
            hasCheckbox: true,
            buttons: [
                { label: 'Open Initiating Phase Exit Checklist', action: () => onOpenArtefact(artefacts.find(a => a.id === 'initiating-phase-exit-checklist')), primary: true }
            ]
        }
    ]

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Initiating Phase</h2>
                    <p className="text-gray-500 mt-1">Establish the foundation of the project by capturing the need, defining objectives, identifying stakeholders, and producing the initial PM² artefacts.</p>
                </div>
                <button
                    onClick={() => onOpenGuidance('Initiating Phase', null, { tab: 'Lifecycle', label: 'Initiating Phase' })}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                    Open PM² Guidance for Initiating Phase
                </button>
            </div>

            {/* Figure 5.1 - Collapsible */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowProcessDiagram(!showProcessDiagram)}
                    className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="font-medium text-gray-900">Process Diagram (Figure 5.1)</span>
                    <div className="flex items-center text-sm text-blue-600">
                        {showProcessDiagram ? 'Hide workflow diagram' : 'Show workflow diagram'}
                        {showProcessDiagram ? (
                            <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                        )}
                    </div>
                </button>

                {showProcessDiagram && (
                    <div className="p-6 border-t border-gray-200 flex justify-center items-center bg-white">
                        <img
                            src="/pm2/figures/fig-5-1.png"
                            alt="Fig 5.1 Initiating Phase"
                            className="w-full max-w-4xl object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* ACTIVITIES COLUMN */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-4 overflow-y-auto">
                    <h3 className="font-semibold text-gray-900 flex items-center sticky top-0 bg-gray-50 z-10 pb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded mr-2">1</span>
                        Activities
                    </h3>
                    <div className="space-y-4">
                        {activitiesList.map((activity) => {
                            const isExpanded = expandedActivity === activity.id
                            const isCompleted = activityStatus[activity.id] || false

                            return (
                                <div key={activity.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                        {activity.hasCheckbox && (
                                            isCompleted ? (
                                                <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                    <CheckCircleIconSolid className="h-3 w-3 mr-1" />
                                                    Completed
                                                </span>
                                            ) : null
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{activity.summary}</p>

                                    {/* Collapsible PM2 Text - NOW Activity Description */}
                                    <div className="mb-4 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                                        <button
                                            onClick={() => togglePM2Text(activity.id)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="flex items-center">
                                                <span className="w-1 h-3 bg-blue-500 rounded-sm mr-2 opacity-50"></span>
                                                Show Activity Description
                                            </span>
                                            {isExpanded ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="p-4 border-t border-gray-100 bg-white text-sm text-gray-800">
                                                <p className="leading-relaxed">{activity.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {/* Supporting Tools / Artefact Buttons (Select Few) */}
                                        {activity.buttons.map((btn, idx) => (
                                            <button
                                                key={idx}
                                                onClick={btn.action}
                                                className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${btn.primary
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}

                                        {/* Guidance Button */}
                                        <button
                                            onClick={() => onOpenGuidance(activity.guidance.topic, activity.guidance.section, { tab: 'Lifecycle', label: 'Initiating Phase' })}
                                            className="w-full flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1.5" />
                                            Open PM² Guidance → {activity.pm2Config.section}
                                        </button>

                                        {/* Checkbox Button */}
                                        {activity.hasCheckbox && (
                                            <button
                                                onClick={() => updateActivityStatus(activity.id, !isCompleted)}
                                                className={`w-full flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors border ${isCompleted
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <CheckCircleIconSolid className="h-4 w-4 mr-1.5" />
                                                        Mark Activity Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                                                        Mark Activity Completed
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ARTEFACTS COLUMN */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded mr-2">2</span>
                        Artefacts
                    </h3>
                    <div className="space-y-3">
                        {['project-initiation-request', 'business-case', 'projectCharter', 'initiating-phase-exit-checklist'].map(id => {
                            const art = artefacts.find(a => a.id === id)
                            const name = art ? art.name : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                            return (
                                <div key={id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 mb-1">{name}</p>
                                        {renderArtefactStatus(id)}
                                    </div>
                                    <button
                                        onClick={() => onOpenArtefact(art)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                    >
                                        Open
                                    </button>
                                </div>
                            )
                        })}

                        {/* Initial Logs (Risk, Issue...) */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <p className="font-medium text-sm text-gray-900">Initial Logs (Risk, Issue...)</p>
                                <div className="mt-1"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Optional</span></div>
                            </div>
                            <button
                                onClick={onOpenLogs}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                                Open
                            </button>
                        </div>
                    </div>
                </div>

                {/* PHASE GATE PANEL (Summary) */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded mr-2">3</span>
                        Phase Gate: RfP
                    </h3>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Ready for Planning</h4>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Checklist Status:</span>
                                {renderArtefactStatus('initiating-phase-exit-checklist')}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Gate Status:</span>
                                <span className={`text-sm font-bold ${isGateSignedOff ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isGateSignedOff ? 'Ready (Signed Off)' : 'Pending'}
                                </span>
                            </div>

                            <button
                                onClick={() => onOpenArtefact(artefacts.find(a => a.id === 'initiating-phase-exit-checklist'))}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors"
                            >
                                Review Exit Checklist
                            </button>
                        </div>
                    </div>

                    <div className={`rounded-lg p-4 text-center border transition-colors ${isGateSignedOff ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                        {isGateSignedOff ? (
                            <>
                                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h4 className="text-green-800 font-bold mb-1">Ready to Proceed</h4>
                                <p className="text-green-700 text-sm mb-3">Gate approval confirmed.</p>
                            </>
                        ) : (
                            <>
                                <div className="h-8 w-8 rounded-full border-2 border-gray-300 mx-auto mb-2" />
                                <h4 className="text-gray-800 font-bold mb-1">Not Yet Signed Off</h4>
                                <p className="text-gray-500 text-sm mb-3">Complete approval in the Checklist.</p>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Initiating
