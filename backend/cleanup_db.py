import sqlite3
import os

db_path = "backend/chat_history.db"

def cleanup():
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 刪除所有找不到 session ID 的訊息 (孤兒訊息)
    cursor.execute("DELETE FROM messages WHERE session_id NOT IN (SELECT id FROM sessions)")
    deleted_count = cursor.rowcount
    print(f"Cleaned up {deleted_count} orphaned messages.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    cleanup()
