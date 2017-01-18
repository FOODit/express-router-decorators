import {expect} from 'chai';
import * as sinon from 'sinon';

import {PromiseResponseWrapper} from '../../../lib/promise-response/promise-response.wrapper';
import {Response} from '../../../lib/promise-response/response';

describe('PromiseResponseWrapper', () => {
  let middleware: (req: any, res: any, next: () => void) => void,
    handler: Sinon.SinonStub,
    log: any,
    req: any,
    res: any,
    next: any;

  function expectResponseNotToHaveBeenTouched(): void {
    expect(res.status).not.to.have.been.called;
    expect(res.end).not.to.have.been.called;
    expectNoContentToHaveBeenSent();
  }

  function expectNoContentToHaveBeenSent(): void {
    expect(res.send).not.to.have.been.called;
    expect(res.json).not.to.have.been.called;
  }

  function waitForResponseEnd(): Promise<void> {
    if (res.end.calledOnce) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      res.end = sinon.spy(() => {
        resolve();
      });
    });
  }

  beforeEach(() => {
    log = {
      warn: sinon.stub(),
      error: sinon.stub()
    };
    handler = sinon.stub();
    req = { url: 'incoming' }; // Content is irrelevant, this is a placeholder
    res = {};
    res.status = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.end = sinon.stub();
    next = sinon.stub();

    const factory = new PromiseResponseWrapper();
    factory.setLogger(log);

    middleware = factory.wrap(handler);
  });

  it('should call the handler with res, req, and next when the middleware is called', () => {
    // Code under test
    middleware(req, res, next);

    expect(handler).to.have.been.calledOnce;
    expect(handler).to.have.been.calledWithExactly(req, res, next);
  });

  it('should not call next() if the handler returns void', () => {
    handler.returns(undefined);

    middleware(req, res, next);

    expect(next).not.to.have.been.called;
    expectResponseNotToHaveBeenTouched();
  });

  it('should not call next() or send a response if the handler returns a string value', () => {
    handler.returns('foobar');

    middleware(req, res, next);

    expect(next).not.to.have.been.called;
    expectResponseNotToHaveBeenTouched();
  });

  it('should not call next() or send a response if the handler returns a non-promise object', () => {
    handler.returns({
      error: 'foo'
    });

    middleware(req, res, next);

    expect(next).not.to.have.been.called;
    expectResponseNotToHaveBeenTouched();
  });

  it('should send the response content as JSON when the handler returns a successful Response promise with an object', () => {
    const response = {
      content: 'foo'
    };
    handler.returns(Response.resolve(response));

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(res.status).to.have.been.calledWithExactly(200);
        expect(res.json).to.have.been.calledWithExactly(response);
      });
  });

  it('should send the response content as a string when the handler returns a successful Response promise with a string', () => {
    const response = 'response message';
    handler.returns(Response.resolve(response));

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(res.status).to.have.been.calledWithExactly(200);
        expect(res.send).to.have.been.calledWithExactly(response);
      });
  });

  it('should log a warning and return 500 if the response is a promise with a non-Response object', () => {
    const response = {
      content: 'hello world'
    };
    handler.returns(Promise.resolve(response));

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(log.warn).to.have.been.called;
        expect(res.status).to.have.been.calledWithExactly(500);
        expectNoContentToHaveBeenSent();
      });
  });

  it('should send the response content as JSON with the given error code when the handler returns a failed Response promise with an object', () => {
    const errorObject = {
      message: 'You are not logged in'
    };
    handler.returns(Response.reject(errorObject, 401));

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(res.status).to.have.been.calledWithExactly(401);
        expect(res.json).to.have.been.calledWithExactly(errorObject);
      });
  });

  it('should send the response content as a string when the handler returns a failed Response promise with a string', () => {
    const response = 'response message';
    handler.returns(Response.reject(response, 400));

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(res.status).to.have.been.calledWithExactly(400);
        expect(res.send).to.have.been.calledWithExactly(response);
      });
  });

  it('should log an error with the original URL and return 500 if the response is a failed promise with a non-Response error', () => {
    const error = new Error('Something went wrong');
    handler.returns(Promise.reject(error));
    const url = '/foo/bar';
    req.originalUrl = url;

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(log.error).to.have.been.calledOnce;
        expect(log.error.firstCall.args).to.contain(url);
        expect(log.error.firstCall.args).to.contain(error);
        expect(res.status).to.have.been.calledWithExactly(500);
        expectNoContentToHaveBeenSent();
      });
  });

  it('should log an error with the original URL and return 500 if the handler itself throws an error', () => {
    const error = new Error('Something went wrong');
    handler.throws(error);
    const url = '/foo/bar';
    req.originalUrl = url;

    middleware(req, res, next);

    return waitForResponseEnd()
      .then(() => {
        expect(log.error).to.have.been.calledOnce;
        expect(log.error.firstCall.args).to.contain(url);
        expect(log.error.firstCall.args).to.contain(error);
        expect(res.status).to.have.been.calledWithExactly(500);
        expectNoContentToHaveBeenSent();
      });
  });
});
