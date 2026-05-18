import {
  EditorState,
  StateEffect,
  StateField,
  Transaction,
} from "@codemirror/state";
import {
  EditorView, Decoration
} from "@codemirror/view";
import {
  App,
  Editor,
  MarkdownFileInfo,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  WorkspaceLeaf,
} from "obsidian";
import {
  DEFAULT_SETTINGS,
  MyPluginSettings,
  SampleSettingTab,
} from "./settings";

// Remember to rename these classes and interfaces!
export default class HelloWorldPlugin extends Plugin {
  settings: MyPluginSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);

    if (view) {
      const editor = view.editor;
      const cursor = editor.getCursor();
      console.log(cursor);
      const num = 0;
    }

    this.registerEditorExtension([
      EditorView.perLineTextDirection.of(true),
      EditorView.decorations.of(Decoration.set(Decoration.line({attributes: {style: "direction: rtl"}}).range(0))),
    ]);

    this.addCommand({
      id: "add-one",
      name: "Add One",
      editorCallback: (editor: Editor, myCtx: MarkdownView | MarkdownFileInfo) => {
        const selection = editor.getSelection();
        console.log("FOO BAR");
        const editorValue = editor.getValue();
        console.log(editorValue);
      },
    });

    this.addCommand({
      id: "insert-todays-date",
      name: "Insert Today's Date",
      editorCallback: (editor: Editor) => {
        const selection = editor.getSelection();
        editor.replaceSelection(selection.toUpperCase());
      },
    });

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: "replace-selected",
      name: "Replace selected content",
      editorCallback: (editor: Editor) => {
        editor.replaceSelection("Sample editor command");
      },
    });

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: "open-modal-complex",
      name: "Open modal (complex)",
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView =
          this.app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new MyModal(this.app).open();
          }

          // This command will only show up in Command Palette when the check function returns true
          return true;
        }
        return false;
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000),
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<MyPluginSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class MyModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("DID YOU RELOAD!");
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

const addEffect = StateEffect.define<number>();
const subtractEffect = StateEffect.define<number>();
const resetEffect = StateEffect.define();

export const calculatorField = StateField.define<number>({
  create(state: EditorState): number {
    return 0;
  },
  update(oldState: number, transaction: Transaction): number {
    let newState = oldState;

    for (let effect of transaction.effects) {
      if (effect.is(addEffect)) {
        newState += effect.value;
      } else if (effect.is(subtractEffect)) {
        newState -= effect.value;
      } else if (effect.is(resetEffect)) {
        newState = 0;
      }
    }
    return 0;
  },
});
