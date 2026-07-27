import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "lms.db")

def update_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check online_meets columns
    cursor.execute("PRAGMA table_info(online_meets)")
    columns = [col[1] for col in cursor.fetchall()]

    new_columns = [
        ("meeting_id", "TEXT"),
        ("absence_limit_mins", "INTEGER DEFAULT 15"),
        ("camera_mandatory", "BOOLEAN DEFAULT 0"),
        ("recording_url", "TEXT"),
        ("allowed_users_json", "TEXT"),
        ("attendance_report_json", "TEXT"),
        ("status", "TEXT DEFAULT 'scheduled'")
    ]

    for col_name, col_type in new_columns:
        if col_name not in columns:
            print(f"Adding column {col_name} ({col_type}) to online_meets...")
            cursor.execute(f"ALTER TABLE online_meets ADD COLUMN {col_name} {col_type}")

    # Create online_meet_sessions table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS online_meet_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meet_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        session_token TEXT NOT NULL,
        role TEXT NOT NULL,
        first_join_time TEXT,
        last_leave_time TEXT,
        total_absence_seconds INTEGER DEFAULT 0,
        warnings_count INTEGER DEFAULT 0,
        beeps_count INTEGER DEFAULT 0,
        removal_reason TEXT,
        final_status TEXT DEFAULT 'Active',
        logs_json TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meet_id) REFERENCES online_meets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_online_meet_sessions_token ON online_meet_sessions(session_token)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_online_meets_meeting_id ON online_meets(meeting_id)")

    conn.commit()
    conn.close()
    print("Online meets schema updated successfully!")

if __name__ == "__main__":
    update_schema()
