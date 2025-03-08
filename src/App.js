import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [panelLength, setPanelLength] = useState(1.13);
    const [tiltAngle, setTiltAngle] = useState(24);
    const [solarAltitude, setSolarAltitude] = useState(42);
    const [interRowSpacing, setInterRowSpacing] = useState(0);
    
    // SVG diagram dimensions
    const svgWidth = 800;
    const svgHeight = 500;
    const groundY = 350;
    
    // Basic positioning variables
    const panelWidth = 200;
    const panelThickness = 10;
    const panel1X = 100;
    
    // Calculate the panel height based on tilt angle and panel length
    const calculatePanelHeight = () => {
      return panelLength * Math.sin(tiltAngle * Math.PI / 180);
    };
    
    // Calculate the shadow end position (point B)
    const calculateShadowEndX = () => {
      const topPanelX = panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180);
      const topPanelY = groundY - panelWidth * Math.sin(tiltAngle * Math.PI / 180);
      const altitudeRad = solarAltitude * Math.PI / 180;
      const height = topPanelY - groundY;
      const shadowLength = Math.abs(height / Math.tan(altitudeRad));
      return topPanelX + shadowLength;
    };
    
    // Calculate the position of the second panel based on the shadow
    const calculatePanel2X = () => {
      return calculateShadowEndX();
    };
    
    // Calculate shadow extension (CB)
    const calculateShadowExtension = () => {
      const pointC = panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180);
      const pointB = calculateShadowEndX();
      return (pointB - pointC) / panelWidth * panelLength;
    };
    
    // Calculate sun position based on angle theta from point E
    const calculateSunPosition = () => {
      // Point E (top of left panel)
      const pointEX = panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180);
      const pointEY = groundY - panelWidth * Math.sin(tiltAngle * Math.PI / 180);
      
      // Theta angle should equal alpha
      const thetaRad = solarAltitude * Math.PI / 180;
      
      // Calculate sun position - need to position it at the correct angle from E
      // For a horizontal line from E, the sun would be at angle (180 - theta) degrees upward
      const sunRayAngle = Math.PI - thetaRad;
      
      // Position sun along this angle at a fixed distance
      const sunDistance = 250;
      const sunX = pointEX + sunDistance * Math.cos(sunRayAngle);
      const sunY = pointEY - sunDistance * Math.sin(sunRayAngle);
      
      // Ensure sun is fully visible
      const sunX_bounded = Math.max(60, Math.min(sunX, svgWidth - 60));
      const sunY_bounded = Math.max(60, Math.min(sunY, groundY - 60));
      
      return { x: sunX_bounded, y: sunY_bounded };
    };
    
    // Calculate sun ray path to top of first panel
    const calculateSunRay = () => {
      const sun = calculateSunPosition();
      const width = panelWidth;
      const angle = tiltAngle * Math.PI / 180;
      
      // Top of first panel (point E)
      const x2 = panel1X + width * Math.cos(angle);
      const y2 = groundY - width * Math.sin(angle);
      
      return { x1: sun.x, y1: sun.y, x2: x2, y2: y2 };
    };
    
    // Calculate shadow line
    const calculateShadowLine = () => {
      const topPanelX = panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180);
      const topPanelY = groundY - panelWidth * Math.sin(tiltAngle * Math.PI / 180);
      const shadowX = calculateShadowEndX();
      
      return { x1: topPanelX, y1: topPanelY, x2: shadowX, y2: groundY };
    };
    
    // Calculate SVG paths for tilted panels
    const calculatePanelPath = (startX) => {
      const width = panelWidth;
      const angle = tiltAngle * Math.PI / 180;
      
      const x1 = startX;
      const y1 = groundY;
      const x2 = x1 + width * Math.cos(angle);
      const y2 = y1 - width * Math.sin(angle);
      const x3 = x2 + panelThickness * Math.sin(angle);
      const y3 = y2 + panelThickness * Math.cos(angle);
      const x4 = x1 + panelThickness * Math.sin(angle);
      const y4 = y1 + panelThickness * Math.cos(angle);
      
      return `M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`;
    };
    
    // Update calculation when parameters change
    useEffect(() => {
      const topPanelX = panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180);
      const shadowEndX = calculateShadowEndX();
      const pixelDistance = shadowEndX - panel1X;
      const scaledDistance = pixelDistance / panelWidth * panelLength;
      setInterRowSpacing(scaledDistance);
    }, [panelLength, tiltAngle, solarAltitude]);
    
    return (
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Interactive Solar Panel Spacing Calculator</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Input Parameters</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Panel Length (meters)
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={panelLength}
                    onChange={(e) => setPanelLength(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={panelLength}
                    onChange={(e) => setPanelLength(Math.min(2.5, Math.max(1, parseFloat(e.target.value) || 1)))}
                    style={{ width: '70px', padding: '5px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1m</span>
                  <span>2.5m</span>
                </div>
              </label>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Panel Tilt Angle (β) in degrees
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    step="1"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))}
                    style={{ width: '70px', padding: '5px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>0°</span>
                  <span>60°</span>
                </div>
              </label>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Winter Solar Altitude (α) in degrees
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={solarAltitude}
                    onChange={(e) => setSolarAltitude(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <input
                    type="number"
                    min="5"
                    max="45"
                    step="1"
                    value={solarAltitude}
                    onChange={(e) => setSolarAltitude(Math.min(45, Math.max(5, parseInt(e.target.value) || 5)))}
                    style={{ width: '70px', padding: '5px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>5°</span>
                  <span>45°</span>
                </div>
              </label>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Results</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#f9fafb' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Panel Height (H)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{calculatePanelHeight().toFixed(2)} m</div>
              </div>
              
              <div style={{ border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#f9fafb' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Effective Width</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{(panelLength * Math.cos(tiltAngle * Math.PI / 180)).toFixed(2)} m</div>
              </div>
              
              <div style={{ gridColumn: 'span 2', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#f9fafb' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Shadow Extension (CB)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#800080' }}>
                  {calculateShadowExtension().toFixed(2)} m
                </div>
              </div>
              
              <div style={{ gridColumn: 'span 2', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#eff6ff' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Minimum Inter-Row Spacing (D)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>{interRowSpacing.toFixed(2)} m</div>
              </div>
              
              <div style={{ gridColumn: 'span 2', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.25rem', backgroundColor: '#ecfdf5' }}>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>Total Row-to-Row Distance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#059669' }}>
                  {(interRowSpacing + panelLength * Math.cos(tiltAngle * Math.PI / 180)).toFixed(2)} m
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SVG Diagram */}
        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.25rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Visual Diagram</h3>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Ground Line */}
            <line x1="50" y1={groundY} x2="750" y2={groundY} stroke="#333" strokeWidth="2" />
            
            {/* Triangle formed by shadow */}
            <polygon
              points={`${panel1X},${groundY} ${calculateShadowLine().x1},${calculateShadowLine().y1} ${calculateShadowLine().x2},${calculateShadowLine().y2}`}
              fill="rgba(100, 100, 100, 0.1)"
              stroke="#555"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
            
            {/* Shadow Line */}
            <line 
              x1={calculateShadowLine().x1} 
              y1={calculateShadowLine().y1} 
              x2={calculateShadowLine().x2} 
              y2={calculateShadowLine().y2} 
              stroke="#555" 
              strokeWidth="2.5" 
              strokeDasharray="6,3" 
            />
            
            {/* First Solar Panel */}
            <path d={calculatePanelPath(panel1X)} fill="#1E90FF" stroke="#000" />
            
            {/* Second Solar Panel */}
            <path d={calculatePanelPath(calculatePanel2X())} fill="#1E90FF" stroke="#000" />
            
            {/* Sun */}
            <circle cx={calculateSunPosition().x} cy={calculateSunPosition().y} r="30" fill="#FFD700" stroke="#FF8C00" strokeWidth="2" />
            <circle cx={calculateSunPosition().x} cy={calculateSunPosition().y} r="20" fill="#FF8C00" />
            
            {/* Add letter for Sun angle */}
            <text 
              x={calculateSunPosition().x + 20} 
              y={calculateSunPosition().y + 15} 
              fontSize="16" 
              fontWeight="bold"
              fill="#FFD700"
            >
              S
            </text>
            
            {/* Sun Ray - Single ray showing the critical shadow-casting angle */}
            <line 
              x1={calculateSunRay().x1} 
              y1={calculateSunRay().y1} 
              x2={calculateSunRay().x2} 
              y2={calculateSunRay().y2} 
              stroke="#FFD700" 
              strokeWidth="2.5" 
              strokeDasharray="6,3" 
            />
            
            {/* Reference height line */}
            <line 
              x1={panel1X} 
              y1={groundY} 
              x2={panel1X} 
              y2={calculateShadowLine().y1} 
              stroke="#008000" 
              strokeWidth="2" 
              strokeDasharray="4,2"
            />
            <text 
              x={panel1X - 25} 
              y={(groundY + calculateShadowLine().y1) / 2} 
              fontSize="16" 
              textAnchor="middle" 
              fill="#008000"
            >
              H = {calculatePanelHeight().toFixed(2)}m
            </text>
            
            {/* Panel actual tilted length */}
            <line 
              x1={panel1X} 
              y1={groundY} 
              x2={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)} 
              y2={groundY - panelWidth * Math.sin(tiltAngle * Math.PI / 180)} 
              stroke="#0000FF" 
              strokeWidth="1.5" 
              strokeDasharray="3,1"
            />
            <text 
              x={panel1X + (panelWidth * Math.cos(tiltAngle * Math.PI / 180))/2 - 10} 
              y={groundY - (panelWidth * Math.sin(tiltAngle * Math.PI / 180))/2 - 10} 
              fontSize="14" 
              fill="#0000FF"
            >
              L = {panelLength.toFixed(1)}m
            </text>
            
            {/* Removed Points T and E and the line T-E */}
            
            {/* Theta angle (Sun angle at panel top) - hidden but kept in code
            <path 
              d={`M${calculateShadowLine().x1 + 30},${calculateShadowLine().y1} A30,30 0 0,1 ${calculateShadowLine().x1 + 40},${calculateShadowLine().y1 - 25}`} 
              fill="none" 
              stroke="#FF4500" 
              strokeWidth="2" 
            />
            <text 
              x={calculateShadowLine().x1 + 45} 
              y={calculateShadowLine().y1 - 15} 
              fontSize="16" 
              fill="#FF4500"
            >
              θ={solarAltitude}°
            </text>
            */}
            
            {/* Point C - perpendicular point from top of panel */}
            <line
              x1={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)}
              y1={groundY - panelWidth * Math.sin(tiltAngle * Math.PI / 180)}
              x2={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)}
              y2={groundY}
              stroke="#800080"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            <text 
              x={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)} 
              y={groundY + 15} 
              fontSize="16" 
              textAnchor="middle" 
              fontWeight="bold"
              fill="#800080"
            >
              C
            </text>
            <circle 
              cx={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)} 
              cy={groundY} 
              r="4" 
              fill="#800080" 
            />
            
            {/* Distance between C and B */}
            <line 
              x1={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)} 
              y1={groundY + 40} 
              x2={calculateShadowEndX()} 
              y2={groundY + 40} 
              stroke="#800080" 
              strokeWidth="1.5" 
            />
            <text 
              x={(panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180) + calculateShadowEndX()) / 2} 
              y={groundY + 55} 
              fontSize="14" 
              textAnchor="middle" 
              fill="#800080"
            >
              CB = {calculateShadowExtension().toFixed(2)} m
            </text>
            
            {/* Panel Length - projected width */}
            <line 
              x1={panel1X} 
              y1={groundY + 20} 
              x2={panel1X + panelWidth * Math.cos(tiltAngle * Math.PI / 180)} 
              y2={groundY + 20} 
              stroke="#0000FF" 
              strokeWidth="1.5" 
            />
            <text 
              x={panel1X + (panelWidth * Math.cos(tiltAngle * Math.PI / 180))/2} 
              y={groundY + 35} 
              fontSize="14" 
              textAnchor="middle" 
              fill="#0000FF"
            >
              L·cos(β) = {(panelLength * Math.cos(tiltAngle * Math.PI / 180)).toFixed(2)}m
            </text>
            
            {/* Points A and B labels */}
            <text 
              x={panel1X} 
              y={groundY + 15} 
              fontSize="16" 
              textAnchor="middle" 
              fontWeight="bold"
              fill="#000"
            >
              A
            </text>
            <text 
              x={calculateShadowEndX()} 
              y={groundY + 15} 
              fontSize="16" 
              textAnchor="middle"
              fontWeight="bold" 
              fill="#000"
            >
              B
            </text>
            <circle cx={panel1X} cy={groundY} r="4" fill="#000" />
            <circle cx={calculateShadowEndX()} cy={groundY} r="4" fill="#000" />
            
            {/* Spacing Dimension Line */}
            <line 
              x1={panel1X} 
              y1={groundY + 70} 
              x2={calculatePanel2X()} 
              y2={groundY + 70} 
              stroke="#FF0000" 
              strokeWidth="2" 
            />
            <text 
              x={(panel1X + calculatePanel2X()) / 2} 
              y={groundY + 85} 
              fontSize="16" 
              textAnchor="middle" 
              fill="#FF0000"
            >
              D = {((calculatePanel2X() - panel1X) / panelWidth * panelLength).toFixed(2)} m
            </text>
            
            {/* Panel Tilt Angle */}
            <path 
              d={`M${panel1X + 20},${groundY} A30,30 0 0,0 ${panel1X + 40},${groundY - 20}`} 
              fill="none" 
              stroke="#9932CC" 
              strokeWidth="2" 
            />
            <text 
              x={panel1X + 25} 
              y={groundY - 15} 
              fontSize="16" 
              fill="#9932CC"
            >
              β={tiltAngle}°
            </text>
            
            {/* Solar Altitude Angle */}
            <path 
              d={`M${calculateShadowLine().x2 - 40},${groundY} A40,40 0 0,1 ${calculateShadowLine().x2 - 20},${groundY - 20}`} 
              fill="none" 
              stroke="#FFA500" 
              strokeWidth="2" 
            />
            <text 
              x={calculateShadowLine().x2 - 40} 
              y={groundY - 25} 
              fontSize="16" 
              fill="#FFA500"
            >
              α={solarAltitude}°
            </text>
            
            {/* Add horizontal dimension line to complete the triangle reference */}
            <line 
              x1={panel1X} 
              y1={groundY + 10} 
              x2={calculateShadowLine().x2} 
              y2={groundY + 10} 
              stroke="#555" 
              strokeWidth="1.5" 
              strokeDasharray="4,2"
            />
            
            {/* Legend */}
            <rect x="600" y="50" width="150" height="280" fill="white" stroke="#333" />
            <text x="610" y="70" fontSize="14" fontWeight="bold">Legend:</text>
            <text x="610" y="95" fontSize="14" fill="#FF0000">D: Distance A to B</text>
            <text x="610" y="115" fontSize="14" fill="#800080">CB: Shadow length</text>
            <text x="610" y="135" fontSize="14" fill="#008000">H: Panel height</text>
            <text x="610" y="155" fontSize="14" fill="#9932CC">β: Panel tilt angle</text>
            <text x="610" y="175" fontSize="14" fill="#FFA500">α: Solar altitude</text>
            <text x="610" y="195" fontSize="14" fill="#0000FF">L: Panel length</text>
            <text x="610" y="215" fontSize="14" fill="#555">---: Shadow line</text>
            <text x="610" y="235" fontSize="14" fill="#FFD700">····: Sun ray</text>
            {/* <text x="610" y="255" fontSize="14" fill="#FF4500">θ: Sun angle at panel top</text> */}
          </svg>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Formula Used</h3>
          <p style={{ marginBottom: '0.5rem' }}>D = H × [cos(β) + sin(β)/tan(α)]</p>
          <p>Where:</p>
          <ul style={{ paddingLeft: '1.5rem', listStyleType: 'disc' }}>
            <li>D is the inter-row spacing</li>
            <li>H is the height difference between the top and bottom edges of the panel (H = L × sin(β))</li>
            <li>L is the length of the panel</li>
            <li>β is the tilt angle of the panel</li>
            <li>α is the minimum solar altitude angle (winter solstice)</li>
          </ul>
          
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Detailed Calculations</h3>
          <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5', backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '0.25rem' }}>
  {`// Input parameters
  Panel length (L) = ${panelLength.toFixed(2)} m
  Panel tilt angle (β) = ${tiltAngle}°
  Solar altitude angle (α) = ${solarAltitude}° (Noon, Dec 21st)
  
  // Step 1: Calculate panel height
  H = L × sin(β)
  H = ${panelLength.toFixed(2)} × sin(${tiltAngle}°)
  H = ${panelLength.toFixed(2)} × ${Math.sin(tiltAngle * Math.PI / 180).toFixed(4)}
  H = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} m
  
  // Step 2: Calculate panel width projection
  Width = L × cos(β)
  Width = ${panelLength.toFixed(2)} × cos(${tiltAngle}°)
  Width = ${panelLength.toFixed(2)} × ${Math.cos(tiltAngle * Math.PI / 180).toFixed(4)}
  Width = ${(panelLength * Math.cos(tiltAngle * Math.PI / 180)).toFixed(4)} m
  
  // Step 3: Calculate shadow extension (CB)
  CB = H / tan(α)
  CB = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} / tan(${solarAltitude}°)
  CB = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} / ${Math.tan(solarAltitude * Math.PI / 180).toFixed(4)}
  CB = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180)).toFixed(4)} m
  
  // Step 4: Calculate total spacing (D)
  D = Width + CB 
  D = ${(panelLength * Math.cos(tiltAngle * Math.PI / 180)).toFixed(4)} + ${(panelLength * Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180)).toFixed(4)}
  D = ${(panelLength * Math.cos(tiltAngle * Math.PI / 180) + panelLength * Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180)).toFixed(4)} m
  
  // Alternative formula
  D = H × [cos(β) + sin(β)/tan(α)]
  D = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} × [cos(${tiltAngle}°) + sin(${tiltAngle}°)/tan(${solarAltitude}°)]
  D = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} × [${Math.cos(tiltAngle * Math.PI / 180).toFixed(4)} + ${Math.sin(tiltAngle * Math.PI / 180).toFixed(4)}/${Math.tan(solarAltitude * Math.PI / 180).toFixed(4)}]
  D = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} × [${Math.cos(tiltAngle * Math.PI / 180).toFixed(4)} + ${(Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180)).toFixed(4)}]
  D = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180)).toFixed(4)} × ${(Math.cos(tiltAngle * Math.PI / 180) + Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180)).toFixed(4)}
  D = ${(panelLength * Math.sin(tiltAngle * Math.PI / 180) * (Math.cos(tiltAngle * Math.PI / 180) + Math.sin(tiltAngle * Math.PI / 180) / Math.tan(solarAltitude * Math.PI / 180))).toFixed(4)} m
  `}
          </div>
        </div>
      </div>
    );
  };
  

export default App;