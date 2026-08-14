import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LinkCard from './LinkCard';

// Mock the hook to avoid errors during rendering
vi.mock('../hooks/useNests', () => ({
  useNests: () => ({ nests: [] })
}));

describe('LinkCard Component', () => {
    const defaultProps = {
        id: '1',
        url: 'https://example.com',
        title: 'Test Link Card',
        contentType: 'article'
    };

    it('renders the component with the given title', () => {
        render(<LinkCard {...defaultProps} />);
        expect(screen.getByText('Test Link Card')).toBeInTheDocument();
    });

    it('displays the correct content type badge', () => {
        render(<LinkCard {...defaultProps} />);
        // The contentType is rendered as an uppercase badge
        const badges = screen.getAllByText('article');
        expect(badges.length).toBeGreaterThan(0);
    });
});

