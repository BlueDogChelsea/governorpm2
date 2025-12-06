import React, { useState } from 'react'
import { PlusIcon, FolderOpenIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ProjectsPage({ projects, activeProjectId, onCreateProject, onOpenProject, onRenameProject, onDeleteProject }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [projectToRename, setProjectToRename] = useState(null)
    const [projectToDelete, setProjectToDelete] = useState(null)
    const [newProjectName, setNewProjectName] = useState('')
    const [renameName, setRenameName] = useState('')

    const handleCreateSubmit = (e) => {
        e.preventDefault()
        if (newProjectName.trim()) {
            onCreateProject(newProjectName.trim())
            setNewProjectName('')
            setIsCreateModalOpen(false)
        }
    }

    const handleRenameSubmit = (e) => {
        e.preventDefault()
        if (renameName.trim() && projectToRename) {
            onRenameProject(projectToRename.id, renameName.trim())
            setProjectToRename(null)
            setRenameName('')
            setIsRenameModalOpen(false)
        }
    }

    const startRename = (project) => {
        setProjectToRename(project)
        setRenameName(project.name)
        setIsRenameModalOpen(true)
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-500 mt-1">Manage your governance projects</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div
                        key={project.id}
                        className={`bg-white rounded-xl border p-6 flex flex-col transition-all hover:shadow-md ${activeProjectId === project.id
                                ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm'
                                : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <FolderOpenIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            {activeProjectId === project.id && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Active
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={project.name}>
                            {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            Created: {new Date(project.createdAt || Date.now()).toLocaleDateString()}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                                onClick={() => onOpenProject(project.id)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Open Project
                            </button>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => startRename(project)}
                                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
                                    title="Rename"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setProjectToDelete(project)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                                    title="Delete"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter project name..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {isRenameModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-semibold mb-4">Rename Project</h3>
                        <form onSubmit={handleRenameSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={renameName}
                                    onChange={(e) => setRenameName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRenameModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {projectToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-semibold mb-2">Delete Project?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{projectToDelete.name}</strong>? This will permanently delete all artefacts and logs associated with this project. This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setProjectToDelete(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteProject(projectToDelete.id)
                                    setProjectToDelete(null)
                                }}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
