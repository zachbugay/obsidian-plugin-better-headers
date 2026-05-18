export type BetterHeading = {
  lineIndex: number;
  mdHeading: string;
  prefix: string;
  title: string;
  length: number;
};

export const HEADING_REGEX: RegExp = /(?<mdHeading>^#+\s+)(?<prefix>(?:\d+\.)+\s+)*(?<title>.*$)/;

class BetterHeadingClass {
  lineIndex: number;
  mdHeading: string;
  prefix: string;
  title: string;
  length: number;

  constructor() {
    this.lineIndex = -1;
    this.mdHeading = "";
    this.prefix = "";
    this.title = "";
    this.length = -1;
  }
}
