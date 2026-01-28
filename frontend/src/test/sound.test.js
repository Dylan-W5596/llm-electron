import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playSound } from '../utils/soundUtils';

describe('Sound Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Audio
        global.Audio = vi.fn().mockImplementation(() => ({
            play: vi.fn().mockResolvedValue(),
            pause: vi.fn(),
            currentTime: 0
        }));
    });

    it('不應在停用時播放聲音', () => {
        playSound('click', false);
        expect(global.Audio).not.toHaveBeenCalled();
    });

    it('應在啟用時針對正確類型播放聲音', () => {
        playSound('click', true);
        expect(global.Audio).toHaveBeenCalled();
    });
});
