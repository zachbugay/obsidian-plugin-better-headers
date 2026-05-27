import { ChangeSpec, Compartment, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Editor, MarkdownFileInfo, MarkdownView, Notice, Plugin } from "obsidian";
import {
  atomicPrefixRanges,
  betterHeadingSettingsFacet,
  betterHeadingState,
  generateChanges,
  headingUpdateListener,
  isBetterHeadingUpdate,
  prefixDecorations,
} from "./betterHeadings";
import { BetterHeadingSettings, BetterSettingsTab, DEFAULT_SETTINGS } from "./settings";

export default class BetterHeadingPlugin extends Plugin {
  settings: BetterHeadingSettings = DEFAULT_SETTINGS;

  private regexCompartment = new Compartment();

  async onload() {
    await this.loadSettings();

    this.registerEditorExtension([
      this.regexCompartment.of(betterHeadingSettingsFacet.of(this.settings)),
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

    this.addSettingTab(new BetterSettingsTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    const savedSettings = await this.loadData() as Partial<BetterHeadingSettings>;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, savedSettings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  reconfigureSettings() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        // @ts-expect-error, not typed
        const cm: EditorView = leaf.view.editor.cm as EditorView;
        cm.dispatch({
          effects: this.regexCompartment.reconfigure(
            betterHeadingSettingsFacet.of(this.settings),
          ),
        });
      }
    });
  }
}
