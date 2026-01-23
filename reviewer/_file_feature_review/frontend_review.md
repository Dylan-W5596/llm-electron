# 前端架構審查 (Frontend Review)

## 檔案總覽

### `frontend/electron/main.cjs`
Electron 的主程序 (Main Process)。
- **功能**:
    - 建立應用程式視窗 (`BrowserWindow`).
    - **子程序管理**: 啟動時自動產生 Python 後端程序 (`spawn` uvicorn)，並在關閉時清理。
    - 載入 React 應用程式 (開發模式載入 `localhost`, 生產模式載入 `index.html`)。
- **技術點**:
    - `child_process.spawn`: 用於執行外部指令 (Python)。
    - `CommonJS`: 使用 `.cjs` 副檔名以相容 Electron 與 Node.js 環境。

### `frontend/src/App.jsx`
React 應用程式的核心調度組件。
- **功能**:
    - 管理全域狀態：`sessions` (會話清單)、`groups` (群組清單)、`sessionId` (目前選中會話)。
    - **邏輯整合**: 協調 API 呼叫、會話切換、群組 CRUD 與拖放排序的後續處理。
- **技術點**:
    - `React Hooks` (`useState`, `useEffect`, `useRef`).
    - 整合多個子組件，維持單向數據流。

### `frontend/src/api.js` [NEW]
封裝所有後端通訊邏輯。
- **功能**:
    - 提供語義化的 API 介面 (例如 `getSessions`, `createGroup`, `moveSession`)。
    - 統一處理錯誤與回應格式。

### `frontend/src/components/` [NEW]
模組化子組件。
- **`Sidebar.jsx`**: 管理側邊欄 UI，包含群組渲染、摺疊切換、重新命名與 **HTML5 拖放 (Drag & Drop)** 實作。
- **`ChatMessage.jsx`**: 負責單條訊息的渲染，支援 `react-markdown` 渲染 Markdown 內容與程式碼區塊。
- **`ChatInput.jsx`**: 管理使用者輸入、自動調整高度與發送邏輯。

### `frontend/src/index.css`
應用程式的樣式表 (Design System)。
- **特色**:
    - **變數管理**: 定義深色模式色票與動畫參數。
    - **Drag Feedback**: 實作 `.drag-top` 與 `.drag-bottom` 類名，提供拖放時的黃藍底線提示。
    - **Animations**: 訊息淡入與側邊欄伸縮平滑過渡。

---

## 核心功能清單 (Core Features)

| 功能 | 說明 | 實作位置 |
| :--- | :--- | :--- |
| **群組化管理** | 支援建立、重新命名與刪除群組，對話紀錄可分類存放 | `Sidebar.jsx`, `api.js` |
| **拖放介面** | 透過 Drag & Drop API 實現跨組移動與自定義排序 | `Sidebar.jsx`, `App.jsx` |
| **Markdown 渲染** | 支援 GFM、程式碼高亮與數學公式展示 | `ChatMessage.jsx` |
| **自動初始化** | 偵測歷史紀錄，避免產生重複的空白對話 | `App.jsx` |

## 技術棧
- **React 18** + **Vite**: 前端開發與打包。
- **Electron**: 轉化為桌面應用。
- **React Markdown**: 處理 AI 回應的豐富格式。
- **HTML5 Drag and Drop**: 輕量級的原生排序解決方案。
