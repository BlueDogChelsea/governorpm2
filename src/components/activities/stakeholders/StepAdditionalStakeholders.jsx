import React, { useState } from 'react'
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

const StepAdditionalStakeholders = ({ stakeholders, onAdd, onEdit, onDelete }) => {
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
            <div className="flex justify-between items-center border-b border-gray-200 pb-5">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Stakeholders</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Identify other key individuals or groups involved.
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none shadow-sm transition-colors"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Stakeholder
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {stakeholders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        No additional stakeholders recorded yet. Click "Add Stakeholder" to create one.
                    </div>
                ) : (
                    stakeholders.map((row) => (
                        <div key={row.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(row)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Edit Stakeholder"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(row.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete Stakeholder"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                                    <div className="text-sm font-medium text-gray-900">{row.name || '-'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role / Function</label>
                                    <div className="text-sm text-gray-900">{row.role || '-'}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Organisation</label>
                                    <div className="text-sm text-gray-900">{row.organisation || '-'}</div>
                                </div>
                                <div className="md:col-span-3 mt-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expectations</label>
                                    <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: row.expectations || '-' }} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
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
