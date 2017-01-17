"use strict";
const middleware_decorator_1 = require("../middleware.decorator");
exports.authenticateWith = (isAuthenticated) => (req, res, next) => {
    const isAuthenticatedValue = isAuthenticated(req);
    let isAuthenticatedPromise;
    if (typeof isAuthenticatedValue === 'object' && typeof isAuthenticatedValue.then === 'function') {
        isAuthenticatedPromise = isAuthenticatedValue;
    }
    else {
        isAuthenticatedPromise = Promise.resolve(!!isAuthenticatedValue);
    }
    isAuthenticatedPromise.then((success) => {
        if (success) {
            next();
        }
        else {
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
function AuthenticatedWith(isAuthenticated) {
    return middleware_decorator_1.Middleware(exports.authenticateWith(isAuthenticated));
}
exports.AuthenticatedWith = AuthenticatedWith;
