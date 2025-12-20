import React from 'react'
import { ArtefactField, ArtefactInput } from '../../artefacts/ui/ArtefactFields'
import RichTextEditor from '../../artefacts/ui/RichTextEditor'

const StepProjectOwner = ({ data, onChange }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Project Owner</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Who is the person accountable for the project's success?
                </p>
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ArtefactField label="Name">
                        <ArtefactInput
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder="e.g. John Doe"
                            autoFocus
                        />
                    </ArtefactField>
                    <ArtefactField label="Organisation / Unit">
                        <ArtefactInput
                            value={data.organisation}
                            onChange={(e) => onChange('organisation', e.target.value)}
                            placeholder="e.g. IT Department"
                        />
                    </ArtefactField>
                    <div className="md:col-span-2">
                        <ArtefactField label="Expectations / Needs">
                            <RichTextEditor
                                value={data.expectations}
                                onChange={(val) => onChange('expectations', val)}
                                placeholder="What does this stakeholder expect from the project?"
                            />
                        </ArtefactField>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StepProjectOwner
