import { AppService } from './app.service';

describe('AppService', () => {
  it('getHello should return Hello World!', () => {
    const service = new AppService();
    expect(service.getHello()).toBe('Hello World!');
  });
});
