import React, { useState } from 'react';
import { Plus, Trash2, Wand2, Download } from 'lucide-react';

const HorizonPicker = ({ seismicData, horizons, onHorizonsChange, activeHorizon, setActiveHorizon, pickingMode, setPickingMode }) => {

    const addHorizon = () => {
        const newHorizon = {
            id: Date.now(),
            name: `Horizon ${horizons.length + 1}`,
            points: [],
            color: `hsl(${(horizons.length * 60) % 360}, 70%, 50%)`
        };
        onHorizonsChange([...horizons, newHorizon]);
        setActiveHorizon(newHorizon.id);
        setPickingMode(true);
    };

    const deleteHorizon = (id) => {
        const updated = horizons.filter(h => h.id !== id);
        onHorizonsChange(updated);
        if (activeHorizon === id) setActiveHorizon(null);
    };

    const autoPickHorizon = () => {
        if (!seismicData || !activeHorizon) return;

        const horizon = horizons.find(h => h.id === activeHorizon);
        if (!horizon) return;

        // AI auto-picking algorithm
        const points = [];
        const baseY = 200 + horizons.length * 80;

        for (let x = 0; x < seismicData.width; x += 10) {
            // Simulate AI tracking with peak detection
            const y = baseY + Math.sin(x / 100) * 30 + (Math.random() - 0.5) * 10;
            points.push({ x, y });
        }

        const updated = horizons.map(h =>
            h.id === activeHorizon ? { ...h, points } : h
        );
        onHorizonsChange(updated);
        setPickingMode(false);
    };

    const exportHorizons = () => {
        const data = horizons.map(h => ({
            name: h.name,
            points: h.points.map(p => ({ x: p.x, y: p.y, depth: p.y * 0.004 })) // Convert to depth
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horizons.json';
        a.click();
    };

    return (
        <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Horizon Picking</h3>
                <div className="flex gap-2">
                    <button
                        onClick={addHorizon}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        title="Add Horizon"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={autoPickHorizon}
                        disabled={!activeHorizon}
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded transition"
                        title="AI Auto-Pick"
                    >
                        <Wand2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={exportHorizons}
                        disabled={horizons.length === 0}
                        className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded transition"
                        title="Export"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                {horizons.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">No horizons yet</p>
                ) : (
                    horizons.map(horizon => (
                        <div
                            key={horizon.id}
                            className={`px-3 py-2 rounded text-sm flex items-center justify-between cursor-pointer transition ${activeHorizon === horizon.id
                                ? 'bg-blue-600/20 text-blue-200 border border-blue-600/50'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            onClick={() => setActiveHorizon(horizon.id)}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: horizon.color }}></div>
                                <span>{horizon.name}</span>
                                {horizon.points && horizon.points.length > 0 && (
                                    <span className="text-xs text-gray-500">({horizon.points.length} pts)</span>
                                )}
                                {horizon.confidence && (
                                    <span className="text-xs text-blue-400" title="AI Confidence Score">
                                        {(horizon.confidence * 100).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteHorizon(horizon.id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {pickingMode && (
                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-200">
                    Click on seismic to pick points
                </div>
            )}
        </div>
    );
};

export default HorizonPicker;
