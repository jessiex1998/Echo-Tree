import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from '../../Common/Button.jsx';

describe('Button component', () => {
  it('renders children text', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

