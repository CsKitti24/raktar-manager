import sqlite3
import os

db_path = r'c:\Users\Kitti\Documents\Egyetem\raktar-manager\raktar-manager\RaktarManager\RaktarManagerApp\app.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(complaints)")
columns = cursor.fetchall()
print("Columns in complaints table:")
for col in columns:
    print(f" - {col[1]} ({col[2]})")
conn.close()
