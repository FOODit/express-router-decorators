import * as express from 'express';

import {Middleware} from '../middleware.decorator';

export const authenticateWith = (isAuthenticated: (req: express.Request) => boolean | Promise<boolean>): express.RequestHandler =>
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const isAuthenticatedValue = isAuthenticated(req);
    let isAuthenticatedPromise: Promise<boolean>;
    if (typeof isAuthenticatedValue === 'object' && typeof isAuthenticatedValue.then === 'function') {
      isAuthenticatedPromise = isAuthenticatedValue;
    } else {
      isAuthenticatedPromise = Promise.resolve(!!isAuthenticatedValue);
    }
    isAuthenticatedPromise.then((success: boolean) => {
      if (success) {
        next();
      } else {
        res.status(401).send('Unauthenticated').end();
      }
    }).catch(() => {
      res.status(401).send('Unauthenticated').end();
    });
  };

/**
 * Method decorator for authenticating a request. Will call the given callback, and if that returns false, will fail with 401.
 * Usage:
 * <pre><code>
 *   @Get('/')
 *   @AuthenticatedWith(callback)
 *   public getRoot(req: express.Request, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
export function AuthenticatedWith(isAuthenticated: (req: express.Request) => boolean | Promise<boolean>): MethodDecorator & PropertyDecorator {
  return Middleware(authenticateWith(isAuthenticated));
}
