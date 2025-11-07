import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class EclipseDVDExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._overlay = null;
        this._actor = null;
        this._label = null;
        this._timeout = null;
        this._clockTimeout = null;
        this._idleMonitor = null;
        this._idleWatchId = null;
        this._settings = null;
        this._isActive = false;
        
        // Bouncing state
        this._x = 0;
        this._y = 0;
        this._velocityX = 0;
        this._velocityY = 0;
        this._colors = [];
        this._colorIndex = 0;
        this._cornerHits = 0;
        
        // Input tracking
        this._capturedEventId = null;
    }

    enable() {
        this._settings = this.getSettings();
        this._loadColors();
        this._setupIdleMonitor();
        this._connectSettings();
    }

    disable() {
        this._hideScreensaver();
        
        if (this._idleWatchId && this._idleMonitor) {
            this._idleMonitor.remove_watch(this._idleWatchId);
            this._idleWatchId = null;
        }
        
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        
        // Clean up clock timeout
        if (this._clockTimeout) {
            GLib.source_remove(this._clockTimeout);
            this._clockTimeout = null;
        }
        
        this._settings = null;
        this._idleMonitor = null;
    }

    _setupIdleMonitor() {
        try {
            this._idleMonitor = global.backend.get_core_idle_monitor();
        } catch (e) {
            try {
                this._idleMonitor = Meta.IdleMonitor.get_core();
            } catch (e2) {
                console.error('Eclipse: Failed to get idle monitor');
                return;
            }
        }
        this._updateIdleWatch();
    }

    _updateIdleWatch() {
        if (this._idleWatchId && this._idleMonitor) {
            try {
                this._idleMonitor.remove_watch(this._idleWatchId);
            } catch (e) {
                // Silently fail
            }
            this._idleWatchId = null;
        }
        
        if (!this._idleMonitor) {
            return;
        }
        
        const idleTimeSeconds = this._settings.get_int('idle-time');
        const idleTimeMs = idleTimeSeconds * 1000;
        
        try {
            this._idleWatchId = this._idleMonitor.add_idle_watch(idleTimeMs, () => {
                this._showScreensaver();
            });
        } catch (e) {
            console.error('Eclipse: Failed to add idle watch');
        }
    }

    _showScreensaver() {
        if (this._isActive) {
            return;
        }
        
        this._isActive = true;
        
        // Create fullscreen overlay
        this._createOverlay();
        
        // Create the bouncing label
        this._createLabel();
        
        // Start animation
        this._startAnimation();
        
        // Capture all input to detect user activity
        this._captureInput();
        
        // Fade in smoothly
        this._overlay.opacity = 0;
        this._actor.opacity = 0;
        
        this._overlay.ease({
            opacity: 255,
            duration: 500,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
        
        this._actor.ease({
            opacity: 255,
            duration: 800,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }

    _hideScreensaver() {
        if (!this._isActive) {
            return;
        }
        
        this._isActive = false;
        
        // Remove input capture immediately
        if (this._capturedEventId) {
            global.stage.disconnect(this._capturedEventId);
            this._capturedEventId = null;
        }
        
        // Fade out smoothly
        if (this._overlay && this._actor) {
            this._overlay.ease({
                opacity: 0,
                duration: 400,
                mode: Clutter.AnimationMode.EASE_IN_QUAD,
                onComplete: () => {
                    this._cleanupScreensaver();
                }
            });
            
            this._actor.ease({
                opacity: 0,
                duration: 300,
                mode: Clutter.AnimationMode.EASE_IN_QUAD,
            });
        } else {
            this._cleanupScreensaver();
        }
    }
    
    _cleanupScreensaver() {
        // Stop animation
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        
        // Stop clock update
        this._stopClockUpdate();
        
        // Destroy UI
        if (this._actor) {
            this._actor.destroy();
            this._actor = null;
            this._label = null;
        }
        
        if (this._overlay) {
            this._overlay.destroy();
            this._overlay = null;
        }
        
        // Reset idle monitor
        this._updateIdleWatch();
    }

    _createOverlay() {
        // Create black fullscreen overlay
        this._overlay = new St.Widget({
            style_class: 'eclipse-dvd-overlay',
            style: 'background-color: black;',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x: 0,
            y: 0,
        });
        
        const monitor = Main.layoutManager.primaryMonitor;
        this._overlay.set_size(monitor.width, monitor.height);
        
        Main.layoutManager.addChrome(this._overlay, {
            affectsStruts: false,
            trackFullscreen: false,
        });
        
        this._overlay.show();
    }

    _captureInput() {
        // Capture any keyboard or mouse event to hide screensaver
        this._capturedEventId = global.stage.connect('captured-event', (actor, event) => {
            const type = event.type();
            if (type === Clutter.EventType.KEY_PRESS ||
                type === Clutter.EventType.BUTTON_PRESS ||
                type === Clutter.EventType.MOTION) {
                this._hideScreensaver();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }

    _loadColors() {
        const colorScheme = this._settings.get_string('color-scheme');
        
        if (colorScheme === 'classic') {
            this._colors = [
                [255, 51, 76],    // Red
                [51, 255, 76],    // Green
                [76, 127, 255],   // Blue
                [255, 204, 51],   // Yellow
                [255, 102, 204],  // Pink
                [102, 255, 229],  // Cyan
                [204, 102, 255],  // Purple
                [255, 153, 51],   // Orange
            ];
        } else if (colorScheme === 'pastel') {
            this._colors = [
                [255, 179, 186],  // Pastel Red
                [186, 255, 201],  // Pastel Green
                [186, 225, 255],  // Pastel Blue
                [255, 243, 186],  // Pastel Yellow
                [255, 209, 229],  // Pastel Pink
                [209, 255, 243],  // Pastel Cyan
                [229, 209, 255],  // Pastel Purple
                [255, 223, 186],  // Pastel Orange
            ];
        } else if (colorScheme === 'neon') {
            this._colors = [
                [255, 0, 102],    // Neon Pink
                [0, 255, 102],    // Neon Green
                [0, 102, 255],    // Neon Blue
                [255, 255, 0],    // Neon Yellow
                [255, 0, 255],    // Neon Magenta
                [0, 255, 255],    // Neon Cyan
                [255, 102, 0],    // Neon Orange
                [204, 0, 255],    // Neon Purple
            ];
        } else if (colorScheme === 'monochrome') {
            this._colors = [
                [255, 255, 255],  // White
                [220, 220, 220],  // Light Gray
                [180, 180, 180],  // Gray
                [140, 140, 140],  // Dark Gray
            ];
        }
        
        this._colorIndex = Math.floor(Math.random() * this._colors.length);
    }

    _createLabel() {
        // Create container
        this._actor = new St.Widget({
            style_class: 'eclipse-dvd-container',
            reactive: false,
            can_focus: false,
            track_hover: false,
        });
        
        // Create label
        const displayMode = this._settings.get_string('display-mode');
        const text = displayMode === 'clock' ? this._getCurrentTime() : this._settings.get_string('display-text');
        const fontSize = this._settings.get_int('font-size');
        const showGlow = this._settings.get_boolean('show-glow');
        
        this._label = new St.Label({
            text: text,
            style: this._getLabelStyle(fontSize, showGlow),
        });
        
        this._actor.add_child(this._label);
        
        // Start clock update timer if in clock mode
        if (displayMode === 'clock') {
            this._startClockUpdate();
        }
        
        // Add to Main UI above the overlay
        Main.layoutManager.addChrome(this._actor, {
            affectsStruts: false,
            trackFullscreen: false,
        });
        
        // Initialize random position and velocity
        const monitor = Main.layoutManager.primaryMonitor;
        
        // Wait for layout to get actual dimensions
        GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
            const width = this._label.width || 200;
            const height = this._label.height || 80;
            
            this._x = Math.random() * (monitor.width - width);
            this._y = Math.random() * (monitor.height - height);
            
            const speed = this._settings.get_int('bounce-speed');
            this._velocityX = (speed + Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
            this._velocityY = (speed + Math.random() * 50) * (Math.random() > 0.5 ? 1 : -1);
            
            this._updatePosition();
            this._updateColor();
            
            return GLib.SOURCE_REMOVE;
        });
    }

    _getLabelStyle(fontSize, showGlow) {
        const color = this._colors[this._colorIndex];
        const colorStr = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        
        let style = `
            color: ${colorStr};
            font-size: ${fontSize}px;
            font-weight: bold;
            font-family: sans-serif;
        `;
        
        if (showGlow) {
            style += `
                text-shadow: 
                    0 0 10px ${colorStr},
                    0 0 20px ${colorStr},
                    0 0 30px ${colorStr};
            `;
        }
        
        return style;
    }

    _getCurrentTime() {
        const now = new Date();
        const clockFormat = this._settings.get_string('clock-format');
        const showSeconds = this._settings.get_boolean('show-seconds');
        
        let hours = now.getHours();
        let ampm = '';
        
        // Handle 12-hour format
        if (clockFormat === '12h') {
            ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12
        }
        
        const hoursStr = String(hours).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        let timeStr = `${hoursStr}:${minutes}`;
        
        if (showSeconds) {
            const seconds = String(now.getSeconds()).padStart(2, '0');
            timeStr += `:${seconds}`;
        }
        
        return timeStr + ampm;
    }

    _startClockUpdate() {
        // Clear existing clock timeout if any
        if (this._clockTimeout) {
            GLib.source_remove(this._clockTimeout);
            this._clockTimeout = null;
        }
        
        // Update clock every second
        this._clockTimeout = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
            if (this._label && this._settings.get_string('display-mode') === 'clock') {
                this._label.text = this._getCurrentTime();
            }
            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopClockUpdate() {
        if (this._clockTimeout) {
            GLib.source_remove(this._clockTimeout);
            this._clockTimeout = null;
        }
    }

    _updatePosition() {
        if (this._actor && this._label) {
            this._actor.set_position(Math.floor(this._x), Math.floor(this._y));
        }
    }

    _updateColor() {
        if (this._label) {
            const fontSize = this._settings.get_int('font-size');
            const showGlow = this._settings.get_boolean('show-glow');
            this._label.style = this._getLabelStyle(fontSize, showGlow);
        }
    }

    _startAnimation() {
        // Update at ~60 FPS
        const fps = 60;
        const interval = 1000 / fps;
        
        // Clear existing timeout if any
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        
        this._timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
            this._update(1 / fps);
            return GLib.SOURCE_CONTINUE;
        });
    }

    _update(dt) {
        const monitor = Main.layoutManager.primaryMonitor;
        
        if (!this._label || !this._actor) {
            return;
        }
        
        // Update position
        this._x += this._velocityX * dt;
        this._y += this._velocityY * dt;
        
        const width = this._label.width;
        const height = this._label.height;
        
        let hitEdge = false;
        let hitCorner = false;
        
        // Bounce off edges
        if (this._x <= 0) {
            this._x = 0;
            this._velocityX = Math.abs(this._velocityX);
            hitEdge = true;
        } else if (this._x + width >= monitor.width) {
            this._x = monitor.width - width;
            this._velocityX = -Math.abs(this._velocityX);
            hitEdge = true;
        }
        
        if (this._y <= 0) {
            this._y = 0;
            this._velocityY = Math.abs(this._velocityY);
            if (hitEdge) hitCorner = true;
            hitEdge = true;
        } else if (this._y + height >= monitor.height) {
            this._y = monitor.height - height;
            this._velocityY = -Math.abs(this._velocityY);
            if (hitEdge) hitCorner = true;
            hitEdge = true;
        }
        
        // Change color on edge hit
        if (hitEdge) {
            this._colorIndex = (this._colorIndex + 1) % this._colors.length;
            this._updateColor();
        }
        
        if (hitCorner) {
            this._cornerHits++;
        }
        
        this._updatePosition();
    }

    _connectSettings() {
        this._settings.connect('changed::display-mode', () => {
            if (this._isActive) {
                this._recreateLabel();
            }
        });
        
        this._settings.connect('changed::display-text', () => {
            if (this._isActive) {
                this._recreateLabel();
            }
        });
        
        this._settings.connect('changed::font-size', () => {
            if (this._isActive) {
                this._updateColor();
            }
        });
        
        this._settings.connect('changed::show-glow', () => {
            if (this._isActive) {
                this._updateColor();
            }
        });
        
        this._settings.connect('changed::bounce-speed', () => {
            if (this._isActive && this._velocityX && this._velocityY) {
                const speed = this._settings.get_int('bounce-speed');
                const currentSpeed = Math.sqrt(this._velocityX ** 2 + this._velocityY ** 2);
                const ratio = speed / currentSpeed;
                this._velocityX *= ratio;
                this._velocityY *= ratio;
            }
        });
        
        this._settings.connect('changed::color-scheme', () => {
            this._loadColors();
            if (this._isActive) {
                this._updateColor();
            }
        });
        
        this._settings.connect('changed::clock-format', () => {
            if (this._isActive && this._settings.get_string('display-mode') === 'clock') {
                // Update clock display immediately with new format
                if (this._label) {
                    this._label.text = this._getCurrentTime();
                }
            }
        });
        
        this._settings.connect('changed::show-seconds', () => {
            if (this._isActive && this._settings.get_string('display-mode') === 'clock') {
                // Update clock display immediately with/without seconds
                if (this._label) {
                    this._label.text = this._getCurrentTime();
                }
            }
        });
        
        this._settings.connect('changed::idle-time', () => {
            this._updateIdleWatch();
        });
    }

    _recreateLabel() {
        if (!this._isActive) {
            return;
        }
        
        const oldX = this._x;
        const oldY = this._y;
        const oldVelX = this._velocityX;
        const oldVelY = this._velocityY;
        
        if (this._actor) {
            this._actor.destroy();
            this._actor = null;
            this._label = null;
        }
        
        this._createLabel();
        
        this._x = oldX;
        this._y = oldY;
        this._velocityX = oldVelX;
        this._velocityY = oldVelY;
        
        this._updatePosition();
    }
}
