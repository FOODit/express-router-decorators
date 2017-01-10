"use strict";
const express = require("express");
const promise_response_wrapper_1 = require("./promise-response/promise-response.wrapper");
const router_registry_1 = require("./router.registry");
const router_creator_1 = require("./router.creator");
function createRouter(classInstance, options) {
    const promiseResponseWrapper = new promise_response_wrapper_1.PromiseResponseWrapper();
    if (options && options.log) {
        promiseResponseWrapper.setLogger(options.log);
    }
    const creator = new router_creator_1.RouterCreator(() => express.Router(), router_registry_1.RouterRegistry.getInstance(), promiseResponseWrapper);
    return creator.createRouter(classInstance);
}
exports.createRouter = createRouter;
