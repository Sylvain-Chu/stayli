import { I18nController } from './i18n.controller';
import type { Request, Response } from 'express';

describe('I18nController', () => {
  let controller: I18nController;

  beforeEach(() => {
    controller = new I18nController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('setLanguage', () => {
    it('should set language cookie to en and redirect to referer', () => {
      const req = {
        headers: { referer: '/dashboard' },
      } as unknown as Request;

      const cookieFn = jest.fn();
      const redirectFn = jest.fn();
      const res = {
        cookie: cookieFn,
        redirect: redirectFn,
      } as unknown as Response;

      controller.setLanguage('en', '', req, res);

      expect(cookieFn).toHaveBeenCalledWith('lang', 'en', {
        maxAge: 31536000000,
        httpOnly: true,
        sameSite: 'lax',
      });
      expect(redirectFn).toHaveBeenCalledWith('/dashboard');
    });

    it('should set language cookie to fr and redirect to custom redirect', () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const cookieFn = jest.fn();
      const redirectFn = jest.fn();
      const res = {
        cookie: cookieFn,
        redirect: redirectFn,
      } as unknown as Response;

      controller.setLanguage('fr', '/clients', req, res);

      expect(cookieFn).toHaveBeenCalledWith('lang', 'fr', {
        maxAge: 31536000000,
        httpOnly: true,
        sameSite: 'lax',
      });
      expect(redirectFn).toHaveBeenCalledWith('/clients');
    });

    it('should default to /dashboard when no redirect or referer', () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const cookieFn = jest.fn();
      const redirectFn = jest.fn();
      const res = {
        cookie: cookieFn,
        redirect: redirectFn,
      } as unknown as Response;

      controller.setLanguage('en', '', req, res);

      expect(cookieFn).toHaveBeenCalledWith('lang', 'en', {
        maxAge: 31536000000,
        httpOnly: true,
        sameSite: 'lax',
      });
      expect(redirectFn).toHaveBeenCalledWith('/dashboard');
    });

    it('should default to fr when lang is invalid', () => {
      const req = {
        headers: { referer: '/properties' },
      } as unknown as Request;

      const cookieFn = jest.fn();
      const redirectFn = jest.fn();
      const res = {
        cookie: cookieFn,
        redirect: redirectFn,
      } as unknown as Response;

      controller.setLanguage('invalid', '', req, res);

      expect(cookieFn).toHaveBeenCalledWith('lang', 'fr', {
        maxAge: 31536000000,
        httpOnly: true,
        sameSite: 'lax',
      });
      expect(redirectFn).toHaveBeenCalledWith('/properties');
    });
  });
});
