import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import Layout from '../../components/Layout/Layout';
import MessageBubble from '../../components/Chat/MessageBubble';
import MoodEnergySelector from '../../components/Chat/MoodEnergySelector';
import FeelingLabelInput from '../../components/Chat/FeelingLabelInput';
import Button from '../../components/Common/Button';
import Loading from '../../components/Common/Loading';

const NewChat = () => {
  const { isAuthenticated } = useAuth();
  const { createChat, sendMessage, loading, error } = useChat();
  const navigate = useNavigate();

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [feelingLabels, setFeelingLabels] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const messageContent = content.trim();
    setContent('');

    // If no chat exists, create one
    let currentChatId = chatId;
    if (!currentChatId) {
      const chatResult = await createChat();
      if (!chatResult.success) {
        alert(chatResult.error || 'Failed to create chat');
        return;
      }
      currentChatId = chatResult.data._id || chatResult.data.chat_id;
      setChatId(currentChatId);
    }

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

    // Send message to API
    const result = await sendMessage(currentChatId, messageContent, mood, energy, feelingLabels);
    
    if (result.success) {
      // Replace temp message with real one
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== userMessage._id);
        return [...filtered, result.data.user_message];
      });

      // Add tree response if available
      if (result.data.tree_message) {
        setMessages((prev) => [...prev, result.data.tree_message]);
      }
    } else {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m._id !== userMessage._id));
      alert(result.error || 'Failed to send message');
    }

    // Reset form
    setMood(null);
    setEnergy(null);
    setFeelingLabels([]);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in or register to start chatting</p>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-primary-800 mb-6">New Conversation</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌳</div>
                  <p>Start your conversation with the Echo Tree...</p>
                </div>
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

            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewChat;

