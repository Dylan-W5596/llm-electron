const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;

const BACKEND_PORT = 8000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // 若需要簡單的 IPC 或是使用 preload
            webSecurity: false // 若有嚴格需求允許載入本地資源，通常不建議在 localhost 使用
        },
        // 高級質感: 可以保留預設邊框或自訂。為了穩定性我們先保留預設。
        backgroundColor: '#121212',
        show: false // 準備好後再顯示
    });

    // 載入 Vite 應用程式
    // 開發模式: 從 localhost:5173 載入
    // 生產模式: 從 dist/index.html 載入
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackend() {
    const isDev = !app.isPackaged;
    let scriptPath;
    let pythonPath;

    if (isDev) {
        // 開發模式: 使用本地 venv
        // 假設從專案根目錄或 frontend 資料夾執行。
        // 我們需要找到 venv python 的絕對路徑。
        // 假設此腳本是從 `frontend` 或專案根目錄執行。
        // 如果是從 `frontend` (透過 npm) 執行，則是 `../venv`
        pythonPath = path.join(__dirname, '../../venv/Scripts/python.exe'); // frontend/electron/ -> ../../venv
        scriptPath = path.join(__dirname, '../../backend/main.py');
    } else {
        // 生產模式: 解壓縮後的 python 或類似環境。
        // 暫時簡化: 假設使用者路徑中有 python 或已打包。
        // 對於此原型，我們主要依賴開發環境路徑。
        pythonPath = path.join(process.resourcesPath, 'venv/Scripts/python.exe');
        scriptPath = path.join(process.resourcesPath, 'backend/main.py');
    }

    console.log(`正在啟動後端，使用: ${pythonPath} ${scriptPath}`);

    backendProcess = spawn(pythonPath, [scriptPath], {
        cwd: path.dirname(scriptPath), // 設定 CWD 為 backend 目錄
        stdio: 'inherit' // 將輸出導向至控制台
    });

    backendProcess.on('error', (err) => {
        console.error('後端啟動失敗:', err);
    });

    backendProcess.on('exit', (code, signal) => {
        console.log(`後端已退出，代碼 ${code}，訊號 ${signal}`);
    });
}

function checkBackendReady(callback) {
    http.get(`${BACKEND_URL}/status`, (res) => {
        if (res.statusCode === 200) {
            callback();
        } else {
            setTimeout(() => checkBackendReady(callback), 1000);
        }
    }).on('error', () => {
        setTimeout(() => checkBackendReady(callback), 1000);
    });
}

app.on('ready', () => {
    startBackend();
    // 等待後端？對於 UI 載入來說並非絕對必要，但是個好習慣。
    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
