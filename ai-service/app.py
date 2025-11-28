from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Geo AI Insights Python Service',
        'version': '1.0.0'
    })

@app.route('/api/ai/horizon-pick', methods=['POST'])
def ai_horizon_pick():
    """AI-powered horizon picking"""
    try:
        data = request.get_json()
        
        # Extract seismic data
        seismic_data = np.array(data.get('seismicData', []))
        
        if seismic_data.size == 0:
            return jsonify({'error': 'No seismic data provided'}), 400
        
        # Simulate AI horizon picking (in a real implementation, this would use a trained model)
        horizons = simulate_ai_horizon_picking(seismic_data)
        
        return jsonify({
            'success': True,
            'horizons': horizons
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/fault-detection', methods=['POST'])
def ai_fault_detection():
    """AI-powered fault detection"""
    try:
        data = request.get_json()
        
        # Extract seismic data
        seismic_data = np.array(data.get('seismicData', []))
        
        if seismic_data.size == 0:
            return jsonify({'error': 'No seismic data provided'}), 400
        
        # Simulate AI fault detection (in a real implementation, this would use a trained model)
        faults = simulate_ai_fault_detection(seismic_data)
        
        return jsonify({
            'success': True,
            'faults': faults
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/attribute-analysis', methods=['POST'])
def ai_attribute_analysis():
    """AI-powered seismic attribute analysis"""
    try:
        data = request.get_json()
        
        # Extract seismic data
        seismic_data = np.array(data.get('seismicData', []))
        
        if seismic_data.size == 0:
            return jsonify({'error': 'No seismic data provided'}), 400
        
        # Perform attribute analysis
        attributes = perform_attribute_analysis(seismic_data)
        
        return jsonify({
            'success': True,
            'attributes': attributes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_ai_horizon_picking(seismic_data):
    """Simulate AI horizon picking - in reality, this would use a trained neural network"""
    height, width = seismic_data.shape
    
    # Generate multiple horizons with different characteristics
    horizons = []
    
    # Main reflector (strongest amplitude)
    main_reflector = []
    for x in range(width):
        # Simple sine wave pattern to simulate a geological horizon
        y = int(height/2 + 20 * np.sin(x * 0.1))
        # Clamp to image bounds
        y = max(0, min(height-1, y))
        main_reflector.append({'x': x, 'y': y})
    
    horizons.append({
        'id': 'main-reflector',
        'name': 'Main Reflector',
        'points': main_reflector,
        'color': '#ff6b6b',
        'confidence': 0.95
    })
    
    # Secondary reflector
    secondary_reflector = []
    for x in range(width):
        y = int(height/2 + 20 * np.sin(x * 0.1) + 30)
        y = max(0, min(height-1, y))
        secondary_reflector.append({'x': x, 'y': y})
    
    horizons.append({
        'id': 'secondary-reflector',
        'name': 'Secondary Reflector',
        'points': secondary_reflector,
        'color': '#4ecdc4',
        'confidence': 0.87
    })
    
    return horizons

def simulate_ai_fault_detection(seismic_data):
    """Simulate AI fault detection"""
    height, width = seismic_data.shape
    
    # Generate some faults
    faults = []
    
    # Vertical fault
    vertical_fault = []
    fault_x = width // 3
    for y in range(height):
        vertical_fault.append({'x': fault_x, 'y': y})
    
    faults.append({
        'id': 'vertical-fault-1',
        'name': 'Vertical Fault 1',
        'points': vertical_fault,
        'confidence': 0.92
    })
    
    # Another vertical fault
    vertical_fault2 = []
    fault_x2 = 2 * width // 3
    for y in range(height):
        vertical_fault2.append({'x': fault_x2, 'y': y})
    
    faults.append({
        'id': 'vertical-fault-2',
        'name': 'Vertical Fault 2',
        'points': vertical_fault2,
        'confidence': 0.88
    })
    
    return faults

def perform_attribute_analysis(seismic_data):
    """Perform seismic attribute analysis"""
    # Calculate various attributes
    attributes = {}
    
    # Amplitude attributes
    attributes['mean_amplitude'] = float(np.mean(seismic_data))
    attributes['max_amplitude'] = float(np.max(seismic_data))
    attributes['min_amplitude'] = float(np.min(seismic_data))
    attributes['std_amplitude'] = float(np.std(seismic_data))
    
    # Gradient attributes (simple edge detection)
    grad_x, grad_y = np.gradient(seismic_data)
    attributes['mean_gradient'] = float(np.mean(np.sqrt(grad_x**2 + grad_y**2)))
    
    # Frequency attributes (using FFT)
    fft_data = np.fft.fft2(seismic_data)
    attributes['dominant_frequency'] = float(np.argmax(np.abs(fft_data)))
    
    return attributes

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)