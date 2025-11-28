# 🧪 TESTING GUIDE - Geo AI Insights Platform

## Quick Start Testing (5 Minutes)

### 1. Access the Application
The system is already running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Preview**: Click the preview button in the panel above

### 2. Create Account & Login
```
1. Click the preview button
2. Click "Sign up"
3. Fill in the form:
   - Name: Test User
   - Email: test@geoai.com
   - Password: Test123!@# (meets all requirements)
   - Company: Geo AI Labs (optional)
4. Click "Sign Up"
5. You'll be automatically logged in!
```

---

## 🎯 COMPREHENSIVE TESTING WORKFLOW

### STEP 1: Test Authentication ✅
**What to Test:**
1. Sign up with valid credentials
2. Check password requirements are enforced
3. Verify automatic login after signup
4. Test logout from profile dropdown
5. Test login with created credentials

**Expected Results:**
- ✅ Password validation shows green checks
- ✅ Redirected to dashboard after signup
- ✅ Profile dropdown shows user name
- ✅ Logout redirects to login page

---

### STEP 2: Verify Seismic Data Display ✅
**What to Test:**
1. Dashboard loads with seismic data automatically
2. Observe 3 distinct horizontal reflectors (horizons)
3. Notice 2 vertical disruptions (faults at x~250 and x~550)
4. Check colorbar on the right shows amplitude scale
5. Move mouse over seismic - watch coordinates update

**Expected Results:**
- ✅ 800x600 seismic section displayed
- ✅ Blue-white-red color scheme
- ✅ Colorbar shows amplitude range
- ✅ Live cursor tracking (Inline, Crossline, Time)
- ✅ Zoom controls functional

**How to Zoom:**
```
1. Click [+] button - zoom in
2. Click [-] button - zoom out
3. Click [↻] button - reset to 100%
4. Watch zoom percentage update
```

---

### STEP 3: Test AI Horizon Picking ✅
**What to Test:**
1. Click "Auto-Pick Horizons" button (purple, magic wand icon)
2. Wait for processing (~500ms)
3. Observe 3 horizons appear on seismic
4. Check left sidebar shows horizon list
5. Verify confidence scores displayed (e.g., "87%")

**Expected Results:**
- ✅ 3 colored lines overlay the seismic
- ✅ Horizons tracked across the section
- ✅ Confidence scores: 80-95%
- ✅ Different colors for each horizon
- ✅ Sidebar shows: "AI Horizon 1 (160 pts) 87%"

**Console Output:**
```
✅ Auto-picked 3 horizons with avg confidence: 85.3%
```

---

### STEP 4: Test AI Fault Detection ✅
**What to Test:**
1. Click "Detect Faults (AI)" button (purple, zap icon)
2. Wait for processing (~1.5s)
3. Observe dashed pink lines appear (faults)
4. Check "Faults" section in left sidebar
5. Verify confidence and displacement shown

**Expected Results:**
- ✅ 2-3 dashed pink lines (vertical faults)
- ✅ Faults appear at discontinuities
- ✅ Confidence scores: 65-95%
- ✅ Displacement estimates: ~10-20ms
- ✅ Sidebar shows: "AI Fault 1 78% ~12ms"

**Console Output:**
```
✅ Detected 2 faults with avg confidence: 73.5%
```

---

### STEP 5: Test Amplitude Extraction ✅
**What to Test:**
1. Click "Extract Amplitude" button (activity icon)
2. Observe alert popup with statistics
3. Check min, max, and mean values

**Expected Results:**
- ✅ Alert shows amplitude stats
- ✅ Min: ~ -80 to -100
- ✅ Max: ~ 80 to 100
- ✅ Mean: ~ 0 to 10

---

### STEP 6: Test Manual Horizon Picking ✅
**What to Test:**
1. Click "Horizon Picking" tool in left sidebar
2. Click "+" button in Horizon Picking panel
3. New horizon created and active (blue highlight)
4. Click on seismic to add points
5. Observe points being added
6. Try "AI Auto-Pick" button (magic wand)
7. Click "Export" button (download icon)

