import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const FileUploader = ({ onFileLoad }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Import and use SEG-Y parser
            const { SEGYParser } = await import('../utils/segyParser');
            const parser = new SEGYParser(arrayBuffer);
            const segyData = parser.parse();

            // Convert SEG-Y traces to 2D array format
            const traces = segyData.traces;
            if (traces.length === 0) {
                throw new Error('No traces found in SEG-Y file');
            }

            const height = traces[0].data.length; // samples per trace
            const width = Math.min(traces.length, 1000); // limit to 1000 traces for performance
            const data = [];

            // Transpose: traces become columns
            for (let y = 0; y < height; y++) {
                const row = [];
                for (let x = 0; x < width; x++) {
                    row.push(traces[x].data[y] || 0);
                }
                data.push(row);
            }

            onFileLoad({
                width,
                height,
                data,
                // Add display scaling to imported seismic data
                displayWidth: Math.max(width, 1600), // Scale to at least 1600 pixels wide for better visibility
                displayHeight: height,
                filename: file.name,
                segyHeader: segyData.binaryHeader,
                textHeader: segyData.textHeader
            });

            setLoading(false);
        } catch (err) {
            console.error('SEG-Y parsing error:', err);
            setError(`Failed to load SEG-Y file: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-12">
            <input
                ref={fileInputRef}
                type="file"
                accept=".segy,.sgy,.sg2"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="text-center">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Seismic Data</h3>
                <p className="text-gray-400 mb-6">
                    {loading ? 'Loading SEG-Y file...' : 'Drag and drop SEG-Y files or click to browse'}
                </p>

                {loading && (
                    <div className="mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition"
                >
                    {loading ? 'Loading...' : 'Select Files'}
                </button>

                <p className="text-xs text-gray-500 mt-4">Supported formats: SEG-Y (.segy, .sgy)</p>
            </div>
        </div>
    );
};

export default FileUploader;