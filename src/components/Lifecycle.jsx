import React, { useState } from "react";
import lifecycleData from "../data/lifecycle.json";

const Lifecycle = () => {
    const [openPhase, setOpenPhase] = useState(null);

    const togglePhase = (key) => {
        setOpenPhase(prev => (prev === key ? null : key));
    };

    const openGuidanceDrawer = (phaseKey) => {
        console.log("Open guidance drawer for:", phaseKey);
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">PM² Lifecycle</h1>

            {Object.entries(lifecycleData).map(([phaseKey, phaseData]) => {
                const isOpen = openPhase === phaseKey;

                return (
                    <div
                        key={phaseKey}
                        className="border border-gray-300 rounded-lg shadow-sm"
                    >
                        <button
                            onClick={() => togglePhase(phaseKey)}
                            className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
                        >
                            <span className="text-lg font-semibold capitalize">
                                {phaseKey.replace("_", " ")}
                            </span>
                            <span className="text-xl">{isOpen ? "−" : "+"}</span>
                        </button>

                        {isOpen && (
                            <div className="p-4 space-y-6 bg-white rounded-b-lg">

                                <section>
                                    <h2 className="text-lg font-semibold mb-2">Overview</h2>
                                    <p className="text-gray-700">{phaseData.overview}</p>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold mb-2">Key Activities</h2>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {phaseData.activities.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold mb-2">Inputs</h2>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {phaseData.inputs.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold mb-2">Outputs</h2>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {phaseData.outputs.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-lg font-semibold mb-2">Responsibilities</h2>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {phaseData.responsibilities.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </section>

                                {phaseData.phase_gate && (
                                    <section>
                                        <h2 className="text-lg font-semibold mb-2">
                                            Phase Gate: {phaseData.phase_gate.name}
                                        </h2>
                                        <ul className="list-disc pl-6 space-y-1">
                                            {phaseData.phase_gate.criteria.map((criterion, idx) => (
                                                <li key={idx}>{criterion}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                <button
                                    onClick={() => openGuidanceDrawer(phaseKey)}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    View Full PM² Guidance
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Lifecycle;
