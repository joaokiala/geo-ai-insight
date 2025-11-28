import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const SeismicViewer = ({ data, horizons = [], faults = [], measurePoints = [], onPick }) => {
    const canvasRef = useRef(null);
    const colorbarCanvasRef = useRef(null);
    const [minAmp, setMinAmp] = useState(0);
    const [maxAmp, setMaxAmp] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, inline: 0, crossline: 0, time: 0 });
    const [viewMode, setViewMode] = useState('inline'); // 'inline' or 'crossline'
    const [currentLine, setCurrentLine] = useState(1234);
    const [fitZoom, setFitZoom] = useState(1); // Auto-fit zoom level
    const [prevDataId, setPrevDataId] = useState(null); // Track previous data to detect changes

    // Calculate fit zoom based on container size
    const calculateFitZoom = useCallback((displayWidth, displayHeight) => {
        if (!canvasRef.current) return 1;
        
        const canvasContainer = canvasRef.current.parentElement;
        if (!canvasContainer) return 1;
        
        // Use a more generous calculation for container size
        const containerWidth = canvasContainer.clientWidth - 10; // Minimal padding
        const containerHeight = canvasContainer.clientHeight - 10; // Minimal padding
        
        if (displayWidth > 0 && displayHeight > 0) {
            // Calculate fit zoom with minimal margin to ensure it fills the screen better
            const widthRatio = containerWidth / displayWidth;
            const heightRatio = containerHeight / displayHeight;
            const fitZoomLevel = Math.min(widthRatio, heightRatio) * 0.98; // 98% to leave a tiny margin
            return Math.max(0.1, Math.min(fitZoomLevel, 10)); // Clamp between 0.1 and 10
        }
        return 1;
    }, []);

    // Apply fit zoom
    const applyFitZoom = useCallback(() => {
        if (!data) return;
        
        // Get display dimensions if available, otherwise use actual data dimensions
        const displayWidth = data.displayWidth || data.width;
        const displayHeight = data.displayHeight || data.height;
        
        const newFitZoom = calculateFitZoom(displayWidth, displayHeight);
        console.log(`🔍 Calculated fit zoom: ${newFitZoom.toFixed(2)}`);
        setFitZoom(newFitZoom);
        setZoom(newFitZoom);
    }, [data, calculateFitZoom]);

    // Create a unique identifier for the data to detect changes
    const getDataId = useCallback((data) => {
        if (!data) return null;
        return `${data.width}x${data.height}-${data.filename || 'no-filename'}`;
    }, []);

    // Effect to handle data changes and apply fit zoom when needed
    useEffect(() => {
        if (!data || !canvasRef.current || !colorbarCanvasRef.current) return;

        const currentDataId = getDataId(data);
        const isNewData = currentDataId !== prevDataId;
        
        console.log('🔍 Data change detected:', {
            isNewData,
            currentDataId,
            prevDataId,
            dataSize: `${data.width}x${data.height}`,
            filename: data.filename
        });

        // Get display dimensions if available, otherwise use actual data dimensions
        const displayWidth = data.displayWidth || data.width;
        const displayHeight = data.displayHeight || data.height;

        // Calculate and apply fit zoom when data changes
        if (isNewData) {
            console.log('🔍 New data detected, calculating fit zoom...');
            const newFitZoom = calculateFitZoom(displayWidth, displayHeight);
            console.log(`🔍 New fit zoom calculated: ${newFitZoom.toFixed(2)}`);
            setFitZoom(newFitZoom);
            setZoom(newFitZoom);
            setPrevDataId(currentDataId);
        }

        console.log('🎨 SeismicViewer rendering:', {
            dataSize: `${data.width}x${data.height}`,
            displaySize: `${displayWidth}x${displayHeight}`,
            horizonsCount: horizons?.length || 0,
            faultsCount: faults?.length || 0,
            zoom: zoom,
            fitZoom: fitZoom
        });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height, data: seismicData } = data;

        // Set canvas size based on zoom and display dimensions
        const newWidth = displayWidth * zoom;
        const newHeight = displayHeight * zoom;
        console.log(`🔍 Canvas size: ${displayWidth}x${displayHeight} → ${newWidth}x${newHeight} (zoom: ${zoom}x)`);
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Find min and max amplitudes
        let min = Infinity;
        let max = -Infinity;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const amp = seismicData[y][x];
                if (amp < min) min = amp;
                if (amp > max) max = amp;
            }
        }

        setMinAmp(min.toFixed(2));
        setMaxAmp(max.toFixed(2));

        // Draw seismic data with SMOOTH PROFESSIONAL COLORMAP
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const amp = seismicData[y][x];
                const normalized = (amp - min) / (max - min); // 0 to 1
                const idx = (y * width + x) * 4;

                // Professional seismic colormap: Smooth Red → White → Blue
                // INDUSTRY STANDARD - No separator line, continuous gradient
                let r, g, b;
                
                if (normalized > 0.5) {
                    // Upper half: White (0.5) → Red (1.0)
                    const t = (normalized - 0.5) * 2; // 0 to 1
                    r = 255;
                    g = Math.floor(255 * (1 - t));
                    b = Math.floor(255 * (1 - t));
                } else {
                    // Lower half: Blue (0.0) → White (0.5)
                    const t = normalized * 2; // 0 to 1
                    r = Math.floor(255 * t);
                    g = Math.floor(255 * t);
                    b = 255;
                }
                
                imageData.data[idx] = r;
                imageData.data[idx + 1] = g;
                imageData.data[idx + 2] = b;
                imageData.data[idx + 3] = 255; // Alpha
            }
        }

        // Create temporary canvas for scaling
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);

        // Clear and scale to zoomed size using display dimensions
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false; // Keep sharp pixels
        console.log(`🔍 Drawing image at zoom ${zoom}x: ${width}x${height} → ${displayWidth * zoom}x${displayHeight * zoom}`);
        ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, displayWidth * zoom, displayHeight * zoom);

        // Draw horizons (scaled using display dimensions)
        if (horizons && horizons.length > 0) {
            horizons.forEach(horizon => {
                ctx.strokeStyle = horizon.color || '#00ff00';
                ctx.lineWidth = 2 * zoom;
                ctx.beginPath();
                horizon.points.forEach((point, i) => {
                    // Scale points according to display dimensions vs actual data dimensions
                    const scaleX = displayWidth / width;
                    const scaleY = displayHeight / height;
                    const scaledX = point.x * scaleX * zoom;
                    const scaledY = point.y * scaleY * zoom;
                    if (i === 0) ctx.moveTo(scaledX, scaledY);
                    else ctx.lineTo(scaledX, scaledY);
                });
                ctx.stroke();
            });
        }

        // Draw faults (scaled using display dimensions)
        if (faults && faults.length > 0) {
            faults.forEach(fault => {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 2 * zoom;
                ctx.setLineDash([5 * zoom, 5 * zoom]);
                ctx.beginPath();
                fault.points.forEach((point, i) => {
                    // Scale points according to display dimensions vs actual data dimensions
                    const scaleX = displayWidth / width;
                    const scaleY = displayHeight / height;
                    const scaledX = point.x * scaleX * zoom;
                    const scaledY = point.y * scaleY * zoom;
                    if (i === 0) ctx.moveTo(scaledX, scaledY);
                    else ctx.lineTo(scaledX, scaledY);
                });
                ctx.stroke();
                ctx.setLineDash([]);
            });
        }

        // Draw measurement line and points (scaled using display dimensions)
        if (measurePoints && measurePoints.length > 0) {
            // Scale points according to display dimensions vs actual data dimensions
            const scaleX = displayWidth / width;
            const scaleY = displayHeight / height;
            
            // Draw first point
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(measurePoints[0].x * scaleX * zoom, measurePoints[0].y * scaleY * zoom, 5 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * zoom;
            ctx.stroke();

            // Draw second point and line if exists
            if (measurePoints.length === 2) {
                // Draw line
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3 * zoom;
                ctx.setLineDash([10 * zoom, 5 * zoom]);
                ctx.beginPath();
                ctx.moveTo(measurePoints[0].x * scaleX * zoom, measurePoints[0].y * scaleY * zoom);
                ctx.lineTo(measurePoints[1].x * scaleX * zoom, measurePoints[1].y * scaleY * zoom);
                ctx.stroke();
                ctx.setLineDash([]);

                // Draw second point
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(measurePoints[1].x * scaleX * zoom, measurePoints[1].y * scaleY * zoom, 5 * zoom, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 * zoom;
                ctx.stroke();

                // Draw distance label at midpoint
                const midX = ((measurePoints[0].x + measurePoints[1].x) / 2) * scaleX * zoom;
                const midY = ((measurePoints[0].y + measurePoints[1].y) / 2) * scaleY * zoom;
                const dx = measurePoints[1].x - measurePoints[0].x;
                const dy = measurePoints[1].y - measurePoints[0].y;
                const horizontalDist = Math.abs(dx) * 25; // 25m trace spacing
                const verticalTime = Math.abs(dy) * 4; // 4ms sample rate

                // Draw label background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(midX - 60 * zoom, midY - 25 * zoom, 120 * zoom, 40 * zoom);

                // Draw label text
                ctx.fillStyle = '#22c55e';
                ctx.font = `bold ${11 * zoom}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(`H: ${horizontalDist.toFixed(0)}m`, midX, midY - 8 * zoom);
                ctx.fillText(`V: ${verticalTime.toFixed(0)}ms`, midX, midY + 8 * zoom);
            }
        }
        
        // Draw colorbar
        drawColorbar(colorbarCanvasRef.current, min, max);
    }, [data, horizons, faults, measurePoints, zoom, fitZoom, prevDataId, getDataId, calculateFitZoom]);

    // Handle window resize to recalculate fit zoom
    useEffect(() => {
        const handleResize = () => {
            if (!data) return;
            
            // Get display dimensions if available, otherwise use actual data dimensions
            const displayWidth = data.displayWidth || data.width;
            const displayHeight = data.displayHeight || data.height;
            
            const newFitZoom = calculateFitZoom(displayWidth, displayHeight);
            console.log(`🔍 Window resize detected, recalculating fit zoom: ${newFitZoom.toFixed(2)}`);
            setFitZoom(newFitZoom);
            
            // Only apply the new fit zoom if we're currently at the fit zoom level
            // This prevents overriding user zoom when they've manually zoomed
            if (Math.abs(zoom - fitZoom) < 0.01) {
                console.log(`🔍 Applying new fit zoom due to resize: ${zoom} → ${newFitZoom}`);
                setZoom(newFitZoom);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data, zoom, fitZoom, calculateFitZoom]);

    const drawColorbar = (canvas, min, max) => {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        // COMPACT PROFESSIONAL SIZING - All labels visible
        canvas.width = 100;
        canvas.height = 300; // SHORTER - was 400

        // Clear canvas
        ctx.clearRect(0, 0, 100, 300);

        // Draw title "Amplitude" at top
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Amplitude', 50, 16);

        // Draw gradient bar with SMOOTH PROFESSIONAL TRANSITION
        const barLeft = 25;
        const barWidth = 45;
        const barTop = 32;   // Compact spacing
        const barHeight = 220; // SHORTER gradient - was 310
        
        for (let y = 0; y < barHeight; y++) {
            const value = max - (y / barHeight) * (max - min);
            const normalized = (value - min) / (max - min);

            // Professional seismic colormap: Smooth Red → White → Blue
            let r, g, b;
            
            if (normalized > 0.5) {
                const t = (normalized - 0.5) * 2;
                r = 255;
                g = Math.floor(255 * (1 - t));
                b = Math.floor(255 * (1 - t));
            } else {
                const t = normalized * 2;
                r = Math.floor(255 * t);
                g = Math.floor(255 * t);
                b = 255;
            }
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(barLeft, barTop + y, barWidth, 1);
        }

        // Draw border around colorbar
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(barLeft, barTop, barWidth, barHeight);

        // Draw tick marks and amplitude value labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#64748b';

        const ticks = 5; // 5 ticks for compact display
        for (let i = 0; i <= ticks; i++) {
            const y = barTop + (i / ticks) * barHeight;
            const value = max - (i / ticks) * (max - min);

            // Tick mark
            ctx.beginPath();
            ctx.moveTo(barLeft + barWidth, y);
            ctx.lineTo(barLeft + barWidth + 5, y);
            ctx.stroke();

            // Value label
            ctx.fillStyle = '#ffffff';
            ctx.fillText(value.toFixed(1), barLeft + barWidth + 8, y + 3);
        }

        // Draw "High" label at top
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('High', 50, barTop - 6);

        // Draw "Low" label at bottom
        ctx.fillText('Low', 50, barTop + barHeight + 14);
    };

    const handleCanvasClick = (e) => {
        if (!onPick || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Adjust coordinates based on display scaling
        const displayWidth = data.displayWidth || data.width;
        const displayHeight = data.displayHeight || data.height;
        const scaleX = displayWidth / data.width;
        const scaleY = displayHeight / data.height;
        
        const x = Math.floor((e.clientX - rect.left) / (scaleX * zoom));
        const y = Math.floor((e.clientY - rect.top) / (scaleY * zoom));

        onPick({ x, y });
    };

    const handleMouseMove = (e) => {
        if (!canvasRef.current || !data) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Adjust coordinates based on display scaling
        const displayWidth = data.displayWidth || data.width;
        const displayHeight = data.displayHeight || data.height;
        const scaleX = displayWidth / data.width;
        const scaleY = displayHeight / data.height;
        
        const x = Math.floor((e.clientX - rect.left) / (scaleX * zoom));
        const y = Math.floor((e.clientY - rect.top) / (scaleY * zoom));

        if (x >= 0 && x < data.width && y >= 0 && y < data.height) {
            const inline = viewMode === 'inline' ? currentLine : x + 1000;
            const crossline = viewMode === 'crossline' ? currentLine : x + 2000;
            const time = y * 4; // Convert to milliseconds (assuming 4ms sample rate)

            setCursorPos({ x, y, inline, crossline, time });
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-slate-700 h-full flex flex-col">
            {/* Controls Header - ALWAYS visible */}
            <div className="bg-gradient-to-r from-blue-900/40 to-slate-800/40 border-b border-blue-500/30 px-4 py-1.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Direction Info - Conditional */}
                    {data?.direction && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 uppercase">Direction:</span>
                                <div className="flex items-center gap-2 bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/50">
                                    <span className="text-sm">➡️</span>
                                    <span className="text-xs text-white font-bold font-mono">{data.direction}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Azimuth:</span>
                                <span className="text-xs text-blue-300 font-mono font-semibold">{data.azimuth}°</span>
                            </div>
                            {data.sliceType && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Type:</span>
                                    <span className="text-xs text-green-300 font-mono capitalize">{data.sliceType}</span>
                                </div>
                            )}
                            
                            <div className="border-l border-slate-600 h-5 mx-2" />
                        </>
                    )}
                    
                    {/* Zoom Controls - ALWAYS visible */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => {
                                const newZoom = Math.min(zoom + 0.25, 10);
                                console.log(`🔍 Zoom In: ${zoom} → ${newZoom}`);
                                setZoom(newZoom);
                            }}
                            className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-3 h-3 text-white" />
                        </button>
                        <button
                            onClick={() => {
                                const newZoom = Math.max(zoom - 0.25, 0.1);
                                console.log(`🔍 Zoom Out: ${zoom} → ${newZoom}`);
                                setZoom(newZoom);
                            }}
                            className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-3 h-3 text-white" />
                        </button>
                        <button
                            onClick={() => {
                                console.log(`🔍 Reset Zoom: ${zoom} → 1`);
                                setZoom(1);
                            }}
                            className="p-1 bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="Reset"
                        >
                            <RotateCcw className="w-3 h-3 text-white" />
                        </button>
                        <button
                            onClick={() => {
                                console.log(`🔍 Fit to Screen: ${zoom} → ${fitZoom}`);
                                setZoom(fitZoom);
                            }}
                            className="p-1 bg-blue-700 hover:bg-blue-600 rounded transition"
                            title="Fit to Screen"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                            </svg>
                        </button>
                        <span className="text-[10px] text-gray-400 ml-1">{(zoom * 100).toFixed(0)}%</span>
                        <span className="text-[10px] text-blue-400 ml-1" title="Fit to screen zoom level">(Fit: {(fitZoom * 100).toFixed(0)}%)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {data?.direction && (
                        <div className="w-7 h-7 relative">
                            <svg width="28" height="28" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="14" fill="rgba(15, 23, 42, 0.6)" stroke="#3b82f6" strokeWidth="1"/>
                                <line x1="16" y1="16" x2="16" y2="4" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2"/>
                                <g transform={`rotate(${data.azimuth} 16 16)`}>
                                    <line x1="16" y1="16" x2="16" y2="6" stroke="#ef4444" strokeWidth="2"/>
                                    <polygon points="16,4 13,9 19,9" fill="#ef4444"/>
                                </g>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Seismic Canvas - FULL HEIGHT */}
            {/* Only render canvas when data is available */}
            {data ? (
                <div className="relative flex-1 overflow-auto bg-black/30 rounded border border-slate-700">
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseMove={handleMouseMove}
                        className="cursor-crosshair"
                        style={{ display: 'block' }}
                    />

                    {/* Colorbar overlay on the right side */}
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border-2 border-blue-500/30 shadow-2xl">
                        <canvas ref={colorbarCanvasRef} />
                    </div>
                </div>
            ) : (
                // Show placeholder when no data
                <div className="relative flex-1 flex items-center justify-center bg-black/30 rounded border border-slate-700">
                    <div className="text-center text-gray-500">
                        <div className="text-lg mb-2">No seismic data loaded</div>
                        <div className="text-sm">Import a SEG-Y file to visualize seismic data</div>
                    </div>
                </div>
            )}
            
            {/* Bottom Info Bar - Dynamic cursor position + data info (OUTSIDE seismic section) */}
            <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Inline:</span>
                        <span className="text-blue-400 font-mono font-semibold">{cursorPos.inline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Crossline:</span>
                        <span className="text-green-400 font-mono font-semibold">{cursorPos.crossline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">TWT:</span>
                        <span className="text-white font-mono font-semibold">{cursorPos.time}ms</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] text-gray-500">
                    <span>Resolution: {data?.width} x {data?.height}</span>
                    <span>Display Size: {(data?.displayWidth || data?.width)} x {(data?.displayHeight || data?.height)}</span>
                    <span>Amplitude: {minAmp} to {maxAmp}</span>
                </div>
            </div>
        </div>
    );
};

export default SeismicViewer;