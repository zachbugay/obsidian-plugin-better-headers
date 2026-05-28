import { describe, expect, test } from "vitest";
import { getHeadingPrefix } from "../src/headingCreator";

describe("Better Heading Creator with proper markdown antics.", () => {
  test("An input of [] returns []", () => {
    const input: string[] = [];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject([]);
  });

  test("An input of ['##'] returns ['1.']", () => {
    const input: string[] = ["##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1."]);
  });

  test("An input of ['##', '###'] returns ['1.', '1.1.']", () => {
    const input: string[] = ["##", "###"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1."]);
  });

  test("An input of ['##', '###', '####' ] returns ['1.', '1.1.', '1.1.1.']", () => {
    const input: string[] = ["##", "###", "####"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "1.1.1."]);
  });

  test("An input of ['##', '##'] returns ['1.', '2.']", () => {
    const input: string[] = ["##", "##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "2."]);
  });

  test("An input of ['##', '###', '##'] returns ['1.', '1.1.', '2.']", () => {
    const input: string[] = ["##", "###", "##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "2."]);
  });

  test("An input of ['##', '###', '####', '##'] returns ['1.', '1.1.', '1.1.1.', '2.']", () => {
    const input: string[] = ["##", "###", "####", "##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "1.1.1.", "2."]);
  });

  test(
    "An input of  ['##', '###', '####', '##', '###', '####', '##'] \
  returns ['1.', '1.1.', '1.1.1.', '2.', '2.1', '2.1.1', '3.']",
    () => {
      const input: string[] = ["##", "###", "####", "##", "###", "####", "##"];
      const output = getHeadingPrefix(input);
      expect(output).toMatchObject(["1.", "1.1.", "1.1.1.", "2.", "2.1.", "2.1.1.", "3."]);
    },
  );

  test("An input of ['##', '###', '###', '##'] returns ['1.', '1.1', '1.2', '2.']", () => {
    const input: string[] = ["##", "###", "###", "##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "1.2.", "2."]);
  });
});

describe("Better Heading starting with a title", () => {
  test("An input of ['#', '##', '###', '####', '##', '#'] returns ['1.', '1.1', '1.1.1.', '1.1.1.1.', '1.2.', '2.']", () => {
    const input: string[] = ["#", "##", "###", "####", "##", "#"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "1.1.1.", "1.1.1.1.", "1.2.", "2."]);
  });

  test("An input of ['#', '##', '###', '#', '##', '##'] returns ['1.', '1.1', '1.1.1.', '2.', '2.1', '2.2']", () => {
    const input: string[] = ["#", "##", "###", "#", "##", "##"];
    const output = getHeadingPrefix(input);
    expect(output).toMatchObject(["1.", "1.1.", "1.1.1.", "2.", "2.1.", "2.2."]);
  });
});

describe("Performance testing", () => {
  test("Performance test: 5,000 headings.", () => {
    const target = 5000;
    const input: Array<string> = [];
    for (let i = 0; i < target; i++) {
      input.push("#");
    }
    const output = getHeadingPrefix(input);
    expect(output.length).toBe(target);
  });
});
