# API 介面說明文件 (API Review)

本文檔詳細列出了後端 FastAPI 提供的主要 API 端點資訊。

## 1. 對話會話 (Chat Sessions)

| 方法 | 路徑 | 功能 |
| :--- | :--- | :--- |
| `GET` | `/sessions` | 獲取所有對話紀錄 (依群組與順序排列) |
| `POST` | `/sessions` | 建立新的對話紀錄 (可指定 group_id) |
| `PATCH` | `/sessions/{id}` | 更新對話標題 |
| `DELETE` | `/sessions/{id}` | 刪除對話紀錄 (含訊息) |
| `PATCH` | `/sessions/{id}/move` | **[NEW]** 移動會話至特定群組並設定排序 |

## 2. 聊天訊息 (Messages)

| 方法 | 路徑 | 功能 |
| :--- | :--- | :--- |
| `GET` | `/sessions/{id}/messages` | 獲取指定對話的所有訊息紀錄 |
| `POST` | `/chat` | 發送新訊息並獲取 AI 回應 |

## 3. 群組管理 (Groups) **[NEW]**

| 方法 | 路徑 | 功能 |
| :--- | :--- | :--- |
| `GET` | `/groups` | 獲取所有群組清單 |
| `POST` | `/groups` | 建立新群組 |
| `PATCH` | `/groups/{id}` | 更新群組名稱或排序 |
| `DELETE` | `/groups/{id}` | 刪除群組 (關聯會話將轉為未分類) |

---

## 資料架構摘要
### ChatSession 擴充屬性
- `group_id`: 關聯的群組 ID。
- `order`: 在該組內的排序權重 (數字越小越前面)。

### 請求範例 (Move Session)
```json
// PATCH /sessions/5/move
{
  "group_id": 2,
  "order": 10
}
```
