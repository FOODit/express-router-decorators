import * as express from 'express';

import {Middleware} from '../middleware.decorator';

export const authenticateWith = (isAuthenticated: (req: express.Request) => boolean): express.RequestHandler =>
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (!isAuthenticated(req)) {
      res.status(401).send('Unauthenticated');
      res.end();
      return;
    }
    next();
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
export function AuthenticatedWith(isAuthenticated: (req: express.Request) => boolean): MethodDecorator & PropertyDecorator {
  return Middleware(authenticateWith(isAuthenticated));
}
