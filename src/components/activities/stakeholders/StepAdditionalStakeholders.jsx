import React, { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ArtefactField, ArtefactInput } from '../../artefacts/ui/ArtefactFields'
import RichTextEditor from '../../artefacts/ui/RichTextEditor'

const StepAdditionalStakeholders = ({ stakeholders, onAdd, onUpdate, onDelete }) => {
    // If we wanted local delete confirmation, we could add state here.
    // For now, let's keep it simple or use the parent's delete logic if complex confirmation is needed.
    // But typically a wizard step can handle its own UI interactions. 
    // Let's implement a simple delete confirmation inside this component.

    const [deleteId, setDeleteId] = useState(null)

    const handleDeleteClick = (id) => {
        setDeleteId(id)
    }

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId)
            setDeleteId(null)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Stakeholders</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Are there any other key individuals or groups involved?
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Stakeholder
                </button>
            </div>

            <div className="space-y-4">
                {stakeholders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No additional stakeholders recorded yet. Click "Add Stakeholder" to create one.
                    </div>
                ) : (
                    stakeholders.map((row) => (
                        <div key={row.id} className="bg-white p-6 rounded-xl border border-gray-200 relative shadow-sm group">
                            <button
                                onClick={() => handleDeleteClick(row.id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Delete Stakeholder"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-8">
                                <ArtefactField label="Name">
                                    <ArtefactInput
                                        value={row.name}
                                        onChange={(e) => onUpdate(row.id, 'name', e.target.value)}
                                        placeholder="Name"
                                    />
                                </ArtefactField>
                                <ArtefactField label="Role / Function">
                                    <ArtefactInput
                                        value={row.role}
                                        onChange={(e) => onUpdate(row.id, 'role', e.target.value)}
                                        placeholder="Role"
                                    />
                                </ArtefactField>
                                <ArtefactField label="Organisation">
                                    <ArtefactInput
                                        value={row.organisation}
                                        onChange={(e) => onUpdate(row.id, 'organisation', e.target.value)}
                                        placeholder="Organisation"
                                    />
                                </ArtefactField>
                                <div className="md:col-span-2">
                                    <ArtefactField label="Expectations">
                                        <RichTextEditor
                                            value={row.expectations}
                                            onChange={(val) => onUpdate(row.id, 'expectations', val)}
                                            placeholder="Expectations"
                                        />
                                    </ArtefactField>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Stakeholder</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete this stakeholder? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StepAdditionalStakeholders
