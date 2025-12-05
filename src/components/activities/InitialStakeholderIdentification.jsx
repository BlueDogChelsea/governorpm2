import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon, ExclamationCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from '../artefacts/ui/ArtefactFields'
import ArtefactSection from '../artefacts/ui/ArtefactSection'

const InitialStakeholderIdentification = ({ onBack, onOpenGuidance }) => {
    // Data State
    const [data, setData] = useState({
        projectOwner: { name: '', organisation: '', expectations: '' },
        businessManager: { name: '', organisation: '', expectations: '' },
        solutionProvider: { name: '', organisation: '', expectations: '' },
        additionalStakeholders: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [deleteId, setDeleteId] = useState(null)
    const [sectionsOpen, setSectionsOpen] = useState({
        core: true,
        additional: true
    })

    // Save State
    const [isDirty, setIsDirty] = useState(false)
    const [saveStatus, setSaveStatus] = useState('idle') // idle, saving, success, error

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (window.electronAPI) {
                try {
                    await window.electronAPI.ensureFolder('data/initiating')
                    const loadedData = await window.electronAPI.readJSON('data/initiating/stakeholders.json')
                    if (loadedData) {
                        setData(prev => ({
                            ...prev,
                            ...loadedData,
                            projectOwner: { ...prev.projectOwner, ...loadedData.projectOwner },
                            businessManager: { ...prev.businessManager, ...loadedData.businessManager },
                            solutionProvider: { ...prev.solutionProvider, ...loadedData.solutionProvider },
                            additionalStakeholders: loadedData.additionalStakeholders || []
                        }))
                    }
                } catch (error) {
                    console.error("Error loading stakeholder data", error)
                }
            }
            setIsLoading(false)
        }
        loadData()
    }, [])

    const saveData = async () => {
        setSaveStatus('saving')
        if (window.electronAPI) {
            try {
                await window.electronAPI.writeJSON('data/initiating/stakeholders.json', data)
                setSaveStatus('success')
                setIsDirty(false)

                // Reset success status after a moment
                setTimeout(() => setSaveStatus('idle'), 2000)
            } catch (error) {
                console.error("Error saving stakeholder data", error)
                setSaveStatus('error')
            }
        } else {
            // Mock
            setSaveStatus('success')
            setIsDirty(false)
            setTimeout(() => setSaveStatus('idle'), 2000)
        }
    }

    const handleChange = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
        setIsDirty(true)
        if (saveStatus !== 'idle') setSaveStatus('idle')
    }

    const handleAdditionalChange = (id, field, value) => {
        setData(prev => {
            const updatedList = prev.additionalStakeholders.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
            return { ...prev, additionalStakeholders: updatedList }
        })
        setIsDirty(true)
        if (saveStatus !== 'idle') setSaveStatus('idle')
    }

    const handleAddStakeholder = () => {
        setData(prev => {
            const newRow = {
                id: Date.now(),
                name: '',
                role: '',
                organisation: '',
                expectations: ''
            }
            return {
                ...prev,
                additionalStakeholders: [...prev.additionalStakeholders, newRow]
            }
        })
        setIsDirty(true)
        if (saveStatus !== 'idle') setSaveStatus('idle')
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
    }

    const confirmDelete = () => {
        if (!deleteId) return
        setData(prev => {
            const updatedList = prev.additionalStakeholders.filter(item => item.id !== deleteId)
            return { ...prev, additionalStakeholders: updatedList }
        })
        setDeleteId(null)
        setIsDirty(true)
        if (saveStatus !== 'idle') setSaveStatus('idle')
    }

    const toggleSection = (id) => {
        setSectionsOpen(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                onBack()
            }
        } else {
            onBack()
        }
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={handleBack}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Initial Stakeholder Identification</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Record the key stakeholders involved during the Initiating Phase.
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onOpenGuidance('Roles & Organisation', null, { tab: 'Lifecycle', label: 'Stakeholder Identification' })}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center"
                    >
                        <BookOpenIcon className="h-4 w-4 mr-2" />
                        Open PM² Guidance
                    </button>
                    <button
                        onClick={saveData}
                        disabled={(!isDirty && saveStatus !== 'error') || saveStatus === 'saving' || saveStatus === 'success'}
                        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm flex items-center transition-all duration-200 ${saveStatus === 'saving'
                            ? 'bg-slate-400 text-white cursor-wait'
                            : saveStatus === 'success'
                                ? 'bg-green-500 text-white'
                                : saveStatus === 'error'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : isDirty
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-600 text-white opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {saveStatus === 'saving' && <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />}
                        {saveStatus === 'success' && <CheckCircleIcon className="h-4 w-4 mr-2" />}
                        {saveStatus === 'error' && <ExclamationCircleIcon className="h-4 w-4 mr-2" />}
                        {saveStatus === 'idle' && <CheckCircleIcon className="h-4 w-4 mr-2" />}

                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'success' && 'Saved'}
                        {saveStatus === 'error' && 'Save Failed'}
                        {saveStatus === 'idle' && 'Save'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8 max-w-5xl mx-auto w-full">

                {/* Core Stakeholders */}
                <ArtefactSection
                    id="core"
                    title="Core Stakeholders"
                    isOpen={sectionsOpen.core}
                    onToggle={toggleSection}
                >
                    <div className="space-y-8">
                        {/* Project Owner */}
                        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <h4 className="text-base font-semibold text-gray-900 mb-4">1. Project Owner</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ArtefactField label="Name">
                                    <ArtefactInput
                                        value={data.projectOwner.name}
                                        onChange={(e) => handleChange('projectOwner', 'name', e.target.value)}
                                    />
                                </ArtefactField>
                                <ArtefactField label="Organisation / Unit">
                                    <ArtefactInput
                                        value={data.projectOwner.organisation}
                                        onChange={(e) => handleChange('projectOwner', 'organisation', e.target.value)}
                                    />
                                </ArtefactField>
                                <div className="md:col-span-2">
                                    <ArtefactField label="Expectations / Needs">
                                        <ArtefactTextarea
                                            value={data.projectOwner.expectations}
                                            onChange={(e) => handleChange('projectOwner', 'expectations', e.target.value)}
                                            rows={3}
                                        />
                                    </ArtefactField>
                                </div>
                            </div>
                        </div>

                        {/* Business Manager */}
                        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <h4 className="text-base font-semibold text-gray-900 mb-4">2. Business Manager</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ArtefactField label="Name">
                                    <ArtefactInput
                                        value={data.businessManager.name}
                                        onChange={(e) => handleChange('businessManager', 'name', e.target.value)}
                                    />
                                </ArtefactField>
                                <ArtefactField label="Organisation / Unit">
                                    <ArtefactInput
                                        value={data.businessManager.organisation}
                                        onChange={(e) => handleChange('businessManager', 'organisation', e.target.value)}
                                    />
                                </ArtefactField>
                                <div className="md:col-span-2">
                                    <ArtefactField label="Expectations / Needs">
                                        <ArtefactTextarea
                                            value={data.businessManager.expectations}
                                            onChange={(e) => handleChange('businessManager', 'expectations', e.target.value)}
                                            rows={3}
                                        />
                                    </ArtefactField>
                                </div>
                            </div>
                        </div>

                        {/* Solution Provider */}
                        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <h4 className="text-base font-semibold text-gray-900 mb-4">3. Solution Provider <span className="font-normal text-gray-500 text-sm">(Optional)</span></h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ArtefactField label="Name">
                                    <ArtefactInput
                                        value={data.solutionProvider.name}
                                        onChange={(e) => handleChange('solutionProvider', 'name', e.target.value)}
                                    />
                                </ArtefactField>
                                <ArtefactField label="Organisation / Unit">
                                    <ArtefactInput
                                        value={data.solutionProvider.organisation}
                                        onChange={(e) => handleChange('solutionProvider', 'organisation', e.target.value)}
                                    />
                                </ArtefactField>
                                <div className="md:col-span-2">
                                    <ArtefactField label="Expectations / Needs">
                                        <ArtefactTextarea
                                            value={data.solutionProvider.expectations}
                                            onChange={(e) => handleChange('solutionProvider', 'expectations', e.target.value)}
                                            rows={3}
                                        />
                                    </ArtefactField>
                                </div>
                            </div>
                        </div>
                    </div>
                </ArtefactSection>

                {/* Additional Stakeholders */}
                <ArtefactSection
                    id="additional"
                    title="Additional Stakeholders"
                    isOpen={sectionsOpen.additional}
                    onToggle={toggleSection}
                >
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={handleAddStakeholder}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Stakeholder
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {data.additionalStakeholders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                No additional stakeholders recorded.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.additionalStakeholders.map((row) => (
                                    <div key={row.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                        <button
                                            onClick={() => handleDeleteClick(row.id)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1"
                                            title="Delete Stakeholder"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-10">
                                            <ArtefactField label="Name" className="bg-white">
                                                <ArtefactInput
                                                    value={row.name}
                                                    onChange={(e) => handleAdditionalChange(row.id, 'name', e.target.value)}
                                                    className="border-gray-200"
                                                />
                                            </ArtefactField>
                                            <ArtefactField label="Role / Function" className="bg-white">
                                                <ArtefactInput
                                                    value={row.role}
                                                    onChange={(e) => handleAdditionalChange(row.id, 'role', e.target.value)}
                                                    className="border-gray-200"
                                                />
                                            </ArtefactField>
                                            <ArtefactField label="Organisation" className="bg-white">
                                                <ArtefactInput
                                                    value={row.organisation}
                                                    onChange={(e) => handleAdditionalChange(row.id, 'organisation', e.target.value)}
                                                    className="border-gray-200"
                                                />
                                            </ArtefactField>
                                            <ArtefactField label="Expectations" className="bg-white">
                                                <ArtefactTextarea
                                                    value={row.expectations}
                                                    onChange={(e) => handleAdditionalChange(row.id, 'expectations', e.target.value)}
                                                    className="border-gray-200 min-h-[50px] h-[50px]"
                                                    rows={1}
                                                />
                                            </ArtefactField>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ArtefactSection>
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

export default InitialStakeholderIdentification
