"use strict";
const middleware_decorator_1 = require("../middleware.decorator");
exports.authenticateWith = (isAuthenticated) => (req, res, next) => {
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
function AuthenticatedWith(isAuthenticated) {
    return middleware_decorator_1.Middleware(exports.authenticateWith(isAuthenticated));
}
exports.AuthenticatedWith = AuthenticatedWith;
