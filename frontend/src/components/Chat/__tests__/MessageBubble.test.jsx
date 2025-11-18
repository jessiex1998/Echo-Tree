import { render, screen } from '@testing-library/react';
import MessageBubble from '../../Chat/MessageBubble.jsx';

describe('MessageBubble component', () => {
  it('displays user message content', () => {
    render(
      <MessageBubble
        message={{
          sender: 'user',
          content: 'Hello, Echo Tree',
          created_at: new Date().toISOString(),
        }}
      />
    );

    expect(screen.getByText('Hello, Echo Tree')).toBeInTheDocument();
  });
});

