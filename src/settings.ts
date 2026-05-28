import { App, PluginSettingTab, Setting } from "obsidian";
import BetterHeadingPlugin from "./main";

export const HEADING_REGEX: RegExp = /^(?<mdHeading>#+)\s+(?:(?<prefix>(?:\d+\.)+)\s+)?(?<title>.*$)/;

export interface BetterHeadingSettings {
  useBetterHeading: boolean;
  startWithHeadingLevel1: boolean;
}

export const DEFAULT_SETTINGS: BetterHeadingSettings = {
  useBetterHeading: true,
  startWithHeadingLevel1: false,
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
          .onChange(async (value: boolean) => {
            this.plugin.settings.useBetterHeading = value;
            await this.plugin.saveSettings();
            this.plugin.reconfigureSettings();
          })
      );

    new Setting(containerEl)
      .setName("Start heading count at heading 1")
      .setDesc(
        "Whether or not to use heading level 1 (#) as a start for your headings. (It is recommended to keep this set to false.)",
      )
      .addToggle(component =>
        component.setValue(this.plugin.settings.startWithHeadingLevel1)
          .onChange(async (value: boolean) => {
            this.plugin.settings.startWithHeadingLevel1 = value;
            await this.plugin.saveSettings();
            this.plugin.reconfigureSettings();
          })
      );
  }
}
