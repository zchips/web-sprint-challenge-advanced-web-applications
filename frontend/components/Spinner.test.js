import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner'; 
import '@testing-library/jest-dom';


describe('Spinner Component', () => {
  test('renders spinner when "on" prop is true', () => {
    render(<Spinner on={true} />);
    const spinnerElement = screen.getByTestId('spinner');
    expect(spinnerElement).toBeInTheDocument();
  });

  test('does not render spinner when "on" prop is false', () => {
    render(<Spinner on={false} />);
    const spinnerElement = screen.queryByTestId('spinner');
    expect(spinnerElement).not.toBeInTheDocument();
  });
});
