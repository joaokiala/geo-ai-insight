import express from 'express';
import { callAIHorizonPicking, callAIFaultDetection, callAIAttributeAnalysis, checkAIServiceHealth } from '../utils/aiService.js';

const router = express.Router();

// @route   POST /api/ai/horizon-pick
// @desc    Use AI to pick horizons in seismic data
// @access  Private
router.post('/horizon-pick', async (req, res) => {
    try {
        const { seismicData } = req.body;
        
        if (!seismicData) {
            return res.status(400).json({
                success: false,
                message: 'Seismic data is required'
            });
        }
        
        const result = await callAIHorizonPicking(seismicData);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('AI Horizon Picking Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to perform AI horizon picking'
        });
    }
});

// @route   POST /api/ai/fault-detection
// @desc    Use AI to detect faults in seismic data
// @access  Private
router.post('/fault-detection', async (req, res) => {
    try {
        const { seismicData } = req.body;
        
        if (!seismicData) {
            return res.status(400).json({
                success: false,
                message: 'Seismic data is required'
            });
        }
        
        const result = await callAIFaultDetection(seismicData);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('AI Fault Detection Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to perform AI fault detection'
        });
    }
});

// @route   POST /api/ai/attribute-analysis
// @desc    Use AI to analyze seismic attributes
// @access  Private
router.post('/attribute-analysis', async (req, res) => {
    try {
        const { seismicData } = req.body;
        
        if (!seismicData) {
            return res.status(400).json({
                success: false,
                message: 'Seismic data is required'
            });
        }
        
        const result = await callAIAttributeAnalysis(seismicData);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('AI Attribute Analysis Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to perform AI attribute analysis'
        });
    }
});

// @route   GET /api/ai/health
// @desc    Check AI service health
// @access  Public
router.get('/health', async (req, res) => {
    try {
        const isHealthy = await checkAIServiceHealth();
        
        res.status(200).json({
            success: true,
            healthy: isHealthy,
            message: isHealthy ? 'AI service is healthy' : 'AI service is unavailable'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            healthy: false,
            message: 'Failed to check AI service health'
        });
    }
});

export default router;