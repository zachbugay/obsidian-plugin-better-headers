import { expect, test } from "vitest";
import { getHeadingPrefix } from "../src/headingCreator";

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

test("Performance test.... Super large heading...", () => {
  const target = 100;
  const input: Array<string> = [];
  for (let i = 0; i < target; i++) {
    input.push("#");
  }
  const output = getHeadingPrefix(input);
  expect(output.length).toBe(target);
});
