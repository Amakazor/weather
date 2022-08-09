import {RequestErrorHandler} from "./request-error-handler";
import {ZodError, ZodIssue} from "zod";

describe("Request error handler", () => {
  it('should handle generic error', () => {
    const {errorMessages, code} = RequestErrorHandler.handleError(new Error());
    expect(errorMessages).toEqual(["Unknown server error"]);
    expect(code).toEqual(500);
  });

  it('should handle error with a message', () => {
    const {errorMessages, code} = RequestErrorHandler.handleError(new Error("error message"));
    expect(errorMessages).toEqual(["Server error: error message"]);
    expect(code).toEqual(500);
  });

  it('should handle zod error with a message', () => {
    const {errorMessages, code} = RequestErrorHandler.handleError(new ZodError([{
      path: ["path"],
      message: "error message",
      code: "invalid_type",
      expected: "number",
      received: "undefined"
    }]));
    expect(errorMessages).toEqual(["Server error: response field 'path' is malformed"]);
    expect(code).toEqual(500);
  });

  it('should handle zod error as a query parameter error when provided appropriate predicate', () => {
    const predicate = (issue: ZodIssue) => issue.path.join("") === "path";

    const {errorMessages, code} = RequestErrorHandler.handleError(new ZodError([{
      path: ["path"],
      message: "error message",
      code: "invalid_type",
      expected: "number",
      received: "undefined"
    }]), predicate);

    const {errorMessages: errorMessages2, code: code2} = RequestErrorHandler.handleError(new ZodError([{
      path: ["path2"],
      message: "error message",
      code: "invalid_type",
      expected: "number",
      received: "undefined"
    }]), predicate);

    expect(errorMessages).toEqual(["Request error: required query parameter 'path' is malformed"]);
    expect(code).toEqual(405);

    expect(errorMessages2).toEqual(["Server error: response field 'path2' is malformed"]);
    expect(code2).toEqual(500);
  });
})