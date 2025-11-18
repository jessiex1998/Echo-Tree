import { useState } from 'react';
import api from '../services/api';

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createChat = async (initialMessage = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/chats', {
        initial_message: initialMessage,
      });
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to create chat';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getChats = async (filters = {}, pagination = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        ...pagination,
      };
      const response = await api.get('/chats', { params });
      return { success: true, data: response.data.data, pagination: response.data.pagination };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to load chats';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getChatById = async (chatId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/chats/${chatId}`);
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to load chat';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId, content, mood, energy, feelingLabels = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        content,
        mood,
        energy,
        feeling_labels: feelingLabels,
      });
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to send message';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async (chatId, pagination = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: 50,
        offset: 0,
        sort: 'created_at',
        order: 'asc',
        ...pagination,
      };
      const response = await api.get(`/chats/${chatId}/messages`, { params });
      return { success: true, data: response.data.data, pagination: response.data.pagination };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to load messages';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const closeChat = async (chatId) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/chats/${chatId}`, { closed: true });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to close chat';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createChat,
    getChats,
    getChatById,
    sendMessage,
    getMessages,
    closeChat,
  };
};

