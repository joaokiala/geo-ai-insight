export const calculateCoherence = (seismicData) => {
    const { width, height, data } = seismicData;
    const coherence = [];

    for (let y = 1; y < height - 1; y++) {
        const row = [];
        for (let x = 1; x < width - 1; x++) {
            const center = data[y][x];
            const neighbors = [
                data[y - 1][x], data[y + 1][x],
                data[y][x - 1], data[y][x + 1]
            ];
            const avgDiff = neighbors.reduce((sum, n) => sum + Math.abs(n - center), 0) / 4;
            row.push(Math.max(0, 100 - avgDiff));
        }
        coherence.push(row);
    }

    return coherence;
};

export const calculateCurvature = (seismicData) => {
    const { width, height, data } = seismicData;
    const curvature = [];

    for (let y = 1; y < height - 1; y++) {
        const row = [];
        for (let x = 1; x < width - 1; x++) {
            const center = data[y][x];
            const secondDeriv = (data[y - 1][x] - 2 * center + data[y + 1][x]);
            row.push(secondDeriv);
        }
        curvature.push(row);
    }

    return curvature;
};

export const extractAmplitude = (horizon, seismicData) => {
    return horizon.points.map(point => {
        const x = Math.floor(point.x);
        const y = Math.floor(point.y);
        if (y >= 0 && y < seismicData.height && x >= 0 && x < seismicData.width) {
            return seismicData.data[y][x];
        }
        return 0;
    });
};

// RMS Amplitude - Calculate Root Mean Square amplitude within a time window
export const calculateRMSAmplitude = (seismicData, windowSize = 25) => {
    const { width, height, data } = seismicData;
    const rmsData = [];
    let totalRMS = 0;
    let maxRMS = -Infinity;
    let count = 0;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            // Calculate RMS within vertical window centered at current point
            const startY = Math.max(0, y - Math.floor(windowSize / 2));
            const endY = Math.min(height - 1, y + Math.floor(windowSize / 2));
            
            let sumSquared = 0;
            let samples = 0;
            
            for (let wy = startY; wy <= endY; wy++) {
                const amplitude = data[wy][x];
                sumSquared += amplitude * amplitude;
                samples++;
            }
            
            const rms = Math.sqrt(sumSquared / samples);
            row.push(rms);
            
            totalRMS += rms;
            if (rms > maxRMS) maxRMS = rms;
            count++;
        }
        rmsData.push(row);
    }

    const avgRMS = totalRMS / count;
    
    return {
        data: rmsData,
        avgRMS: avgRMS,
        maxRMS: maxRMS,
        windowSize: windowSize,
        coverage: 100
    };
};

// Maximum Magnitude - Find peak amplitude within a time window
export const calculateMaxMagnitude = (seismicData, windowSize = 25) => {
    const { width, height, data } = seismicData;
    const maxMagData = [];
    let globalMaxAmp = -Infinity;
    let globalMaxX = 0;
    let globalMaxY = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            // Find maximum absolute amplitude within vertical window
            const startY = Math.max(0, y - Math.floor(windowSize / 2));
            const endY = Math.min(height - 1, y + Math.floor(windowSize / 2));
            
            let maxAmp = -Infinity;
            let maxAbsAmp = 0;
            
            for (let wy = startY; wy <= endY; wy++) {
                const amplitude = data[wy][x];
                const absAmp = Math.abs(amplitude);
                
                if (absAmp > maxAbsAmp) {
                    maxAbsAmp = absAmp;
                    maxAmp = amplitude;
                }
            }
            
            row.push(maxAmp);
            
            if (maxAbsAmp > Math.abs(globalMaxAmp)) {
                globalMaxAmp = maxAmp;
                globalMaxX = x;
                globalMaxY = y;
            }
            
            if (maxAmp > 0) positiveCount++;
            else if (maxAmp < 0) negativeCount++;
        }
        maxMagData.push(row);
    }

    const polarity = positiveCount > negativeCount ? 'Positive' : 'Negative';
    const contrast = Math.abs(globalMaxAmp) > 100 ? 'High' : Math.abs(globalMaxAmp) > 50 ? 'Medium' : 'Low';
    
    return {
        data: maxMagData,
        peakAmplitude: Math.abs(globalMaxAmp).toFixed(2),
        locationDepth: globalMaxY * 4, // Assuming 4ms sample rate
        locationTrace: globalMaxX,
        polarity: polarity,
        contrast: contrast
    };
};

