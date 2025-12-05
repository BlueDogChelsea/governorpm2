import React from 'react';

const LifecycleMap = ({ onNavigate }) => {
    // Hotspot coordinates (percentages)
    // Based on standard PM2 Lifecycle Diagram layout
    const hotspots = [
        {
            name: 'Initiating',
            phase: 'Initiating',
            style: { left: '24%', top: '50%', width: '16%', height: '12%' }
        },
        {
            name: 'Planning',
            phase: 'Planning',
            style: { left: '43%', top: '50%', width: '16%', height: '12%' }
        },
        {
            name: 'Executing',
            phase: 'Executing',
            style: { left: '62%', top: '50%', width: '16%', height: '12%' }
        },
        {
            name: 'Closing',
            phase: 'Closing',
            style: { left: '81%', top: '50%', width: '16%', height: '12%' }
        },
        {
            name: 'Monitor & Control',
            phase: 'Monitor & Control',
            style: { left: '24%', top: '42%', width: '73%', height: '8%' }
        }
    ];

    return (
        <div className="relative w-full max-w-5xl mx-auto rounded-xl shadow-lg overflow-hidden bg-white">
            <img
                src="/pm2/figures/fig-3-8.png"
                alt="PM² Lifecycle Map"
                className="w-full h-auto block"
            />

            {hotspots.map((spot) => (
                <div
                    key={spot.name}
                    onClick={() => onNavigate(spot.phase)}
                    className="absolute cursor-pointer transition-colors duration-200 hover:bg-white/10 border border-transparent hover:border-white/30 rounded-lg"
                    style={spot.style}
                    title={`Go to ${spot.name} Phase`}
                >
                    <span className="sr-only">{spot.name}</span>
                </div>
            ))}
        </div>
    );
};

export default LifecycleMap;
