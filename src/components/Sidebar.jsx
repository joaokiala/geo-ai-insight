import React from 'react';
import { Folder, FileText } from 'lucide-react';

const Sidebar = ({ onLoadData, loadedFiles = [] }) => {
    // Available real datasets (example data) - REMOVED: No fake datasets
    const realDatasets = [];

    const handleLoadDataset = (dataset) => {
        if (onLoadData) {
            onLoadData(dataset);
        }
    };

    return (
        <>
            {/* Loaded Files Section */}
            {loadedFiles.length > 0 && (
                <div className="mb-3">
                    <div className="text-[9px] text-gray-500 uppercase mb-1.5 px-1">Imported Files</div>
                    <div className="space-y-1">
                        {loadedFiles.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => handleLoadDataset(file)}
                                className="w-full text-left p-2 rounded hover:bg-blue-600/20 transition group bg-blue-600/10"
                                title={`Click to load: ${file.name}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-medium text-blue-300 truncate group-hover:text-blue-200">
                                            {file.name}
                                        </div>
                                        <div className="text-[9px] text-gray-500">
                                            {file.type} • {file.size}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sample/Real Datasets Section */}
            {realDatasets.length > 0 && (
                <div>
                    <div className="text-[9px] text-gray-500 uppercase mb-1.5 px-1">Sample Data</div>
                    <div className="space-y-1">
                        {realDatasets.map((dataset) => (
                            <button
                                key={dataset.id}
                                onClick={() => handleLoadDataset(dataset)}
                                className="w-full text-left p-2 rounded hover:bg-white/10 transition group"
                                title={dataset.description}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-green-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-medium text-white truncate group-hover:text-green-400">
                                            {dataset.name}
                                        </div>
                                        <div className="text-[9px] text-gray-500">
                                            {dataset.type} • {dataset.size}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
