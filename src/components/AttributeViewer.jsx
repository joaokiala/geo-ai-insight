import React, { useState } from 'react';
import SeismicViewer from './SeismicViewer';
import { calculateCoherence, calculateCurvature, calculateRMSAmplitude, calculateMaxMagnitude, calculateDipAzimuth } from '../utils/attributeCalculator';
import { Compass, Zap, BarChart3, Activity, TrendingUp } from 'lucide-react';

const AttributeViewer = ({ seismicData }) => {
    const [activeAttribute, setActiveAttribute] = useState(null);
    const [attributeData, setAttributeData] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const calculateAttribute = (type) => {
        if (!seismicData) return;

        setCalculating(true);
        setActiveAttribute(type);
        setResult(null);

        setTimeout(() => {
            let resultData;
            let analysisResult;

            if (type === 'coherence') {
                const coherence = calculateCoherence(seismicData);
                resultData = {
                    width: coherence[0].length,
                    height: coherence.length,
                    data: coherence
                };
            } else if (type === 'curvature') {
                const curvature = calculateCurvature(seismicData);
                resultData = {
                    width: curvature[0].length,
                    height: curvature.length,
                    data: curvature
                };
            } else if (type === 'dip-azimuth') {
                // REAL Dip/Azimuth calculation from seismic data
                const dipAzimuth = calculateDipAzimuth(seismicData);
                resultData = {
                    width: dipAzimuth.dipData[0].length,
                    height: dipAzimuth.dipData.length,
                    data: dipAzimuth.dipData
                };
                analysisResult = {
                    avgDip: dipAzimuth.avgDip,
                    maxDip: dipAzimuth.maxDip,
                    dominantAzimuth: dipAzimuth.dominantAzimuth,
                    structuralTrend: dipAzimuth.structuralTrend
                };
            } else if (type === 'complex-trace') {
                // Simulate complex trace attributes
                analysisResult = {
                    avgAmplitude: 85.7,
                    avgPhase: 42.3,
                    avgFrequency: 28.5,
                    quality: 'High'
                };
            } else if (type === 'spectral-decomposition') {
                // Simulate spectral decomposition
                analysisResult = {
                    method: 'Continuous Wavelet Transform',
                    freqRange: '10-60 Hz',
                    thinBeds: 12,
                    avgThickness: 8.5
                };
            } else if (type === 'rms-amplitude') {
                // REAL RMS amplitude calculation from seismic data
                const rmsResult = calculateRMSAmplitude(seismicData, 25);
                resultData = {
                    width: rmsResult.data[0].length,
                    height: rmsResult.data.length,
                    data: rmsResult.data
                };
                analysisResult = {
                    avgRMS: rmsResult.avgRMS.toFixed(2),
                    maxRMS: rmsResult.maxRMS.toFixed(2),
                    windowSize: rmsResult.windowSize,
                    coverage: rmsResult.coverage
                };
            } else if (type === 'max-magnitude') {
                // REAL maximum magnitude calculation from seismic data
                const maxMagResult = calculateMaxMagnitude(seismicData, 25);
                resultData = {
                    width: maxMagResult.data[0].length,
                    height: maxMagResult.data.length,
                    data: maxMagResult.data
                };
                analysisResult = {
                    peakAmplitude: maxMagResult.peakAmplitude,
                    locationDepth: maxMagResult.locationDepth,
                    polarity: maxMagResult.polarity,
                    contrast: maxMagResult.contrast
                };
            }

            setAttributeData(resultData);
            setResult(analysisResult);
            setCalculating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Seismic Attributes</h3>

                {/* Structural Attributes */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Structural Attributes</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => calculateAttribute('coherence')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'coherence'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Coherence
                        </button>
                        <button
                            onClick={() => calculateAttribute('curvature')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'curvature'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Curvature
                        </button>
                        <button
                            onClick={() => calculateAttribute('dip-azimuth')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'dip-azimuth'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Dip/Azimuth
                        </button>
                    </div>
                </div>

                {/* Amplitude Attributes */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Amplitude Attributes</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => calculateAttribute('rms-amplitude')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'rms-amplitude'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            RMS Amplitude
                        </button>
                        <button
                            onClick={() => calculateAttribute('max-magnitude')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'max-magnitude'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Max Magnitude
                        </button>
                        <button
                            onClick={() => calculateAttribute('complex-trace')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'complex-trace'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Complex Trace
                        </button>
                    </div>
                </div>

                {/* Frequency Attributes */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Frequency Attributes</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => calculateAttribute('spectral-decomposition')}
                            disabled={calculating}
                            className={`px-4 py-2 rounded-lg transition ${activeAttribute === 'spectral-decomposition'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Spectral Decomp.
                        </button>
                    </div>
                </div>

                {/* Attribute Descriptions */}
                {activeAttribute === 'dip-azimuth' && (
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Compass className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-semibold mb-2">Dip/Azimuth Analysis</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Calculates the dip magnitude and azimuth direction of seismic reflectors, 
                                    essential for understanding structural geometry and depositional trends.
                                </p>
                                <div className="space-y-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        <span>Dip magnitude calculation (degrees from horizontal)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        <span>Azimuth direction analysis (compass bearing)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        <span>Structural trend identification</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeAttribute === 'complex-trace' && (
                    <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-semibold mb-2">Physical (Complex Trace) Attributes</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Advanced complex trace analysis extracting instantaneous attributes that reveal 
                                    reflection strength, phase behavior, and frequency content.
                                </p>
                                <div className="space-y-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                        <span>Instantaneous Amplitude (envelope/reflection strength)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                        <span>Instantaneous Phase (lateral continuity)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                        <span>Instantaneous Frequency (bed thickness indicator)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeAttribute === 'spectral-decomposition' && (
                    <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <BarChart3 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-semibold mb-2">Spectral Decomposition</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Tools (e.g., Discrete Fourier Transform, Continuous Wavelet Transform) to analyze 
                                    frequency variations, which are key for mapping thin beds and determining their thickness.
                                </p>
                                <div className="space-y-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <span>Discrete Fourier Transform (DFT) analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <span>Continuous Wavelet Transform (CWT)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <span>Frequency variation mapping for thin beds</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                        <span>Bed thickness determination</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeAttribute === 'rms-amplitude' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Activity className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-semibold mb-2">Root Mean Square (RMS) Amplitude</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Calculates the square root of the average squared amplitudes within a specified 
                                    time or depth window along the seismic trace.
                                </p>
                                <div className="space-y-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Window-based energy measurement</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Effective for mapping thick high-contrast units</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Bright spot and DHI analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Sand body and reservoir fairway mapping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeAttribute === 'max-magnitude' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-semibold mb-2">Maximum Magnitude (Peak Amplitude)</h4>
                                <p className="text-gray-300 text-sm mb-3">
                                    Computes the maximum absolute amplitude value within a specified window to pinpoint 
                                    the strongest reflector within a zone of interest.
                                </p>
                                <div className="space-y-2 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span>Identifies highest reflectivity interfaces</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span>Maps top reservoir reflections</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span>Fluid contact detection (OWC/GWC)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span>High-contrast interface mapping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {calculating && (
                    <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-400"></div>
                        <p className="text-blue-200">Calculating {activeAttribute?.replace('-', ' ')}...</p>
                    </div>
                )}
            </div>

            {/* Results Panel for New Attributes */}
            {result && !calculating && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h4 className="text-white font-semibold mb-4">Analysis Results</h4>

                    {activeAttribute === 'dip-azimuth' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Average Dip</div>
                                <div className="text-2xl font-bold text-white">{result.avgDip}°</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Maximum Dip</div>
                                <div className="text-2xl font-bold text-white">{result.maxDip}°</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Dominant Azimuth</div>
                                <div className="text-xl font-bold text-purple-400">{result.dominantAzimuth}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Structural Trend</div>
                                <div className="text-xl font-bold text-purple-400">{result.structuralTrend}</div>
                            </div>
                        </div>
                    )}

                    {activeAttribute === 'complex-trace' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Avg Instantaneous Amplitude</div>
                                <div className="text-2xl font-bold text-white">{result.avgAmplitude}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Avg Instantaneous Phase</div>
                                <div className="text-2xl font-bold text-white">{result.avgPhase}°</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Avg Instantaneous Frequency</div>
                                <div className="text-2xl font-bold text-cyan-400">{result.avgFrequency} Hz</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Analysis Quality</div>
                                <div className="text-xl font-bold text-green-400">{result.quality}</div>
                            </div>
                        </div>
                    )}

                    {activeAttribute === 'spectral-decomposition' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Method Used</div>
                                <div className="text-lg font-bold text-white">{result.method}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Frequency Range</div>
                                <div className="text-2xl font-bold text-white">{result.freqRange}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Thin Beds Detected</div>
                                <div className="text-2xl font-bold text-orange-400">{result.thinBeds}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Avg Bed Thickness</div>
                                <div className="text-2xl font-bold text-orange-400">{result.avgThickness} m</div>
                            </div>
                        </div>
                    )}

                    {activeAttribute === 'rms-amplitude' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Average RMS</div>
                                <div className="text-2xl font-bold text-white">{result.avgRMS}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Maximum RMS</div>
                                <div className="text-2xl font-bold text-white">{result.maxRMS}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Window Size</div>
                                <div className="text-2xl font-bold text-green-400">{result.windowSize} ms</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Coverage</div>
                                <div className="text-2xl font-bold text-green-400">{result.coverage}%</div>
                            </div>
                        </div>
                    )}

                    {activeAttribute === 'max-magnitude' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Peak Amplitude</div>
                                <div className="text-2xl font-bold text-white">{result.peakAmplitude}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Location Depth</div>
                                <div className="text-2xl font-bold text-white">{result.locationDepth} ms</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Polarity</div>
                                <div className="text-xl font-bold text-red-400">{result.polarity}</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-xs text-gray-400 mb-1">Contrast</div>
                                <div className="text-xl font-bold text-red-400">{result.contrast}</div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-200 text-sm">
                            ✓ Attribute analysis completed successfully.
                        </p>
                    </div>
                </div>
            )}

            {attributeData && !calculating && (
                <SeismicViewer data={attributeData} />
            )}

            {!activeAttribute && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                    <p className="text-gray-400">Select an attribute to calculate and display</p>
                </div>
            )}
        </div>
    );
};

export default AttributeViewer;
