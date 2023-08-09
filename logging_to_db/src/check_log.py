import sqlite3 
import logging
import click 
from rich.logging import RichHandler
from rich.console import Console
from rich.table import Table

FORMAT = "%(message)s"
logging.basicConfig(
    level="NOTSET", format=FORMAT, datefmt="%Y-%m-%dT%H:%M:%S:%f", handlers=[RichHandler()]
)

log = logging.getLogger("rich")

def print_tables(cur):
    """Show which tables have been created, and the
    corresponding schemas. Assumes nothing about the structure of the database."""
    cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cur.fetchall()
    tabs = Table(title="Database tables")
    tabs.add_column("Name")
    tabs.add_column("Schema")
    tabs.add_column("Rows")
    tabs.add_column("Last time")
    for name, sql in tables:
        rows = cur.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]        
        # see if we can get a last modified time
        try:
            last_time = cur.execute(f"SELECT time FROM {name} ORDER BY rowid DESC LIMIT 1").fetchone()
        except sqlite3.OperationalError:
            last_time = None
        if not last_time:
            last_time = "Never"
        else:
            last_time = last_time[0]
        tabs.add_row(name, sql, str(rows), last_time)
    console = Console()
    console.print(tabs)

def print_users(cur):
    """Print out the name and enrollment time of each user,
    and the number of rows they have in the main log, and
    the last timestamp for that user in the main log."""
    cur.execute("SELECT name, time FROM USERS")
    users = cur.fetchall()
    tabs = Table(title="Users")
    tabs.add_column("Name")
    tabs.add_column("Enrol time")
    tabs.add_column("Rows")
    tabs.add_column("Last log time")

    for name, time in users:
        rows = cur.execute(f"SELECT COUNT(*) FROM log WHERE user={name}").fetchone()[0]        
        last_time = cur.execute(f"SELECT time FROM log WHERE user={name} ORDER BY rowid DESC LIMIT 1").fetchone()[0]        
        tabs.add_row(name, time, str(rows), last_time)
    console = Console()
    console.print(tabs)


def tail(cur, table, n=10):
    """Print the last n rows of the given table (defaults to 10 rows)."""
    rows = cur.execute(f"SELECT * FROM {table} ORDER BY rowid DESC LIMIT {n}").fetchall()
    tabs = Table(title="Tail of log")    
    for col in [t[0] for t in cur.description]:
        tabs.add_column(col)
    for row in rows:
         tabs.add_row(*[str(c) for c in row])
    console = Console()
    console.print(tabs)


@click.command()
@click.option("--file", default="experiment.db", help="Filename of database to check.")
def check_db(file):    
    db = sqlite3.connect(file)
    cursor = db.cursor()
    # dump generic tables
    print_tables(cursor)
    print_users(cursor)
    tail(cursor, "log", 10)
    cursor.close()
    db.close()
    

if __name__ == '__main__':
    check_db()