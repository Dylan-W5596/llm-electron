# 前端架構審查 (Frontend Review) - Alpha 0.0.3 更新

## 檔案總覽

### `frontend/electron/main.cjs` [UPDATED]
- **功能**: 電子桌面環境的主程序，負責視窗生命週期。
- **後端監控 (IPC)**: 
    - 創立 `monitorWindow` 用於顯示後端日誌。
    - 透過監聽 Python 子程序的 `stdout` 與 `stderr`，將即時輸出經由 IPC 傳送至監控網頁。
- **路徑管理**: 根據開發/生產環境自動切換 `monitor.html` 的加載路徑。

### `frontend/src/App.jsx` [UPDATED]
- **全域狀態**: 
    - 新增 `config.language` 用於控制介面語系。
    - 整合 `playSound` 工具，為 UI 移動與系統確認提供反饋。
- **優化後的音訊策略**: 僅在 UI 操作（切換、刪除、更名）時觸發音效，避開對話頻繁生成的流程以減少疲勞。

### `frontend/src/translations/languages.js` [NEW]
- **功能**: 翻譯鍵值對管理中心。
- **架構**: 支援 `zh` (繁體中文) 與 `en` (English)，提供全平臺 UI 標籤的語系映射。

### `frontend/src/utils/soundUtils.js` [RE-STORED & ENHANCED]
- **策略**: 封裝 `Audio` 對象快取機制，提升重複播放的效能。
- **用途**: 單一出口點管理 UI 提示音（click, success, error）。

### `frontend/src/components/` [UPDATED]
- **`Sidebar.jsx`**: 整合雙語標籤，並在導覽操作中加入 UI 提示音。
- **`Settings.jsx`**: 
    - 新增 **Language Selection**: 繁中/英文即時切換。
    - 新增 **Audio Toggle**: 讓使用者自主控制 UI 提示音。
    - 新增 **Developer Monitor**: 一鍵開啟「深色奢華」佈景的後端運算窗口。
- **`monitor.html` [NEW]**: 
    - 獨立渲染進程，採用 Terminal 樣式（黑底金邊）。
    - 具備自動滾動與高效能日誌渲染能力。

### `frontend/src/test/` [UPDATED]
- **`settings.test.jsx`**: 驗證主題切換、語系變更及 UI 音效觸發斷言。
- **`i18n.test.js` [NEW]**: 驗證翻譯字典的鍵值對完整性。
- **`sound.test.js` [NEW]**: 驗證音訊播放器在停用/啟用狀態下的正確行為。

---

## 核心技術棧與亮點

| 功能 | 說明 | 關鍵技術 |
| :--- | :--- | :--- |
| **i18n 系統** | 無需重新啟動即可變更介面語系 | React State + Static Dictionary |
| **優化版 UI 音訊** | 精準平衡「操作安定感」與「對話疲勞」 | Proxy Utility + HTML5 Audio |
| **後端即時監控** | 開發者可觀察模型推論的底層 Token 輸出 | IPC Pipe + Stream Capture |
| **Vitest 整合** | 11 個關鍵路徑測試，確保交付品質 | Vitest + RTL |

---
**最後更新**: 2026-01-28  
**狀態**: 已同步 Alpha 0.0.3 完整功能集。
