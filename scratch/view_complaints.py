import sqlite3
import os

db_path = r'c:\Users\Kitti\Documents\Egyetem\raktar-manager\raktar-manager\RaktarManager\RaktarManagerApp\app.db'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    
    print(f"Columns: {columns}")
    for row in rows:
        print(row)
    conn.close()
