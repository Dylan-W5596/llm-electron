# 後端架構審查 (Backend Review)

## 檔案總覽

### `backend/main.py`
這是 FastAPI 應用程式的入口點。
- **功能**:
    - 初始化資料庫與 AI 引擎。
    - 提供 REST API (`/chat`, `/sessions` 等) 供前端呼叫。
    - 處理跨來源資源共享 (CORS)。
- **技術點**:
    - `FastAPI`: 現代、高效能的 web 框架。
    - `SQLAlchemy`: ORM 用於資料庫操作。
    - `Pydantic`: 資料驗證。

### `backend/model_engine.py`
封裝了 LLM 的推論邏輯。
- **功能**:
    - 載入 GGUF 模型 (`Llama-3.2-1B-Instruct-Q8_0.gguf`).
    - 管理 `llama-cpp-python` 的 `Llama` 實例。
    - 處理對話格式 (Chat Format) 與生成。
- **關鍵技術**:
    - `llama-cpp-python`: 讓 Python 能呼叫 C++ 編寫的 `llama.cpp` 函式庫，支援 CUDA 加速。
    - **量化 (Quantization)**: 使用 Q8_0 (8-bit) 量化，在保持精度的同時減少記憶體使用與推理時間。
    - **CUDA**: 透過設定 `n_gpu_layers=-1` 將所有層卸載至 GPU 執行。

### `backend/database.py`
定義資料庫 Schema 與連線。
- **功能**:
    - 使用 SQLite 儲存聊天紀錄。
    - 定義 `ChatSession` (對話) 與 `Message` (訊息) 資料表。
- **技術點**:
    - `SQLAlchemy` (Declarative Base): 定義資料模型。
    - `SQLite`: 輕量級檔案型資料庫，適合本地應用程式。

### `download_model.py`
自動化下載模型的腳本。
- **功能**:
    - 從 HuggingFace 下載指定的 GGUF 模型。
    - 顯示下載進度條。

## 依賴套件 (`requirements.txt`)
- `fastapi`, `uvicorn`: Web 伺服器。
- `llama-cpp-python`: AI 推論核心。
- `sqlalchemy`: 資料庫 ORM。
