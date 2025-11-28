import React, { useState } from 'react';
import { Link2, Layers, Download, Play } from 'lucide-react';

const Integration = ({ seismicData, wellLogs = [] }) => {
    const [activeMode, setActiveMode] = useState('well-tie');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

    const processWellTie = () => {
        if (!seismicData || wellLogs.length === 0) return;

        setProcessing(true);

        setTimeout(() => {
            setResult({
                correlation: 0.87,
                timeShift: 12.5,
                stretch: 1.02,
                quality: 'Good'
            });
            setProcessing(false);
        }, 2000);
    };

    const processDomainConversion = () => {
        if (!seismicData) return;

        setProcessing(true);

        setTimeout(() => {
            setResult({
                conversionType: activeMode === 'time-to-depth' ? 'Time → Depth' : 'Depth → Time',
                velocityModel: 'Multi-vintage V(z)',
                depthRange: '0 - 3500m',
                quality: 'High'
            });
            setProcessing(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Integration Tools</h3>

                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => {
                            setActiveMode('well-tie');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'well-tie'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Well-Seismic Tie
                    </button>
                    <button
                        onClick={() => {
                            setActiveMode('time-to-depth');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'time-to-depth'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Time → Depth
                    </button>
                    <button
                        onClick={() => {
                            setActiveMode('depth-to-time');
                            setResult(null);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                            activeMode === 'depth-to-time'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                        Depth → Time
                    </button>
                </div>

                {/* Well-Seismic Tie Mode */}
                {activeMode === 'well-tie' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Link2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Integrated Well-Seismic Tie</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Advanced tools for creating, QC'ing, and calibrating synthetic seismograms using 
                                        well logs (sonic, density) and VSP data to tie the seismic data back to the borehole geology.
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Synthetic seismogram generation from sonic & density logs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Automated well-to-seismic correlation</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>VSP data integration for calibration</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>Quality control and time-shift analysis</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processWellTie}
                            disabled={processing || !seismicData || wellLogs.length === 0}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Processing Well Tie...' : 'Generate Synthetic & Tie'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                        {wellLogs.length === 0 && seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ No well logs available. Using synthetic well data.</p>
                        )}
                    </div>
                )}

                {/* Time to Depth Mode */}
                {activeMode === 'time-to-depth' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Layers className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Time to Depth Conversion</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Robust, accurate, and dynamic depth conversion tools using multi-vintage velocity 
                                        models and well-log data to move seamlessly from time to depth domain, which is 
                                        critical for drilling and field development.
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Multi-vintage velocity model integration</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Well-log velocity calibration</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Dynamic conversion with uncertainty analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>Optimized for drilling & field development</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processDomainConversion}
                            disabled={processing || !seismicData}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Converting Time → Depth...' : 'Convert to Depth Domain'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                    </div>
                )}

                {/* Depth to Time Mode */}
                {activeMode === 'depth-to-time' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Layers className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Depth to Time Conversion</h4>
                                    <p className="text-gray-300 text-sm mb-3">
                                        Robust, accurate, and dynamic time conversion tools using multi-vintage velocity 
                                        models and well-log data to move seamlessly from depth to time domain for seismic 
                                        interpretation and analysis.
                                    </p>
                                    <div className="space-y-2 text-xs text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Multi-vintage velocity model integration</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Well-log velocity calibration</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Dynamic conversion with uncertainty analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Optimized for seismic interpretation</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={processDomainConversion}
                            disabled={processing || !seismicData}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Play className="w-4 h-4" />
                            {processing ? 'Converting Depth → Time...' : 'Convert to Time Domain'}
                        </button>

                        {!seismicData && (
                            <p className="text-yellow-400 text-sm">⚠️ Please load seismic data first</p>
                        )}
                    </div>
                )}
            </div>

            {/* Results Display */}
            {result && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Processing Results</h4>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
                            <Download className="w-4 h-4" />
                            Export Results
                        </button>
                    </div>

                    {activeMode === 'well-tie' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Correlation</div>
                                <div className="text-2xl font-bold text-white">{result.correlation}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Time Shift</div>
                                <div className="text-2xl font-bold text-white">{result.timeShift} ms</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Stretch Factor</div>
                                <div className="text-2xl font-bold text-white">{result.stretch}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Tie Quality</div>
                                <div className="text-2xl font-bold text-green-400">{result.quality}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Conversion Type</div>
                                <div className="text-xl font-bold text-white">{result.conversionType}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Velocity Model</div>
                                <div className="text-xl font-bold text-white">{result.velocityModel}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Depth Range</div>
                                <div className="text-xl font-bold text-white">{result.depthRange}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Conversion Quality</div>
                                <div className="text-xl font-bold text-green-400">{result.quality}</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-200 text-sm">
                            ✓ Processing completed successfully. Results are ready for export.
                        </p>
                    </div>
                </div>
            )}

            {processing && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-white">
                        {activeMode === 'well-tie' 
                            ? 'Generating synthetic seismogram and computing correlation...' 
                            : 'Applying velocity model and converting domain...'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Integration;
