import sqlite3
import os

db_path = r'c:\Users\Kitti\Documents\Egyetem\raktar-manager\raktar-manager\RaktarManager\RaktarManagerApp\app.db'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("UPDATE complaints SET status = 'Pending' WHERE status = 'nyitott'")
    cursor.execute("UPDATE complaints SET status = 'Resolved' WHERE status = 'lezárva'")
    print(f"Rows updated: {cursor.rowcount}")
    conn.commit()
    conn.close()
    print("Database updated successfully")
