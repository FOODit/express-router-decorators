import {expect} from 'chai';
import * as sinon from 'sinon';

import {matchClass} from '../../util';
import {RouterRegistry} from '../../../lib/router.registry';
import {AuthenticatedWith, authenticateWith} from '../../../lib/middleware/authenticated-with.decorator';

describe('@AuthenticatedWith decorator', () => {
  let registry: any,
    getInstanceStub: Sinon.SinonStub;

  beforeEach(() => {
    registry = {
      addMiddleware: sinon.stub()
    };

    getInstanceStub = sinon.stub(RouterRegistry, 'getInstance');
    getInstanceStub.returns(registry);
  });

  afterEach(() => getInstanceStub.restore());

  it('should add an entry to the registry when added to a method', () => {
    class ClassWithParsedMethods {

      @AuthenticatedWith(null)
      public parsedMethod(): void {
      }
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', authenticateWith);
  });

  it('should add an entry to the registry when added to a property', () => {
    class ClassWithParsedProperties {
      @AuthenticatedWith(null)
      public parsedProperty: any;
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'parsedProperty', authenticateWith);
  });

  // TODO tests that it throws 401 on failed auth
});
