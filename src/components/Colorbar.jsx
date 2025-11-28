import React from 'react';

/**
 * Colorbar component for displaying amplitude scale
 * Shows a vertical gradient with high/low labels and numerical values
 */
const Colorbar = ({
    min = -1.0,
    max = 1.0,
    colorScheme = 'seismic',
    height = 400,
    width = 60
}) => {
    // Generate gradient stops based on color scheme
    const getGradientColors = () => {
        switch (colorScheme) {
            case 'seismic':
                // SMOOTH PROFESSIONAL GRADIENT (Industry Standard - Petrel/Kingdom)
                // Red → White → Blue (NO separator line)
                return [
                    { offset: '0%', color: '#FF0000' },    // Red (high positive)
                    { offset: '50%', color: '#FFFFFF' },   // White (zero crossing)
                    { offset: '100%', color: '#0000FF' }   // Blue (high negative)
                ];
            case 'grayscale':
                return [
                    { offset: '0%', color: '#FFFFFF' },
                    { offset: '100%', color: '#000000' }
                ];
            case 'rainbow':
                return [
                    { offset: '0%', color: '#FF0000' },
                    { offset: '20%', color: '#FFFF00' },
                    { offset: '40%', color: '#00FF00' },
                    { offset: '60%', color: '#00FFFF' },
                    { offset: '80%', color: '#0000FF' },
                    { offset: '100%', color: '#FF00FF' }
                ];
            default:
                return [
                    { offset: '0%', color: '#FF0000' },
                    { offset: '100%', color: '#0000FF' }
                ];
        }
    };

    const gradientColors = getGradientColors();
    const gradientId = `colorbar-gradient-${colorScheme}`;

    // Generate tick marks and labels
    const numTicks = 5;
    const ticks = Array.from({ length: numTicks }, (_, i) => {
        const value = max - (i * (max - min) / (numTicks - 1));
        const position = (i / (numTicks - 1)) * 100;
        return { value, position };
    });

    return (
        <div className="flex flex-col items-center bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">Amplitude</div>

            <div className="flex items-center gap-2">
                {/* Gradient bar */}
                <svg width={width} height={height} className="rounded">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                            {gradientColors.map((stop, idx) => (
                                <stop
                                    key={idx}
                                    offset={stop.offset}
                                    stopColor={stop.color}
                                />
                            ))}
                        </linearGradient>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        fill={`url(#${gradientId})`}
                        stroke="#475569"
                        strokeWidth="1"
                    />
                </svg>

                {/* Labels */}
                <div className="relative" style={{ height: `${height}px` }}>
                    {ticks.map((tick, idx) => (
                        <div
                            key={idx}
                            className="absolute text-xs text-gray-300 font-mono"
                            style={{
                                top: `${tick.position}%`,
                                transform: 'translateY(-50%)'
                            }}
                        >
                            {tick.value.toFixed(2)}
                        </div>
                    ))}
                </div>
            </div>

            {/* High/Low labels */}
            <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
                <span>Low</span>
                <span>High</span>
            </div>
        </div>
    );
};

export default Colorbar;
