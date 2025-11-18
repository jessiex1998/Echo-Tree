import { describe, it, expect } from '@jest/globals';
import {
  login,
  logout,
  validateSession,
  getAllUserSessions,
  deleteSession,
} from '../../services/authService.js';

describe('authService', () => {
  it('should expose login function', () => {
    expect(typeof login).toBe('function');
  });

  it('should expose logout function', () => {
    expect(typeof logout).toBe('function');
  });

  it('should expose validateSession function', () => {
    expect(typeof validateSession).toBe('function');
  });

  it('should expose getAllUserSessions function', () => {
    expect(typeof getAllUserSessions).toBe('function');
  });

  it('should expose deleteSession function', () => {
    expect(typeof deleteSession).toBe('function');
  });
});

