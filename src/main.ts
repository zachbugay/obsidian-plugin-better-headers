import { EditorState, StateEffect, StateField, Transaction } from "@codemirror/state";
import {
  App,
  Editor,
  EditorPosition,
  EditorTransaction,
  MarkdownFileInfo,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
} from "obsidian";
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";

import { produce } from "immer";
import { BetterHeading, HEADING_REGEX } from "./betterHeadings";
import { getHeadingPrefix } from "./headingCreator";
import { MyPlugin } from "./myViewPlugin";

// Remember to rename these classes and interfaces!
export default class HelloWorldPlugin extends Plugin {
  settings: MyPluginSettings = DEFAULT_SETTINGS;
  private counter = 0;

  async onload() {
    await this.loadSettings();

    this.registerEditorExtension([
      calculatorField,
      MyPlugin,
    ]);

    /*
     * Iterate over every single line. Filter. For any line that matches my regex, I am going to have a total count.
     * Keep track of the line numbers, as well. Tiered numbers as indexes for hierarchical headings.
     */
    this.addCommand({
      id: "bulk-my-add-headings",
      name: "Bulk My Add Headings",
      editorCallback(editor: Editor, context: MarkdownView | MarkdownFileInfo) {
        const rawContent: string = editor.getValue();
        const content: string[] = rawContent.split(/\r?\n/);

        const headings: Array<BetterHeading> = content.reduce(
          (accumulator: Array<BetterHeading>, heading: string, index) => {
            const found: RegExpMatchArray | null = heading.match(HEADING_REGEX);
            if (found === null || found.groups === undefined) {
              return accumulator;
            }
            const headingContent = found.groups.mdHeading!.trim();
            const title = found.groups.title!;
            const result: BetterHeading = {
              mdHeading: headingContent.trim(),
              prefix: "",
              lineIndex: index,
              title: title.trim(),
              length: heading.length,
            };
            return produce(accumulator, draftValue => {
              draftValue.push(result);
            });
          },
          new Array<BetterHeading>(),
        );

        // TODO: Can this be cleaned up? I think so.
        const headingsOnly = headings.map(heading => heading.mdHeading);
        const headingResult = getHeadingPrefix(headingsOnly);
        const headingsWithPrefix: Array<BetterHeading> = headings.map((heading, index) => {
          return { ...heading, prefix: headingResult[index]! };
        });

        const tx: EditorTransaction = {
          changes: headingsWithPrefix.map((heading) => {
            const newLine: string = `${heading.mdHeading} ${heading.prefix} ${heading.title}`;
            const lineStart: EditorPosition = { line: heading.lineIndex, ch: 0 };
            const lineEnd: EditorPosition = { line: heading.lineIndex, ch: heading.length };
            return {
              from: lineStart,
              to: lineEnd,
              text: newLine,
            };
          }),
        };

        editor.transaction(tx, "better-headings:bulk-heading-apply");
        new Notice("Applied my heading bulk changes");
      },
    });

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: "open-modal-complex",
      name: "Open modal (complex)",
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
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

    this.addCommand({
      id: "add-one",
      name: "Add one",
      editorCallback: (editor: Editor, _myCtx: MarkdownView | MarkdownFileInfo) => {
        this.applyCounterTransaction(editor, 1);
      },
    });

    this.addCommand({
      id: "subtract-one",
      name: "Subtract one",
      editorCallback: (editor: Editor, _myCtx: MarkdownView | MarkdownFileInfo) => {
        this.applyCounterTransaction(editor, -1);
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
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

  private applyCounterTransaction(editor: Editor, delta: number): void {
    this.counter += delta;

    const from = editor.getCursor("from");
    const to = editor.getCursor("to");
    const text = `[counter=${this.counter}]`;

    const tx: EditorTransaction = {
      changes: [{ from, to, text }],
      selection: {
        from,
        to: { line: from.line, ch: from.ch + text.length },
      },
    };

    editor.transaction(tx, "better-heading:counter");
    new Notice(`Counter is now ${this.counter}`);
  }
}

class MyModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Did you reload!");
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
  create(_state: EditorState): number {
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
    return newState;
  },
});
