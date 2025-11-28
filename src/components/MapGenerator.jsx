import React, { useState } from 'react';
import { Map, Download, Info } from 'lucide-react';

const MapGenerator = ({ horizons = [] }) => {
    const [mapType, setMapType] = useState('structure');
    const [generatedMap, setGeneratedMap] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [mapStats, setMapStats] = useState(null);

    // 2D Interpolation using Inverse Distance Weighting (IDW)
    const interpolate2D = (x, y, points, power = 2) => {
        if (points.length === 0) return 0;
        
        let sumWeights = 0;
        let sumValues = 0;
        
        for (const point of points) {
            const dx = x - point.x;
            const dy = y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 0.1) return point.value; // Very close to a point
            
            const weight = 1 / Math.pow(distance, power);
            sumWeights += weight;
            sumValues += weight * point.value;
        }
        
        return sumValues / sumWeights;
    };

    const generateMap = () => {
        if (mapType === 'structure' && horizons.length === 0) {
            alert('Please pick at least one horizon first');
            return;
        }
        if (mapType === 'isochron' && horizons.length < 2) {
            alert('Please pick at least two horizons for isochron map');
            return;
        }

        setGenerating(true);

        setTimeout(() => {
            const canvas = document.createElement('canvas');
            const mapWidth = 800;
            const mapHeight = 600;
            canvas.width = mapWidth;
            canvas.height = mapHeight;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, mapWidth, mapHeight);

            let gridData = [];
            let minValue, maxValue;
            let stats = {};

            if (mapType === 'structure') {
                // STRUCTURE MAP - Time/Depth contours of single horizon
                const horizon = horizons[0];
                const points = horizon.points.map(p => ({
                    x: p.x,
                    y: p.y,
                    value: p.y // Depth in time (ms)
                }));

                // Calculate statistics
                const depths = points.map(p => p.value);
                minValue = Math.min(...depths);
                maxValue = Math.max(...depths);
                const avgValue = depths.reduce((a, b) => a + b, 0) / depths.length;

                stats = {
                    type: 'Structure Map',
                    horizon: horizon.name,
                    minDepth: minValue.toFixed(1),
                    maxDepth: maxValue.toFixed(1),
                    avgDepth: avgValue.toFixed(1),
                    relief: (maxValue - minValue).toFixed(1),
                    points: points.length
                };

                // Create interpolated grid
                const gridResX = mapWidth / 2; // Grid resolution
                const gridResY = mapHeight / 2;
                
                for (let gy = 0; gy < gridResY; gy++) {
                    const row = [];
                    for (let gx = 0; gx < gridResX; gx++) {
                        // Map grid to horizon point space
                        const xNorm = (gx / gridResX) * 800; // Assuming seismic width ~800
                        const yNorm = (gy / gridResY) * 600; // Assuming seismic height ~600
                        
                        const value = interpolate2D(xNorm, yNorm, points, 2);
                        row.push(value);
                    }
                    gridData.push(row);
                }

            } else if (mapType === 'isochron') {
                // ISOCHRON MAP - Thickness between two horizons
                const horizon1 = horizons[0]; // Top horizon
                const horizon2 = horizons[1]; // Bottom horizon

                // Match points between horizons (by x-coordinate)
                const thicknessPoints = [];
                
                for (let i = 0; i < Math.min(horizon1.points.length, horizon2.points.length); i++) {
                    const p1 = horizon1.points[i];
                    const p2 = horizon2.points[i];
                    
                    // Calculate thickness (time difference)
                    const thickness = Math.abs(p2.y - p1.y);
                    
                    thicknessPoints.push({
                        x: p1.x,
                        y: p1.y, // Use top horizon position
                        value: thickness
                    });
                }

                // Calculate statistics
                const thicknesses = thicknessPoints.map(p => p.value);
                minValue = Math.min(...thicknesses);
                maxValue = Math.max(...thicknesses);
                const avgValue = thicknesses.reduce((a, b) => a + b, 0) / thicknesses.length;

                stats = {
                    type: 'Isochron Map',
                    topHorizon: horizon1.name,
                    bottomHorizon: horizon2.name,
                    minThickness: minValue.toFixed(1),
                    maxThickness: maxValue.toFixed(1),
                    avgThickness: avgValue.toFixed(1),
                    variation: (maxValue - minValue).toFixed(1),
                    points: thicknessPoints.length
                };

                // Create interpolated grid
                const gridResX = mapWidth / 2;
                const gridResY = mapHeight / 2;
                
                for (let gy = 0; gy < gridResY; gy++) {
                    const row = [];
                    for (let gx = 0; gx < gridResX; gx++) {
                        const xNorm = (gx / gridResX) * 800;
                        const yNorm = (gy / gridResY) * 600;
                        
                        const value = interpolate2D(xNorm, yNorm, thicknessPoints, 2);
                        row.push(value);
                    }
                    gridData.push(row);
                }
            }

            // Render interpolated grid as colored map
            const pixelWidth = mapWidth / gridData[0].length;
            const pixelHeight = mapHeight / gridData.length;

            for (let gy = 0; gy < gridData.length; gy++) {
                for (let gx = 0; gx < gridData[0].length; gx++) {
                    const value = gridData[gy][gx];
                    const normalized = (value - minValue) / (maxValue - minValue);

                    // Enhanced color gradient: Blue (low) → Green → Yellow → Red (high)
                    let r, g, b;
                    if (normalized < 0.33) {
                        // Blue to Cyan
                        const t = normalized / 0.33;
                        r = 0;
                        g = Math.floor(t * 200);
                        b = 255;
                    } else if (normalized < 0.66) {
                        // Cyan to Yellow
                        const t = (normalized - 0.33) / 0.33;
                        r = Math.floor(t * 255);
                        g = 200;
                        b = Math.floor((1 - t) * 255);
                    } else {
                        // Yellow to Red
                        const t = (normalized - 0.66) / 0.34;
                        r = 255;
                        g = Math.floor((1 - t) * 200);
                        b = 0;
                    }

                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(gx * pixelWidth, gy * pixelHeight, pixelWidth, pixelHeight);
                }
            }

            // Draw smooth contour lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            const numContours = 12;
            
            for (let i = 0; i <= numContours; i++) {
                const contourValue = minValue + (i / numContours) * (maxValue - minValue);
                
                // Draw contour for this value
                ctx.beginPath();
                let contourStarted = false;
                
                for (let gy = 0; gy < gridData.length - 1; gy++) {
                    for (let gx = 0; gx < gridData[0].length - 1; gx++) {
                        const v1 = gridData[gy][gx];
                        const v2 = gridData[gy][gx + 1];
                        const v3 = gridData[gy + 1][gx];
                        
                        // Check if contour crosses this cell
                        if ((v1 <= contourValue && v2 >= contourValue) || 
                            (v1 >= contourValue && v2 <= contourValue)) {
                            const x = (gx + 0.5) * pixelWidth;
                            const y = gy * pixelHeight;
                            
                            if (!contourStarted) {
                                ctx.moveTo(x, y);
                                contourStarted = true;
                            } else {
                                ctx.lineTo(x, y);
                            }
                        }
                    }
                }
                
                if (contourStarted) {
                    ctx.stroke();
                }
                
                // Add contour labels
                if (i % 3 === 0) {
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 11px Arial';
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.lineWidth = 3;
                    const label = contourValue.toFixed(0);
                    ctx.strokeText(label, 15, 30 + i * 45);
                    ctx.fillText(label, 15, 30 + i * 45);
                }
            }

            // Add scale bar
            const scaleX = mapWidth - 150;
            const scaleY = mapHeight - 80;
            const scaleWidth = 120;
            const scaleHeight = 20;

            // Color scale gradient
            for (let i = 0; i < scaleWidth; i++) {
                const t = i / scaleWidth;
                let r, g, b;
                if (t < 0.33) {
                    const tt = t / 0.33;
                    r = 0; g = Math.floor(tt * 200); b = 255;
                } else if (t < 0.66) {
                    const tt = (t - 0.33) / 0.33;
                    r = Math.floor(tt * 255); g = 200; b = Math.floor((1 - tt) * 255);
                } else {
                    const tt = (t - 0.66) / 0.34;
                    r = 255; g = Math.floor((1 - tt) * 200); b = 0;
                }
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(scaleX + i, scaleY, 1, scaleHeight);
            }

            // Scale labels
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(scaleX, scaleY, scaleWidth, scaleHeight);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(minValue.toFixed(0), scaleX, scaleY + scaleHeight + 15);
            ctx.fillText(maxValue.toFixed(0), scaleX + scaleWidth - 30, scaleY + scaleHeight + 15);
            
            const unit = mapType === 'structure' ? 'ms TWT' : 'ms (thickness)';
            ctx.font = '11px Arial';
            ctx.fillText(unit, scaleX + 30, scaleY - 5);

            setGeneratedMap(canvas.toDataURL());
            setMapStats(stats);
            setGenerating(false);
        }, 2000);
    };

    const exportMap = () => {
        if (!generatedMap) return;

        const a = document.createElement('a');
        a.href = generatedMap;
        a.download = `${mapType}_map.png`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Map Generation</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={generateMap}
                            disabled={horizons.length === 0 || generating}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Map className="w-4 h-4" />
                            {generating ? 'Generating...' : 'Generate Map'}
                        </button>
                        <button
                            onClick={exportMap}
                            disabled={!generatedMap}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => { setMapType('structure'); setGeneratedMap(null); setMapStats(null); }}
                        className={`px-4 py-2 rounded-lg transition ${mapType === 'structure'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Structure Map
                    </button>
                    <button
                        onClick={() => { setMapType('isochron'); setGeneratedMap(null); setMapStats(null); }}
                        className={`px-4 py-2 rounded-lg transition ${mapType === 'isochron'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Isochron Map
                    </button>
                </div>

                {mapType === 'structure' && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">
                                Structure map shows time/depth contours of the picked horizon surface. 
                                Colors represent depth: Blue (shallow) → Red (deep)
                            </p>
                        </div>
                    </div>
                )}

                {mapType === 'isochron' && (
                    <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300">
                                Isochron map shows thickness (time difference) between two horizons. 
                                Requires at least 2 picked horizons. Colors represent thickness variation.
                            </p>
                        </div>
                    </div>
                )}

                {horizons.length === 0 && (
                    <p className="text-yellow-400 text-sm">⚠️ Please pick horizons first before generating maps</p>
                )}
                {mapType === 'isochron' && horizons.length === 1 && (
                    <p className="text-yellow-400 text-sm">⚠️ Please pick at least 2 horizons for isochron map</p>
                )}
            </div>

            {generatedMap && mapStats && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-lg">{mapStats.type}</h4>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span>{mapStats.points} points</span>
                        </div>
                    </div>

                    {/* Map Image */}
                    <img src={generatedMap} alt="Generated Map" className="w-full rounded-lg border border-white/20 mb-4" />

                    {/* Statistics Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {mapType === 'structure' ? (
                            <>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Horizon</div>
                                    <div className="text-sm font-semibold text-white">{mapStats.horizon}</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Min Depth</div>
                                    <div className="text-sm font-semibold text-blue-400">{mapStats.minDepth} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Max Depth</div>
                                    <div className="text-sm font-semibold text-red-400">{mapStats.maxDepth} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Relief</div>
                                    <div className="text-sm font-semibold text-green-400">{mapStats.relief} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg col-span-2">
                                    <div className="text-xs text-gray-400 mb-1">Average Depth</div>
                                    <div className="text-sm font-semibold text-white">{mapStats.avgDepth} ms</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Top Horizon</div>
                                    <div className="text-sm font-semibold text-white">{mapStats.topHorizon}</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Bottom Horizon</div>
                                    <div className="text-sm font-semibold text-white">{mapStats.bottomHorizon}</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Min Thickness</div>
                                    <div className="text-sm font-semibold text-blue-400">{mapStats.minThickness} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Max Thickness</div>
                                    <div className="text-sm font-semibold text-red-400">{mapStats.maxThickness} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Avg Thickness</div>
                                    <div className="text-sm font-semibold text-white">{mapStats.avgThickness} ms</div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-gray-400 mb-1">Variation</div>
                                    <div className="text-sm font-semibold text-green-400">{mapStats.variation} ms</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Interpretation Guide */}
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-green-200 text-sm">
                            {mapType === 'structure' 
                                ? '✓ Structure map generated with 2D interpolation. Blue areas indicate structural highs (potential traps), red areas show deeper zones.'
                                : '✓ Isochron map shows thickness variation. Thicker zones may indicate depositional centers or fault-controlled subsidence.'}
                        </p>
                    </div>
                </div>
            )}

            {generating && (
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mx-auto mb-4"></div>
                    <p className="text-white font-semibold">
                        {mapType === 'structure' 
                            ? 'Generating structure map with 2D interpolation...'
                            : 'Calculating isochron thickness between horizons...'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">Applying inverse distance weighting algorithm</p>
                </div>
            )}
        </div>
    );
};

export default MapGenerator;
