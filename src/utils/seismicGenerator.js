// Generate 3D seismic volume (multiple inline and crossline slices)
export const generate3DSeismicVolume = (numInlines = 50, numCrosslines = 50, numSamples = 600) => {
    console.log(`🎲 Generating 3D seismic volume: ${numInlines}IL x ${numCrosslines}XL x ${numSamples}samples`);
    
    const volume = [];
    const inlineStart = 1200;
    const crosslineStart = 2000;
    
    // Generate 3D volume [inline][crossline][time]
    for (let il = 0; il < numInlines; il++) {
        const inlineSlice = [];
        for (let xl = 0; xl < numCrosslines; xl++) {
            const trace = [];
            for (let t = 0; t < numSamples; t++) {
                let amplitude = 0;
                
                // Create 3D geological structures
                // Horizon 1 - Dipping surface
                const horizon1 = 100 + Math.sin(xl / 8) * 25 + Math.cos(il / 10) * 20;
                if (Math.abs(t - horizon1) < 3) {
                    amplitude += 80 * Math.exp(-Math.pow((t - horizon1) / 2, 2));
                }
                
                // Horizon 2 - Complex structure
                const horizon2 = 250 + Math.cos(xl / 10) * 40 + Math.sin(il / 8) * 30 + Math.sin((il + xl) / 15) * 15;
                if (Math.abs(t - horizon2) < 3) {
                    amplitude += 60 * Math.exp(-Math.pow((t - horizon2) / 2, 2));
                }
                
                // Horizon 3 - Deep reflector with anticline
                const horizon3 = 420 + Math.sin(xl / 12) * 30 - Math.abs(il - numInlines/2) * 0.5;
                if (Math.abs(t - horizon3) < 3) {
                    amplitude += 70 * Math.exp(-Math.pow((t - horizon3) / 2, 2));
                }
                
                // Fault zones (3D discontinuities)
                const faultIL = numInlines * 0.4;
                const faultXL = numCrosslines * 0.6;
                if (Math.abs(il - faultIL) < 2 || Math.abs(xl - faultXL) < 2) {
                    amplitude += (Math.random() - 0.5) * 80;
                }
                
                // 3D background layering
                amplitude += Math.sin(t / 25) * 15;
                amplitude += Math.cos(t / 40 + il / 20 + xl / 20) * 20;
                
                // Noise
                amplitude += (Math.random() - 0.5) * 12;
                
                // Random events
                if (Math.random() > 0.985) {
                    amplitude += (Math.random() - 0.5) * 40;
                }
                
                trace.push(amplitude);
            }
            inlineSlice.push(trace);
        }
        volume.push(inlineSlice);
    }
    
    return {
        volume, // 3D array [inline][crossline][time]
        numInlines,
        numCrosslines,
        numSamples,
        inlineStart,
        crosslineStart,
        inlineEnd: inlineStart + numInlines - 1,
        crosslineEnd: crosslineStart + numCrosslines - 1,
        sampleRate: 4, // ms
        is3D: true,
        // Survey geometry and orientation
        surveyGeometry: {
            inlineAzimuth: 45,        // degrees from North (NE-SW direction)
            crosslineAzimuth: 135,    // degrees from North (SE-NW direction)
            inlineDirection: 'NE-SW',  // Primary acquisition direction
            crosslineDirection: 'SE-NW', // Perpendicular direction
            binSpacing: 25,            // meters (trace spacing)
            surveyName: 'Demo 3D Survey',
            area: 'Synthetic Basin',
            acquisitionYear: 2024
        },
        metadata: {
            inlineRange: [inlineStart, inlineStart + numInlines - 1],
            crosslineRange: [crosslineStart, crosslineStart + numCrosslines - 1],
            timeRange: [0, numSamples * 4],
            sampleRate: 4,
            inlineAzimuth: 45,
            crosslineAzimuth: 135,
            inlineDirection: 'NE-SW',
            crosslineDirection: 'SE-NW'
        }
    };
};

