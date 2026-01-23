# 後端架構審查 (Backend Review)

## 檔案總覽

### `backend/main.py`
這是 FastAPI 應用程式的入口點與控制器。
- **功能**:
    - 初始化資料庫與 AI 引擎。
    - **路由管理**: 管理包括對話、訊息及新增的「群組管理」與「會話移動」端點。
    - **邏輯分發**: 協調資料庫操作與 `ModelEngine` 的推論任務。
- **技術點**:
    - `FastAPI`: 高效能 web 框架。
    - `SQLAlchemy`: ORM 資料庫操作。

### `backend/model_engine.py`
封裝了 LLM 的推論邏輯。
- **功能**:
    - 載入 Llama 3.2 1B (GGUF 格式)。
    - **硬體加速**: 透過 CUDA 全量卸載 (`n_gpu_layers=-1`) 提升推論速度。
    - **對話流**: 支援流式 (Streaming) 的思考與生成 (目前主要為同步回應，可擴充)。

### `backend/database.py`
定義資料庫 Schema 與連線，支援群組分類。
- **結構更新**:
    - **`Group` 資料表**: 儲存群組名稱與自定義排序。
    - **`ChatSession` 資料表**: 新增 `group_id` (外鍵) 與 `order` (排序位) 欄位。
    - **級聯刪除**: 實作 `cascade="all, delete-orphan"`，確保刪除會話時訊息同步清理。
- **技術點**:
    - `SQLite`: 本地檔案資料庫。

### `backend/migrate_db.py` [NEW]
維修用腳本。
- **功能**: 手動執行 SQL 指令為舊有的資料表補上缺失欄位，解決 schema 不一致導致的啟動錯誤。

---

## 資料安全性與完整性
- **CASCADE**: 刪除操作會連帶刪除關聯資料，防止資料庫產生孤兒訊息。
- **Thread Safety**: 設定 `check_same_thread=False` 以支援 FastAPI 的異步請求環境。
