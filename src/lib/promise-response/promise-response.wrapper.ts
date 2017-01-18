import * as express from 'express';

import {Response} from './response';
import {Logger} from './logger.interface';

class SilentLogger implements Logger {
  public debug(): void {}
  public info(): void {}
  public log(): void {}
  public warn(): void {}
  public error(): void {}
}

/**
 * This class wraps a request handler. Instead of the request handler having to call properties on the Response,
 * it can return a Promise<Response> and this wrapper will return the values.
 */
export class PromiseResponseWrapper {
  private log: Logger = new SilentLogger();

  public setLogger(log: Logger): void {
    this.log = log;
  }

  public wrap(handler: express.RequestHandler): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      let result;
      try {
        result = handler(req, res, next); // Because this is a middleware, not a handler, we pass `next()` in. We will never call it ourselves.
      } catch (err) {
        this.log.error('Uncaught error', req.originalUrl, err);
        res.status(500).end();
      }
      if (!this.isPromise(result)) {
        // If the handler does not return a promise, we assume that it has handled the request successfully.
        return;
      }
      result
        .then((value: Response) => {
          if (value instanceof Response) {
            this.sendResponse(res, value);
          } else {
            this.log.warn('Response not valid:', value);
            res.status(500).end();
          }
        })
        .catch((err: any) => {
          if (err instanceof Response) {
            this.sendResponse(res, err);
          } else {
            this.log.error('Uncaught error', req.originalUrl, err);
            res.status(500).end();
          }
        });
    };
  }

  private sendResponse(res: express.Response, response: Response): void {
    res.status(response.responseCode);
    if (response.body) {
      if (typeof response.body === 'object') {
        res.json(response.body);
      } else {
        res.send(response.body as string);
      }
    }
    res.end();
  }

  /**
   * Simple test to see if something is a promise.
   * We could do `instanceof Promise`, but the simpler solution to ensure cross-compatibility is to see if it's thenable.
   */
  private isPromise(obj: any): boolean {
    if (!obj) {
      return false;
    }
    if (typeof obj !== 'object') {
      return false;
    }
    return typeof obj.then === 'function';
  }
}
