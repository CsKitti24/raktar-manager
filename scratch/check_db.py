import sqlite3
import os

db_path = r'c:\Users\Kitti\Documents\Egyetem\raktar-manager\raktar-manager\RaktarManager\RaktarManagerApp\app.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f" - {table[0]}")
    
    if ('complaints',) in tables:
        cursor.execute("SELECT COUNT(*) FROM complaints")
        count = cursor.fetchone()[0]
        print(f"\nNumber of complaints: {count}")
    else:
        print("\nTable 'complaints' NOT FOUND!")
    conn.close()
