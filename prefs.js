import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class EclipseDVDPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        // Create a preferences page
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);
        
        // Display Mode Group
        const modeGroup = new Adw.PreferencesGroup({
            title: 'Display Mode',
            description: 'Choose what to display',
        });
        page.add(modeGroup);
        
        // Display Mode ComboRow
        const displayModeRow = new Adw.ComboRow({
            title: 'Mode',
            subtitle: 'Show custom text or digital clock',
            model: new Gtk.StringList({
                strings: ['Custom Text', 'Digital Clock'],
            }),
        });
        
        const modes = ['text', 'clock'];
        const currentMode = settings.get_string('display-mode');
        displayModeRow.set_selected(modes.indexOf(currentMode));
        
        displayModeRow.connect('notify::selected', () => {
            const index = displayModeRow.get_selected();
            settings.set_string('display-mode', modes[index]);
        });
        
        modeGroup.add(displayModeRow);
        
        // Text Settings Group
        const textGroup = new Adw.PreferencesGroup({
            title: 'Text Settings',
            description: 'Customize the bouncing text (only applies in Text mode)',
        });
        page.add(textGroup);
        
        // Display Text Entry
        const textRow = new Adw.EntryRow({
            title: 'Display Text',
            text: settings.get_string('display-text'),
        });
        textRow.connect('changed', () => {
            settings.set_string('display-text', textRow.text);
        });
        textGroup.add(textRow);
        
        // Font Size
        const fontSizeRow = new Adw.ActionRow({
            title: 'Font Size',
            subtitle: 'Size of the bouncing text (20-200)',
        });
        const fontSizeSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 20,
                upper: 200,
                step_increment: 5,
                value: settings.get_int('font-size'),
            }),
            valign: Gtk.Align.CENTER,
        });
        fontSizeSpinButton.connect('value-changed', () => {
            settings.set_int('font-size', fontSizeSpinButton.get_value_as_int());
        });
        fontSizeRow.add_suffix(fontSizeSpinButton);
        fontSizeRow.activatable_widget = fontSizeSpinButton;
        textGroup.add(fontSizeRow);
        
        // Glow Effect Toggle
        const glowRow = new Adw.ActionRow({
            title: 'Glow Effect',
            subtitle: 'Add a retro glow around the text',
        });
        const glowSwitch = new Gtk.Switch({
            active: settings.get_boolean('show-glow'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('show-glow', glowSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        glowRow.add_suffix(glowSwitch);
        glowRow.activatable_widget = glowSwitch;
        textGroup.add(glowRow);
        
        // Clock Settings Group
        const clockGroup = new Adw.PreferencesGroup({
            title: 'Clock Settings',
            description: 'Customize the digital clock (only applies in Clock mode)',
        });
        page.add(clockGroup);
        
        // Clock Format ComboRow
        const clockFormatRow = new Adw.ComboRow({
            title: 'Time Format',
            subtitle: 'Choose 24-hour or 12-hour (AM/PM) format',
            model: new Gtk.StringList({
                strings: ['24-Hour', '12-Hour (AM/PM)'],
            }),
        });
        
        const formats = ['24h', '12h'];
        const currentFormat = settings.get_string('clock-format');
        clockFormatRow.set_selected(formats.indexOf(currentFormat));
        
        clockFormatRow.connect('notify::selected', () => {
            const index = clockFormatRow.get_selected();
            settings.set_string('clock-format', formats[index]);
        });
        
        clockGroup.add(clockFormatRow);
        
        // Show Seconds Toggle
        const secondsRow = new Adw.ActionRow({
            title: 'Show Seconds',
            subtitle: 'Display seconds in the clock',
        });
        const secondsSwitch = new Gtk.Switch({
            active: settings.get_boolean('show-seconds'),
            valign: Gtk.Align.CENTER,
        });
        settings.bind('show-seconds', secondsSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
        secondsRow.add_suffix(secondsSwitch);
        secondsRow.activatable_widget = secondsSwitch;
        clockGroup.add(secondsRow);
        
        // Screensaver Settings Group
        const screensaverGroup = new Adw.PreferencesGroup({
            title: 'Screensaver Settings',
            description: 'Configure when the screensaver activates',
        });
        page.add(screensaverGroup);
        
        // Idle Time
        const idleRow = new Adw.ActionRow({
            title: 'Idle Time',
            subtitle: 'Seconds of inactivity before screensaver shows (10-3600)',
        });
        const idleSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 3600,
                step_increment: 10,
                value: settings.get_int('idle-time'),
            }),
            valign: Gtk.Align.CENTER,
        });
        idleSpinButton.connect('value-changed', () => {
            settings.set_int('idle-time', idleSpinButton.get_value_as_int());
        });
        idleRow.add_suffix(idleSpinButton);
        idleRow.activatable_widget = idleSpinButton;
        screensaverGroup.add(idleRow);
        
        // Animation Settings Group
        const animGroup = new Adw.PreferencesGroup({
            title: 'Animation Settings',
            description: 'Control the bouncing behavior',
        });
        page.add(animGroup);
        
        // Bounce Speed
        const speedRow = new Adw.ActionRow({
            title: 'Bounce Speed',
            subtitle: 'How fast the text moves (50-500)',
        });
        const speedSpinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 50,
                upper: 500,
                step_increment: 10,
                value: settings.get_int('bounce-speed'),
            }),
            valign: Gtk.Align.CENTER,
        });
        speedSpinButton.connect('value-changed', () => {
            settings.set_int('bounce-speed', speedSpinButton.get_value_as_int());
        });
        speedRow.add_suffix(speedSpinButton);
        speedRow.activatable_widget = speedSpinButton;
        animGroup.add(speedRow);
        
        // Color Scheme Group
        const colorGroup = new Adw.PreferencesGroup({
            title: 'Color Scheme',
            description: 'Choose the color palette',
        });
        page.add(colorGroup);
        
        // Color Scheme ComboRow
        const colorSchemeRow = new Adw.ComboRow({
            title: 'Color Palette',
            subtitle: 'Colors that cycle on edge hits',
            model: new Gtk.StringList({
                strings: ['Classic DVD', 'Pastel', 'Neon', 'Monochrome'],
            }),
        });
        
        const schemes = ['classic', 'pastel', 'neon', 'monochrome'];
        const currentScheme = settings.get_string('color-scheme');
        colorSchemeRow.set_selected(schemes.indexOf(currentScheme));
        
        colorSchemeRow.connect('notify::selected', () => {
            const index = colorSchemeRow.get_selected();
            settings.set_string('color-scheme', schemes[index]);
        });
        
        colorGroup.add(colorSchemeRow);
        
        // About Group
        const aboutGroup = new Adw.PreferencesGroup({
            title: 'About',
        });
        page.add(aboutGroup);
        
        const aboutRow = new Adw.ActionRow({
            title: 'Eclipse DVD Screensaver',
            subtitle: 'Classic DVD-style bouncing text screensaver for GNOME Shell\nActivates after idle time • Any key/mouse dismisses\nVersion 1.0',
        });
        aboutGroup.add(aboutRow);
    }
}
