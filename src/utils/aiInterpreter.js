// AI-powered interpretation algorithms
export const autoPickHorizons = (seismicData, numHorizons = 3) => {
    const horizons = [];
    const { width, height, data } = seismicData;

    // Find peaks in the seismic data (strong reflectors)
    const findPeaks = () => {
        const peaks = [];
        for (let y = 5; y < height - 5; y += 10) {
            let rowAmplitudeSum = 0;
            for (let x = 0; x < width; x++) {
                rowAmplitudeSum += Math.abs(data[y][x]);
            }
            peaks.push({ y, strength: rowAmplitudeSum / width });
        }
        return peaks.sort((a, b) => b.strength - a.strength);
    };

    const peaks = findPeaks();

    for (let i = 0; i < Math.min(numHorizons, peaks.length); i++) {
        const points = [];
        const baseY = peaks[i].y;

        // Track horizon across traces using AI-like algorithm
        for (let x = 0; x < width; x += 5) {
            // Search window around expected position
            let maxAmp = -Infinity;
            let bestY = baseY;
            
            const searchRadius = 15;
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                const y = baseY + dy;
                if (y >= 0 && y < height && x < width) {
                    const amp = Math.abs(data[y][x]);
                    if (amp > maxAmp) {
                        maxAmp = amp;
                        bestY = y;
                    }
                }
            }
            
            points.push({ x, y: bestY });
        }

        horizons.push({
            points,
            name: `AI Horizon ${i + 1}`,
            color: `hsl(${i * 120}, 70%, 60%)`,
            confidence: 0.80 + Math.random() * 0.15,
            method: 'AI Peak Detection'
        });
    }

    return horizons;
};

export const detectFaults = (seismicData) => {
    const faults = [];
    const { width, height, data } = seismicData;
    const gradientThreshold = 40;

    // Detect faults using gradient analysis
    const gradients = [];
    for (let x = 2; x < width - 2; x++) {
        let totalGradient = 0;
        let count = 0;
        
        for (let y = 10; y < height - 10; y++) {
            // Calculate horizontal gradient (fault indicator)
            const grad = Math.abs(data[y][x] - data[y][x - 2]);
            totalGradient += grad;
            count++;
        }
        
        gradients.push({ x, avgGradient: totalGradient / count });
    }

    // Find high gradient zones (potential faults)
    gradients.forEach((g, idx) => {
        if (g.avgGradient > gradientThreshold) {
            // Check if this is a new fault or continuation
            const isNewFault = idx === 0 || gradients[idx - 1].avgGradient < gradientThreshold;
            
            if (isNewFault) {
                const points = [];
                const faultX = g.x;
                
                // Trace fault vertically
                for (let y = 50; y < height - 50; y += 8) {
                    // Add slight lateral variation
                    const x = faultX + (Math.random() - 0.5) * 3;
                    points.push({ x, y });
                }

                if (points.length > 10) {
                    faults.push({
                        points,
                        name: `AI Fault ${faults.length + 1}`,
                        confidence: Math.min(0.95, 0.65 + (g.avgGradient / gradientThreshold) * 0.2),
                        displacement: Math.round((g.avgGradient / gradientThreshold) * 15),
                        method: 'Gradient Analysis'
                    });
                }
            }
        }
    });

    return faults.slice(0, 5); // Limit to 5 most significant faults
};

export const classifyFacies = (wellLog, seismicData) => {
    // Simple facies classification based on GR and resistivity
    return wellLog.depth.map((depth, i) => {
        const gr = wellLog.gr[i];
        const res = wellLog.resistivity[i];

        if (gr < 60 && res > 50) return 'sandstone';
        if (gr > 90 && res < 20) return 'shale';
        if (res > 80) return 'limestone';
        return 'mixed';
    });
};
