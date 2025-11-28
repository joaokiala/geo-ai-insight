import React, { useState } from 'react';
import { Activity, Trash2, Download, Plus, MousePointer } from 'lucide-react';

const FaultDetector = ({ seismicData, faults, onFaultsChange, activeFault, setActiveFault, pickingMode, setPickingMode }) => {
    const [detecting, setDetecting] = useState(false);

    const detectFaults = () => {
        if (!seismicData) return;

        setDetecting(true);

        setTimeout(() => {
            const detected = [];
            const threshold = 50;

            for (let x = 100; x < seismicData.width; x += 200) {
                const points = [];
                for (let y = 100; y < seismicData.height - 100; y += 10) {
                    if (y < seismicData.height && x > 0) {
                        const currentAmp = seismicData.data[y]?.[x] || 0;
                        const prevAmp = seismicData.data[y]?.[x - 1] || 0;

                        if (Math.abs(currentAmp - prevAmp) > threshold) {
                            points.push({ x, y });
                        }
                    }
                }

                if (points.length > 5) {
                    detected.push({
                        id: Date.now() + detected.length,
                        name: `Fault ${detected.length + 1}`,
                        points,
                        confidence: 0.7 + Math.random() * 0.2
                    });
                }
            }

            onFaultsChange([...faults, ...detected]);
            setDetecting(false);
        }, 1500);
    };

    const addFault = () => {
        const newFault = {
            id: Date.now(),
            name: `Fault ${faults.length + 1}`,
            points: [],
            confidence: null,
            method: 'Manual'
        };
        onFaultsChange([...faults, newFault]);
        setActiveFault(newFault.id);
        setPickingMode(true);
    };

    const deleteFault = (id) => {
        const updated = faults.filter(f => f.id !== id);
        onFaultsChange(updated);
        if (activeFault === id) {
            setActiveFault(null);
            setPickingMode(false);
        }
    };

    const exportFaults = () => {
        const data = faults.map(f => ({
            name: f.name,
            confidence: f.confidence,
            points: f.points
        }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faults.json';
        a.click();
    };

    return (
        <div className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Fault Detection</h3>
                <div className="flex gap-2">
                    <button
                        onClick={addFault}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        title="Add Manual Fault"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={detectFaults}
                        disabled={detecting}
                        className="p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded transition"
                        title="AI Detect Faults"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                    <button
                        onClick={exportFaults}
                        disabled={faults.length === 0}
                        className="p-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-gray-500 text-white rounded transition"
                        title="Export"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {detecting && (
                <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/30 rounded flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-purple-400"></div>
                    <p className="text-xs text-purple-200">Analyzing...</p>
                </div>
            )}

            <div className="space-y-1">
                {faults.length === 0 && !detecting ? (
                    <p className="text-xs text-gray-500 text-center py-2">No faults detected</p>
                ) : (
                    faults.map(fault => (
                        <div
                            key={fault.id}
                            onClick={() => setActiveFault(fault.id)}
                            className={`px-3 py-2 rounded text-sm flex items-center justify-between transition cursor-pointer ${
                                activeFault === fault.id
                                    ? 'bg-blue-600/20 text-blue-200 border border-blue-600/50'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-4 h-0.5 bg-pink-500" style={{ borderTop: '2px dashed #ec4899' }}></div>
                                <span className="flex-1">{fault.name}</span>
                                {fault.confidence && (
                                    <span className="text-xs text-purple-400" title="AI Confidence">
                                        {(fault.confidence * 100).toFixed(0)}%
                                    </span>
                                )}
                                {fault.displacement && (
                                    <span className="text-xs text-gray-500" title="Estimated Displacement">
                                        ~{fault.displacement}ms
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFault(fault.id);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {pickingMode && activeFault && (
                <div className="mt-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <MousePointer className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-semibold text-pink-200">Manual Fault Picking Mode</span>
                    </div>
                    <p className="text-xs text-pink-200">Click on the seismic to trace the fault</p>
                    <button
                        onClick={() => setPickingMode(false)}
                        className="mt-2 w-full px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition"
                    >
                        Stop Picking
                    </button>
                </div>
            )}
        </div>
    );
};

export default FaultDetector;
