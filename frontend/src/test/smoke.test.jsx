import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Smoke Test', () => {
    it('should render a simple div', () => {
        render(<div>Test</div>);
        expect(screen.getByText('Test')).toBeInTheDocument();
    });
});
