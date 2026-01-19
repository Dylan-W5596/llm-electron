# 故障排除 (Troubleshooting)

## 嚴重錯誤: `Failed to load shared library ... llama.dll`

若您在啟動應用程式時看到此錯誤，代表您的系統缺少執行 AI 模型所需的驅動程式或函式庫。

### 原因分析
本專案設定為使用 **CUDA (GPU 加速)** 版本的 `llama-cpp-python`。
雖然 Python 套件已成功安裝，但它依賴 Windows 系統層級的 DLL 檔案。

### 解決方案 (請選擇一項)

#### 方案 A: 啟用 GPU 加速 (強烈推薦)
若您有 NVIDIA 顯示卡，請依照以下步驟讓應用程式能使用 GPU：

1.  **下載 CUDA Toolkit 12.4**:
    - 前往 [NVIDIA 官方下載頁面](https://developer.nvidia.com/cuda-downloads).
    - 選擇 Windows > x86_64 > 11 > exe (local).
    - 安裝時選擇 "Custom"，確保勾選 "Runtime" 相關元件。
2.  **安裝完成後**:
    - 重新啟動電腦 (確保環境變數生效)。
    - 再次執行 `npm run electron:dev`。

#### 方案 B: 使用純 CPU 模式 (若無 NVIDIA 顯卡)
若您無法安裝 CUDA，您必須擁有 C++ 編譯器才能讓 Python 自動建置 CPU 版本。

1.  **下載 Visual Studio Build Tools**:
    - 前往 [Visual Studio 下載](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
    - 下載並執行安裝程式。
    - **關鍵步驟**: 在工作負載 (Workloads) 中，必須勾選 **"Desktop development with C++"** (使用 C++ 的桌面開發)。
2.  **重裝 Python 套件**:
    安裝完編譯器後，執行以下指令切換回 CPU 版：
    ```bash
    .\venv\Scripts\pip install llama-cpp-python --force-reinstall --no-cache-dir
    ```

---
### 驗證方式
在 `frontend` 資料夾中執行：
```bash
npm run electron:dev
```
若看到 "Model loaded successfully" 且無 DLL 錯誤，即代表修復成功。
