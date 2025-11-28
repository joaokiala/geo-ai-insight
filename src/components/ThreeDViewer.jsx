import React, { useRef, useEffect, useState } from 'react';
import { Box, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const ThreeDViewer = ({ seismicData }) => {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 30, y: 45 });
    const [scale, setScale] = useState(1);
    const [autoRotate, setAutoRotate] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !seismicData) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 900;
        canvas.height = 700;

        // Clear background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Check if it's 3D volume or 2D slice
        const is3D = seismicData.is3D && seismicData.volume;
        
        if (is3D) {
            // Render 3D volume
            const { volume, numInlines, numCrosslines, numSamples } = seismicData;
            
            // 3D visualization parameters
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const baseScale = Math.min(canvas.width / numCrosslines, canvas.height / numSamples) * 0.6 * scale;
            
            // Convert rotation to radians
            const rotX = (rotation.x * Math.PI) / 180;
            const rotY = (rotation.y * Math.PI) / 180;

            // Draw multiple inline slices to create 3D volume effect
            const numSlices = Math.min(15, numInlines);
            const sliceStep = Math.floor(numInlines / numSlices);

            for (let slice = 0; slice < numSlices; slice++) {
                const ilIndex = slice * sliceStep;
                if (ilIndex >= numInlines) continue;

                // Create slice data
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = numCrosslines;
                sliceCanvas.height = numSamples;
                const sliceCtx = sliceCanvas.getContext('2d');
                const sliceImageData = sliceCtx.createImageData(numCrosslines, numSamples);

                // Find min/max for this slice
                let min = Infinity, max = -Infinity;
                for (let t = 0; t < numSamples; t++) {
                    for (let xl = 0; xl < numCrosslines; xl++) {
                        const amp = volume[ilIndex][xl][t];
                        if (amp < min) min = amp;
                        if (amp > max) max = amp;
                    }
                }

                // Draw slice with color mapping
                for (let t = 0; t < numSamples; t++) {
                    for (let xl = 0; xl < numCrosslines; xl++) {
                        const amp = volume[ilIndex][xl][t];
                        const normalized = (amp - min) / (max - min);
                        const idx = (t * numCrosslines + xl) * 4;

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

                        sliceImageData.data[idx] = r;
                        sliceImageData.data[idx + 1] = g;
                        sliceImageData.data[idx + 2] = b;
                        sliceImageData.data[idx + 3] = 255;
                    }
                }

                sliceCtx.putImageData(sliceImageData, 0, 0);

                // 3D transformation
                const sliceDepth = (ilIndex - numInlines / 2) * baseScale * 0.3;
                const z = sliceDepth * Math.cos(rotY);
                const offsetX = sliceDepth * Math.sin(rotY);
                const offsetY = sliceDepth * Math.sin(rotX) * 0.3;

                // Calculate opacity based on depth
                const opacity = 0.4 + (0.6 * (slice / numSlices));

                // Draw the slice
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.translate(centerX + offsetX, centerY + offsetY);
                
                const sliceWidth = numCrosslines * baseScale * 0.8;
                const sliceHeight = numSamples * baseScale;
                
                ctx.drawImage(sliceCanvas, -sliceWidth / 2, -sliceHeight / 2, sliceWidth, sliceHeight);
                
                // Draw slice outline
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1;
                ctx.strokeRect(-sliceWidth / 2, -sliceHeight / 2, sliceWidth, sliceHeight);
                
                ctx.restore();
            }

            // Draw info for 3D volume
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('3D Seismic Volume', centerX, 40);
            
            ctx.font = '12px Arial';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`${numInlines}IL x ${numCrosslines}XL x ${numSamples}samples | ${numSlices} slices | Rotation: ${Math.round(rotation.y)}°`, centerX, 65);
            
            // Draw axis legend
            ctx.textAlign = 'left';
            ctx.fillText('🔴 Inline', 20, canvas.height - 60);
            ctx.fillText('🟢 Time', 20, canvas.height - 40);
            ctx.fillText('🔵 Amplitude', 20, canvas.height - 20);
        } else {
            // Render 2D slice (fallback)
            const { width, height, data } = seismicData;
        
        // 3D visualization parameters
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseScale = Math.min(canvas.width / width, canvas.height / height) * 0.6 * scale;
        
        // Convert rotation to radians
        const rotX = (rotation.x * Math.PI) / 180;
        const rotY = (rotation.y * Math.PI) / 180;

        // Draw multiple inline slices to create 3D volume effect
        const numSlices = Math.min(15, Math.floor(width / 10));
        const sliceStep = Math.floor(width / numSlices);

        for (let slice = 0; slice < numSlices; slice++) {
            const x = slice * sliceStep;
            if (x >= width) continue;

            // Create slice data
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = 1;
            sliceCanvas.height = height;
            const sliceCtx = sliceCanvas.getContext('2d');
            const sliceImageData = sliceCtx.createImageData(1, height);

            // Find min/max for this slice
            let min = Infinity, max = -Infinity;
            for (let y = 0; y < height; y++) {
                const amp = data[y][x];
                if (amp < min) min = amp;
                if (amp > max) max = amp;
            }

            // Draw slice with color mapping
            for (let y = 0; y < height; y++) {
                const amp = data[y][x];
                const normalized = (amp - min) / (max - min);
                const idx = y * 4;

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

                sliceImageData.data[idx] = r;
                sliceImageData.data[idx + 1] = g;
                sliceImageData.data[idx + 2] = b;
                sliceImageData.data[idx + 3] = 255;
            }

            sliceCtx.putImageData(sliceImageData, 0, 0);

            // 3D transformation
            const sliceDepth = (x - width / 2) * baseScale;
            const z = sliceDepth * Math.cos(rotY);
            const offsetX = sliceDepth * Math.sin(rotY);
            const offsetY = sliceDepth * Math.sin(rotX) * 0.3;

            // Calculate opacity based on depth
            const opacity = 0.4 + (0.6 * (slice / numSlices));

            // Draw the slice
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.translate(centerX + offsetX, centerY + offsetY);
            
            const sliceWidth = Math.max(2, baseScale * 0.5);
            const sliceHeight = height * baseScale;
            
            ctx.drawImage(sliceCanvas, 0, -sliceHeight / 2, sliceWidth, sliceHeight);
            
            // Draw slice outline
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(0, -sliceHeight / 2, sliceWidth, sliceHeight);
            
            ctx.restore();
        }

        // Draw axis indicators
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // X axis (red)
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(centerX - 150, centerY);
        ctx.lineTo(centerX + 150, centerY);
        ctx.stroke();
        
        // Y axis (green)
        ctx.strokeStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 150);
        ctx.lineTo(centerX, centerY + 150);
        ctx.stroke();
        
        ctx.setLineDash([]);

            // Draw info for 2D slice
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('3D Seismic Volume (2D View)', centerX, 40);
                    
            ctx.font = '12px Arial';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`${width} x ${height} samples | ${numSlices} slices | Rotation: ${Math.round(rotation.y)}°`, centerX, 65);
            
            // Draw axis legend
            ctx.textAlign = 'left';
            ctx.fillText('🔴 Inline', 20, canvas.height - 60);
            ctx.fillText('🟢 Time', 20, canvas.height - 40);
            ctx.fillText('🔵 Amplitude', 20, canvas.height - 20);
        }

    }, [seismicData, rotation, scale]);

    // Auto-rotation effect
    useEffect(() => {
        if (!autoRotate) return;
        
        const interval = setInterval(() => {
            setRotation(prev => ({
                ...prev,
                y: (prev.y + 1) % 360
            }));
        }, 50);
        
        return () => clearInterval(interval);
    }, [autoRotate]);

    return (
        <div className="h-full bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">3D Seismic Volume Viewer</h3>
                    <p className="text-xs text-gray-500 mt-1">Interactive 3D visualization with real seismic data</p>
                </div>
                
                {seismicData && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={() => setScale(s => Math.min(2, s + 0.2))}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={() => setAutoRotate(!autoRotate)}
                            className={`p-2 rounded transition ${
                                autoRotate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                            title="Toggle Auto-Rotate"
                        >
                            <RotateCw className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                {seismicData ? (
                    <div className="relative">
                        <canvas ref={canvasRef} className="border border-slate-700 rounded" />
                        
                        {/* Rotation Controls */}
                        <div className="absolute bottom-4 left-4 bg-slate-800/90 p-3 rounded-lg border border-slate-600">
                            <div className="text-xs text-gray-400 mb-2">Rotation</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">Y:</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={rotation.y}
                                        onChange={(e) => setRotation(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                                        className="w-32"
                                    />
                                    <span className="text-xs text-white w-10">{rotation.y}°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-8">X:</span>
                                    <input
                                        type="range"
                                        min="-90"
                                        max="90"
                                        value={rotation.x}
                                        onChange={(e) => setRotation(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                                        className="w-32"
                                    />
                                    <span className="text-xs text-white w-10">{rotation.x}°</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <Box className="w-16 h-16 mb-4 text-blue-500 opacity-50 mx-auto" />
                        <p>No seismic data loaded</p>
                        <p className="text-xs mt-2">Import SEG-Y file to view 3D volume</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreeDViewer;
