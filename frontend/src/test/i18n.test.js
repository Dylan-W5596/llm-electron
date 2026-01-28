import { describe, it, expect } from 'vitest';
import { languages } from '../translations/languages';

describe('Internationalization (i18n)', () => {
    it('應包含必要的語言代碼', () => {
        expect(languages).toHaveProperty('zh');
        expect(languages).toHaveProperty('en');
    });

    it('繁體中文翻譯應包含正確內容', () => {
        expect(languages.zh.settings).toBe('系統設定');
        expect(languages.zh.newChat).toBe('新對話');
    });

    it('英文翻譯應包含正確內容', () => {
        expect(languages.en.settings).toBe('System Settings');
        expect(languages.en.newChat).toBe('New Chat');
    });

    it('兩語系應具備相同數量的 Key', () => {
        const zhKeys = Object.keys(languages.zh).sort();
        const enKeys = Object.keys(languages.en).sort();
        expect(zhKeys).toEqual(enKeys);
    });
});
