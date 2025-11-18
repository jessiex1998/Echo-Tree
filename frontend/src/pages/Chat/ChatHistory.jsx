import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import Layout from '../../components/Layout/Layout';
import ChatCard from '../../components/Chat/ChatCard';
import Button from '../../components/Common/Button';
import Loading from '../../components/Common/Loading';
import EmptyState from '../../components/Common/EmptyState';

const ChatHistory = () => {
  const { isAuthenticated } = useAuth();
  const { getChats, loading } = useChat();
  const [chats, setChats] = useState([]);
  const [filters, setFilters] = useState({ status: 'all' });
  const [pagination, setPagination] = useState({ limit: 20, offset: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated, filters, pagination]);

  const loadChats = async () => {
    const result = await getChats(filters, pagination);
    if (result.success) {
      setChats(result.data);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your chat history</p>
          <Button onClick={() => window.location.href = '/login'}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-800">My conversations</h1>
          <Link to="/chats/new">
            <Button>New conversation</Button>
          </Link>
        </div>

        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setFilters({ ...filters, status: 'all' })}
            className={`px-4 py-2 rounded-lg ${
              filters.status === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'open' })}
            className={`px-4 py-2 rounded-lg ${
              filters.status === 'open'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'closed' })}
            className={`px-4 py-2 rounded-lg ${
              filters.status === 'closed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Closed
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : chats.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations yet"
            message="Start your first chat and share your thoughts with the Echo Tree."
            action={
              <Link to="/chats/new">
                <Button>Start a new chat</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat) => (
              <ChatCard key={chat._id || chat.chat_id} chat={chat} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatHistory;

