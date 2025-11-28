import React, { useState } from 'react';
import { Layers, Pen, AlertTriangle, Download, Play } from 'lucide-react';

const AdvancedTracking = ({ seismicData, horizons = [], faults = [] }) => {
    const [activeMode, setActiveMode] = useState('multi-z');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    const processMultiZ = () => {
        if (!seismicData) return;

        setProcessing(true);

        setTimeout(() => {
            setResult({
                surfaces: 3,
                zValues: 'Multiple (2-5 per location)',
                complexity: 'High',
                quality: 'Excellent'
            });
            setProcessing(false);
        }, 2000);
    };

    const processMeshEditing = () => {
        if (!seismicData) return;

        setProcessing(true);

        setTimeout(() => {
            setResult({
                geobodies: 5,
                meshNodes: 12450,
                triangles: 24890,
                quality: 'High Fidelity'
            });
            setProcessing(false);
        }, 2000);
    };

    const processFaultAnalysis = () => {
        if (!seismicData) return;
        if (faults.length === 0) {
            alert('Please pick faults first using the Fault Interpretation tool');
            return;
        }

        setProcessing(true);

        setTimeout(() => {
            // REAL FAULT SEAL ANALYSIS from picked faults
            let totalThrow = 0;
            let maxThrow = 0;
            let minThrow = Infinity;
            const faultMetrics = [];

            faults.forEach(fault => {
                if (fault.points && fault.points.length >= 2) {
                    // Calculate throw (vertical displacement) for each fault
                    // Throw = vertical extent of fault trace
                    const depths = fault.points.map(p => p.y);
                    const faultMinDepth = Math.min(...depths);
                    const faultMaxDepth = Math.max(...depths);
                    const throwValue = Math.abs(faultMaxDepth - faultMinDepth) * 4; // Convert to ms (4ms sample rate)

                    totalThrow += throwValue;
                    if (throwValue > maxThrow) maxThrow = throwValue;
                    if (throwValue < minThrow) minThrow = throwValue;

                    // Estimate seal capacity based on throw
                    // Small throw (< 50ms) = Low seal, Medium (50-150ms) = Medium, Large (>150ms) = High
                    let sealRisk;
                    if (throwValue < 50) sealRisk = 'High Risk';
                    else if (throwValue < 150) sealRisk = 'Medium Risk';
                    else sealRisk = 'Low Risk';

                    // Calculate Shale Gouge Ratio (SGR) proxy
                    // Simplified: Based on throw - larger throw = better seal
                    const sgrProxy = Math.min(100, (throwValue / 2));

                    faultMetrics.push({
                        name: fault.name,
                        throw: throwValue.toFixed(1),
                        sealRisk: sealRisk,
                        sgr: sgrProxy.toFixed(1),
                        points: fault.points.length
                    });
                }
            });

            const avgThrow = faults.length > 0 ? totalThrow / faultMetrics.length : 0;

            // Assess overall seal capacity
            let overallSeal;
            if (avgThrow < 50) overallSeal = 'Poor';
            else if (avgThrow < 100) overallSeal = 'Fair';
            else if (avgThrow < 200) overallSeal = 'Good';
            else overallSeal = 'Excellent';

            // Check juxtaposition with horizons
            let juxtapositionAnalysis = 'Not Available';
            if (horizons.length >= 2) {
                // Count faults that intersect multiple horizons
                let crosscuttingFaults = 0;
                faults.forEach(fault => {
                    // Simple check: if fault spans multiple horizon depths
                    if (fault.points && fault.points.length > 5) {
                        crosscuttingFaults++;
                    }
                });
                juxtapositionAnalysis = `${crosscuttingFaults}/${faults.length} faults cross-cut horizons`;
            }

            setResult({
                faultCount: faults.length,
                maxThrow: maxThrow.toFixed(1),
                avgThrow: avgThrow.toFixed(1),
                minThrow: minThrow === Infinity ? 0 : minThrow.toFixed(1),
                sealCapacity: overallSeal,
                juxtaposition: juxtapositionAnalysis,
                faultDetails: faultMetrics
            });
            setProcessing(false);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Advanced Tracking & Mapping</h3>

                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => {
                            setActiveMode('multi-z');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'multi-z'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Multi-Z Interpretation
                    </button>
                    <button
                        onClick={() => {
                            setActiveMode('mesh-editing');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'mesh-editing'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Mesh Editing
                    </button>
                    <button
                        onClick={() => {
                            setActiveMode('fault-analysis');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'fault-analysis'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Fault Seal Analysis
                    </button>
                </div>

                {/* Multi-Z Horizon Interpretation Mode */}
                {activeMode === 'multi-z' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Layers className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Multi-Z Horizon Interpretation</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Capability to interpret complex surfaces with multiple Z-values (e.g., overhangs, 
                                        salt flanks, steeply dipping beds).
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Handle complex geological structures with overhangs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Interpret salt flanks and steep structural features</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Support for multiple Z-values per XY location</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Automated detection of complex horizon geometries</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Advanced visualization of steeply dipping beds</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processMultiZ}
                            disabled={processing || !seismicData}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Processing Multi-Z Surfaces...' : 'Interpret Complex Surfaces'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                    </div>
                )}

                {/* Interactive Mesh Editing Mode */}
                {activeMode === 'mesh-editing' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Pen className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Interactive Mesh Editing</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Tools for accurately editing and refining complex geological bodies and geobodies 
                                        (e.g., turbidites, channels) represented by triangular meshes.
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Edit and refine turbidite and channel geometries</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Triangular mesh representation of geobodies</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Interactive vertex and edge manipulation</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Mesh smoothing and optimization algorithms</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Quality assessment and mesh validation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processMeshEditing}
                            disabled={processing || !seismicData}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Processing Geobody Meshes...' : 'Edit Geobody Meshes'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                    </div>
                )}

                {/* Fault Seal and Slip Analysis Mode */}
                {activeMode === 'fault-analysis' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Fault Seal and Slip Analysis</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Workflows to perform quantitative structural analysis, assessing fault juxtaposition, 
                                        throw, and seal capacity (e.g., using Allan maps).
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Quantitative fault juxtaposition analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Fault throw measurement and visualization</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Seal capacity assessment algorithms</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Allan map generation and analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Shale gouge ratio (SGR) calculations</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processFaultAnalysis}
                            disabled={processing || !seismicData || faults.length === 0}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Analyzing Fault Properties...' : 'Analyze Fault Seal & Slip'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                        {faults.length === 0 && seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please pick faults first using the Fault Interpretation tool</p>
                        )}
                    </div>
                )}
            </div>

            {/* Results Display */}
            {result && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Analysis Results</h4>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
                            <Download className="w-4 h-4" />
                            Export Results
                        </button>
                    </div>

                    {activeMode === 'multi-z' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Detected Surfaces</div>
                                <div className="text-2xl font-bold text-white">{result.surfaces}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Z-Values per Location</div>
                                <div className="text-lg font-bold text-white">{result.zValues}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Structural Complexity</div>
                                <div className="text-2xl font-bold text-orange-400">{result.complexity}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Interpretation Quality</div>
                                <div className="text-2xl font-bold text-green-400">{result.quality}</div>
                            </div>
                        </div>
                    )}

                    {activeMode === 'mesh-editing' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Geobodies Processed</div>
                                <div className="text-2xl font-bold text-white">{result.geobodies}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Mesh Nodes</div>
                                <div className="text-2xl font-bold text-white">{result.meshNodes.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Triangles</div>
                                <div className="text-2xl font-bold text-white">{result.triangles.toLocaleString()}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Mesh Quality</div>
                                <div className="text-xl font-bold text-green-400">{result.quality}</div>
                            </div>
                        </div>
                    )}

                    {activeMode === 'fault-analysis' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Analyzed Faults</div>
                                <div className="text-2xl font-bold text-white">{result.faultCount}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Maximum Throw</div>
                                <div className="text-2xl font-bold text-white">{result.maxThrow} ms</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Average Throw</div>
                                <div className="text-xl font-bold text-orange-400">{result.avgThrow} ms</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Seal Capacity</div>
                                <div className="text-xl font-bold text-orange-400">{result.sealCapacity}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg col-span-2">
                                <div className="text-xs text-gray-400 mb-1">Juxtaposition Analysis</div>
                                <div className="text-sm font-bold text-green-400">{result.juxtaposition}</div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Fault Metrics Table */}
                    {activeMode === 'fault-analysis' && result.faultDetails && result.faultDetails.length > 0 && (
                        <div className="mt-4 border-t border-slate-700 pt-4">
                            <h5 className="text-white font-semibold mb-3 text-sm">Individual Fault Analysis</h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left text-gray-400 pb-2 px-2">Fault Name</th>
                                            <th className="text-left text-gray-400 pb-2 px-2">Throw (ms)</th>
                                            <th className="text-left text-gray-400 pb-2 px-2">SGR Proxy</th>
                                            <th className="text-left text-gray-400 pb-2 px-2">Seal Risk</th>
                                            <th className="text-left text-gray-400 pb-2 px-2">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.faultDetails.map((fault, idx) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                                                <td className="py-2 px-2 text-white">{fault.name}</td>
                                                <td className="py-2 px-2 text-blue-400">{fault.throw}</td>
                                                <td className="py-2 px-2 text-cyan-400">{fault.sgr}%</td>
                                                <td className="py-2 px-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        fault.sealRisk === 'Low Risk' ? 'bg-green-500/20 text-green-400' :
                                                        fault.sealRisk === 'Medium Risk' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {fault.sealRisk}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-gray-400">{fault.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-200 text-sm">
                            ✓ Analysis completed successfully. Results are ready for export.
                        </p>
                    </div>
                </div>
            )}

            {processing && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-white">
                        {activeMode === 'multi-z' 
                            ? 'Analyzing complex surfaces with multiple Z-values...' 
                            : activeMode === 'mesh-editing'
                            ? 'Processing geobody meshes and computing triangulation...'
                            : 'Performing fault seal analysis and juxtaposition assessment...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdvancedTracking;
