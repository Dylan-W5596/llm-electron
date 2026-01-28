import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Settings from '../components/Settings';
import { languages } from '../translations/languages';

describe('Settings Component', () => {
    const mockConfig = {
        theme: 'dark',
        temperature: 0.7,
        maxTokens: 512,
        language: 'zh',
        soundEnabled: true
    };
    const mockOnUpdateConfig = vi.fn();
    const mockOnBack = vi.fn();
    const mockOnPlayClick = vi.fn();
    const mockOnOpenMonitor = vi.fn();
    const t = languages.zh;

    it('應正確顯示當前設定值', () => {
        render(
            <Settings
                config={mockConfig}
                onUpdateConfig={mockOnUpdateConfig}
                onBack={mockOnBack}
                onPlayClick={mockOnPlayClick}
                onOpenMonitor={mockOnOpenMonitor}
                t={t}
            />
        );
        expect(screen.getByText(/Temperature/i)).toBeInTheDocument();
        expect(screen.getByText('繁體中文')).toBeInTheDocument();
    });

    it('點擊主題按鈕應觸發更新', () => {
        render(
            <Settings
                config={mockConfig}
                onUpdateConfig={mockOnUpdateConfig}
                onBack={mockOnBack}
                onPlayClick={mockOnPlayClick}
                onOpenMonitor={mockOnOpenMonitor}
                t={t}
            />
        );
        const lightThemeBtn = screen.getByText(t.brightComfort);
        fireEvent.click(lightThemeBtn);
        expect(mockOnUpdateConfig).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light' }));
        expect(mockOnPlayClick).toHaveBeenCalled();
    });

    it('點擊語系按鈕應觸發更新', () => {
        render(
            <Settings
                config={mockConfig}
                onUpdateConfig={mockOnUpdateConfig}
                onBack={mockOnBack}
                onPlayClick={mockOnPlayClick}
                onOpenMonitor={mockOnOpenMonitor}
                t={t}
            />
        );
        const enBtn = screen.getByText('English');
        fireEvent.click(enBtn);
        expect(mockOnUpdateConfig).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }));
        expect(mockOnPlayClick).toHaveBeenCalled();
    });

    it('點擊開啟監控按鈕應觸發回呼', () => {
        render(
            <Settings
                config={mockConfig}
                onUpdateConfig={mockOnUpdateConfig}
                onBack={mockOnBack}
                onPlayClick={mockOnPlayClick}
                onOpenMonitor={mockOnOpenMonitor}
                t={t}
            />
        );
        // 使用 exact: false 避開括號造成的正则解析問題
        const monitorBtn = screen.getByText(t.openMonitor, { exact: false });
        fireEvent.click(monitorBtn);
        expect(mockOnOpenMonitor).toHaveBeenCalled();
    });
});
