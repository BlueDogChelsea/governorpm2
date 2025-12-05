import React from 'react'
import ArtefactSection from './ArtefactSection'
import { ArtefactField, ArtefactInput } from './ArtefactFields'

const ArtefactApprovalSection = ({
    approvalState,
    onUpdate,
    onToggleApproval,
    isOpen,
    onToggle,
    isModified // New prop
}) => {
    const { approverName, approvalDate, signature, isApproved } = approvalState || {}

    const handleChange = (field, value) => {
        onUpdate(field, value)
    }

    // Determine Button State
    let buttonColor = 'bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
    let buttonText = 'Mark as Approved'
    let handleClick = onToggleApproval

    if (isApproved) {
        if (isModified) {
            // State B: Modified After Approval
            buttonColor = 'bg-blue-600 text-white hover:bg-blue-700'
            buttonText = 'Re-approve Changes'
        } else {
            // State A: Approved
            buttonColor = 'bg-green-600 text-white hover:bg-green-700'
            buttonText = 'Approved ✓'
        }
    }

    return (
        <ArtefactSection
            title="Approval"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <ArtefactField label="Approver Name">
                    <ArtefactInput
                        value={approverName || ''}
                        onChange={(e) => handleChange('approverName', e.target.value)}
                        placeholder="Enter approver name"
                    />
                </ArtefactField>
                <ArtefactField label="Approval Date">
                    <ArtefactInput
                        type="date"
                        value={approvalDate || ''}
                        onChange={(e) => handleChange('approvalDate', e.target.value)}
                    />
                </ArtefactField>
                <div className="md:col-span-2">
                    <ArtefactField label="Signature">
                        <ArtefactInput
                            value={signature || ''}
                            onChange={(e) => handleChange('signature', e.target.value)}
                            placeholder="Enter digital signature (text)"
                        />
                    </ArtefactField>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                    onClick={handleClick}
                    className={`px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center ${buttonColor}`}
                >
                    <span>{buttonText}</span>
                </button>
            </div>
        </ArtefactSection>
    )
}

export default ArtefactApprovalSection
