import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeftIcon, BookOpenIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import WizardStepper from '../../ui/WizardStepper'
import StepProjectOwner from './StepProjectOwner'
import StepBusinessManager from './StepBusinessManager'
import StepSolutionProvider from './StepSolutionProvider'
import StepAdditionalStakeholders from './StepAdditionalStakeholders'
import StepReview from './StepReview'

const steps = [
    { id: 0, name: 'Project Owner' },
    { id: 1, name: 'Business Manager' },
    { id: 2, name: 'Solution Provider' },
    { id: 3, name: 'Additional' },
    { id: 4, name: 'Review' },
]

const StakeholderWizard = ({ projectId, onBack, onOpenGuidance }) => {
    // Data State
    const [data, setData] = useState({
        projectOwner: { name: '', organisation: '', expectations: '' },
        businessManager: { name: '', organisation: '', expectations: '' },
        solutionProvider: { name: '', organisation: '', expectations: '' },
        additionalStakeholders: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(() => {
        if (!projectId) return 0
        const savedStep = sessionStorage.getItem(`stakeholder_wizard_step_${projectId}`)
        return savedStep ? parseInt(savedStep, 10) : 0
    })

    // Persist current step
    useEffect(() => {
        if (projectId) {
            sessionStorage.setItem(`stakeholder_wizard_step_${projectId}`, currentStep)
        }
    }, [currentStep, projectId])

    // Save State
    const [isDirty, setIsDirty] = useState(false)
    const [saveStatus, setSaveStatus] = useState('idle')
    const baselineRef = useRef(null)

    // Helper to normalize data for comparison
    const normalizeForComparison = (obj) => {
        if (!obj) return obj
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === 'string') {
                if (value === '<p></p>') return ''
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
                        const fullData = {
                            projectOwner: { name: '', organisation: '', expectations: '', ...loadedData.projectOwner },
                            businessManager: { name: '', organisation: '', expectations: '', ...loadedData.businessManager },
                            solutionProvider: { name: '', organisation: '', expectations: '', ...loadedData.solutionProvider },
                            additionalStakeholders: loadedData.additionalStakeholders || []
                        }
                        setData(fullData)
                        baselineRef.current = JSON.stringify(normalizeForComparison(fullData))
                        setIsDirty(false)
                    } else {
                        const defaultData = {
                            projectOwner: { name: '', organisation: '', expectations: '' },
                            businessManager: { name: '', organisation: '', expectations: '' },
                            solutionProvider: { name: '', organisation: '', expectations: '' },
                            additionalStakeholders: []
                        }
                        await window.electronAPI.writeJSON(filePath, defaultData)
                        setData(defaultData)
                        baselineRef.current = JSON.stringify(normalizeForComparison(defaultData))
                        setIsDirty(false)
                    }
                } catch (error) {
                    console.error("Error loading stakeholder data", error)
                }
            } else {
                baselineRef.current = JSON.stringify(normalizeForComparison(data))
            }
            setIsLoading(false)
        }
        loadData()
    }, [projectId])

    // Dirty Check
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

    // Step Handlers
    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1)
        else {
            // Finish action - save and exit?
            saveData().then(() => {
                onBack()
            })
        }
    }

    const handleStepBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1)
        else onBack() // If on step 0, go back to menu
    }

    // Data Update Handlers
    const updateProjectOwner = (field, value) => {
        setData(prev => ({ ...prev, projectOwner: { ...prev.projectOwner, [field]: value } }))
    }

    const updateBusinessManager = (field, value) => {
        setData(prev => ({ ...prev, businessManager: { ...prev.businessManager, [field]: value } }))
    }

    const updateSolutionProvider = (field, value) => {
        setData(prev => ({ ...prev, solutionProvider: { ...prev.solutionProvider, [field]: value } }))
    }

    const addStakeholder = () => {
        setData(prev => ({
            ...prev,
            additionalStakeholders: [
                ...prev.additionalStakeholders,
                { id: Date.now(), name: '', role: '', organisation: '', expectations: '' }
            ]
        }))
    }

    const updateAdditionalStakeholder = (id, field, value) => {
        setData(prev => ({
            ...prev,
            additionalStakeholders: prev.additionalStakeholders.map(s =>
                s.id === id ? { ...s, [field]: value } : s
            )
        }))
    }

    const deleteStakeholder = (id) => {
        setData(prev => ({
            ...prev,
            additionalStakeholders: prev.additionalStakeholders.filter(s => s.id !== id)
        }))
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
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

            <div className="bg-white border-b border-gray-200 py-4 flex justify-center sticky top-0 z-10">
                <WizardStepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-8 w-full">
                {currentStep === 0 && (
                    <StepProjectOwner
                        data={data.projectOwner}
                        onChange={updateProjectOwner}
                    />
                )}
                {currentStep === 1 && (
                    <StepBusinessManager
                        data={data.businessManager}
                        onChange={updateBusinessManager}
                    />
                )}
                {currentStep === 2 && (
                    <StepSolutionProvider
                        data={data.solutionProvider}
                        onChange={updateSolutionProvider}
                    />
                )}
                {currentStep === 3 && (
                    <StepAdditionalStakeholders
                        stakeholders={data.additionalStakeholders}
                        onAdd={addStakeholder}
                        onUpdate={updateAdditionalStakeholder}
                        onDelete={deleteStakeholder}
                    />
                )}
                {currentStep === 4 && (
                    <StepReview data={data} />
                )}
            </div>

            {/* Footer Navigation */}
            <div className="bg-white border-t border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
                <button
                    onClick={handleStepBack}
                    className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                    {currentStep === 0 ? 'Back to Menu' : 'Back'}
                </button>

                <button
                    onClick={handleNext}
                    className={`px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${currentStep === 4 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {currentStep === 4 ? (
                        <>
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Finish & Save
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRightIcon className="h-4 w-4 ml-2" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default StakeholderWizard
