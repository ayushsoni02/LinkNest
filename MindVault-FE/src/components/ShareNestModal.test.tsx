import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShareNestModal } from './ShareNestModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('ShareNestModal Component', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        nestId: '12345',
        nestName: 'My Awesome Nest',
        initialIsPublic: false,
        onUpdate: vi.fn()
    };

    it('renders the modal when isOpen is true', () => {
        render(<ShareNestModal {...defaultProps} />);
        expect(screen.getByText('Share "My Awesome Nest"')).toBeInTheDocument();
        expect(screen.getByText('Private Nest')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(<ShareNestModal {...defaultProps} isOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when the close button is clicked', () => {
        render(<ShareNestModal {...defaultProps} />);
        // Close button usually has the X icon. The button acts as a close mechanism.
        // In our structure, there is a button wrapping the X icon.
        // We can find it by its role or structure if possible.
        // Easiest is to target the button triggering onClose. We can find it via querying close button or just firing click on the button wrapping the X.
        const closeButtons = screen.getAllByRole('button');
        const closeButton = closeButtons[0]; // Assuming first button is the close button at the top
        fireEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('toggles public state and calls API when toggle button is clicked', async () => {
        // Mock successful patch request
        (axios.patch as any).mockResolvedValueOnce({
            data: { nest: { shareToken: 'new_token_123' } }
        });

        render(<ShareNestModal {...defaultProps} />);
        
        // Find the toggle button - it's the second button in our layout typically
        // The toggle button contains the "switch" UI.
        const toggleButton = screen.getAllByRole('button')[1]; 
        
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(axios.patch).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/nests/12345/toggle-public'),
                { isPublic: true },
                expect.any(Object)
            );
        });

        // After toggle, should display Public Nest
        expect(screen.getByText('Public Nest')).toBeInTheDocument();
        
        // Ensure onUpdate was called
        expect(defaultProps.onUpdate).toHaveBeenCalledWith(true, 'new_token_123');
    });
});
