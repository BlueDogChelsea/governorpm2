import React from 'react';
import LifecycleMap from '../components/LifecycleMap';

const Home = ({ onNavigate }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-8 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PM² Lifecycle</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Interactive guide to the PM² Project Management Methodology phases.
                    Click on any phase to explore detailed guidance, inputs, outputs, and artefacts.
                </p>
            </header>

            <div className="w-full flex justify-center">
                <LifecycleMap onNavigate={onNavigate} />
            </div>
        </div>
    );
};

export default Home;
