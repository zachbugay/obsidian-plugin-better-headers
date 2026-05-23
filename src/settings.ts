import { App, PluginSettingTab, Setting } from "obsidian";
import BetterHeadingPlugin from "./main";

export interface BetterHeadingSettings {
  useBetterHeading: boolean;
}

export const DEFAULT_SETTINGS: BetterHeadingSettings = {
  useBetterHeading: true,
};

export class BetterSettingsTab extends PluginSettingTab {
  plugin: BetterHeadingPlugin;

  constructor(app: App, plugin: BetterHeadingPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Enable better headings.")
      .setDesc("Enable, or disable the use of the better heading plugin.")
      .addToggle(component =>
        component
          .setValue(this.plugin.settings.useBetterHeading)
          .onChange(async (_: boolean) => {
            this.plugin.settings.useBetterHeading = !this.plugin.settings.useBetterHeading;
            await this.plugin.saveSettings();
          })
      );
  }
}
