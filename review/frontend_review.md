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
React 主應用程式邏輯。
- **功能**:
    - 管理聊天狀態 (輸入框、訊息列表、目前 Session)。
    - 處理 API 呼叫 (`fetch` 到 localhost:8000)。
    - 自動捲動、Markdown 渲染 (目前為純文字，可擴充)。
- **技術點**:
    - `React Hooks` (`useState`, `useEffect`, `useRef`).
    - `Fetch API`: 與後端通訊。

### `frontend/src/index.css`
應用程式的樣式表 (Design System)。
- **特色**:
    - **原生 CSS (Vanilla CSS)**: 不依賴框架，手寫現代 CSS。
    - **變數 (`:root`)**: 定義深色模式色票 (Dark Mode Palette)。
    - **Animations**: 訊息淡入 (`@keyframes fadeIn`)、按鈕互動效果。
    - **排版**: Flexbox 佈局，打造類似 App 的固定視窗體驗。

### `frontend/package.json`
專案設定與腳本。
- **關鍵腳本**:
    - `electron:dev`: 同時啟動 Vite 開發伺服器與 Electron 視窗，並使用 `wait-on` 等待 Vite 就緒。
    - `electron:build`: 建置 React 專案並打包為 Electron 應用。

## 技術棧
- **React 18/19** + **Vite**: 快速的前端開發環境。
- **Electron**: 跨平台桌面應用程式框架。
- **Concurrently**: 並行執行多個指令 (Vite + Electron)。
