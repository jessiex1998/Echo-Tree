import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { FiUser } from 'react-icons/fi';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const isCrisis = message.flagged_for_crisis;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-100 text-primary-600' : 'bg-calm-100 text-calm-600'
        }`}>
          {isUser ? <FiUser /> : <span className="text-lg">🌳</span>}
        </div>
        <div className={`rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary-100 text-primary-900'
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          {isCrisis && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ This message may indicate someone needs help. If you are in crisis, please contact professional support.
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
            <span>{format(new Date(message.created_at), 'HH:mm', { locale: enUS })}</span>
            {message.mood && (
              <span>Mood: {message.mood}/5</span>
            )}
            {message.energy && (
              <span>Energy: {message.energy}/5</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

