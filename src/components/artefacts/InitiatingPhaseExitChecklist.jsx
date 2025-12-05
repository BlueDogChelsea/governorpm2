import React from 'react'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import GovernedArtefactEditor from './ui/GovernedArtefactEditor'
import { ArtefactTextarea } from './ui/ArtefactFields'

const questions = [
    "Has a Project Initiation Request been documented and approved?",
    "Are the project context, scope, deliverables and expected outcomes documented?",
    "Has a Project Owner (PO) been identified?",
    "Are project benefits and success criteria documented?",
    "Are the benefits and success criteria measurable?",
    "Have all the key project stakeholders been identified?",
    "Are all the initial roles and responsibilities defined?",
    "Has the Project Steering Committee (PSC) been established?",
    "Have at least 4 alternative solutions been analysed (e.g. using a SWOT analysis)?",
    "Are major assumptions, constraints and risks identified?",
    "Have project synergies and dependencies been analysed?",
    "Has the project Total Cost of Ownership (TCO) been estimated in FTE and €?",
    "Are both requestor and solution provider costs included in the project TCO?",
    "Are project funding sources identified for each cost element?",
    "Have project savings been estimated in FTE and €?",
    "Has a Business Case been documented and approved by the Project Owner (PO)?",
    "Is there a Project Manager (PM) assigned to the project?",
    "Are requestor needs documented and linked to project deliverables?",
    "Is project roadmap (start and end dates) for major milestones and deliverables documented?",
    "Is project approach / methodology identified?",
    "Are Risk, Issue and Decision Logs setup?",
    "Have the identified risks an associated response strategy been approved?",
    "Are major resources needed to execute the project identified as well as requirements detailed?",
    "Have security, document management and data protection constraints been assessed?",
    "Has a Project Charter been documented and approved by the PSC?",
    "Is the project currently delivering to schedule?",
    "Is the budget allocated sufficient at this point of the project?"
]

const InitiatingPhaseExitChecklist = ({ artefact, onSave, onBack, onOpenGuidance }) => {

    // Initial Answers Structure
    const initialAnswers = {}
    questions.forEach((q, idx) => {
        initialAnswers[idx] = { answer: 'No', comment: '' }
    })

    const CustomActions = () => (
        <button
            onClick={() => onOpenGuidance('Initiating Phase', '5.5 Phase Gate RfP (Ready for Planning)', { tab: 'Artefacts', label: 'Initiating Phase Exit Checklist' })}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center"
        >
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Open PM² Guidance for this Artefact
        </button>
    )

    const processLoadedContent = (content) => {
        // Handle legacy structure or cleanup
        const answers = content.answers || content // Handle if it was flat before? No, it was always nested/array-like? 
        // Previously: artefact.content.answers OR artefact.content if flat?
        // Let's assume content has `answers` key if we standardized it.
        // But wait, `initialData` has `answers`.
        // `mergedContent` in wrapper = `{ answers: initial, ...rest }`.
        // If loaded `rest` has `answers`, it overrides.

        const currentAnswers = content.answers || {}
        const cleanAnswers = {}

        // Filter out questions not in the current list
        questions.forEach((_, idx) => {
            if (currentAnswers[idx]) {
                cleanAnswers[idx] = currentAnswers[idx]
            } else {
                // Ensure default if missing
                cleanAnswers[idx] = { answer: 'No', comment: '' }
            }
        })

        return {
            ...content,
            answers: cleanAnswers
        }
    }

    return (
        <GovernedArtefactEditor
            artefact={artefact}
            onSave={onSave}
            onBack={onBack}
            title="Initiating Phase Exit Checklist"
            description="Phase-exit assessment for Initiating, aligned to the PM² template."
            actions={<CustomActions />}
            initialData={{ answers: initialAnswers }}
            processLoadedContent={processLoadedContent}
        >
            {({ data, onDataChange }) => {
                // data.answers contains the answers
                const answers = data.answers || initialAnswers // Fallback

                const handleChange = (index, field, value) => {
                    // Update nested structure
                    // We need to update `data.answers[index][field]`
                    // But `onDataChange` expects a top-level update to `contentData`.
                    // contentData = { answers: { ... } }

                    onDataChange(prev => ({
                        ...prev,
                        answers: {
                            ...prev.answers,
                            [index]: {
                                ...(prev.answers[index] || { answer: 'No', comment: '' }),
                                [field]: value
                            }
                        }
                    }))
                }

                return (
                    <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/3">Question</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Answer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comments / Justification</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.map((question, index) => {
                                    const answerData = answers[index] || { answer: 'No', comment: '' }

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium align-top">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium align-top leading-relaxed">
                                                {question}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex flex-col space-y-2">
                                                    {['Yes', 'Partially', 'No', 'Not Applicable'].map(option => (
                                                        <label key={option} className="inline-flex items-center cursor-pointer group">
                                                            <input
                                                                type="radio"
                                                                name={`q-${index}`}
                                                                value={option}
                                                                checked={answerData.answer === option}
                                                                onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                                                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 group-hover:border-blue-400"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <ArtefactTextarea
                                                    value={answerData.comment}
                                                    onChange={(e) => handleChange(index, 'comment', e.target.value)}
                                                    rows={2}
                                                    placeholder="Add justification..."
                                                    className="min-h-[80px]"
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            }}
        </GovernedArtefactEditor>
    )
}

export default InitiatingPhaseExitChecklist