// Extract a 2D slice from 3D volume
export const extractSlice = (volumeData, sliceType, sliceNumber) => {
    if (!volumeData || !volumeData.is3D) {
        console.warn('Not a 3D volume, returning original data');
        return volumeData;
    }
    
    const { volume, numInlines, numCrosslines, numSamples, inlineStart, crosslineStart } = volumeData;
    
    if (sliceType === 'inline') {
        // Extract inline slice
        const inlineIndex = sliceNumber - inlineStart;
        if (inlineIndex < 0 || inlineIndex >= numInlines) {
            console.warn(`Inline ${sliceNumber} out of range`);
            return null;
        }
        
        // Create 2D data [time][crossline]
        const data = [];
        for (let t = 0; t < numSamples; t++) {
            const row = [];
            for (let xl = 0; xl < numCrosslines; xl++) {
                row.push(volume[inlineIndex][xl][t]);
            }
            data.push(row);
        }
        
        return {
            width: numCrosslines,
            height: numSamples,
            data,
            sliceType: 'inline',
            sliceNumber,
            filename: `Inline_${sliceNumber}`,
            direction: volumeData.surveyGeometry?.inlineDirection || 'NE-SW',
            azimuth: volumeData.surveyGeometry?.inlineAzimuth || 45,
            metadata: volumeData.metadata,
            // Add display scaling factor to make narrow slices appear wider
            displayWidth: Math.max(numCrosslines, 1600), // Scale to at least 1600 pixels wide for better visibility
            displayHeight: numSamples
        };
    } else if (sliceType === 'crossline') {
        // Extract crossline slice
        const crosslineIndex = sliceNumber - crosslineStart;
        if (crosslineIndex < 0 || crosslineIndex >= numCrosslines) {
            console.warn(`Crossline ${sliceNumber} out of range`);
            return null;
        }
        
        // Create 2D data [time][inline]
        const data = [];
        for (let t = 0; t < numSamples; t++) {
            const row = [];
            for (let il = 0; il < numInlines; il++) {
                row.push(volume[il][crosslineIndex][t]);
            }
            data.push(row);
        }
        
        return {
            width: numInlines,
            height: numSamples,
            data,
            sliceType: 'crossline',
            sliceNumber,
            filename: `Crossline_${sliceNumber}`,
            direction: volumeData.surveyGeometry?.crosslineDirection || 'SE-NW',
            azimuth: volumeData.surveyGeometry?.crosslineAzimuth || 135,
            metadata: volumeData.metadata,
            // Add display scaling factor to make narrow slices appear wider
            displayWidth: Math.max(numInlines, 1600), // Scale to at least 1600 pixels wide for better visibility
            displayHeight: numSamples
        };
    }
    
    return null;
};

export const generateSyntheticSeismic = (width = 800, height = 600) => {
    const data = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            let amplitude = 0;
            
            // Create realistic seismic reflectors with varying amplitude
            // Horizon 1 - Strong reflector at shallow depth
            const horizon1 = 100 + Math.sin(x / 80) * 25;
            if (Math.abs(y - horizon1) < 3) {
                amplitude += 80 * Math.exp(-Math.pow((y - horizon1) / 2, 2));
            }
            
            // Horizon 2 - Medium reflector with structure
            const horizon2 = 250 + Math.cos(x / 100) * 40 + Math.sin(x / 50) * 15;
            if (Math.abs(y - horizon2) < 3) {
                amplitude += 60 * Math.exp(-Math.pow((y - horizon2) / 2, 2));
            }
            
            // Horizon 3 - Deep reflector
            const horizon3 = 420 + Math.sin(x / 120) * 30;
            if (Math.abs(y - horizon3) < 3) {
                amplitude += 70 * Math.exp(-Math.pow((y - horizon3) / 2, 2));
            }
            
            // Add faults - vertical discontinuities
            const faultX1 = 250;
            const faultX2 = 550;
            if (x === faultX1 || x === faultX2) {
                amplitude += (Math.random() - 0.5) * 100;
            }
            
            // Background geological layering
            amplitude += Math.sin(y / 25) * 15;
            amplitude += Math.cos(y / 40 + x / 200) * 20;
            
            // Realistic noise
            amplitude += (Math.random() - 0.5) * 12;
            
            // Add some random events
            if (Math.random() > 0.98) {
                amplitude += (Math.random() - 0.5) * 40;
            }
            
            row.push(amplitude);
        }
        data.push(row);
    }

    return { 
        width, 
        height, 
        data,
        metadata: {
            inlineRange: [1000, 1000 + width],
            crosslineRange: [2000, 2000 + width],
            timeRange: [0, height * 4],
            sampleRate: 4 // ms
        }
    };
};

export const generateWellLogs = () => {
    const generateRealisticLog = (baseValue, variation, trend = 0) => {
        return Array.from({ length: 100 }, (_, i) => {
            const trendValue = trend * i;
            const cyclicVariation = Math.sin(i / 10) * variation * 0.3;
            const randomNoise = (Math.random() - 0.5) * variation * 0.4;
            return baseValue + trendValue + cyclicVariation + randomNoise;
        });
    };

    return [
        {
            name: 'Well-A',
            x: 200,
            inline: 1200,
            crossline: 2200,
            depth: Array.from({ length: 100 }, (_, i) => i * 10),
            gr: generateRealisticLog(75, 40, 0.2),
            resistivity: generateRealisticLog(30, 25, 0.1),
            porosity: generateRealisticLog(0.18, 0.08, -0.0005),
            density: generateRealisticLog(2.35, 0.15, 0.001)
        },
        {
            name: 'Well-B',
            x: 600,
            inline: 1600,
            crossline: 2600,
            depth: Array.from({ length: 100 }, (_, i) => i * 10),
            gr: generateRealisticLog(65, 45, 0.25),
            resistivity: generateRealisticLog(35, 30, 0.15),
            porosity: generateRealisticLog(0.20, 0.09, -0.0006),
            density: generateRealisticLog(2.40, 0.18, 0.0012)
        }
    ];
};