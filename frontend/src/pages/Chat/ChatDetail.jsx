import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import Layout from '../../components/Layout/Layout';
import MessageBubble from '../../components/Chat/MessageBubble';
import MoodEnergySelector from '../../components/Chat/MoodEnergySelector';
import FeelingLabelInput from '../../components/Chat/FeelingLabelInput';
import Button from '../../components/Common/Button';
import Loading from '../../components/Common/Loading';

const ChatDetail = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getChatById, getMessages, sendMessage, closeChat, loading } = useChat();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [feelingLabels, setFeelingLabels] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId && isAuthenticated) {
      loadChat();
      loadMessages();
    }
  }, [chatId, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChat = async () => {
    const result = await getChatById(chatId);
    if (result.success) {
      setChat(result.data);
    }
  };

  const loadMessages = async () => {
    const result = await getMessages(chatId);
    if (result.success) {
      setMessages(result.data);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || chat?.closed_at) return;

    const messageContent = content.trim();
    setContent('');

    // Add user message to UI immediately
    const userMessage = {
      _id: `temp-${Date.now()}`,
      sender: 'user',
      content: messageContent,
      mood,
      energy,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const result = await sendMessage(chatId, messageContent, mood, energy, feelingLabels);

    if (result.success) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== userMessage._id);
        return [...filtered, result.data.user_message];
      });

      if (result.data.tree_message) {
        setMessages((prev) => [...prev, result.data.tree_message]);
      }

      // Reload chat to update message count
      loadChat();
    } else {
      setMessages((prev) => prev.filter((m) => m._id !== userMessage._id));
      alert(result.error || 'Failed to send message');
    }

    setMood(null);
    setEnergy(null);
    setFeelingLabels([]);
  };

  const handleCloseChat = async () => {
    if (window.confirm('Are you sure you want to close this conversation? You won’t be able to send new messages afterward.')) {
      const result = await closeChat(chatId);
      if (result.success) {
        loadChat();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in to view this conversation</p>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  if (loading && !chat) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-800">Conversation Details</h1>
          <div className="flex space-x-2">
            {chat && !chat.closed_at && (
              <Button variant="secondary" onClick={handleCloseChat}>
                Close conversation
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/chats')}>
              Back to list
            </Button>
          </div>
        </div>

        {chat?.closed_at && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600">
            This conversation is closed
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <Loading message="Loading messages..." />
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message._id || message.message_id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {!chat?.closed_at && (
            <form onSubmit={handleSendMessage}>
              <MoodEnergySelector
                mood={mood}
                energy={energy}
                onMoodChange={setMood}
                onEnergyChange={setEnergy}
              />

              <FeelingLabelInput
                labels={feelingLabels}
                onChange={setFeelingLabels}
              />

              <div className="flex space-x-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <Button type="submit" disabled={loading || !content.trim()}>
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatDetail;

