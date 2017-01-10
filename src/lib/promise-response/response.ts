export type ResponseBody = string | {};

export class Response {
  constructor(
    public responseCode: number,
    public body?: ResponseBody
  ) {}

  public static error(error?: ResponseBody | number, responseCode?: number): Response {
    if (typeof responseCode === 'undefined' && typeof error === 'number') {
      responseCode = error as number;
      error = undefined;
    }
    return new Response(responseCode || 500, error);
  }

  public static success(body?: ResponseBody, responseCode?: number): Response {
    if (typeof responseCode === 'undefined' && typeof body === 'number') {
      responseCode = body as number;
      body = undefined;
    }
    return new Response(responseCode || 200, body);
  }

  public static reject<T>(error?: ResponseBody | number, responseCode?: number): Promise<T> {
    return Promise.reject<T>(Response.error(error, responseCode));
  }

  public static resolve(body?: ResponseBody, responseCode?: number): Promise<Response> {
    return Promise.resolve(Response.success(body, responseCode));
  }
}
