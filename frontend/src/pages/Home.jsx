import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import Button from '../components/Common/Button';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-6xl font-bold text-primary-800 mb-4">
            🌳 Echo Tree
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Talk with the wise Echo Tree, share your thoughts, and receive calming reflections.
          </p>

          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Welcome back, {user?.username}!
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/chats/new">
                  <Button>Start a new chat</Button>
                </Link>
                <Link to="/chats">
                  <Button variant="secondary">View chat history</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="calm">Sign up</Button>
              </Link>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="font-semibold text-lg mb-2">Private conversations</h3>
              <p className="text-gray-600 text-sm">
                Have one-on-one conversations with the AI tree for gentle, bias-free reflections.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">🌲</div>
              <h3 className="font-semibold text-lg mb-2">Tree hole sharing</h3>
              <p className="text-gray-600 text-sm">
                Share anonymous notes with the community and receive understanding support.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-3">💚</div>
              <h3 className="font-semibold text-lg mb-2">Healers</h3>
              <p className="text-gray-600 text-sm">
                Become a healer and offer supportive, empathetic replies to others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