// Dip/Azimuth - Calculate structural dip and azimuth direction
export const calculateDipAzimuth = (seismicData) => {
    const { width, height, data } = seismicData;
    const dipData = [];
    const azimuthData = [];
    let totalDip = 0;
    let maxDip = -Infinity;
    let count = 0;
    const azimuthBins = { N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 };

    // Use a sliding window to find local peaks (reflectors)
    for (let y = 2; y < height - 2; y++) {
        const dipRow = [];
        const azimuthRow = [];
        
        for (let x = 2; x < width - 2; x++) {
            // Calculate inline gradient (dz/dx) - spatial derivative
            const inlineGradient = (data[y][x + 1] - data[y][x - 1]) / 2;
            
            // Calculate crossline gradient (dz/dy) - time/depth derivative
            // Using vertical gradient as proxy for dip magnitude
            const crosslineGradient = (data[y + 1][x] - data[y - 1][x]) / 2;
            
            // Calculate dip magnitude (in degrees)
            // Assuming: 25m trace spacing, 4ms sample rate, 2000 m/s velocity
            const horizontalDist = 25; // meters
            const verticalDist = 4 * 2000 / 1000; // 4ms * 2000m/s / 1000 = 8 meters
            
            const dipRadians = Math.atan(Math.abs(crosslineGradient) / horizontalDist * verticalDist);
            const dipDegrees = dipRadians * 180 / Math.PI;
            
            // Calculate azimuth (compass direction of dip)
            let azimuthDegrees = Math.atan2(crosslineGradient, inlineGradient) * 180 / Math.PI;
            if (azimuthDegrees < 0) azimuthDegrees += 360;
            
            dipRow.push(dipDegrees);
            azimuthRow.push(azimuthDegrees);
            
            totalDip += dipDegrees;
            if (dipDegrees > maxDip) maxDip = dipDegrees;
            count++;
            
            // Bin azimuth for dominant direction
            if (azimuthDegrees >= 337.5 || azimuthDegrees < 22.5) azimuthBins.N++;
            else if (azimuthDegrees >= 22.5 && azimuthDegrees < 67.5) azimuthBins.NE++;
            else if (azimuthDegrees >= 67.5 && azimuthDegrees < 112.5) azimuthBins.E++;
            else if (azimuthDegrees >= 112.5 && azimuthDegrees < 157.5) azimuthBins.SE++;
            else if (azimuthDegrees >= 157.5 && azimuthDegrees < 202.5) azimuthBins.S++;
            else if (azimuthDegrees >= 202.5 && azimuthDegrees < 247.5) azimuthBins.SW++;
            else if (azimuthDegrees >= 247.5 && azimuthDegrees < 292.5) azimuthBins.W++;
            else if (azimuthDegrees >= 292.5 && azimuthDegrees < 337.5) azimuthBins.NW++;
        }
        dipData.push(dipRow);
        azimuthData.push(azimuthRow);
    }

    const avgDip = totalDip / count;
    
    // Find dominant azimuth
    let dominantDir = 'N';
    let maxCount = 0;
    for (const [dir, cnt] of Object.entries(azimuthBins)) {
        if (cnt > maxCount) {
            maxCount = cnt;
            dominantDir = dir;
        }
    }
    
    // Map to structural trend (perpendicular to dip direction)
    const trendMap = {
        N: 'E-W', NE: 'NW-SE', E: 'N-S', SE: 'NE-SW',
        S: 'E-W', SW: 'NW-SE', W: 'N-S', NW: 'NE-SW'
    };
    
    return {
        dipData: dipData,
        azimuthData: azimuthData,
        avgDip: avgDip.toFixed(2),
        maxDip: maxDip.toFixed(2),
        dominantAzimuth: dominantDir,
        structuralTrend: trendMap[dominantDir]
    };
};
