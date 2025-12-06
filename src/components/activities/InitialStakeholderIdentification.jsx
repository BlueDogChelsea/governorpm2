import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeftIcon, PlusIcon, TrashIcon, CheckCircleIcon, ArrowPathIcon, ExclamationCircleIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { ArtefactField, ArtefactInput, ArtefactTextarea } from '../artefacts/ui/ArtefactFields'
import ArtefactSection from '../artefacts/ui/ArtefactSection'
import RichTextEditor from '../artefacts/ui/RichTextEditor'

const InitialStakeholderIdentification = ({ projectId, onBack, onOpenGuidance }) => {
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

    // Baseline for dirty check
    const baselineRef = useRef(null)

    // Helper to normalize data for comparison (handling rich text empty states and wrapping)
    const normalizeForComparison = (obj) => {
        if (!obj) return obj
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === 'string') {
                // Handle empty rich text
                if (value === '<p></p>') return ''
                // Handle wrapped text (e.g. "Text" vs "<p>Text</p>")
                // This is a naive strip, but sufficient for dirty check on simple content
                if (value.startsWith('<p>') && value.endsWith('</p>')) {
                    return value.slice(3, -4)
                }
            }
            if (value === null) return ''
            return value
        }))
    }

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (window.electronAPI && projectId) {
                try {
                    const filePath = `projects/${projectId}/initialStakeholders.json`
                    const loadedData = await window.electronAPI.readJSON(filePath)

                    if (loadedData) {
                        // Prepare the full data object based on loaded + defaults
                        const fullData = {
                            projectOwner: { name: '', organisation: '', expectations: '', ...loadedData.projectOwner },
                            businessManager: { name: '', organisation: '', expectations: '', ...loadedData.businessManager },
                            solutionProvider: { name: '', organisation: '', expectations: '', ...loadedData.solutionProvider },
                            additionalStakeholders: loadedData.additionalStakeholders || []
                        }

                        setData(fullData)
                        // snapshot baseline
                        baselineRef.current = JSON.stringify(normalizeForComparison(fullData))
                        setIsDirty(false)
                    } else {
                        // New project or file missing - create default file
                        const defaultData = {
                            projectOwner: { name: '', organisation: '', expectations: '' },
                            businessManager: { name: '', organisation: '', expectations: '' },
                            solutionProvider: { name: '', organisation: '', expectations: '' },
                            additionalStakeholders: []
                        }

                        // Write default to file immediately as per requirements
                        await window.electronAPI.writeJSON(filePath, defaultData)

                        setData(defaultData)
                        baselineRef.current = JSON.stringify(normalizeForComparison(defaultData))
                        setIsDirty(false)
                    }
                } catch (error) {
                    console.error("Error loading stakeholder data", error)
                }
            } else {
                // Mock / Browser
                baselineRef.current = JSON.stringify(normalizeForComparison(data))
            }
            setIsLoading(false)
        }
        loadData()
    }, [projectId])

    // Robust Dirty Check Effect
    useEffect(() => {
        if (!isLoading && baselineRef.current) {
            const currentStr = JSON.stringify(normalizeForComparison(data))
            const isChanged = currentStr !== baselineRef.current
            setIsDirty(isChanged)
            if (isChanged && saveStatus !== 'idle') setSaveStatus('idle')
        }
    }, [data, isLoading, saveStatus])

    const saveData = async () => {
        setSaveStatus('saving')
        if (window.electronAPI && projectId) {
            try {
                const filePath = `projects/${projectId}/initialStakeholders.json`
                await window.electronAPI.writeJSON(filePath, data)
                setSaveStatus('success')
                // Update baseline to new clean state
                baselineRef.current = JSON.stringify(normalizeForComparison(data))
                setIsDirty(false)
                setTimeout(() => setSaveStatus('idle'), 2000)
            } catch (error) {
                console.error("Error saving stakeholder data", error)
                setSaveStatus('error')
            }
        } else {
            setSaveStatus('success')
            baselineRef.current = JSON.stringify(normalizeForComparison(data))
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
    }

    const handleAdditionalChange = (id, field, value) => {
        setData(prev => {
            const updatedList = prev.additionalStakeholders.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
            return { ...prev, additionalStakeholders: updatedList }
        })
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
    }

    const toggleSection = (id) => {
        setSectionsOpen(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const [showExitModal, setShowExitModal] = useState(false)

    const handleBack = () => {
        if (isDirty) {
            setShowExitModal(true)
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
                                        <RichTextEditor
                                            value={data.projectOwner.expectations}
                                            onChange={(val) => handleChange('projectOwner', 'expectations', val)}
                                            placeholder="What does this stakeholder expect?"
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
                                        <RichTextEditor
                                            value={data.businessManager.expectations}
                                            onChange={(val) => handleChange('businessManager', 'expectations', val)}
                                            placeholder="What does this stakeholder expect?"
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
                                        <RichTextEditor
                                            value={data.solutionProvider.expectations}
                                            onChange={(val) => handleChange('solutionProvider', 'expectations', val)}
                                            placeholder="What does this stakeholder expect?"
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
                                                <RichTextEditor
                                                    value={row.expectations}
                                                    onChange={(val) => handleAdditionalChange(row.id, 'expectations', val)}
                                                    className=""
                                                    placeholder="Expectations"
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

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
                        <p className="text-gray-500 mb-6">You have unsaved changes. Are you sure you want to leave without saving?</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Leave Without Saving
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InitialStakeholderIdentification
