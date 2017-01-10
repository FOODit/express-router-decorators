"use strict";
const decorators_interfaces_1 = require("./decorators.interfaces");
const EMPTY_ANNOTATIONS = {
    middleware: [],
    endpoints: []
};
class RouterRegistry {
    constructor() {
        this.annotationsForAllClasses = [];
    }
    static getInstance() {
        if (!RouterRegistry.instance) {
            RouterRegistry.instance = new RouterRegistry();
        }
        return RouterRegistry.instance;
    }
    getDefinitions(constructor) {
        const constructorAnnotations = this.findAnnotations(constructor) || EMPTY_ANNOTATIONS;
        const prototypeAnnotations = this.findAnnotations(constructor.prototype) || EMPTY_ANNOTATIONS;
        return {
            middleware: [].concat(constructorAnnotations.middleware, prototypeAnnotations.middleware),
            endpoints: [].concat(constructorAnnotations.endpoints, prototypeAnnotations.endpoints)
        };
    }
    addMethod(clazz, methodName, httpVerb, path) {
        const annotations = this.getOrCreateAnnotations(clazz);
        const methodDefinition = {
            httpVerb,
            path,
            methodName
        };
        annotations.endpoints.unshift({
            type: decorators_interfaces_1.EndpointDefinitionType.METHOD,
            definition: methodDefinition
        });
    }
    addUse(clazz, methodOrPropertyName, useType, path) {
        const annotations = this.getOrCreateAnnotations(clazz);
        const useDefinition = {
            propertyName: methodOrPropertyName,
            type: useType
        };
        if (path) {
            useDefinition.path = path;
        }
        annotations.endpoints.unshift({
            type: decorators_interfaces_1.EndpointDefinitionType.USE,
            definition: useDefinition
        });
    }
    addMiddleware(clazz, methodOrPropertyName, middleware) {
        const annotations = this.getOrCreateAnnotations(clazz);
        annotations.middleware.unshift({
            propertyName: methodOrPropertyName,
            middleware
        });
    }
    findAnnotations(clazz) {
        for (let i = 0; i < this.annotationsForAllClasses.length; i++) {
            if (this.annotationsForAllClasses[i].clazz === clazz) {
                return this.annotationsForAllClasses[i].annotations;
            }
        }
        return null;
    }
    getOrCreateAnnotations(clazz) {
        let annotationsForThisClass = this.findAnnotations(clazz);
        if (!annotationsForThisClass) {
            annotationsForThisClass = {
                middleware: [],
                endpoints: []
            };
            this.annotationsForAllClasses.push({
                clazz,
                annotations: annotationsForThisClass
            });
        }
        return annotationsForThisClass;
    }
}
exports.RouterRegistry = RouterRegistry;
