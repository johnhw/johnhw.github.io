import sqlite3 
import logging
import click 
from rich.logging import RichHandler

FORMAT = "%(message)s"
logging.basicConfig(
    level="NOTSET", format=FORMAT, datefmt="%Y-%m-%dT%H:%M:%S:%f", handlers=[RichHandler()]
)

log = logging.getLogger("rich")

def create_tables(cur, file):
    """Create the initial, blank tables according to the 
    schema."""

    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    
    if len(cur.fetchall())>0:
        logging.error(f"Database file '{file}' already exists. Tables *not* created.")
        exit(-1)

    cur.executescript("""
    CREATE TABLE users (name TEXT, gender TEXT, preferred_hand TEXT, group_id TEXT, time DATE);
    CREATE TABLE log (time DATE, user TEXT, target_seq TEXT, pixel_size INT, pixel_distance INT, action TEXT, expt_state TEXT);
    CREATE TABLE experiment_state (time DATE, action TEXT, prev_state TEXT, new_state TEXT);
    CREATE TABLE runs (time DATE, hostname TEXT, git_sha TEXT, pyversion TEXT, pyexec TEXT, action TEXT, random_seed TEXT, experimenter TEXT);    
    CREATE TABLE saves(time DATE, user TEXT, resume_state TEXT);
    CREATE TABLE debug_log(time DATE, level TEXT, message TEXT);
    """)
        
@click.command()
@click.option("--file", default="experiment.db", help="Filename to write the database to.")

def create(file, test):    
    db = sqlite3.connect(file)
    logging.debug(f"Creating database in {file}.")
    cursor = db.cursor()
    create_tables(cursor, file)
    logging.debug("Tables created successfully.")
    cursor.close()
    db.close()
    

if __name__ == '__main__':
    create()