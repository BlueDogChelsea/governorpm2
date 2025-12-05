import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

const Initiating = ({ artefacts, onOpenArtefact, onOpenActivity, onOpenGuidance, onOpenLogs }) => {
    const [meetingCompleted, setMeetingCompleted] = useState(false)
    const [showDiagram, setShowDiagram] = useState(false)

    // Helper to get artefact status
    const getStatus = (id) => {
        const art = artefacts.find(a => a.id === id)
        return art ? art.status : 'Not Started'
    }

    // Helper to check if artefact is complete
    const isComplete = (id) => getStatus(id) === 'Complete'

    const checklistArtefact = artefacts.find(a => a.id === 'initiating-phase-exit-checklist')
    const checklistContent = (checklistArtefact && checklistArtefact.content) || {}
    const checklistStatus = checklistArtefact ? checklistArtefact.status : 'Not Started'

    let isSignedOff = false

    // Check Formal Approval
    if (checklistContent.approval && checklistContent.approval.isApproved) {
        isSignedOff = true
    }

    // Load Stakeholder Data for Activity Status
    const [stakeholderStatus, setStakeholderStatus] = useState('Not Started')

    useEffect(() => {
        const checkStakeholderStatus = async () => {
            if (window.electronAPI) {
                try {
                    await window.electronAPI.ensureFolder('data/initiating')
                    const data = await window.electronAPI.readJSON('data/initiating/stakeholders.json')

                    if (data) {
                        const hasProjectOwner = data.projectOwner && (data.projectOwner.name || data.projectOwner.organisation || data.projectOwner.expectations)
                        const hasBusinessManager = data.businessManager && (data.businessManager.name || data.businessManager.organisation || data.businessManager.expectations)
                        const hasSolutionProvider = data.solutionProvider && (data.solutionProvider.name || data.solutionProvider.organisation || data.solutionProvider.expectations)
                        const hasAdditional = data.additionalStakeholders && data.additionalStakeholders.length > 0

                        const isCompleted = data.projectOwner?.name && data.projectOwner.name.trim() !== '' &&
                            data.businessManager?.name && data.businessManager.name.trim() !== ''

                        if (isCompleted) {
                            setStakeholderStatus('Completed')
                        } else if (hasProjectOwner || hasBusinessManager || hasSolutionProvider || hasAdditional) {
                            setStakeholderStatus('In Progress')
                        } else {
                            setStakeholderStatus('Not Started')
                        }
                    }
                } catch (err) {
                    console.warn("Could not check stakeholder status", err)
                }
            }
        }

        // Check on mount and every time we might return to this view (interval or re-render)
        // Since we don't have a reliable "onFocus" for the tab switch in this component easily without props, 
        // we can check it when the component mounts (which happens when we switch back to 'Lifecycle' tab from activity).
        checkStakeholderStatus()
    }, []) // Check on mount

    const renderStatusChip = (artefact) => {
        if (!artefact) {
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Not Started
                </span>
            )
        }

        const { status, modifiedAfterApproval } = artefact

        let displayStatus = status
        let colorClass = 'bg-gray-100 text-gray-600' // Default / Not Started

        if (status === 'In Progress') {
            colorClass = 'bg-blue-100 text-blue-700'
        } else if (status === 'Approved' || status === 'Completed') {
            if (modifiedAfterApproval) {
                displayStatus = 'Approved — Modified'
                colorClass = 'bg-yellow-100 text-yellow-800'
            } else {
                displayStatus = 'Approved'
                colorClass = 'bg-green-100 text-green-700'
            }
        }

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {displayStatus}
            </span>
        )
    }

    const openArtefact = (id) => {
        const art = artefacts.find(a => a.id === id)
        if (art) {
            onOpenArtefact(art)
        } else {
            console.warn(`Artefact ${id} not found`)
        }
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Initiating Phase</h2>
                    <p className="text-gray-500 mt-1">Establish the foundation of the project by capturing the need, defining objectives, identifying stakeholders, and producing the initial PM² artefacts.</p>
                </div>
                <button
                    onClick={() => onOpenGuidance('Initiating Phase')}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                    Open PM² Guidance for Initiating Phase
                </button>
            </div>

            {/* Figure 5.1 - Collapsible */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                    onClick={() => setShowDiagram(!showDiagram)}
                    className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="font-medium text-gray-900">Process Diagram (Figure 5.1)</span>
                    <div className="flex items-center text-sm text-blue-600">
                        {showDiagram ? 'Hide workflow diagram' : 'Show workflow diagram'}
                        {showDiagram ? (
                            <ChevronUpIcon className="h-4 w-4 ml-1" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4 ml-1" />
                        )}
                    </div>
                </button>

                {showDiagram && (
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

                {/* Activities Panel */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded mr-2">1</span>
                        Activities
                    </h3>
                    <div className="space-y-4">
                        {/* A: Initiating Meeting */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">Initiating Meeting</h4>
                                {meetingCompleted ? (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Not Started</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Discuss pre-project information and agree next steps leading into PIR creation.</p>
                            <button
                                onClick={() => setMeetingCompleted(!meetingCompleted)}
                                className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${meetingCompleted
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {meetingCompleted ? 'Mark as Not Started' : 'Mark Meeting Completed'}
                            </button>
                        </div>

                        {/* B: Document the idea/need */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">Document the idea/need</h4>
                                {renderStatusChip(artefacts.find(a => a.id === 'project-initiation-request'))}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Capture the problem, need, or opportunity.</p>
                            <button
                                onClick={() => openArtefact('project-initiation-request')}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Create Project Initiation Request
                            </button>
                        </div>

                        {/* C: Identify key stakeholders */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">Identify key stakeholders</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stakeholderStatus === 'In Progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : stakeholderStatus === 'Completed'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {stakeholderStatus}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Identify stakeholders and their expectations.</p>
                            <button
                                onClick={() => onOpenActivity('stakeholder-identification')}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 bg-blue-50 border-blue-200 text-blue-700"
                            >
                                Identify Key Stakeholders
                            </button>
                        </div>

                        {/* D: Create a business justification */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">Create business justification</h4>
                                {renderStatusChip(artefacts.find(a => a.id === 'business-case'))}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Develop justification and alignment — foundation of Business Case.</p>
                            <button
                                onClick={() => openArtefact('business-case')}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Open Business Case
                            </button>
                        </div>

                        {/* E: Define project scope & organisation */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-900">Define scope & organisation</h4>
                                {renderStatusChip(artefacts.find(a => a.id === 'project-charter'))}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Establish high-level scope, governance roles, milestones.</p>
                            <button
                                onClick={() => openArtefact('project-charter')}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Open Project Charter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Artefacts Panel */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded mr-2">2</span>
                        Artefacts
                    </h3>
                    <div className="space-y-3">
                        {['project-initiation-request', 'stakeholder-matrix', 'business-case', 'project-charter', 'initiating-phase-exit-checklist'].map(id => {
                            const art = artefacts.find(a => a.id === id)
                            const name = art ? art.name : id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            const status = art ? art.status : 'Not Started'

                            return (
                                <div key={id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{name}</p>
                                        <div className="mt-1">{renderStatusChip(art)}</div>
                                    </div>
                                    <button
                                        onClick={() => openArtefact(id)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                    >
                                        Open
                                    </button>
                                </div>
                            )
                        })}

                        {/* Initial Logs Placeholder */}
                        {/* Initial Logs (Risk, Issue...) */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
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

                {/* Phase Gate Panel */}
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
                                {renderStatusChip(checklistArtefact)}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Gate Status:</span>
                                <span className={`text-sm font-bold ${isSignedOff ? 'text-green-600' : 'text-orange-600'}`}>
                                    {isSignedOff ? 'Ready (Signed Off)' : 'Pending'}
                                </span>
                            </div>

                            <button
                                onClick={() => openArtefact('initiating-phase-exit-checklist')}
                                className="w-full py-2 px-3 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                                Open Initiating Phase Exit Checklist
                            </button>
                        </div>
                    </div>

                    <div className={`rounded-lg p-4 text-center border transition-colors ${isSignedOff ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                        {isSignedOff ? (
                            <>
                                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h4 className="text-green-800 font-bold mb-1">Ready to Proceed</h4>
                                <p className="text-green-700 text-sm mb-3">Gate approval confirmed.</p>
                            </>
                        ) : (
                            <>
                                <div className="h-8 w-8 rounded-full border-2 border-gray-300 mx-auto mb-2" />
                                <h4 className="text-gray-800 font-bold mb-1">Not Yet Signed Off</h4>
                                <p className="text-gray-500 text-sm mb-3">Gate not yet approved — complete approval section in the checklist.</p>
                            </>
                        )}


                    </div>
                </div>

            </div>
        </div>
    )
}

export default Initiating
