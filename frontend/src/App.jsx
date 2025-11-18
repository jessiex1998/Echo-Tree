import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NewChat from './pages/Chat/NewChat';
import ChatHistory from './pages/Chat/ChatHistory';
import ChatDetail from './pages/Chat/ChatDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-calm-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chats" element={<ChatHistory />} />
            <Route path="/chats/new" element={<NewChat />} />
            <Route path="/chats/:chatId" element={<ChatDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

