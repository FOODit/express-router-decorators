"use strict";
const response_1 = require("./response");
class SilentLogger {
    debug() { }
    info() { }
    log() { }
    warn() { }
    error() { }
}
/**
 * This class wraps a request handler. Instead of the request handler having to call properties on the Response,
 * it can return a Promise<Response> and this wrapper will return the values.
 */
class PromiseResponseWrapper {
    constructor() {
        this.log = new SilentLogger();
    }
    setLogger(log) {
        this.log = log;
    }
    wrap(handler) {
        return (req, res, next) => {
            let result;
            try {
                result = handler(req, res, next); // Because this is a middleware, not a handler, we pass `next()` in. We will never call it ourselves.
            }
            catch (err) {
                this.log.error('Uncaught error', req.originalUrl, err);
                res.status(500).end();
            }
            if (!this.isPromise(result)) {
                // If the handler does not return a promise, we assume that it has handled the request successfully.
                return;
            }
            result
                .then((value) => {
                if (value instanceof response_1.Response) {
                    this.sendResponse(res, value);
                }
                else {
                    this.log.warn('Response not valid:', value);
                    res.status(500).end();
                }
            })
                .catch((err) => {
                if (err instanceof response_1.Response) {
                    this.sendResponse(res, err);
                }
                else {
                    this.log.error('Uncaught error', req.originalUrl, err);
                    res.status(500).end();
                }
            });
        };
    }
    sendResponse(res, response) {
        res.status(response.responseCode);
        if (response.body) {
            if (typeof response.body === 'object') {
                res.json(response.body);
            }
            else {
                res.send(response.body);
            }
        }
        res.end();
    }
    /**
     * Simple test to see if something is a promise.
     * We could do `instanceof Promise`, but the simpler solution to ensure cross-compatibility is to see if it's thenable.
     */
    isPromise(obj) {
        if (!obj) {
            return false;
        }
        if (typeof obj !== 'object') {
            return false;
        }
        return typeof obj.then === 'function';
    }
}
exports.PromiseResponseWrapper = PromiseResponseWrapper;
