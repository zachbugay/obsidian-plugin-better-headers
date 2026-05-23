import { ChangeSpec, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin } from "obsidian";
import {
  atomicPrefixRanges,
  betterHeadingState,
  generateChanges,
  headingUpdateListener,
  isBetterHeadingUpdate,
  prefixDecorations,
} from "./betterHeadings";
import { BetterHeadingSettings, BetterSettingsTab, DEFAULT_SETTINGS } from "./settings";

export default class BetterHeadingPlugin extends Plugin {
  settings: BetterHeadingSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerEditorExtension([
      betterHeadingState,
      headingUpdateListener,
      atomicPrefixRanges,
      prefixDecorations,
    ]);

    this.addCommand({
      id: "update-all-headings",
      name: "Update all headings.",
      editorCallback(_: Editor, context: MarkdownFileInfo | MarkdownView) {
        // @ts-expect-error, not typed
        const codeMirrorView: EditorView = context.editor!.cm as EditorView;
        const changes: ChangeSpec[] = generateChanges(codeMirrorView.state);
        if (changes.length > 0) {
          codeMirrorView.dispatch({
            changes,
            annotations: [
              isBetterHeadingUpdate.of(true),
              Transaction.addToHistory.of(true),
            ],
          });
        }
        new Notice("Headings updated!");
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new BetterSettingsTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<BetterHeadingSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
