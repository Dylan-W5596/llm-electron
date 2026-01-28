import { useState } from 'react';

function Settings({ config, onUpdateConfig, onBack, onPlayClick, onOpenMonitor, t }) {
    const handleThemeChange = (theme) => {
        onPlayClick();
        onUpdateConfig({ ...config, theme });
    };

    const handleParamChange = (key, value) => {
        onUpdateConfig({ ...config, [key]: parseFloat(value) });
    };

    const handleLanguageChange = (lang) => {
        onPlayClick();
        onUpdateConfig({ ...config, language: lang });
    };

    return (
        <div className="settings-view">
            <div className="settings-header">
                <button className="back-btn" onClick={onBack}>{t.backToChat}</button>
                <h2>{t.settings}</h2>
            </div>

            <div className="settings-content">
                <section className="settings-section">
                    <h3>{t.language}</h3>
                    <div className="language-options">
                        <button
                            className={`lang-btn ${config.language === 'zh' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('zh')}
                        >繁體中文</button>
                        <button
                            className={`lang-btn ${config.language === 'en' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('en')}
                        >English</button>
                    </div>
                </section>

                <section className="settings-section">
                    <h3>{t.audioSettings}</h3>
                    <div className="setting-item toggle">
                        <label>{t.soundInteractions}</label>
                        <button
                            className={`toggle-btn ${config.soundEnabled ? 'on' : 'off'}`}
                            onClick={() => {
                                if (!config.soundEnabled) {
                                    onUpdateConfig({ ...config, soundEnabled: true });
                                    onPlayClick(true);
                                } else {
                                    onPlayClick();
                                    onUpdateConfig({ ...config, soundEnabled: false });
                                }
                            }}
                        >
                            {config.soundEnabled ? t.on : t.off}
                        </button>
                    </div>
                </section>

                <section className="settings-section">
                    <h3>{t.interfaceTheme}</h3>
                    <div className="theme-options">
                        <button
                            className={`theme-btn dark ${config.theme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}
                        >{t.darkLuxury}</button>
                        <button
                            className={`theme-btn light ${config.theme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}
                        >{t.brightComfort}</button>
                        <button
                            className={`theme-btn cyber ${config.theme === 'cyber' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('cyber')}
                        >{t.cyberpunk}</button>
                    </div>
                </section>

                <section className="settings-section">
                    <h3>{t.modelParams}</h3>
                    <div className="setting-item">
                        <label htmlFor="temperature">{t.temperature}: {config.temperature}</label>
                        <input
                            id="temperature"
                            type="range" min="0.1" max="2.0" step="0.1"
                            value={config.temperature}
                            onChange={(e) => handleParamChange('temperature', e.target.value)}
                        />
                    </div>
                    <div className="setting-item">
                        <label htmlFor="maxTokens">{t.maxTokens}: {config.maxTokens}</label>
                        <input
                            id="maxTokens"
                            type="range" min="64" max="2048" step="64"
                            value={config.maxTokens}
                            onChange={(e) => handleParamChange('maxTokens', e.target.value)}
                        />
                    </div>
                </section>

                <section className="settings-section dev-section">
                    <h3>{t.devSettings}</h3>
                    <div className="setting-item">
                        <label>{t.backendMonitor}</label>
                        <button className="monitor-btn" onClick={() => onOpenMonitor()}>
                            🚀 {t.openMonitor}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Settings;