**Expected Results:**
- ✅ New horizon added to list
- ✅ Active horizon highlighted in blue
- ✅ Clicking adds points to horizon
- ✅ Point count updates: (5 pts)
- ✅ AI auto-pick fills entire horizon
- ✅ JSON file downloads

**Manual Picking Flow:**
```
1. Add Horizon → "Horizon 4" created
2. Click on seismic → Point added
3. Click again → Another point added
4. Point count shown: (2 pts)
5. AI Auto-Pick → Full horizon tracked
6. Export → horizons.json downloaded
```

---

### STEP 7: Test Fault Interpretation Tool ✅
**What to Test:**
1. Click "Fault Interpretation" tool in left sidebar
2. Click "Detect" button (AI detection)
3. Watch loading animation
4. Verify faults appear in list
5. Try "Export" button

**Expected Results:**
- ✅ Loading spinner during detection
- ✅ "Analyzing..." message shown
- ✅ Faults added to list after ~1.5s
- ✅ Confidence and displacement displayed
- ✅ Export creates faults.json

---

### STEP 8: Test Map Generation ✅
**What to Test:**
1. Click "Maps" tab at the top
2. Click "Generate Map" button (green)
3. Wait for generation (~1.5s)
4. Observe structure map with contours
5. Try "Export" button

**Expected Results:**
- ✅ Loading spinner during generation
- ✅ Colorful map with contour lines
- ✅ Depth labels on contours
- ✅ Blue (shallow) to Red (deep) gradient
- ✅ Export downloads PNG file

**Note:** Requires horizons to be picked first!

---

### STEP 9: Test Attribute Viewer ✅
**What to Test:**
1. Click "Attributes" tab at the top
2. Click "Coherence" button
3. Wait for calculation (~1s)
4. Observe coherence attribute display
5. Try "Curvature" button

**Expected Results:**
- ✅ Loading message: "Calculating coherence..."
- ✅ New seismic-like display appears
- ✅ Coherence highlights faults (low values)
- ✅ Curvature shows structural curvature
- ✅ Colorbar updates for attribute

**Attribute Characteristics:**
- **Coherence**: Highlights discontinuities (faults appear dark)
- **Curvature**: Shows bending of reflectors

---

### STEP 10: Test 3D Viewer ✅
**What to Test:**
1. Click "3D Viewer" tab
2. Observe 3D cube visualization
3. Check data dimensions displayed

**Expected Results:**
- ✅ 3D cube rendered
- ✅ Grid background shown
- ✅ Data dimensions: "800 x 600 samples"
- ✅ Clean visual representation

**Note:** Simplified 3D - can be upgraded to full Three.js visualization

---

### STEP 11: Test Well Log Viewer ✅
**What to Test:**
1. Click "Well Logs" tab
2. Observe 3-track well log display
3. Check Gamma Ray, Resistivity, Density logs
4. Verify depth scale

**Expected Results:**
- ✅ 3 tracks displayed side-by-side
- ✅ Gamma Ray (green), Resistivity (red), Density (blue)
- ✅ Depth scale on left (0-3000m)
- ✅ Realistic log curves with trends
- ✅ Well information at bottom

---

### STEP 12: Test SEG-Y Upload ✅
**What to Test:**
1. Click "Import SEG-Y" button (top right)
2. Click "Select Files" button
3. Choose a .segy or .sgy file (if available)
4. Observe loading process
5. Verify data loads into viewer

**Expected Results:**
- ✅ Upload modal opens
- ✅ File selection dialog
- ✅ Loading spinner during parse
- ✅ Seismic data updates
- ✅ Error handling if file invalid

**Note:** System works with synthetic data if no SEG-Y file available

---

### STEP 13: Test Zoom & Navigation ✅
**What to Test:**
1. Click zoom in (+) several times
2. Observe seismic gets larger
3. Click zoom out (-) to return
4. Try reset (↻) button
5. Check zoom percentage updates

