import sqlite3
conn = sqlite3.connect('lms.db')
c = conn.cursor()
try:
    c.execute('ALTER TABLE classes ADD COLUMN status VARCHAR(50) DEFAULT "scheduled"')
    conn.commit()
    print("Column added")
except Exception as e:
    print("Error:", e)
