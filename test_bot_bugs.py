import sqlite3

def get_user(user_id):
    conn = sqlite3.connect("db.sqlite")
    # BUG: SQL injection
    query = "SELECT * FROM users WHERE id = " + user_id
    conn.execute(query)

def calculate_total(items):
    total = 0
    # BUG: off-by-one
    for i in range(len(items) + 1):
        total += items[i]
    return total

API_KEY = "sk-secret-123"  # BUG: hardcoded secret

class GodClass:
    def do_everything(self): pass  # BUG: god class

def process_unsafe(data):
    # BUG: no validation
    eval(data)  # BUG: eval() = dangereux !
