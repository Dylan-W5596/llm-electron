import sqlite3
import os

db_path = "backend/chat_history.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found. No migration needed.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 檢查並新增 sessions.group_id
    try:
        cursor.execute("ALTER TABLE sessions ADD COLUMN group_id INTEGER REFERENCES groups(id)")
        print("Successfully added column 'group_id' to 'sessions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'group_id' already exists.")
        else:
            print(f"Error adding 'group_id': {e}")

    # 檢查並新增 sessions.order
    try:
        cursor.execute("ALTER TABLE sessions ADD COLUMN \"order\" INTEGER DEFAULT 0")
        print("Successfully added column 'order' to 'sessions' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'order' already exists.")
        else:
            print(f"Error adding 'order': {e}")

    conn.commit()
    conn.close()
    print("Migration finished!")

if __name__ == "__main__":
    migrate()
