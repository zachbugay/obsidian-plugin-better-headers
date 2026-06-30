import {
  enableMapSet as immerEnableMapSet,
  produce as immerProduce,
} from "immer";

export const enableMapSet: () => void = immerEnableMapSet;
export const produce: <T>(base: T, recipe: (draft: T) => void) => T =
  immerProduce;
