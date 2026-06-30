import {
  enableMapSet as immerEnableMapSet,
  produce as immerProduce,
} from "immer";

// The Obsidian community plugin validator lints with immer's typings collapsed
// to `any`. Cast to the recipe-only overload we rely on so call sites stay
// fully type-checked under that environment.
export const enableMapSet = immerEnableMapSet as () => void;
export const produce = immerProduce as <T>(
  base: T,
  recipe: (draft: T) => void,
) => T;
