import sqlite3
import os

db_path = "backend/chat_history.db"

def check_db():
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Sessions ---")
    cursor.execute("SELECT id, title, group_id, \"order\" FROM sessions")
    sessions = cursor.fetchall()
    for s in sessions:
        print(s)

    print("\n--- Groups ---")
    cursor.execute("SELECT id, name FROM groups")
    groups = cursor.fetchall()
    for g in groups:
        print(g)

    print("\n--- Message Count per Session ---")
    cursor.execute("SELECT session_id, COUNT(*) FROM messages GROUP BY session_id")
    counts = cursor.fetchall()
    for c in counts:
        print(c)

    conn.close()

if __name__ == "__main__":
    check_db()
