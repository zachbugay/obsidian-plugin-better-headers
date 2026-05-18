import { enableMapSet, produce } from "immer";

enableMapSet();

/*
 * Given an array of markdown headings, return a corresponding array of Decimal System Headings.
 */
export const getHeadingPrefix = (mdHeadings: string[]): string[] => {
  type Result = {
    headingCounts: Map<string, string>;
    headings: string[];
  };

  const initialValue: Result = {
    headingCounts: new Map<string, string>(),
    headings: [],
  };

  const result: Result = mdHeadings.reduce((accumulator, currentMdHeading, index, array: string[]) => {
    // The very first heading is always "1."
    if (index === 0) {
      const result: Result = produce(accumulator, (draftState: Result) => {
        const value = "1.";
        draftState.headingCounts.set(currentMdHeading, value);
        draftState.headings.push(value);
      });
      return result;
    }
    // Keep track of the previously processed heading.
    const prevMdHeading: string = array[index - 1]!;
    // When the length of the current heading is greater than the length of the previous heading
    // we return a new result, adding the newly formatted heading, which is simply the previous with .1 appended.
    if (currentMdHeading.length > prevMdHeading!.length) {
      const newFormattedHeading = accumulator.headingCounts.get(prevMdHeading) + "1.";
      return produce(accumulator, draftState => {
        draftState.headingCounts.set(currentMdHeading, newFormattedHeading);
        draftState.headings.push(newFormattedHeading);
      });
    }

    // We need to remove all headings from the map that are greater than the length of the current heading.
    const interimAccumulator = [...accumulator.headingCounts.keys()].reduceRight((accumulator, lastMdHeading) => {
      if (lastMdHeading.length > currentMdHeading.length) {
        return produce(accumulator, draftState => {
          draftState.headingCounts.delete(lastMdHeading);
        });
      }
      return accumulator;
    }, accumulator);

    const previousFormattedHeading = interimAccumulator.headingCounts.get(currentMdHeading)!;
    // An array of values, without the trailing "".
    const headingParts = previousFormattedHeading.split(".").slice(0, -1);
    // The last heading, converted to a number, and incremented by 1.
    const newHeadingValue = Number(headingParts[headingParts.length - 1]) + 1;
    return produce(interimAccumulator, (draftState: Result) => {
      // An array of values, stripping the last heading value, and adding the new heading value.
      const tmp = headingParts.slice(0, -1);
      tmp.push(`${newHeadingValue}`);
      const final = `${tmp.join(".")}.`; // Create a final string, joining all values with a ".".
      draftState.headings.push(final);
      draftState.headingCounts.set(currentMdHeading, final);
    });
  }, initialValue);

  // Simply return the headings string.
  return result.headings;
};
