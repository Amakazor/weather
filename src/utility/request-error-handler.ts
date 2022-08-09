import {ZodError, ZodIssue} from "zod";

export class RequestErrorHandler {
  static handleError = (error: any, queryIssuePredicate: (error: ZodIssue) => boolean = () => false) => {
    let statusCode = 500;
    let errorMessages: string[] = [];

    if (error.name === "ZodError") {
      const zError = error as ZodError;

      zError.issues.map(issue => {
        const issuePath = issue.path.join("/");
        const issueMessage = issue.message === "Required" ? "missing" : "malformed";

        if (queryIssuePredicate(issue)) {
          errorMessages.push(`Request error: required query parameter '${issuePath}' is ${issueMessage}`);
          statusCode = 405
        } else {
          errorMessages.push(`Server error: response field '${issuePath}' is ${issueMessage}`);
        }
      })
    } else {
      errorMessages.push(error.message ? `Server error: ${error.message}` : `Unknown server error`)
    }
    errorMessages.forEach(message => console.error(message));
    return {code: statusCode, errorMessages: errorMessages}
  }
}