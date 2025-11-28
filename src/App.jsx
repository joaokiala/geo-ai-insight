import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import UserProfile from './components/UserProfile';
import SeismicViewer from './components/SeismicViewer';
import HorizonPicker from './components/HorizonPicker';
import FaultDetector from './components/FaultDetector';
import AttributeViewer from './components/AttributeViewer';
import MapGenerator from './components/MapGenerator';
import ThreeDViewer from './components/ThreeDViewer';
import WellLogViewer from './components/WellLogViewer';
import FileUploader from './components/FileUploader';
import Integration from './components/Integration';
import AdvancedTracking from './components/AdvancedTracking';
import Sidebar from './components/Sidebar';
import { Layers, Upload, Save, MousePointer, Ruler, Wand2, Activity, Zap, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { generateSyntheticSeismic, generate3DSeismicVolume, extractSlice } from './utils/seismicGenerator';
import { loadRealSeismicData } from './utils/realSeismicLoader';
import { autoPickHorizons, detectFaults } from './utils/aiInterpreter';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('seismic-section');
    const [activeTool, setActiveTool] = useState(null);
    const [seismicData, setSeismicData] = useState(null);
    const [seismic3DVolume, setSeismic3DVolume] = useState(null); // Store 3D volume
    const [horizons, setHorizons] = useState([]);
    const [faults, setFaults] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [coordinates, setCoordinates] = useState({ inline: 1234, crossline: 5678, time: 1500 });
    const [loadedFiles, setLoadedFiles] = useState([]); // Track loaded seismic files
    const [showClearMenu, setShowClearMenu] = useState(false); // Dropdown menu state
    const [showLoadProjectModal, setShowLoadProjectModal] = useState(false); // Load project modal

    const [activeHorizon, setActiveHorizon] = useState(null);
    const [pickingMode, setPickingMode] = useState(false);
    const [activeFault, setActiveFault] = useState(null);
    const [faultPickingMode, setFaultPickingMode] = useState(false);
    const [measurePoints, setMeasurePoints] = useState([]);
    const [measuring, setMeasuring] = useState(false);
    const [currentInline, setCurrentInline] = useState(1234);
    const [currentCrossline, setCurrentCrossline] = useState(5678);
    const [navigationMode, setNavigationMode] = useState('inline'); // 'inline' or 'crossline'
    const [lineStep, setLineStep] = useState(1); // Step increment for navigation

    useEffect(() => {
        // Generate 3D volume on startup
        const volume = generate3DSeismicVolume(50, 50, 600);
        setSeismic3DVolume(volume);
        
        // Extract and display initial inline slice
        const initialSlice = extractSlice(volume, 'inline', volume.inlineStart + 25);
        setSeismicData(initialSlice);
        setCurrentInline(volume.inlineStart + 25);
        setCurrentCrossline(volume.crosslineStart + 25);
        
        console.log('✅ 3D seismic volume generated and initial slice extracted');
    }, []);

    const handleFileLoad = (data) => {
        console.log('📥 Loading SEGY file:', data.filename);
        
        // CRITICAL FIX: When importing SEGY, it's just 2D data
        // We need to treat it as a single slice, not replace the 3D volume
        // Keep the existing 3D volume for navigation to work
        
        // Set the imported 2D data as current display
        setSeismicData(data);
        
        // Add loaded file to the list
        const fileInfo = {
            id: Date.now().toString(),
            name: data.filename || 'Unnamed Seismic',
            data: data,
            type: 'SEG-Y',
            size: data.size || 'Unknown',
            loadedAt: new Date()
        };
        setLoadedFiles(prev => [...prev, fileInfo]);
        
        // Clear old horizons and faults when loading new SEG-Y file
        setHorizons([]);
        setFaults([]);
        setMeasurePoints([]);
        
        setShowUploadModal(false);
        
        // WARNING: Imported SEGY is 2D - navigation will switch back to 3D volume
        console.log('⚠️ Loaded 2D SEGY file. Navigation still uses 3D volume.');
        console.log('🧭 If you want to navigate this file, it should be a 3D SEG-Y volume.');
    };

    const handleLoadRealDataset = (dataset) => {
        console.log('📂 Loading dataset:', dataset.name);
        
        // If it's a file from loadedFiles, load its data
        if (dataset.data) {
            setSeismicData(dataset.data);
            setActiveTab('seismic-section');
            console.log('✅ Loaded file from list:', dataset.name);
            return;
        }
        
        // Otherwise try to load from real dataset
        try {
            const realData = loadRealSeismicData(dataset.id);
            setSeismicData(realData);
            
            // CRITICAL FIX: Clear old horizons and faults when loading new data
            setHorizons([]);
            setFaults([]);
            setMeasurePoints([]);
            
            setActiveTab('seismic-section');
            console.log('✅ Successfully loaded real seismic data:', dataset.name);
            console.log('🧹 Cleared old interpretations (horizons, faults)');
        } catch (error) {
            console.error('❌ Error loading dataset:', error);
            alert(`Failed to load ${dataset.name}: ${error.message}`);
        }
    };

    const handlePick = (point) => {
        // Horizon picking
        if (activeTool === 'horizon' && pickingMode && activeHorizon) {
            const updated = horizons.map(h =>
                h.id === activeHorizon
                    ? { ...h, points: [...h.points, point].sort((a, b) => a.x - b.x) }
                    : h
            );
            setHorizons(updated);
        }
        
        // Fault picking
        if (activeTool === 'fault' && faultPickingMode && activeFault) {
            const updated = faults.map(f =>
                f.id === activeFault
                    ? { ...f, points: [...f.points, point].sort((a, b) => a.y - b.y) }
                    : f
            );
            setFaults(updated);
        }
        
        // Distance measurement
        if (activeTool === 'measure' && measuring) {
            if (measurePoints.length === 0) {
                // First point
                setMeasurePoints([point]);
            } else if (measurePoints.length === 1) {
                // Second point - complete measurement
                setMeasurePoints([...measurePoints, point]);
                setMeasuring(false);
                
                // Calculate distance
                const dx = point.x - measurePoints[0].x;
                const dy = point.y - measurePoints[0].y;
                const distancePixels = Math.sqrt(dx * dx + dy * dy);
                
                // Convert to real-world units (assuming 25m trace spacing and 4ms sample rate)
                const traceSpacing = 25; // meters
                const sampleRate = 4; // milliseconds
                const horizontalDist = Math.abs(dx) * traceSpacing;
                const verticalTime = Math.abs(dy) * sampleRate;
                const totalDistance = Math.sqrt(
                    Math.pow(horizontalDist, 2) + Math.pow(verticalTime, 2)
                );
                
                console.log(`📏 Distance Measurement:
  Horizontal: ${horizontalDist.toFixed(1)}m (${Math.abs(dx)} traces)
  Vertical: ${verticalTime.toFixed(1)}ms (${Math.abs(dy)} samples)
  Direct Distance: ${totalDistance.toFixed(1)}m
  Pixels: ${distancePixels.toFixed(1)}px`);
                
                // Show alert with results
                alert(`Distance Measurement:

` +
                    `Horizontal: ${horizontalDist.toFixed(1)} m (${Math.abs(dx)} traces)\n` +
                    `Vertical: ${verticalTime.toFixed(1)} ms (${Math.abs(dy)} samples)\n` +
                    `Direct Distance: ${totalDistance.toFixed(1)} m\n\n` +
                    `Click "Measure Distance" again to measure another distance.`);
            }
        }
    };

    const handleAutoPickHorizons = () => {
        if (!seismicData) return;

        const aiHorizons = autoPickHorizons(seismicData, 3);
        const newHorizons = aiHorizons.map((h, idx) => ({
            id: Date.now() + idx,
            name: h.name,
            points: h.points,
            color: h.color,
            confidence: h.confidence,
            method: h.method
        }));
        setHorizons([...horizons, ...newHorizons]);
        
        // Show success notification
        console.log(`✅ Auto-picked ${newHorizons.length} horizons with avg confidence: ${(newHorizons.reduce((sum, h) => sum + h.confidence, 0) / newHorizons.length * 100).toFixed(1)}%`);
    };

    const handleDetectFaultsAI = () => {
        if (!seismicData) return;

        const aiFaults = detectFaults(seismicData);
        const newFaults = aiFaults.map((f, idx) => ({
            id: Date.now() + idx,
            name: f.name,
            points: f.points,
            confidence: f.confidence,
            displacement: f.displacement,
            method: f.method
        }));
        setFaults([...faults, ...newFaults]);
        
        // Show success notification
        console.log(`✅ Detected ${newFaults.length} faults with avg confidence: ${(newFaults.reduce((sum, f) => sum + f.confidence, 0) / newFaults.length * 100).toFixed(1)}%`);
    };

    const handleExtractAmplitude = () => {
        if (!seismicData) return;

        // Extract amplitude statistics
        let min = Infinity, max = -Infinity, sum = 0, count = 0;
        for (let y = 0; y < seismicData.height; y++) {
            for (let x = 0; x < seismicData.width; x++) {
                const amp = seismicData.data[y][x];
                if (amp < min) min = amp;
                if (amp > max) max = amp;
                sum += amp;
                count++;
            }
        }
        const mean = sum / count;

        alert(`Amplitude Statistics:\nMin: ${min.toFixed(2)}\nMax: ${max.toFixed(2)}\nMean: ${mean.toFixed(2)}`);
    };

    // Navigation controls for inline/crossline - NOW WITH REAL SLICE SWITCHING
    const handleNavigatePrevious = () => {
        console.log('🔍 handleNavigatePrevious called');
        console.log('  - seismic3DVolume:', seismic3DVolume ? 'EXISTS' : 'NULL');
        console.log('  - navigationMode:', navigationMode);
        console.log('  - currentInline:', currentInline);
        console.log('  - lineStep:', lineStep);
        
        if (!seismic3DVolume) {
            console.error('❌ No 3D volume available for navigation');
            alert('⚠️ No 3D volume loaded. Navigation requires 3D seismic data.');
            return;
        }
        
        if (navigationMode === 'inline') {
            const newValue = Math.max(seismic3DVolume.inlineStart, currentInline - lineStep);
            console.log(`  - Calculating: ${currentInline} - ${lineStep} = ${newValue}`);
            console.log(`  - Range: ${seismic3DVolume.inlineStart} to ${seismic3DVolume.inlineEnd}`);
            setCurrentInline(newValue);
            
            // Extract and display new slice
            console.log(`  - Extracting inline ${newValue}...`);
            const newSlice = extractSlice(seismic3DVolume, 'inline', newValue);
            if (newSlice) {
                console.log('  ✅ Slice extracted successfully');
                setSeismicData(newSlice);
                console.log(`← Navigated to Inline ${newValue}`);
            } else {
                console.error('❌ Failed to extract inline slice', newValue);
                alert(`Failed to extract inline ${newValue}`);
            }
        } else {
            const newValue = Math.max(seismic3DVolume.crosslineStart, currentCrossline - lineStep);
            console.log(`  - Calculating: ${currentCrossline} - ${lineStep} = ${newValue}`);
            setCurrentCrossline(newValue);
            
            // Extract and display new slice
            console.log(`  - Extracting crossline ${newValue}...`);
            const newSlice = extractSlice(seismic3DVolume, 'crossline', newValue);
            if (newSlice) {
                console.log('  ✅ Slice extracted successfully');
                setSeismicData(newSlice);
                console.log(`← Navigated to Crossline ${newValue}`);
            } else {
                console.error('❌ Failed to extract crossline slice', newValue);
                alert(`Failed to extract crossline ${newValue}`);
            }
        }
    };

    const handleNavigateNext = () => {
        console.log('🔍 handleNavigateNext called');
        console.log('  - seismic3DVolume:', seismic3DVolume ? 'EXISTS' : 'NULL');
        console.log('  - navigationMode:', navigationMode);
        console.log('  - currentInline:', currentInline);
        console.log('  - lineStep:', lineStep);
        
        if (!seismic3DVolume) {
            console.error('❌ No 3D volume available for navigation');
            alert('⚠️ No 3D volume loaded. Navigation requires 3D seismic data.');
            return;
        }
        
        if (navigationMode === 'inline') {
            const newValue = Math.min(seismic3DVolume.inlineEnd, currentInline + lineStep);
            console.log(`  - Calculating: ${currentInline} + ${lineStep} = ${newValue}`);
            console.log(`  - Range: ${seismic3DVolume.inlineStart} to ${seismic3DVolume.inlineEnd}`);
            setCurrentInline(newValue);
            
            // Extract and display new slice
            console.log(`  - Extracting inline ${newValue}...`);
            const newSlice = extractSlice(seismic3DVolume, 'inline', newValue);
            if (newSlice) {
                console.log('  ✅ Slice extracted successfully');
                setSeismicData(newSlice);
                console.log(`→ Navigated to Inline ${newValue}`);
            } else {
                console.error('❌ Failed to extract inline slice', newValue);
                alert(`Failed to extract inline ${newValue}`);
            }
        } else {
            const newValue = Math.min(seismic3DVolume.crosslineEnd, currentCrossline + lineStep);
            console.log(`  - Calculating: ${currentCrossline} + ${lineStep} = ${newValue}`);
            setCurrentCrossline(newValue);
            
            // Extract and display new slice
            console.log(`  - Extracting crossline ${newValue}...`);
            const newSlice = extractSlice(seismic3DVolume, 'crossline', newValue);
            if (newSlice) {
                console.log('  ✅ Slice extracted successfully');
                setSeismicData(newSlice);
                console.log(`→ Navigated to Crossline ${newValue}`);
            } else {
                console.error('❌ Failed to extract crossline slice', newValue);
                alert(`Failed to extract crossline ${newValue}`);
            }
        }
    };

    const handleSaveProject = () => {
        const projectData = {
            version: '1.0',
            savedAt: new Date().toISOString(),
            // Save the 3D volume (not just current 2D slice)
            seismic3DVolume: seismic3DVolume ? {
                volume: seismic3DVolume.volume,
                numInlines: seismic3DVolume.numInlines,
                numCrosslines: seismic3DVolume.numCrosslines,
                numSamples: seismic3DVolume.numSamples,
                inlineStart: seismic3DVolume.inlineStart,
                crosslineStart: seismic3DVolume.crosslineStart,
                inlineEnd: seismic3DVolume.inlineEnd,
                crosslineEnd: seismic3DVolume.crosslineEnd,
                sampleRate: seismic3DVolume.sampleRate,
                is3D: seismic3DVolume.is3D,
                surveyGeometry: seismic3DVolume.surveyGeometry,
                metadata: seismic3DVolume.metadata
            } : null,
            // Also save current view state
            currentView: {
                inline: currentInline,
                crossline: currentCrossline,
                navigationMode: navigationMode
            },
            horizons: horizons.map(h => ({
                id: h.id,
                name: h.name,
                color: h.color,
                points: h.points,
                confidence: h.confidence,
                method: h.method
            })),
            faults: faults.map(f => ({
                id: f.id,
                name: f.name,
                points: f.points,
                confidence: f.confidence,
                method: f.method
            })),
            loadedFiles: loadedFiles.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                size: f.size,
                loadedAt: f.loadedAt
            }))
        };

        // Save to localStorage
        try {
            localStorage.setItem('geo-ai-insights-project', JSON.stringify(projectData));
            
            // Also create downloadable JSON file
            const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const fileSize = (blob.size / 1024).toFixed(2);
            alert(`✅ Project saved successfully!

- ${horizons.length} horizons
- ${faults.length} faults
- ${loadedFiles.length} files
- 3D Volume: ${seismic3DVolume ? `${seismic3DVolume.numInlines}x${seismic3DVolume.numCrosslines}x${seismic3DVolume.numSamples}` : 'None'}
- File size: ${fileSize} KB

Downloaded as JSON file`);
            console.log('💾 Project saved with 3D volume:', projectData);
        } catch (error) {
            console.error('❌ Error saving project:', error);
            alert('Failed to save project: ' + error.message);
        }
    };

    // Clear current active item only (smart clear)
    const handleClearCurrent = () => {
        let cleared = false;
        
        // Clear active horizon
        if (activeHorizon) {
            setHorizons(prev => prev.filter(h => h.id !== activeHorizon));
            setActiveHorizon(null);
            setPickingMode(false);
            cleared = true;
            console.log('🧹 Cleared active horizon');
        }
        // Clear active fault
        else if (activeFault) {
            setFaults(prev => prev.filter(f => f.id !== activeFault));
            setActiveFault(null);
            setFaultPickingMode(false);
            cleared = true;
            console.log('🧹 Cleared active fault');
        }
        // Clear measurements if active
        else if (measuring || measurePoints.length > 0) {
            setMeasurePoints([]);
            setMeasuring(false);
            cleared = true;
            console.log('🧹 Cleared measurements');
        }
        
        if (!cleared) {
            alert('No active item to clear. Select a horizon, fault, or measurement first.');
        } else {
            alert('✅ Cleared current item');
        }
        
        setShowClearMenu(false);
    };

    // Clear everything (destructive)
    const handleClearAll = () => {
        const confirm = window.confirm('⚠️ Clear ALL horizons, faults, and measurements?\n\nThis cannot be undone!');
        if (!confirm) {
            setShowClearMenu(false);
            return;
        }
        
        setHorizons([]);
        setFaults([]);
        setMeasurePoints([]);
        setActiveHorizon(null);
        setActiveFault(null);
        setPickingMode(false);
        setFaultPickingMode(false);
        setMeasuring(false);
        setActiveTool(null);
        
        console.log('🧹 CLEARED ALL interpretations');
        alert('✅ All interpretations cleared');
        setShowClearMenu(false);
    };

    // Load project from JSON file
    const handleLoadProject = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);
                
                // Validate project data
                if (!projectData.version) {
                    throw new Error('Invalid project file format');
                }

                // Restore 3D volume if available
                if (projectData.seismic3DVolume) {
                    console.log('✅ Restoring 3D seismic volume...');
                    setSeismic3DVolume(projectData.seismic3DVolume);
                    
                    // Restore view state
                    const viewInline = projectData.currentView?.inline || projectData.seismic3DVolume.inlineStart;
                    const viewCrossline = projectData.currentView?.crossline || projectData.seismic3DVolume.crosslineStart;
                    const viewMode = projectData.currentView?.navigationMode || 'inline';
                    
                    setCurrentInline(viewInline);
                    setCurrentCrossline(viewCrossline);
                    setNavigationMode(viewMode);
                    
                    // Extract and display the saved view slice
                    const slice = extractSlice(
                        projectData.seismic3DVolume,
                        viewMode,
                        viewMode === 'inline' ? viewInline : viewCrossline
                    );
                    
                    if (slice) {
                        setSeismicData(slice);
                        console.log(`✅ Restored ${viewMode} ${viewMode === 'inline' ? viewInline : viewCrossline}`);
                    }
                }

                // Load horizons
                if (projectData.horizons) {
                    setHorizons(projectData.horizons);
                }

                // Load faults
                if (projectData.faults) {
                    setFaults(projectData.faults);
                }

                // Load file list
                if (projectData.loadedFiles) {
                    setLoadedFiles(projectData.loadedFiles);
                }

                setShowLoadProjectModal(false);
                
                const volumeInfo = projectData.seismic3DVolume 
                    ? `\n- 3D Volume: ${projectData.seismic3DVolume.numInlines}x${projectData.seismic3DVolume.numCrosslines}x${projectData.seismic3DVolume.numSamples}\n- View: ${viewMode} ${viewMode === 'inline' ? viewInline : viewCrossline}`
                    : '\n\u26a0\ufe0f No seismic data in project';
                
                alert(`✅ Project loaded successfully!

- ${projectData.horizons?.length || 0} horizons
- ${projectData.faults?.length || 0} faults${volumeInfo}

Saved: ${new Date(projectData.savedAt).toLocaleString()}`);
                console.log('📂 Project loaded with 3D volume:', projectData);
            } catch (error) {
                console.error('❌ Error loading project:', error);
                alert('Failed to load project: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    };

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Layers className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-xl font-bold text-white">Geo AI Insights</h1>
                        <p className="text-xs text-gray-400">Advanced Seismic Interpretation</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center gap-2 transition"
                    >
                        <Upload className="w-4 h-4" />
                        Import SEG-Y
                    </button>
                    
                    {/* Clear Menu Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowClearMenu(!showClearMenu)}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-2 transition font-bold"
                            title="Clear options"
                        >
                            🧹 Clear
                            <span className="text-xs">▼</span>
                        </button>
                        
                        {showClearMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-xl z-50 min-w-[200px]">
                                <button
                                    onClick={handleClearCurrent}
                                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-slate-700 transition flex items-center gap-2 border-b border-slate-700"
                                >
                                    <span className="text-orange-400">🗑️</span>
                                    <div>
                                        <div className="font-medium">Clear Current</div>
                                        <div className="text-xs text-gray-400">Remove active item only</div>
                                    </div>
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-red-700 transition flex items-center gap-2"
                                >
                                    <span className="text-red-400">⚠️</span>
                                    <div>
                                        <div className="font-medium">Clear All</div>
                                        <div className="text-xs text-gray-400">Remove everything</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setShowLoadProjectModal(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 transition"
                        title="Load saved project"
                    >
                        <Upload className="w-4 h-4" />
                        Load Project
                    </button>
                    
                    <button 
                        onClick={handleSaveProject}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition"
                        title="Save project (horizons, faults, interpretations)"
                    >
                        <Save className="w-4 h-4" />
                        Save Project
                    </button>
                    
                    {/* Logout Button - More visible option */}
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to logout?')) {
                                try {
                                    await logout();
                                    navigate('/login');
                                } catch (error) {
                                    console.error('Logout error:', error);
                                    // Still navigate to login page even if logout fails on the server
                                    navigate('/login');
                                }
                            }
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1 transition text-sm"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                    
                    <UserProfile />
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-slate-800 border-b border-slate-700 px-6">
                <div className="flex gap-1">
                    {['Seismic Section', 'Maps', 'Attributes', 'Integration', 'Advanced Tracking & Mapping', '3D Viewer', 'Well Logs'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and'))}
                            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${activeTab === tab.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')
                                ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                                : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* UNIFIED LEFT PANEL - Project Explorer */}
                <aside className="w-64 bg-slate-900 border-r border-slate-700 overflow-y-auto flex flex-col">
                    {/* Data Tree Section */}
                    <div className="p-3 border-b border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Layers className="w-4 h-4 text-blue-400" />
                            <h3 className="text-xs font-semibold text-white uppercase">Project Explorer</h3>
                        </div>
                        <Sidebar 
                            onLoadData={handleLoadRealDataset}
                            loadedFiles={loadedFiles}
                        />
                    </div>

                    {/* Interpretation Tools Section */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Interpretation</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTool(activeTool === 'horizon' ? null : 'horizon')}
                                className={`w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs ${
                                    activeTool === 'horizon' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                            >
                                <MousePointer className="w-3.5 h-3.5" />
                                <span>Horizon Picking</span>
                            </button>
                            <button
                                onClick={() => setActiveTool(activeTool === 'fault' ? null : 'fault')}
                                className={`w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs ${
                                    activeTool === 'fault' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Fault Interpretation</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTool(activeTool === 'measure' ? null : 'measure');
                                    if (activeTool !== 'measure') {
                                        setMeasurePoints([]);
                                        setMeasuring(true);
                                    } else {
                                        setMeasuring(false);
                                        setMeasurePoints([]);
                                    }
                                }}
                                className={`w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs ${
                                    activeTool === 'measure' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                            >
                                <Ruler className="w-3.5 h-3.5" />
                                <span>Measure Distance</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Assistant Section */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-xs font-semibold text-purple-400 mb-3 uppercase flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5" />
                            AI Assistant
                        </h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => handleAutoPickHorizons()}
                                disabled={!seismicData}
                                className="w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:bg-slate-800 disabled:opacity-40 disabled:text-gray-500"
                            >
                                <span>Auto-Pick Horizons</span>
                            </button>
                            <button
                                onClick={() => handleDetectFaultsAI()}
                                disabled={!seismicData}
                                className="w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:bg-slate-800 disabled:opacity-40 disabled:text-gray-500"
                            >
                                <span>Detect Faults</span>
                            </button>
                            <button
                                onClick={() => handleExtractAmplitude()}
                                disabled={!seismicData}
                                className="w-full px-3 py-2 rounded text-left flex items-center gap-2 transition text-xs bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:bg-slate-800 disabled:opacity-40 disabled:text-gray-500"
                            >
                                <span>Extract Amplitude</span>
                            </button>
                        </div>
                    </div>

                    {/* Measurement Tool Info */}
                    {activeTool === 'measure' && (
                        <div className="p-3 border-b border-slate-700">
                            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Measurement</h3>
                            <div className="space-y-2">
                                {measuring && measurePoints.length === 0 && (
                                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-200">
                                        ✓ Click start point
                                    </div>
                                )}
                                {measuring && measurePoints.length === 1 && (
                                    <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-200">
                                        ✓ Click end point
                                    </div>
                                )}
                                {!measuring && measurePoints.length === 2 && (
                                    <div className="space-y-1">
                                        <div className="p-2 bg-slate-800 rounded text-[10px]">
                                            <div className="text-gray-400">H: {(Math.abs(measurePoints[1].x - measurePoints[0].x) * 25).toFixed(0)}m</div>
                                            <div className="text-gray-400">V: {(Math.abs(measurePoints[1].y - measurePoints[0].y) * 4).toFixed(0)}ms</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMeasurePoints([]);
                                                setMeasuring(true);
                                            }}
                                            className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded transition"
                                        >
                                            New
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Horizons Section */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Horizons ({horizons.length})</h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {horizons.length === 0 ? (
                                <p className="text-[10px] text-gray-500 italic">None</p>
                            ) : (
                                horizons.map((horizon) => (
                                    <div key={horizon.id} className="px-2 py-1.5 bg-slate-800 rounded text-xs text-gray-300 flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: horizon.color }}></div>
                                            <span className="flex-1 truncate text-[10px]">{horizon.name}</span>
                                            {horizon.confidence && (
                                                <span className="text-[9px] text-blue-400" title="AI Confidence">
                                                    {(horizon.confidence * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Faults Section */}
                    <div className="p-3 border-b border-slate-700">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Faults ({faults.length})</h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {faults.length === 0 ? (
                                <p className="text-[10px] text-gray-500 italic">None</p>
                            ) : (
                                faults.map((fault, idx) => (
                                    <div key={idx} className="px-2 py-1.5 bg-slate-800 rounded text-xs text-gray-300 flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0"></div>
                                            <span className="flex-1 truncate text-[10px]">{fault.name || `Fault ${idx + 1}`}</span>
                                            {fault.confidence && (
                                                <span className="text-[9px] text-purple-400" title="AI Confidence">
                                                    {(fault.confidence * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active Tool Controls */}
                    {activeTool === 'horizon' && (
                        <HorizonPicker
                            seismicData={seismicData}
                            horizons={horizons}
                            onHorizonsChange={setHorizons}
                            activeHorizon={activeHorizon}
                            setActiveHorizon={setActiveHorizon}
                            pickingMode={pickingMode}
                            setPickingMode={setPickingMode}
                        />
                    )}

                    {activeTool === 'fault' && (
                        <FaultDetector
                            seismicData={seismicData}
                            faults={faults}
                            onFaultsChange={setFaults}
                            activeFault={activeFault}
                            setActiveFault={setActiveFault}
                            pickingMode={faultPickingMode}
                            setPickingMode={setFaultPickingMode}
                        />
                    )}

                    {/* Wells Section */}
                    <div className="p-3 mt-auto border-t border-slate-700">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">Wells (2)</h3>
                        <div className="space-y-1">
                            <div className="px-2 py-1.5 bg-slate-800 rounded text-[10px] text-gray-300 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                Well-A
                            </div>
                            <div className="px-2 py-1.5 bg-slate-800 rounded text-[10px] text-gray-300 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                Well-B
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Viewer */}
                <main className="flex-1 flex flex-col">
                    {/* SIMPLIFIED Navigation Controls (only show in seismic-section tab) */}
                    {activeTab === 'seismic-section' && seismicData && (
                        <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Mode Toggle */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setNavigationMode('inline')}
                                            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition ${
                                                navigationMode === 'inline' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                            }`}
                                        >
                                            IL
                                        </button>
                                        <button
                                            onClick={() => setNavigationMode('crossline')}
                                            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition ${
                                                navigationMode === 'crossline' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                            }`}
                                        >
                                            XL
                                        </button>
                                    </div>

                                    {/* Step Selector */}
                                    <select
                                        value={lineStep}
                                        onChange={(e) => setLineStep(parseInt(e.target.value))}
                                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-[10px] text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="1">±1</option>
                                        <option value="5">±5</option>
                                        <option value="10">±10</option>
                                        <option value="50">±50</option>
                                    </select>

                                    {/* Display navigation range info */}
                                    {seismic3DVolume && (
                                        <span className="text-[9px] text-gray-500 px-2">
                                            {navigationMode === 'inline' 
                                                ? `IL: ${seismic3DVolume.inlineStart}-${seismic3DVolume.inlineEnd}`
                                                : `XL: ${seismic3DVolume.crosslineStart}-${seismic3DVolume.crosslineEnd}`
                                            }
                                        </span>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleNavigatePrevious}
                                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>

                                        <input
                                            type="number"
                                            value={navigationMode === 'inline' ? currentInline : currentCrossline}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value) || 1;
                                                if (navigationMode === 'inline') {
                                                    const clampedValue = Math.max(seismic3DVolume?.inlineStart || 1, Math.min(seismic3DVolume?.inlineEnd || 9999, value));
                                                    setCurrentInline(clampedValue);
                                                    // Extract and display new slice
                                                    if (seismic3DVolume) {
                                                        const newSlice = extractSlice(seismic3DVolume, 'inline', clampedValue);
                                                        if (newSlice) setSeismicData(newSlice);
                                                    }
                                                } else {
                                                    const clampedValue = Math.max(seismic3DVolume?.crosslineStart || 1, Math.min(seismic3DVolume?.crosslineEnd || 9999, value));
                                                    setCurrentCrossline(clampedValue);
                                                    // Extract and display new slice
                                                    if (seismic3DVolume) {
                                                        const newSlice = extractSlice(seismic3DVolume, 'crossline', clampedValue);
                                                        if (newSlice) setSeismicData(newSlice);
                                                    }
                                                }
                                            }}
                                            className="w-16 px-2 py-1 bg-slate-900 border border-blue-500/50 rounded text-xs text-white font-mono text-center focus:outline-none focus:border-blue-500"
                                        />

                                        <button
                                            onClick={handleNavigateNext}
                                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Survey Info */}
                                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                                    <span>Survey: {seismicData.metadata?.location || 'Offshore Block L5'}</span>
                                    <span>Processing: {seismicData.metadata?.processing || 'PSTM'}</span>
                                    <span className="text-blue-400">H: {horizons.length}</span>
                                    <span className="text-pink-400">F: {faults.length}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'seismic-section' && seismicData && (
                            <SeismicViewer
                                data={seismicData}
                                horizons={horizons}
                                faults={faults}
                                measurePoints={measurePoints}
                                onPick={handlePick}
                            />
                        )}
                        {activeTab === 'maps' && (
                            <MapGenerator horizons={horizons} />
                        )}
                        {activeTab === 'attributes' && seismicData && (
                            <AttributeViewer seismicData={seismicData} />
                        )}
                        {activeTab === 'integration' && (
                            <Integration seismicData={seismicData} />
                        )}
                        {activeTab === 'advanced-tracking-and-mapping' && (
                            <AdvancedTracking seismicData={seismicData} horizons={horizons} faults={faults} />
                        )}
                        {activeTab === '3d-viewer' && (
                            <ThreeDViewer seismicData={seismic3DVolume || seismicData} />
                        )}
                        {activeTab === 'well-logs' && (
                            <WellLogViewer />
                        )}
                    </div>

                    {/* SIMPLIFIED Status Bar - Only Essential Info */}
                    <div className="bg-slate-800 border-t border-slate-700 px-4 py-1.5 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-4 text-gray-400">
                            <span>IL:<span className="text-blue-400 font-mono ml-1">{currentInline}</span></span>
                            <span>XL:<span className="text-green-400 font-mono ml-1">{currentCrossline}</span></span>
                            <span>TWT:<span className="text-white font-mono ml-1">{coordinates.time}ms</span></span>
                            {seismicData && seismicData.filename && (
                                <span className="text-gray-500">| {seismicData.filename}</span>
                            )}
                        </div>
                        <div className="text-gray-500">
                            Ready
                        </div>
                    </div>
                </main>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold text-white mb-4">Import SEG-Y Data</h2>
                        <FileUploader onFileLoad={handleFileLoad} />
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Load Project Modal */}
            {showLoadProjectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
                        <h2 className="text-xl font-bold text-white mb-4">📂 Load Project</h2>
                        <p className="text-gray-400 mb-4">
                            Select a previously saved project JSON file to restore your horizons, faults, and interpretations.
                        </p>
                        
                        {/* Important Warning */}
                        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-yellow-400 text-xl">⚠️</span>
                                <div>
                                    <p className="text-yellow-200 font-semibold text-sm mb-1">Important:</p>
                                    <p className="text-yellow-100 text-xs leading-relaxed">
                                        Project files save only <strong>interpretations</strong> (horizons/faults), not seismic data.
                                        <br/><br/>
                                        <strong>Before loading:</strong> Import the <strong>same SEGY file</strong> you used when creating this project, otherwise horizons will appear on wrong data!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <p className="text-white mb-2">Choose Project File</p>
                            <p className="text-xs text-gray-500 mb-4">JSON files only</p>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleLoadProject}
                                className="hidden"
                                id="load-project-input"
                            />
                            <label
                                htmlFor="load-project-input"
                                className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition cursor-pointer"
                            >
                                Select File
                            </label>
                        </div>

                        <button
                            onClick={() => setShowLoadProjectModal(false)}
                            className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
