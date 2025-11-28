import axios from 'axios';

// Get AI service URL from environment variables
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Call AI service for horizon picking
 * @param {Object} seismicData - The seismic data to analyze
 * @returns {Promise<Object>} The AI-generated horizons
 */
export const callAIHorizonPicking = async (seismicData) => {
    try {
        console.log('🤖 Calling AI service for horizon picking');
        
        // Prepare data for Python service
        const requestData = {
            seismicData: seismicData.data || seismicData
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/ai/horizon-pick`, requestData, {
            timeout: 30000 // 30 second timeout
        });
        
        console.log('✅ AI horizon picking completed');
        return response.data;
    } catch (error) {
        console.error('❌ AI horizon picking failed:', error.message);
        throw new Error(`AI service error: ${error.response?.data?.error || error.message}`);
    }
};

/**
 * Call AI service for fault detection
 * @param {Object} seismicData - The seismic data to analyze
 * @returns {Promise<Object>} The AI-detected faults
 */
export const callAIFaultDetection = async (seismicData) => {
    try {
        console.log('🤖 Calling AI service for fault detection');
        
        // Prepare data for Python service
        const requestData = {
            seismicData: seismicData.data || seismicData
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/ai/fault-detection`, requestData, {
            timeout: 30000 // 30 second timeout
        });
        
        console.log('✅ AI fault detection completed');
        return response.data;
    } catch (error) {
        console.error('❌ AI fault detection failed:', error.message);
        throw new Error(`AI service error: ${error.response?.data?.error || error.message}`);
    }
};

/**
 * Call AI service for attribute analysis
 * @param {Object} seismicData - The seismic data to analyze
 * @returns {Promise<Object>} The calculated attributes
 */
export const callAIAttributeAnalysis = async (seismicData) => {
    try {
        console.log('🤖 Calling AI service for attribute analysis');
        
        // Prepare data for Python service
        const requestData = {
            seismicData: seismicData.data || seismicData
        };
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/ai/attribute-analysis`, requestData, {
            timeout: 30000 // 30 second timeout
        });
        
        console.log('✅ AI attribute analysis completed');
        return response.data;
    } catch (error) {
        console.error('❌ AI attribute analysis failed:', error.message);
        throw new Error(`AI service error: ${error.response?.data?.error || error.message}`);
    }
};

/**
 * Check if AI service is healthy
 * @returns {Promise<Boolean>} Service health status
 */
export const checkAIServiceHealth = async () => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/health`, {
            timeout: 5000 // 5 second timeout
        });
        return response.data.status === 'healthy';
    } catch (error) {
        console.error('❌ AI service health check failed:', error.message);
        return false;
    }
};