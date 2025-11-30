import { useState, useEffect, useMemo, Fragment } from 'react'
import {
    HomeIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon,
    ClipboardDocumentListIcon,
    BookOpenIcon,
    Cog6ToothIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ArrowLeftIcon,
    TrashIcon
} from '@heroicons/react/24/outline'
import Lifecycle from './components/Lifecycle'

function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-md p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Entry</h3>
                <p className="text-gray-500 mb-6">Are you sure you want to delete this entry? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

function LogModal({ isOpen, onClose, type, onSave, initialData }) {
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData)
            } else {
                setFormData({
                    dateLogged: new Date().toISOString().split('T')[0]
                })
            }
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const newData = { ...prev, [name]: value }

            // Auto-calculate Risk Level
            if (type === 'Risks' && (name === 'likelihood' || name === 'impact')) {
                const likelihood = name === 'likelihood' ? value : prev.likelihood
                const impact = name === 'impact' ? value : prev.impact
                if (likelihood && impact) {
                    const levels = { Low: 1, Medium: 2, High: 3 }
                    const score = levels[likelihood] * levels[impact]
                    let level = 'Low'
                    if (score >= 3 && score <= 5) level = 'Medium'
                    if (score >= 6) level = 'High'
                    newData.level = level
                }
            }
            return newData
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
        onClose()
        setFormData({}) // Reset form
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-300 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">{initialData ? 'Edit' : 'Add New'} {type}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Common Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input required name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea required name="description" value={formData.description || ''} rows="3" onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                    </div>

                    {/* Type Specific Fields */}
                    {type === 'Risks' && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood</label>
                                <select name="likelihood" value={formData.likelihood || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500">
                                    <option value="">Select...</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                                <select name="impact" value={formData.impact || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500">
                                    <option value="">Select...</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <input readOnly name="level" value={formData.level || ''} className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm" />
                            </div>
                        </div>
                    )}

                    {type === 'Issues' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            <select name="severity" value={formData.severity || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500">
                                <option value="">Select...</option>
                                <option value="Minor">Minor</option>
                                <option value="Major">Major</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    )}

                    {type === 'Dependencies' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500">
                                <option value="">Select...</option>
                                <option value="Upstream">Upstream</option>
                                <option value="Downstream">Downstream</option>
                            </select>
                        </div>
                    )}

                    {/* More Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                            <input name="owner" value={formData.owner || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500">
                                <option value="">Select...</option>
                                {type === 'Assumptions' ? (
                                    <>
                                        <option value="Valid">Valid</option>
                                        <option value="Invalid">Invalid</option>
                                        <option value="Pending">Pending</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Open">Open</option>
                                        <option value="Closed">Closed</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {type === 'Risks' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mitigation</label>
                            <textarea name="mitigation" value={formData.mitigation || ''} rows="2" onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Logged</label>
                        <input type="date" name="dateLogged" value={formData.dateLogged || ''} onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes/Updates</label>
                        <textarea name="notes" value={formData.notes || ''} rows="3" onChange={handleChange} className="w-full bg-gray-100 border-gray-400 text-gray-800 rounded-md shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500" />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-300 px-6 py-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function App() {
    const [activeTab, setActiveTab] = useState('Home')
    const [activePhase, setActivePhase] = useState('Initiating')
    const [showMCInfo, setShowMCInfo] = useState(false)
    const [activeLogTab, setActiveLogTab] = useState('Risks')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
    const [logs, setLogs] = useState({
        Risks: [],
        Assumptions: [],
        Issues: [],
        Dependencies: []
    })
    const [artefacts, setArtefacts] = useState([])
    const [activeArtefact, setActiveArtefact] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState(null)

    const navItems = [
        { name: 'Home', icon: HomeIcon },
        { name: 'Lifecycle', icon: ArrowPathIcon },
        { name: 'Artefacts', icon: DocumentDuplicateIcon },
        { name: 'Logs', icon: ClipboardDocumentListIcon },
        { name: 'Guidance', icon: BookOpenIcon },
        { name: 'Settings', icon: Cog6ToothIcon },
    ]

    const phases = ['Initiating', 'Planning', 'Executing', 'Closing']
    const logTabs = ['Risks', 'Assumptions', 'Issues', 'Dependencies']

    const defaultArtefacts = [
        { id: 'business-case', name: 'Business Case', phase: 'Initiating', status: 'Not Started' },
        { id: 'project-charter', name: 'Project Charter', phase: 'Initiating', status: 'Not Started' },
        { id: 'stakeholder-matrix', name: 'Stakeholder Matrix', phase: 'Initiating', status: 'Not Started' },
        { id: 'project-work-plan', name: 'Project Work Plan', phase: 'Planning', status: 'Not Started' },
        { id: 'requirements-doc', name: 'Requirements Document', phase: 'Planning', status: 'Not Started' },
        { id: 'risk-log', name: 'Risk Log', phase: 'Planning', status: 'Not Started' },
        { id: 'quality-plan', name: 'Quality Plan', phase: 'Planning', status: 'Not Started' },
        { id: 'comm-plan', name: 'Communication Plan', phase: 'Planning', status: 'Not Started' },
        { id: 'procurement-plan', name: 'Procurement Plan', phase: 'Planning', status: 'Not Started' },
        { id: 'project-handbook', name: 'Project Handbook', phase: 'Planning', status: 'Not Started' },
        { id: 'status-reports', name: 'Status Reports', phase: 'Executing', status: 'Not Started' },
        { id: 'deliverables', name: 'Deliverables', phase: 'Executing', status: 'Not Started' },
        { id: 'end-project-report', name: 'End-of-Project Report', phase: 'Closing', status: 'Not Started' },
        { id: 'lessons-learned', name: 'Lessons Learned', phase: 'Closing', status: 'Not Started' },
    ]

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            if (window.electronAPI) {
                await window.electronAPI.ensureFolder('data/logs')

                // Load Logs
                const loadedLogs = {}
                for (const tab of logTabs) {
                    const data = await window.electronAPI.readJSON(`data/logs/${tab}.json`)
                    loadedLogs[tab] = data
                }
                setLogs(loadedLogs)

                // Load Artefacts
                const loadedArtefacts = await window.electronAPI.readJSON('data/artefacts.json')
                if (loadedArtefacts && loadedArtefacts.length > 0) {
                    setArtefacts(loadedArtefacts)
                } else {
                    setArtefacts(defaultArtefacts)
                    await window.electronAPI.writeJSON('data/artefacts.json', defaultArtefacts)
                }
            } else {
                setArtefacts(defaultArtefacts)
            }
        }
        loadData()
    }, [])

    const handleSaveLog = async (entry) => {
        let updatedList = [...logs[activeLogTab]]

        if (editingIndex !== null) {
            // Update existing
            updatedList[editingIndex] = entry
        } else {
            // Add new
            updatedList.push(entry)
        }

        // Update local state
        setLogs(prev => ({
            ...prev,
            [activeLogTab]: updatedList
        }))

        // Persist to file
        if (window.electronAPI) {
            await window.electronAPI.writeJSON(`data/logs/${activeLogTab}.json`, updatedList)
        }

        setEditingIndex(null)
    }

    const handleDeleteClick = (e, index) => {
        e.stopPropagation()
        setDeleteConfirmation({ index })
    }

    const confirmDelete = async () => {
        if (!deleteConfirmation) return

        const updatedList = logs[activeLogTab].filter((_, i) => i !== deleteConfirmation.index)

        // Update local state
        setLogs(prev => ({
            ...prev,
            [activeLogTab]: updatedList
        }))

        // Persist to file
        if (window.electronAPI) {
            await window.electronAPI.writeJSON(`data/logs/${activeLogTab}.json`, updatedList)
        }

        setDeleteConfirmation(null)
    }

    const openEditModal = (index) => {
        setEditingIndex(index)
        setIsModalOpen(true)
    }

    const handleAddNew = () => {
        setEditingIndex(null)
        setIsModalOpen(true)
    }

    const handleSort = (key) => {
        let direction = 'ascending'
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending'
        }
        setSortConfig({ key, direction })
    }

    const sortedLogs = useMemo(() => {
        let sortableItems = [...(logs[activeLogTab] || [])]
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1
                }
                return 0
            })
        }
        return sortableItems
    }, [logs, activeLogTab, sortConfig])

    const handleArtefactStatusChange = async (id, newStatus) => {
        const updatedArtefacts = artefacts.map(art =>
            art.id === id ? { ...art, status: newStatus } : art
        )
        setArtefacts(updatedArtefacts)

        if (activeArtefact && activeArtefact.id === id) {
            setActiveArtefact({ ...activeArtefact, status: newStatus })
        }

        if (window.electronAPI) {
            await window.electronAPI.writeJSON('data/artefacts.json', updatedArtefacts)
        }
    }

    const getColumns = (type) => {
        // Fixed width columns - using specific pixel widths to ensure they don't take too much space
        const dateCol = { key: 'dateLogged', label: 'Date', width: 'w-28', truncate: false } // ~112px
        const statusCol = { key: 'status', label: 'Status', width: 'w-24', truncate: false } // ~96px
        const ownerCol = { key: 'owner', label: 'Owner', width: 'w-24', truncate: true } // ~96px
        const actionsCol = { key: 'actions', label: 'Actions', width: 'w-24', truncate: false } // ~96px

        // Small metric columns
        const metricCol = (key, label) => ({ key, label, width: 'w-20', truncate: false }) // ~80px

        // Flexible columns - no specific width, will share remaining space
        const titleCol = { key: 'title', label: 'Title', width: '', truncate: true }
        const descCol = { key: 'description', label: 'Description', width: '', truncate: true }
        const notesCol = { key: 'notes', label: 'Notes', width: '', truncate: true }
        const mitigationCol = { key: 'mitigation', label: 'Mitigation', width: '', truncate: true }

        const common = [titleCol, descCol]
        const end = [ownerCol, statusCol, notesCol, dateCol, actionsCol]

        switch (type) {
            case 'Risks':
                return [
                    ...common,
                    metricCol('likelihood', 'Prob'),
                    metricCol('impact', 'Imp'),
                    metricCol('level', 'Lvl'),
                    mitigationCol,
                    ...end
                ]
            case 'Issues':
                return [
                    ...common,
                    metricCol('severity', 'Sev'),
                    ...end
                ]
            case 'Dependencies':
                return [
                    ...common,
                    metricCol('type', 'Type'),
                    ...end
                ]
            default: // Assumptions
                return [...common, ...end]
        }
    }

    const renderCellContent = (key, value) => {
        if (key === 'actions') {
            return (
                <button
                    onClick={(e) => handleDeleteClick(e, value)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Delete"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            )
        }

        if (!value) return <span className="text-gray-400">-</span>

        const statusColors = {
            'Open': 'bg-green-100 text-green-800',
            'Closed': 'bg-gray-100 text-gray-800',
            'Valid': 'bg-green-100 text-green-800',
            'Invalid': 'bg-red-100 text-red-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Not Started': 'bg-gray-100 text-gray-800',
            'In Progress': 'bg-blue-100 text-blue-800',
            'Complete': 'bg-green-100 text-green-800',
        }

        const levelColors = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-blue-100 text-blue-800',
            'Critical': 'bg-red-100 text-red-800',
            'Major': 'bg-orange-100 text-orange-800',
            'Minor': 'bg-blue-100 text-blue-800',
            'Upstream': 'bg-purple-100 text-purple-800',
            'Downstream': 'bg-indigo-100 text-indigo-800',
        }

        if (key === 'status') {
            return (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value}
                </span>
            )
        }

        if (key === 'level' || key === 'severity' || key === 'type') {
            return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value}
                </span>
            )
        }

        return <span className="text-sm text-gray-700">{value}</span>
    }

    const renderArtefactStatusChip = (status) => {
        const colors = {
            'Not Started': 'bg-gray-100 text-gray-600',
            'In Progress': 'bg-blue-100 text-blue-700',
            'Complete': 'bg-green-100 text-green-700',
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors['Not Started']}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className="w-[250px] bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
                {/* Header */}
                <div className="h-16 flex items-center justify-center border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-wider text-blue-400">GOVERNOR</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setActiveTab(item.name)
                                    setActiveArtefact(null) // Reset artefact detail view
                                }}
                                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 group ${activeTab === item.name
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${activeTab === item.name ? 'text-white' : 'text-gray-500 group-hover:text-white'
                                    }`} />
                                {item.name}
                            </button>
                        )
                    })}
                </nav>

                {/* User Profile / Footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                            US
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">User Name</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Bar (Optional) */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">{activeTab}</h2>
                    <div className="flex items-center space-x-4">
                        {/* Add top bar actions here if needed */}
                        <button className="text-sm text-gray-500 hover:text-gray-700">Help</button>
                        <button className="text-sm text-gray-500 hover:text-gray-700">Notifications</button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="w-full h-full">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] h-full flex flex-col">

                            {activeTab === 'Lifecycle' ? (
                                <Lifecycle />
                            ) : activeTab === 'Artefacts' ? (
                                <div className="flex flex-col h-full">
                                    {activeArtefact ? (
                                        // Artefact Detail View
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center mb-6">
                                                <button
                                                    onClick={() => setActiveArtefact(null)}
                                                    className="mr-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                                >
                                                    <ArrowLeftIcon className="h-5 w-5" />
                                                </button>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{activeArtefact.name}</h3>
                                                    <p className="text-sm text-gray-500">{activeArtefact.phase}</p>
                                                </div>
                                                <div className="ml-auto flex items-center space-x-3">
                                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                                    <select
                                                        value={activeArtefact.status}
                                                        onChange={(e) => handleArtefactStatusChange(activeArtefact.id, e.target.value)}
                                                        className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Complete">Complete</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 border-dashed flex items-center justify-center">
                                                <div className="text-center">
                                                    <DocumentDuplicateIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 font-medium">Content for this artefact will be added later.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Artefacts List View
                                        <div className="flex flex-col h-full">
                                            <h3 className="text-xl font-bold text-gray-800 mb-6">PM² Artefacts</h3>

                                            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg shadow-sm">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {phases.map(phase => {
                                                            const phaseArtefacts = artefacts.filter(a => a.phase === phase)
                                                            if (phaseArtefacts.length === 0) return null

                                                            return (
                                                                <Fragment key={phase}>
                                                                    <tr className="bg-gray-50">
                                                                        <td colSpan="4" className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                            {phase}
                                                                        </td>
                                                                    </tr>
                                                                    {phaseArtefacts.map(artefact => (
                                                                        <tr key={artefact.id} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                {artefact.name}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                {artefact.phase}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                {renderArtefactStatusChip(artefact.status)}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                <button
                                                                                    onClick={() => setActiveArtefact(artefact)}
                                                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                                                >
                                                                                    View
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </Fragment>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === 'Logs' ? (
                                <div className="flex flex-col h-full">
                                    {/* Logs Sub-navigation */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                            {logTabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveLogTab(tab)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeLogTab === tab
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleAddNew}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm flex items-center"
                                        >
                                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add New
                                        </button>
                                    </div>

                                    {/* Logs Content - Table View */}
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                                            {activeLogTab} Log
                                        </h3>

                                        <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg shadow-sm flex flex-col">
                                            <table className="w-full table-fixed divide-y divide-gray-200 border-collapse">
                                                <thead className="bg-gray-50 sticky top-0 z-10">
                                                    <tr>
                                                        {getColumns(activeLogTab).map((col) => (
                                                            <th
                                                                key={col.key}
                                                                onClick={() => col.key !== 'actions' && handleSort(col.key)}
                                                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap ${col.width} ${col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                                            >
                                                                <div className="flex items-center space-x-1">
                                                                    <span>{col.label}</span>
                                                                    {sortConfig.key === col.key && (
                                                                        sortConfig.direction === 'ascending'
                                                                            ? <ChevronUpIcon className="h-3 w-3" />
                                                                            : <ChevronDownIcon className="h-3 w-3" />
                                                                    )}
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {sortedLogs.length > 0 ? (
                                                        sortedLogs.map((entry, index) => (
                                                            <tr
                                                                key={index}
                                                                onClick={() => openEditModal(index)}
                                                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                            >
                                                                {getColumns(activeLogTab).map((col) => (
                                                                    <td key={col.key} className={`px-6 py-4 text-sm text-gray-500 border-r border-gray-100 last:border-r-0 ${col.width}`}>
                                                                        <div
                                                                            className={`${col.truncate ? 'truncate' : ''}`}
                                                                            title={col.truncate ? entry[col.key] : undefined}
                                                                        >
                                                                            {renderCellContent(col.key, col.key === 'actions' ? index : entry[col.key])}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={getColumns(activeLogTab).length} className="px-6 py-12 text-center text-gray-500">
                                                                No {activeLogTab} entries yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to {activeTab}</h3>
                                    <p className="text-gray-500">
                                        This is the main content area for the {activeTab} module.
                                        Resize the window to see how the layout behaves.
                                    </p>
                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Placeholder Cards */}
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-32 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400">
                                                Content Card {i}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                </div>

                {/* Modals */}
                <LogModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    type={activeLogTab}
                    onSave={handleSaveLog}
                    initialData={editingIndex !== null ? logs[activeLogTab][editingIndex] : null}
                />

                <DeleteConfirmationModal
                    isOpen={!!deleteConfirmation}
                    onClose={() => setDeleteConfirmation(null)}
                    onConfirm={confirmDelete}
                />
            </main>
        </div>
    )
}

export default App

