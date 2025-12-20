import React from 'react'

const ReviewSection = ({ title, data }) => (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.name || '-'}</dd>
            </div>
            <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Organisation</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.organisation || '-'}</dd>
            </div>
            <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Expectations</dt>
                <dd className="mt-1 text-sm text-gray-900 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.expectations || '-' }} />
            </div>
        </dl>
    </div>
)

const StepReview = ({ data }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Review Stakeholders</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Review and confirm the stakeholder information before finishing.
                </p>
            </div>

            <div className="space-y-6">
                <ReviewSection title="Project Owner" data={data.projectOwner} />
                <ReviewSection title="Business Manager" data={data.businessManager} />
                <ReviewSection title="Solution Provider" data={data.solutionProvider} />

                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Additional Stakeholders</h4>
                    {data.additionalStakeholders.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No additional stakeholders added.</p>
                    ) : (
                        <div className="space-y-6">
                            {data.additionalStakeholders.map((stakeholder, idx) => (
                                <div key={stakeholder.id} className={`pb-4 ${idx !== data.additionalStakeholders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                                        <div className="sm:col-span-1">
                                            <dt className="text-xs font-medium text-gray-500">Name</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{stakeholder.name || '-'}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-xs font-medium text-gray-500">Role</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{stakeholder.role || '-'}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-xs font-medium text-gray-500">Organisation</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{stakeholder.organisation || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StepReview
