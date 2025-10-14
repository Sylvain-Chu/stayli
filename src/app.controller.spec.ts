import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('constructs and exposes home()', () => {
    const svc = {
      getHello: jest.fn<ReturnType<AppService['getHello']>, []>(),
    } as unknown as AppService;
    const controller = new AppController(svc);
    // home has no return, just ensure it is callable
    expect(controller.home()).toBeUndefined();
    expect(typeof controller.home).toBe('function');
  });
});
