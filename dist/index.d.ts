import * as express from 'express';

export type PathArgument = string | RegExp | (string | RegExp)[];

export enum UseType {
  MIDDLEWARE_FUNCTION,
  GETTER,
  ROUTER
}

interface Logger {
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
}

export function createRouter(classInstance: any, options?: {
  log?: Logger
}): express.Router;

export function Use(pathOrType?: PathArgument | UseType, useType?: UseType): PropertyDecorator & MethodDecorator;

export function Get(path: PathArgument): MethodDecorator;
export function Post(path: PathArgument): MethodDecorator;
export function Put(path: PathArgument): MethodDecorator;
export function Patch(path: PathArgument): MethodDecorator;
export function Delete(path: PathArgument): MethodDecorator;
export function Options(path: PathArgument): MethodDecorator;

// Middleware
export function Middleware(middleware: express.RequestHandler): MethodDecorator & PropertyDecorator;
export function AuthenticatedWith(isAuthenticated: (req: express.Request) => boolean): MethodDecorator & PropertyDecorator;
export function BodyParsed(): MethodDecorator & PropertyDecorator;

type ResponseBody = string | {};

export interface Response {
  responseCode: number;
  body?: ResponseBody;
}

export const Response: {
  success(responseCode?: number): Response;
  success(body?: ResponseBody, responseCode?: number): Response;

  error(responseCode?: number): Response;
  error(error?: ResponseBody, responseCode?: number): Response;

  resolve(responseCode?: number): Promise<Response>;
  resolve(body?: ResponseBody, responseCode?: number): Promise<Response>;

  reject<T>(responseCode?: number): Promise<T>;
  reject<T>(error?: ResponseBody, responseCode?: number): Promise<T>;
};
