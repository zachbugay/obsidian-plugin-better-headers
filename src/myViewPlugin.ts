import { Annotation, Transaction } from "@codemirror/state";
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { HEADING_REGEX } from "./betterHeadings";
import { getHeadingPrefix } from "./headingCreator";

const selfDispatch = Annotation.define<boolean>();

function collectAllHeadingMarkers(content: string): { lineNumber: number; mdHeading: string; }[] {
  const lines = content.split(/\r?\n/);

  const result: { lineNumber: number; mdHeading: string; }[] = lines.reduce(
    (prevValue, line: string, index: number) => {
      const match = line.match(HEADING_REGEX);

      if (match?.groups) {
        prevValue.push({ lineNumber: index + 1, mdHeading: match.groups.mdHeading!.trim() });
      }
      return prevValue;
    },
    new Array<{ lineNumber: number; mdHeading: string; }>(),
  );

  return result;
}

class MyViewPlugin implements PluginValue {
  constructor(view: EditorView) {
    console.log("In MyViewPluginc constructor");
  }

  update(update: ViewUpdate) {
    console.log("in MyViewPlugin update");
  }

  destroy() {
    console.log("in my view plugin destroy");
  }
}

export const MyPlugin = ViewPlugin.fromClass(MyViewPlugin);
