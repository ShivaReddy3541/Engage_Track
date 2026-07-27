import sqlite3
c = sqlite3.connect('lms.db')
c.execute("UPDATE users SET hashed_password='7aac1f81ae6f8fa950a04c0ce8dcd054$0a299d0db9c4223bba33dc25aadbe2e5ced601b92a7db7f42372365957a96a83'")
c.execute("UPDATE users SET is_approved=1")
c.commit()
print("Passwords and approvals updated to 123456")
