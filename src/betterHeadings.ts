import {
  Annotation,
  ChangeSpec,
  EditorState,
  Facet,
  Line,
  Range,
  RangeSet,
  StateField,
  Text,
  Transaction,
} from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { produce } from "immer";
import { getHeadingPrefix } from "./headingCreator";
import { BetterHeadingSettings, DEFAULT_SETTINGS, HEADING_REGEX } from "./settings";

export type BetterHeading = {
  from: number;
  to: number;
  lineIndex: number;
  mdHeading: string;
  prefix: string;
  title: string;
  result: string;
};

export const isBetterHeadingUpdate = Annotation.define<boolean>();

export const betterHeadingState = StateField.define<BetterHeading[]>({
  create(state: EditorState) {
    return regenerateState(state.doc, state);
  },
  update(value: BetterHeading[], transaction: Transaction) {
    const doc = transaction.newDoc;
    return regenerateState(doc, transaction.startState);
  },
});

export const betterHeadingSettingsFacet: Facet<BetterHeadingSettings, BetterHeadingSettings> = Facet.define<
  BetterHeadingSettings,
  BetterHeadingSettings
>({
  combine(values: readonly BetterHeadingSettings[]) {
    return values[0] ?? DEFAULT_SETTINGS;
  },
});

const regenerateState = (doc: Text, state: EditorState): BetterHeading[] => {
  const settings = state.facet(betterHeadingSettingsFacet);
  if (!settings.useBetterHeading) return [];
  const headings = Iterator.from(doc.iterLines()).reduce((accumulator, lineText, index) => {
    const found: RegExpMatchArray | null = lineText.match(HEADING_REGEX);
    if (found === null || found.groups === undefined) return accumulator;
    if (!settings.startWithHeadingLevel1 && index === 0 && found.groups.mdHeading === "#") return accumulator;
    const line: Line = doc.line(index + 1);
    const heading: BetterHeading = {
      from: line.from,
      to: line.to,
      lineIndex: index,
      mdHeading: found.groups.mdHeading!,
      prefix: found.groups.prefix ?? "",
      title: found.groups.title!,
      result: "",
    };

    return produce(accumulator, (draftState) => {
      draftState.push(heading);
    });
  }, [] as BetterHeading[]);

  const mdHeadings: string[] = headings.reduce((accumulator, currentValue, index) => {
    accumulator.push(currentValue.mdHeading);
    return accumulator;
  }, [] as string[]);

  const prefixes: string[] = getHeadingPrefix(mdHeadings);

  return headings.map((heading, index) => {
    const prefix: string = prefixes[index]!;
    const result: string = `${heading.mdHeading} ${prefix} ${heading.title}`;
    return { ...heading, prefix, result };
  });
};

export const generateChanges = (state: EditorState): ChangeSpec[] => {
  const headings: BetterHeading[] = state.field<BetterHeading[]>(betterHeadingState);
  return headings.reduce((accumulator: ChangeSpec[], heading: BetterHeading) => {
    const currentText: string = state.doc.sliceString(heading.from, heading.to);
    if (currentText !== heading.result) {
      return produce(accumulator, (draftState: ChangeSpec[]) => {
        draftState.push({ from: heading.from, to: heading.to, insert: heading.result });
      });
    }
    return accumulator;
  }, []);
};

export const headingUpdateListener = EditorView.updateListener.of((update: ViewUpdate) => {
  if (update.transactions.some(tr => tr.annotation(isBetterHeadingUpdate))) return;
  if (!update.docChanged) return;
  if (!update.transactions.some(tr => tr.isUserEvent("input") || tr.isUserEvent("delete"))) return;

  const changes = generateChanges(update.state);
  if (changes.length === 0) return;

  const state = update.state;
  const cursorPos = update.state.selection.main.head;
  const headings: BetterHeading[] = state.field<BetterHeading[]>(betterHeadingState);

  const cursorHeading = headings.find(h => h.from <= cursorPos && cursorPos <= h.to);

  let newCursorPos: number | undefined;
  if (cursorHeading) {
    newCursorPos = cursorHeading.from + cursorHeading.mdHeading.length + 1 + cursorHeading.prefix.length + 1;
  }

  update.view.dispatch({
    changes,
    ...(newCursorPos !== undefined && { selection: { anchor: newCursorPos } }),
    annotations: [isBetterHeadingUpdate.of(true)],
  });
});

export const atomicPrefixRanges = EditorView.atomicRanges.of((view: EditorView) => {
  const state = view.state;

  const headings: BetterHeading[] = state.field<BetterHeading[]>(betterHeadingState);

  const marks = headings.reduce((accumulator: Range<Decoration>[], heading: BetterHeading) => {
    if (!heading.prefix) return accumulator;
    const prefixStart = heading.from;
    const prefixEnd = heading.from + heading.mdHeading.length + 1 + heading.prefix.length + 1;
    if (prefixEnd <= heading.to + 1) {
      return produce(accumulator, (draftState) => {
        draftState.push(Decoration.mark({ inclusive: true }).range(prefixStart, prefixEnd));
      });
    }
    return accumulator;
  }, []);
  return RangeSet.of(marks, true);
});

export const prefixDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.state);
      }
    }

    private buildDecorations(state: EditorState): DecorationSet {
      const headings = state.field<BetterHeading[]>(betterHeadingState);
      const decorations = headings.reduce((accumulator: Range<Decoration>[], heading: BetterHeading) => {
        if (!heading.prefix) return accumulator;
        const prefixStart = heading.from + heading.mdHeading.length + 1;
        const prefixEnd = prefixStart + heading.prefix.length;
        if (prefixEnd <= heading.to) {
          return produce(accumulator, (draftState) => {
            draftState.push(
              Decoration.mark({ class: "better-heading-prefix", inclusive: true }).range(prefixStart, prefixEnd),
            );
          });
        }
        return accumulator;
      }, []);

      return Decoration.set(decorations, true);
    }
  },
  {
    decorations: (value) => value.decorations,
  },
);
