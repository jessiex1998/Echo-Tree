import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { FiMessageCircle, FiClock } from 'react-icons/fi';

const ChatCard = ({ chat }) => {
  const isOpen = !chat.closed_at;

  return (
    <Link
      to={`/chats/${chat._id || chat.chat_id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FiMessageCircle className="text-primary-600" />
          <span className={`text-xs px-2 py-1 rounded ${
            isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {format(new Date(chat.start_time), 'yyyy-MM-dd HH:mm', { locale: enUS })}
        </span>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span className="flex items-center space-x-1">
          <FiClock />
          <span>{chat.message_count} messages</span>
        </span>
      </div>
    </Link>
  );
};

export default ChatCard;

