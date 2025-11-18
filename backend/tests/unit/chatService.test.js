import { describe, it, expect } from '@jest/globals';
import {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
} from '../../services/chatService.js';

describe('chatService', () => {
  it('should expose createChat function', () => {
    expect(typeof createChat).toBe('function');
  });

  it('should expose getUserChats function', () => {
    expect(typeof getUserChats).toBe('function');
  });

  it('should expose getChatById function', () => {
    expect(typeof getChatById).toBe('function');
  });

  it('should expose updateChat function', () => {
    expect(typeof updateChat).toBe('function');
  });

  it('should expose deleteChat function', () => {
    expect(typeof deleteChat).toBe('function');
  });
});