**Expected Results:**
- ✅ Zoom: 125%, 150%, 175%, 200%
- ✅ Image scales smoothly
- ✅ Reset returns to 100%
- ✅ Controls always accessible

---

### STEP 14: Test User Profile ✅
**What to Test:**
1. Click profile icon (top right)
2. Verify user information displayed
3. Click "Logout" button
4. Confirm redirect to login page

**Expected Results:**
- ✅ Dropdown shows: Name, Email, Company
- ✅ Logout button visible
- ✅ Click logout → redirected
- ✅ Session cleared

---

## 🎯 FUNCTIONALITY CHECKLIST

### Authentication
- [ ] Sign up with valid data
- [ ] Password requirements enforced
- [ ] Login successful
- [ ] Protected routes redirect
- [ ] Logout clears session

### Seismic Visualization
- [ ] Data displays on load
- [ ] Colorbar renders correctly
- [ ] Zoom controls work
- [ ] Cursor tracking updates
- [ ] 3 horizons visible in data

### AI Tools
- [ ] Auto-pick horizons detects 3
- [ ] Confidence scores shown (80-95%)
- [ ] Detect faults finds 2-3
- [ ] Displacement estimated
- [ ] Extract amplitude shows stats

### Manual Tools
- [ ] Add horizon creates new
- [ ] Click adds points
- [ ] Point count updates
- [ ] AI auto-pick works
- [ ] Export downloads JSON

### Map Generation
- [ ] Generate map creates image
- [ ] Contour lines visible
- [ ] Color gradient correct
- [ ] Export PNG works

### Attributes
- [ ] Coherence calculates
- [ ] Curvature calculates
- [ ] Attribute displays correctly

### Other Views
- [ ] 3D viewer shows cube
- [ ] Well logs display
- [ ] All tabs accessible

---

## 🐛 TROUBLESHOOTING

### Issue: Can't see preview button
**Solution**: Look in the tool panel for "Open Preview" button

### Issue: Login fails
**Solution**: 
1. Check server is running (terminal 1)
2. Verify password meets requirements
3. Create new account if needed

### Issue: No seismic data visible
**Solution**:
1. Check "Seismic Section" tab is active
2. Refresh browser
3. Check browser console for errors

### Issue: AI tools don't work
**Solution**:
1. Ensure seismic data is loaded
2. Check browser console
3. Wait for processing to complete

### Issue: Can't pick horizons manually
**Solution**:
1. Ensure "Horizon Picking" tool is active
2. Click "Add Horizon" first
3. Verify horizon is highlighted (active)

---

## ✅ EXPECTED PERFORMANCE

### Loading Times
- Seismic generation: < 100ms
- AI horizon picking: < 500ms
- AI fault detection: < 1500ms
- Attribute calculation: < 1000ms
- Map generation: < 1500ms

### Visual Quality
- Smooth zoom transitions
- Real-time cursor tracking
- No flickering
- Clean UI elements

---

## 🎯 SUCCESS CRITERIA

**✅ PASS if:**
- All authentication flows work
- Seismic data displays correctly
- AI tools detect features
- Confidence scores shown
- Manual tools functional
- Maps generate
- Export works
- UI is responsive

---

## 📊 TEST RESULTS TEMPLATE

```
Date: ___________
Tester: _________

Authentication:        [ PASS / FAIL ]
Seismic Display:       [ PASS / FAIL ]
AI Horizon Pick:       [ PASS / FAIL ]
AI Fault Detection:    [ PASS / FAIL ]
Manual Horizon Pick:   [ PASS / FAIL ]
Map Generation:        [ PASS / FAIL ]
Attribute Calculation: [ PASS / FAIL ]
3D Viewer:             [ PASS / FAIL ]
Well Log Viewer:       [ PASS / FAIL ]
Export Functions:      [ PASS / FAIL ]

Overall: [ PASS / FAIL ]

Notes:
_________________________
_________________________
```

---

## 🚀 HAPPY TESTING!

For detailed audit results, see [`AUDIT_REPORT.md`](./AUDIT_REPORT.md)
