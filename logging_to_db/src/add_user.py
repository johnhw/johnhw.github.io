import sqlite3 
import logging
import click 
from datetime import datetime
import shutil
from pathlib import Path 
    
from dateutil.tz import tzlocal
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


def log_tail(cur, table, n=10):
    """Print the last n rows of the given table (defaults to 10 rows)."""
    rows = cur.execute(f"SELECT * FROM {table} ORDER BY rowid DESC LIMIT {n}").fetchall()
    tabs = Table(title="Tail of log")    
    for col in [t[0] for t in cur.description]:
        tabs.add_column(col)
    for row in rows:
         tabs.add_row(*[str(c) for c in row])
    console = Console()
    console.print(tabs)



FORMAT = "%(message)s"
logging.basicConfig(
    level="NOTSET", format=FORMAT, datefmt="%Y-%m-%dT%H:%M:%S:%f", handlers=[RichHandler()]
)

from pseudo import make_pseudo

def real_time():
    return datetime.now(tzlocal())

db_file = None 

@click.group()
@click.option("--file", default="experiment.db", help="Filename of db.")
def cli(file):          
    global db_file
    db_file = file
        
def connect():
    return sqlite3.connect(db_file)        

@cli.group(help="Create/delete the tables.")
def tables():
    pass

@tables.command(help="Creates the blank tables from the schema.")
@click.option("--force", is_flag=True, help="Force creation of tables, even if they already exist (by dropping the existing tables).")
@click.option("--sql", '-s', help="SQL file to use for table creation.")
def create(force, sql):
    db = connect()
    if force:
        drop(True)
    if not sql:
        sql = Path(__file__).parent / "schema.sql"
    with open(sql, "r") as f:
        db.executescript(f.read())
    cursor = db.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"{len(tables)} tables created from {sql}: " + ", ".join([t[0] for t in tables])+".")
    db.close()

@tables.command(help="Drops the entire log, copying it to a backup file named <db>.bak.<nnn>.")
@click.option("--force", is_flag=True, help="Do not require confirmation.")
def drop(force):    
    if force:
        proceed = click.confirm("Drop all data in the tables (a backup will be made?)")
    else:
        proceed = True
    if not proceed:
        logging.info("Nothing done.")
        return
    ix = 0
    backup = db_file + f".bak.{ix:03d}"
    while Path(backup).exists():
        ix += 1
        backup = db_file + f".bak.{ix:03d}"
    shutil.move(db_file, backup)    
    print(f"{db_file} removed.")
    print(f"Backed up to {backup}.")


@tables.command(help="Summarises the log tables")
def check():
    db = connect()
    cursor = db.cursor()
    # dump generic tables
    print_tables(cursor)
    print_users(cursor)
    log_tail(cursor, "log", 10)
    db.close()
    
@cli.command(help="Prints out a pseudonym. Further arguments are used to generate fixed hashes.")
@click.argument('args', nargs=-1)
def pseudo(args):    
    print(make_pseudo(*args))


@cli.command(help="Take a free form note.")
@click.option('--experimenter', '-u', help="Name of the experimenter making the note.", default="user", prompt="User (experimenter) name?")
@click.option('--message', '-m', help="Note to record (quoted)", prompt="Message to record?")
def note(experimenter, message):    
    db = connect()
    time = real_time()
    cursor = db.cursor()
    cursor.execute("INSERT INTO NOTES (experimenter, note, time) VALUES (?,?,?)", (experimenter, message, time))
    print(f"{time}\t{experimenter}\t{message}")
    db.close()

    
@cli.command(help="Adds one new user.")
@click.option("--test", is_flag=True, help="Test user, or regular user.", prompt="Test user?")
@click.option("--group", required=True, help="User group.", prompt="User group?", type=click.Choice(["A", "B"]))
@click.option("--name", required=True, help="Pseudonym of user.", prompt="Pseudonym? default", default=lambda: make_pseudo())
@click.option("--preferred_hand", required=True, help="Preferred hand.", prompt="Preferred hand?", type=click.Choice(["L", "R"]))
@click.option("--gender", required=True, help="Identified gender", prompt="Identified gender?", type=click.Choice(["M", "F", "X", "N", "B"]))
def add_user(file, name, preferred_hand, gender, group, test):    
    db = connect()
    # create a pseudonym if needed
    if len(name)==0:
        name = make_pseudo()
    cursor = db.cursor()
    time = real_time()
    cursor.execute("INSERT INTO USERS (name, preferred_hand, gender, test, group_id, time) VALUES (?,?,?,?,?,?)", (name, preferred_hand, gender, "test" if test else "real", group, time))
    db.commit()
    # echo back the written data
    print()
    result = cursor.execute("SELECT * FROM USERS WHERE name=?", (name,)).fetchone()    
    print("\t".join(result))    
    db.close()
    
if __name__ == '__main__':
    cli()