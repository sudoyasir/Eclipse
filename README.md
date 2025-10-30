# Eclipse — DVD-Style Bouncing Screensaver

Eclipse is a retro DVD-style bouncing text screensaver for GNOME Shell. After a period of inactivity, watch customizable text bounce around your screen on a black background, changing colors every time it hits an edge — just like the classic DVD logo screensavers!

## ✨ Features

### Screensaver Functionality
- **Idle Activation** - Automatically shows after user-defined idle time (10-3600 seconds, default: 120s)
- **Instant Dismiss** - Any keyboard or mouse activity immediately hides the screensaver
- **Fullscreen Black Overlay** - Pure black background for authentic screensaver experience
- **Auto-restart** - Reactivates after the idle time when dismissed

### Customization Options
- **Idle Time** - Set when screensaver appears (10 seconds to 1 hour)
- **Custom Text** - Change the bouncing text to anything you want
- **Font Size** - Adjust size from 20px to 200px
- **Glow Effect** - Toggle retro glow around text
- **Bounce Speed** - Control speed from 50 to 500 pixels/second
- **Color Schemes** - Choose from 4 palettes:
  - Classic DVD (vibrant retro colors)
  - Pastel (soft gentle colors)
  - Neon (bright electric colors)
  - Monochrome (grayscale)

### Behavior
- Text bounces off all screen edges with realistic physics
- Color changes automatically on every edge collision
- Corner hit detection (logged to journal)
- Smooth 60 FPS animation
- Works across multiple monitors
- Settings changes apply immediately (even while screensaver is active)

## 🚀 Installation

### Method 1: Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sudoyasir/Eclipse.git
   cd Eclipse
   ```

2. **Copy to extensions directory:**
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/eclipse-dvd-screensaver@sudoyasir.github.com
   cp -r metadata.json extension.js prefs.js stylesheet.css schemas/ ~/.local/share/gnome-shell/extensions/eclipse-dvd-screensaver@sudoyasir.github.com/
   ```

3. **Compile GSettings schema:**
   ```bash
   cd ~/.local/share/gnome-shell/extensions/eclipse-dvd-screensaver@sudoyasir.github.com/schemas
   glib-compile-schemas .
   ```

4. **Restart GNOME Shell:**
   - On X11: Press `Alt+F2`, type `r`, press Enter
   - On Wayland: Log out and log back in

5. **Enable the extension:**
   ```bash
   gnome-extensions enable eclipse-dvd-screensaver@sudoyasir.github.com
   ```

### Method 2: Using GNOME Extensions App

1. Install the extension files as above
2. Open GNOME Extensions app
3. Find "Eclipse DVD Screensaver" and toggle it on

## 🎬 Usage

Once installed and enabled:

1. **Normal Use**: Just let your computer sit idle for the configured time (default 2 minutes)
2. **Screensaver Appears**: Black screen with bouncing colored text
3. **Dismiss**: Press any key, click mouse, or move mouse
4. **Repeat**: After another idle period, it appears again

**Quick Test** (recommended after installation):
```bash
./test.sh
```
This sets idle time to 10 seconds so you can see it immediately!

## ⚙️ Configuration

Open Settings in two ways:

### Via Command Line:
```bash
gnome-extensions prefs eclipse-dvd-screensaver@sudoyasir.github.com
```

### Via GNOME Extensions App:
1. Open Extensions app
2. Find "Eclipse DVD Screensaver"
3. Click the settings icon

### Available Settings:

**Screensaver Settings:**
- Idle Time (10-3600 seconds, default: 120 / 2 minutes)
  - How long to wait before showing screensaver

**Text Settings:**
- Display Text (default: "ECLIPSE")
- Font Size (20-200, default: 80)
- Glow Effect (on/off, default: on)

**Animation Settings:**
- Bounce Speed (50-500, default: 150)

**Color Scheme:**
- Classic DVD (red, green, blue, yellow, pink, cyan, purple, orange)
- Pastel (soft versions)
- Neon (bright electric)
- Monochrome (grayscale)

**Quick Idle Time Suggestions:**
- 30 seconds - Quick test mode
- 120 seconds (2 min) - Default
- 300 seconds (5 min) - Standard
- 600 seconds (10 min) - Longer wait
- 1800 seconds (30 min) - Extended idle

## 💡 How It Works

1. **Idle Detection** - Monitors user inactivity using GNOME's idle monitor
2. **Activation** - After configured idle time, screensaver fades in smoothly
3. **Dismissal** - Any keyboard or mouse activity fades out the screensaver
4. **Auto-restart** - Reactivates after the next idle period

## 🛠️ Development

### Requirements
- GNOME Shell 45 or 46
- GJS (GNOME JavaScript)

### Project Structure
```
Eclipse/
├── metadata.json          # Extension metadata
├── extension.js           # Main extension code
├── prefs.js              # Settings UI
├── stylesheet.css        # Styling
├── schemas/              # GSettings schemas
│   └── org.gnome.shell.extensions.eclipse-dvd.gschema.xml
└── README.md             # This file
```

### Testing
```bash
# View logs
journalctl -f -o cat /usr/bin/gnome-shell

# Reload extension (X11 only)
gnome-extensions disable eclipse-dvd-screensaver@sudoyasir.github.com
gnome-extensions enable eclipse-dvd-screensaver@sudoyasir.github.com
```

## 📝 Uninstallation

```bash
gnome-extensions disable eclipse-dvd-screensaver@sudoyasir.github.com
rm -rf ~/.local/share/gnome-shell/extensions/eclipse-dvd-screensaver@sudoyasir.github.com
```

## 🐛 Troubleshooting

**Extension doesn't show up:**
- Make sure you copied all files correctly
- Check that the schema is compiled
- Restart GNOME Shell

**Settings don't open:**
- Verify schema compilation: `ls ~/.local/share/gnome-shell/extensions/eclipse-dvd-screensaver@sudoyasir.github.com/schemas/gschemas.compiled`
- Recompile if missing: `glib-compile-schemas schemas/`

**Screensaver doesn't appear:**
- Wait for the configured idle time (default 120 seconds)
- Check GNOME Shell logs: `journalctl -f -o cat /usr/bin/gnome-shell | grep Eclipse`
- Verify extension is enabled: `gnome-extensions list --enabled`
- Try setting a shorter idle time (e.g., 10 seconds) for testing

**Screensaver won't dismiss:**
- Try pressing any key or clicking the mouse
- If stuck, press Ctrl+Alt+F2 to switch to TTY and back with Ctrl+Alt+F1
- Check logs for errors

**"IdleMonitor.get_core is not a function" error:**
- This has been fixed - reinstall the extension:
  ```bash
  ./uninstall.sh
  ./install.sh
  ```
- Restart GNOME Shell after reinstalling

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Credits

Inspired by the classic DVD logo screensaver.

---

Enjoy! 🎬
