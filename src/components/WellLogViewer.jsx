import React, { useRef, useEffect } from 'react';

const WellLogViewer = ({ seismicData }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 1200;
        canvas.height = 700;

        // Generate REALISTIC well log data with geological character
        const depth = [];
        const gr = [];        // Gamma Ray
        const rt = [];        // Resistivity
        const rhob = [];      // Density
        const dt = [];        // Sonic
        const nphi = [];      // Neutron Porosity

        // Formation tops and lithology zones
        const formations = [
            { top: 0, base: 800, name: 'Overburden', lithology: 'shale' },
            { top: 800, base: 1200, name: 'Cap Rock', lithology: 'shale' },
            { top: 1200, base: 1450, name: 'Reservoir Sand', lithology: 'sand', hydrocarbon: 'gas' },
            { top: 1450, base: 1600, name: 'Tight Sand', lithology: 'sand' },
            { top: 1600, base: 2100, name: 'Marine Shale', lithology: 'shale' },
            { top: 2100, base: 2400, name: 'Carbonate', lithology: 'limestone' },
            { top: 2400, base: 3000, name: 'Basement', lithology: 'shale' }
        ];

        // Generate realistic logs based on lithology
        for (let d = 0; d <= 3000; d += 5) {
            depth.push(d);

            // Determine current formation
            let currentLith = 'shale';
            let isReservoir = false;
            for (const fm of formations) {
                if (d >= fm.top && d < fm.base) {
                    currentLith = fm.lithology;
                    isReservoir = fm.hydrocarbon !== undefined;
                    break;
                }
            }

            // Add realistic noise and cyclicity
            const noise = (Math.random() - 0.5) * 10;
            const cycle = Math.sin(d / 50) * 5 + Math.sin(d / 150) * 8;

            // GAMMA RAY (API units)
            let grValue;
            if (currentLith === 'shale') {
                grValue = 90 + noise + cycle; // Shale baseline
            } else if (currentLith === 'sand') {
                if (isReservoir) {
                    grValue = 15 + noise * 0.5; // Clean reservoir sand
                } else {
                    grValue = 35 + noise + cycle * 0.5; // Tight sand
                }
            } else if (currentLith === 'limestone') {
                grValue = 20 + noise * 0.7;
            }
            gr.push(Math.max(0, Math.min(150, grValue)));

            // RESISTIVITY (ohm.m)
            let rtValue;
            if (currentLith === 'shale') {
                rtValue = 1.5 + Math.random() * 2; // Conductive shale
            } else if (currentLith === 'sand') {
                if (isReservoir) {
                    rtValue = 80 + Math.random() * 40; // High resistivity gas
                } else {
                    rtValue = 8 + Math.random() * 10; // Water-bearing sand
                }
            } else if (currentLith === 'limestone') {
                rtValue = 15 + Math.random() * 20;
            }
            rt.push(Math.max(0.1, rtValue));

            // DENSITY (g/cc)
            let rhobValue;
            if (currentLith === 'shale') {
                rhobValue = 2.45 + (Math.random() - 0.5) * 0.1;
            } else if (currentLith === 'sand') {
                if (isReservoir) {
                    rhobValue = 2.15 + (Math.random() - 0.5) * 0.05; // Low density (gas)
                } else {
                    rhobValue = 2.30 + (Math.random() - 0.5) * 0.08;
                }
            } else if (currentLith === 'limestone') {
                rhobValue = 2.65 + (Math.random() - 0.5) * 0.1;
            }
            rhob.push(Math.max(1.8, Math.min(2.9, rhobValue)));

            // SONIC (μs/ft)
            let dtValue;
            if (currentLith === 'shale') {
                dtValue = 100 + (Math.random() - 0.5) * 10;
            } else if (currentLith === 'sand') {
                if (isReservoir) {
                    dtValue = 65 + (Math.random() - 0.5) * 5; // Fast (porous)
                } else {
                    dtValue = 58 + (Math.random() - 0.5) * 4;
                }
            } else if (currentLith === 'limestone') {
                dtValue = 52 + (Math.random() - 0.5) * 6;
            }
            dt.push(Math.max(40, Math.min(140, dtValue)));

            // NEUTRON POROSITY (%)
            let nphiValue;
            if (currentLith === 'shale') {
                nphiValue = 35 + (Math.random() - 0.5) * 5;
            } else if (currentLith === 'sand') {
                if (isReservoir) {
                    nphiValue = 22 + (Math.random() - 0.5) * 3; // Good porosity
                } else {
                    nphiValue = 12 + (Math.random() - 0.5) * 4;
                }
            } else if (currentLith === 'limestone') {
                nphiValue = 8 + (Math.random() - 0.5) * 4;
            }
            nphi.push(Math.max(0, Math.min(45, nphiValue)));
        }

        // Draw background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, 50);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('WELL: North Sea Demo-1', 15, 25);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Location: Inline 1234, Crossline 5678  |  TD: 3000m  |  Spud Date: 2024-01-15', 15, 42);

        // Draw formation background zones
        const formationColors = {
            'shale': 'rgba(139, 69, 19, 0.1)',
            'sand': 'rgba(255, 215, 0, 0.1)',
            'limestone': 'rgba(173, 216, 230, 0.1)'
        };

        formations.forEach(fm => {
            const startY = 70 + (fm.top / 3000) * (canvas.height - 100);
            const height = ((fm.base - fm.top) / 3000) * (canvas.height - 100);
            ctx.fillStyle = formationColors[fm.lithology] || 'rgba(128, 128, 128, 0.1)';
            ctx.fillRect(0, startY, canvas.width, height);

            // Highlight reservoir zone
            if (fm.hydrocarbon) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
                ctx.fillRect(0, startY, canvas.width, height);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.strokeRect(5, startY, canvas.width - 10, height);

                // Reservoir label
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 11px Arial';
                ctx.fillText(`★ PAY ZONE (${fm.name})`, 10, startY + 15);
            }
        });

        // Draw tracks
        const trackWidth = 230;
        const tracks = [
            { name: 'Gamma Ray', unit: 'API', data: gr, color: '#22c55e', min: 0, max: 150 },
            { name: 'Resistivity', unit: 'ohm.m', data: rt, color: '#ef4444', min: 0.1, max: 200, log: true },
            { name: 'Density', unit: 'g/cc', data: rhob, color: '#3b82f6', min: 1.8, max: 2.9 },
            { name: 'Sonic', unit: 'μs/ft', data: dt, color: '#f59e0b', min: 40, max: 140, reversed: true },
            { name: 'Neutron', unit: '%', data: nphi, color: '#8b5cf6', min: 0, max: 45, reversed: true }
        ];

        tracks.forEach((track, trackIdx) => {
            const x = trackIdx * trackWidth + 60;

            // Draw track background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, 60, trackWidth, canvas.height - 90);

            // Draw grid lines
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 0.5;
            for (let i = 0; i <= 10; i++) {
                const gridX = x + (i / 10) * trackWidth;
                ctx.beginPath();
                ctx.moveTo(gridX, 60);
                ctx.lineTo(gridX, canvas.height - 30);
                ctx.stroke();
            }

            // Draw track border
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, 60, trackWidth, canvas.height - 90);

            // Draw title
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(track.name, x + 10, 55);
            ctx.font = '10px Arial';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`(${track.unit})`, x + 10 + ctx.measureText(track.name).width + 5, 55);

            // Draw scale
            ctx.font = '10px Arial';
            ctx.fillStyle = '#9ca3af';
            const minLabel = track.log ? track.min.toFixed(1) : track.min.toString();
            const maxLabel = track.log ? track.max.toFixed(0) : track.max.toString();
            ctx.fillText(track.reversed ? maxLabel : minLabel, x + 5, 75);
            ctx.fillText(track.reversed ? minLabel : maxLabel, x + trackWidth - 35, 75);

            // Draw log curve
            ctx.strokeStyle = track.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            track.data.forEach((value, i) => {
                let normalized;
                if (track.log) {
                    // Logarithmic scale for resistivity
                    const logMin = Math.log10(track.min);
                    const logMax = Math.log10(track.max);
                    const logValue = Math.log10(Math.max(track.min, value));
                    normalized = (logValue - logMin) / (logMax - logMin);
                } else {
                    normalized = (value - track.min) / (track.max - track.min);
                }

                if (track.reversed) {
                    normalized = 1 - normalized;
                }

                const plotX = x + 5 + normalized * (trackWidth - 10);
                const plotY = 70 + (i / track.data.length) * (canvas.height - 100);

                if (i === 0) {
                    ctx.moveTo(plotX, plotY);
                } else {
                    ctx.lineTo(plotX, plotY);
                }
            });
            ctx.stroke();

            // Fill reservoir zone for porosity-related logs
            if (track.name === 'Neutron' || track.name === 'Density') {
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = track.color;
                ctx.beginPath();
                const reservoirStart = 1200;
                const reservoirEnd = 1450;
                const startIdx = Math.floor(reservoirStart / 5);
                const endIdx = Math.floor(reservoirEnd / 5);

                for (let i = startIdx; i <= endIdx; i++) {
                    if (i >= 0 && i < track.data.length) {
                        const value = track.data[i];
                        let normalized;
                        if (track.log) {
                            const logMin = Math.log10(track.min);
                            const logMax = Math.log10(track.max);
                            const logValue = Math.log10(Math.max(track.min, value));
                            normalized = (logValue - logMin) / (logMax - logMin);
                        } else {
                            normalized = (value - track.min) / (track.max - track.min);
                        }
                        if (track.reversed) normalized = 1 - normalized;

                        const plotX = x + 5 + normalized * (trackWidth - 10);
                        const plotY = 70 + (i / track.data.length) * (canvas.height - 100);

                        if (i === startIdx) {
                            ctx.moveTo(x + 5, plotY);
                            ctx.lineTo(plotX, plotY);
                        } else {
                            ctx.lineTo(plotX, plotY);
                        }
                    }
                }
                ctx.lineTo(x + 5, 70 + (endIdx / track.data.length) * (canvas.height - 100));
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        });

        // Draw depth scale on left
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        for (let d = 0; d <= 3000; d += 200) {
            const y = 70 + (d / 3000) * (canvas.height - 100);
            ctx.fillText(`${d}m`, 50, y + 4);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(55, y);
            ctx.lineTo(canvas.width - 10, y);
            ctx.stroke();
        }

        // Draw formation tops labels
        ctx.textAlign = 'left';
        ctx.font = 'bold 10px Arial';
        formations.forEach(fm => {
            const y = 70 + (fm.top / 3000) * (canvas.height - 100);
            if (fm.top > 0) {
                ctx.fillStyle = '#fbbf24';
                ctx.fillText(`— ${fm.name}`, canvas.width - 180, y - 5);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(canvas.width - 190, y);
                ctx.lineTo(canvas.width - 10, y);
                ctx.stroke();
            }
        });

        // Draw legend/interpretation box
        const legendX = 10;
        const legendY = canvas.height - 25;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(legendX, legendY, canvas.width - 20, 20);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, canvas.width - 20, 20);

        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Interpretation: Gas-bearing reservoir sand (1200-1450m) | Porosity: ~22% | Sw: ~25% | Net Pay: 250m', legendX + 10, legendY + 13);

    }, [seismicData]);

    return (
        <div className="h-full bg-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Petrophysical Well Log Suite</h3>
                    <p className="text-xs text-gray-500 mt-1">Realistic synthetic logs with geological character and reservoir zones</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400">
                        ★ Reservoir Interval Identified
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded text-xs text-blue-400">
                        5-Track Display
                    </div>
                </div>
            </div>
            <div className="overflow-auto">
                <canvas ref={canvasRef} className="border border-slate-700 rounded" />
            </div>
            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-gray-400 mb-2"><span className="font-semibold text-white">Log Suite:</span> GR (Gamma Ray) | RT (Deep Resistivity) | RHOB (Bulk Density) | DT (Sonic) | NPHI (Neutron Porosity)</p>
                <p className="text-xs text-gray-400"><span className="font-semibold text-white">Key Features:</span> Realistic sand/shale cycles • Hydrocarbon-bearing reservoir zone • Formation tops marked • Petrophysical character honors lithology</p>
            </div>
        </div>
    );
};

export default WellLogViewer;
