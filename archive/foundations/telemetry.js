// Telemetry Dashboard JavaScript Handler

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const connectionIndicator = document.getElementById('connection-indicator');
    const socketStatus = document.getElementById('socket-status');
    const activeAgent = document.getElementById('active-agent');
    const activeMode = document.getElementById('active-mode');
    
    const stabilizationRing = document.getElementById('stabilization-ring');
    const stabilizationValue = document.getElementById('stabilization-value');
    const stabilizationStatus = document.getElementById('stabilization-status');
    
    const fluxRing = document.getElementById('flux-ring');
    const fluxValue = document.getElementById('flux-value');
    const fluxStatus = document.getElementById('flux-status');
    
    const integrityFill = document.getElementById('integrity-fill');
    const integrityValue = document.getElementById('integrity-value');
    const uptimeValue = document.getElementById('uptime-value');
    
    const logStream = document.getElementById('log-stream');
    const streamEmpty = document.getElementById('stream-empty');
    const btnClearLogs = document.getElementById('btn-clear-logs');
    
    const filterAll = document.getElementById('filter-all');
    const filterInfo = document.getElementById('filter-info');
    const filterWarning = document.getElementById('filter-warning');
    const filterCritical = document.getElementById('filter-critical');
    
    const simInfoBtn = document.getElementById('sim-info-btn');
    const simWarnBtn = document.getElementById('sim-warn-btn');
    const simCritBtn = document.getElementById('sim-crit-btn');
    const toastHolder = document.getElementById('toast-holder');

    // State Variables
    let eventLogCache = [];
    let activeFilter = 'ALL'; // ALL, INFO, WARNING, CRITICAL
    let startTime = Date.now();
    let currentStabilization = 98.4;
    let currentFlux = 3.42;
    let currentIntegrity = 100;

    // Start Uptime counter
    setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        uptimeValue.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);

    // Set initial Ring values
    updateStabilization(currentStabilization);
    updateFlux(currentFlux);
    updateIntegrity(currentIntegrity);

    // Clear logs handler
    btnClearLogs.addEventListener('click', () => {
        eventLogCache = [];
        renderLogs();
    });

    // Filtering handler
    const filterButtons = [filterAll, filterInfo, filterWarning, filterCritical];
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderLogs();
        });
    });

    // Connection configuration
    const sseUrl = 'http://localhost:8085/api/events';
    const historyUrl = 'http://localhost:8085/api/history';
    
    let eventSource = null;

    // Fetch initial history
    fetchHistory();
    // Connect to SSE Stream
    connectSSE();

    function fetchHistory() {
        fetch(historyUrl)
            .then(res => {
                if (!res.ok) throw new Error("History server error");
                return res.json();
            })
            .then(history => {
                if (history && history.length > 0) {
                    eventLogCache = history;
                    renderLogs();
                }
            })
            .catch(err => {
                console.warn("Could not load telemetry history:", err.message);
            });
    }

    function connectSSE() {
        console.log("Connecting to telemetry SSE stream...");
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
            connectionIndicator.className = 'pulse-indicator status-connected';
            socketStatus.textContent = 'CONNECTED';
            socketStatus.className = 'value val-cyan';
        };

        eventSource.onerror = (e) => {
            console.error("SSE Connection Error:", e);
            connectionIndicator.className = 'pulse-indicator status-disconnected';
            socketStatus.textContent = 'OFFLINE';
            socketStatus.className = 'value val-pink';
            
            // Reconnect attempt in 4 seconds
            eventSource.close();
            setTimeout(connectSSE, 4000);
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleNewEvent(data);
            } catch (err) {
                console.error("Failed to parse SSE payload:", err);
            }
        };
    }

    function handleNewEvent(event) {
        // Enforce timestamp
        if (!event.timestamp) {
            event.timestamp = new Date().toISOString();
        }
        
        // Severity mapping defaults
        if (!event.severity) {
            event.severity = 'INFO';
        }
        event.severity = event.severity.toUpperCase();

        // Type normalization
        if (!event.type) {
            event.type = 'LOG';
        }

        // Cache event
        eventLogCache.push(event);
        if (eventLogCache.length > 500) {
            eventLogCache.shift();
        }

        // Update active states
        if (event.agent_id) {
            activeAgent.textContent = event.agent_id.toUpperCase();
        }
        if (event.state) {
            activeMode.textContent = event.state.toUpperCase();
        }

        // Parse and update metrics
        if (event.metrics) {
            if (event.metrics.stabilization !== undefined) {
                updateStabilization(parseFloat(event.metrics.stabilization));
            }
            if (event.metrics.flux_density !== undefined) {
                updateFlux(parseFloat(event.metrics.flux_density));
            }
            if (event.metrics.integrity !== undefined) {
                updateIntegrity(parseFloat(event.metrics.integrity));
            }
        }

        // Dynamic Toast generation
        if (event.severity === 'WARNING' || event.severity === 'CRITICAL' || event.type === 'CRITICAL_MUTATION') {
            spawnToast(event);
        }

        // Trigger log render
        renderLogs();
    }

    function updateStabilization(percent) {
        currentStabilization = percent;
        stabilizationValue.textContent = `${percent.toFixed(1)}%`;
        
        // Circular ring calculation (radius=70, circumference=439.82)
        const offset = 440 - (440 * percent) / 100;
        stabilizationRing.style.strokeDashoffset = offset;

        if (percent > 85) {
            stabilizationStatus.textContent = 'OPTIMAL';
            stabilizationStatus.className = 'detail-val val-cyan';
        } else if (percent > 60) {
            stabilizationStatus.textContent = 'STABILIZING';
            stabilizationStatus.className = 'detail-val val-orange';
        } else {
            stabilizationStatus.textContent = 'CRITICAL DECAY';
            stabilizationStatus.className = 'detail-val val-pink';
        }
    }

    function updateFlux(density) {
        currentFlux = density;
        fluxValue.textContent = density.toFixed(2);

        // Circular ring calculation (max density = 10.0)
        const percent = Math.min(Math.max((density / 10) * 100, 0), 100);
        const offset = 440 - (440 * percent) / 100;
        fluxRing.style.strokeDashoffset = offset;

        if (density < 4) {
            fluxStatus.textContent = 'STEADY';
            fluxStatus.className = 'detail-val val-cyan';
        } else if (density < 7.5) {
            fluxStatus.textContent = 'HIGH DENSITY';
            fluxStatus.className = 'detail-val val-orange';
        } else {
            fluxStatus.textContent = 'SUPERCRITICAL';
            fluxStatus.className = 'detail-val val-pink';
        }
    }

    function updateIntegrity(val) {
        currentIntegrity = val;
        integrityValue.textContent = `${val.toFixed(0)}%`;
        integrityFill.style.width = `${val}%`;

        if (val < 50) {
            integrityFill.style.background = 'linear-gradient(90deg, var(--neon-pink), var(--neon-orange))';
        } else {
            integrityFill.style.background = 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))';
        }
    }

    function renderLogs() {
        // Clear children but keep empty state if needed
        logStream.innerHTML = '';

        const filtered = eventLogCache.filter(item => {
            if (activeFilter === 'ALL') return true;
            return item.severity === activeFilter;
        });

        if (filtered.length === 0) {
            logStream.appendChild(streamEmpty);
            streamEmpty.style.display = 'flex';
            if (socketStatus.textContent === 'CONNECTED') {
                streamEmpty.querySelector('p').textContent = 'EVENT CACHE EMPTY. LISTENING FOR NEW METRIC INGESTIONS...';
            } else {
                streamEmpty.querySelector('p').textContent = 'WAITING FOR SSE EVENTS ON PORT 8085...';
            }
            return;
        }

        streamEmpty.style.display = 'none';

        // Render from newest to oldest
        filtered.forEach(event => {
            const entry = document.createElement('div');
            const severityClass = `severity-${event.severity.toLowerCase()}`;
            entry.className = `log-entry ${severityClass}`;

            const timeStr = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
            const componentTag = event.component ? `<span class="log-component">${event.component.toUpperCase()}</span>` : '';
            
            // Format metrics details
            let metricsChips = '';
            if (event.metrics && Object.keys(event.metrics).length > 0) {
                metricsChips = '<div class="log-metrics-chips">';
                for (const [k, v] of Object.entries(event.metrics)) {
                    metricsChips += `
                        <div class="metric-chip">
                            <span class="m-name">${k}</span>
                            <span class="m-val">${typeof v === 'number' ? v.toFixed(2) : v}</span>
                        </div>
                    `;
                }
                metricsChips += '</div>';
            }

            entry.innerHTML = `
                <div class="log-meta">
                    <div class="log-left">
                        <span class="log-time">[${timeStr}]</span>
                        <span class="log-agent">${event.agent_id ? event.agent_id.toUpperCase() : 'ANTIGRAVITY'}</span>
                        ${componentTag}
                    </div>
                    <span class="log-severity">${event.severity}</span>
                </div>
                <div class="log-msg">${event.message}</div>
                ${metricsChips}
            `;

            logStream.appendChild(entry);
        });

        // Auto-scroll to bottom of log stream
        logStream.scrollTop = logStream.scrollHeight;
    }

    function spawnToast(event) {
        const toast = document.createElement('div');
        const isCrit = event.severity === 'CRITICAL' || event.type === 'CRITICAL_MUTATION';
        toast.className = `toast ${isCrit ? 'toast-crit' : 'toast-warn'}`;

        const timeStr = new Date(event.timestamp).toLocaleTimeString();

        toast.innerHTML = `
            <div class="toast-title-box">
                <span class="toast-title">${isCrit ? 'CRITICAL ERROR' : 'SYSTEM WARNING'}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-msg">${event.message}</div>
            <div class="toast-meta">Agent: ${event.agent_id || 'ANTIGRAVITY'} // ${timeStr}</div>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });

        toastHolder.appendChild(toast);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, 6000);
    }

    // Mock buttons simulation
    simInfoBtn.addEventListener('click', () => {
        handleNewEvent({
            timestamp: new Date().toISOString(),
            type: 'LOG',
            agent_id: 'ANTIGRAVITY',
            component: 'telemetry',
            severity: 'INFO',
            message: 'Simulated system telemetry payload parsed successfully.',
            metrics: {
                stabilization: 95.0 + Math.random() * 5.0,
                flux_density: 2.0 + Math.random() * 2.0,
                integrity: 100
            }
        });
    });

    simWarnBtn.addEventListener('click', () => {
        handleNewEvent({
            timestamp: new Date().toISOString(),
            type: 'LOG',
            agent_id: 'DEVELOPER',
            component: 'hub-api',
            severity: 'WARNING',
            message: 'Flux oscillation detected in secondary telemetry buffer channel. Automatic recalibration running.',
            metrics: {
                stabilization: 75.0 + Math.random() * 10.0,
                flux_density: 5.5 + Math.random() * 1.5,
                integrity: 90
            }
        });
    });

    simCritBtn.addEventListener('click', () => {
        handleNewEvent({
            timestamp: new Date().toISOString(),
            type: 'CRITICAL_MUTATION',
            agent_id: 'ORCHESTRATOR',
            component: 'quantum-flux',
            severity: 'CRITICAL',
            message: 'CRITICAL SHIELD FRACTURE: Core containment shield temperature exceeding nominal limits!',
            metrics: {
                stabilization: 40.0 + Math.random() * 15.0,
                flux_density: 8.8 + Math.random() * 1.1,
                integrity: 42
            }
        });
    });
});
