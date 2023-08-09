import sqlite3 
import click 
import rich
import json 
import logging
import pytz 
from dateutil.tz import tzlocal
from datetime import datetime 
from rich.logging import RichHandler

tz = tzlocal()


FORMAT = "%(message)s"
logging.basicConfig(
    level="NOTSET", format=FORMAT, datefmt="%Y-%m-%dT%H:%M:%S:%f", handlers=[RichHandler()]
)
log = logging.getLogger("rich")





def pretty_json(x):
    return json.dumps(x, sort_keys=True, indent=4, separators=(',', ': '))



def create_tables(cur):
    """Create the initial, blank tables according to the 
    schema."""
    cur.executescript("""
    CREATE TABLE users (name TEXT, gender TEXT, preferred_hand TEXT, group_id TEXT, enrolled DATE);
    CREATE TABLE log (time DATE, user TEXT, target_seq TEXT, pixel_size INT, pixel_distance INT, action TEXT, expt_state TEXT);
    CREATE TABLE experiment_state (time DATE, action TEXT, prev_state TEXT, new_state TEXT);
    CREATE TABLE runs (time DATE, hostname TEXT, git_sha TEXT, action TEXT, random_seed TEXT, experimenter TEXT);    
    CREATE TABLE saves(time DATE, user TEXT, resume_state TEXT);
    CREATE TABLE debug_log(time DATE, level TEXT, message TEXT);
    """)

@click.group()
def cli():
    pass

@click.command()
@click.option("--file", default="experiment.db", help="Filename to write the database to.")
@click.option("--memory-test", default=False, is_flag=True, help="If set, writes the database to memory and nothing is saved.")
def create(file, memory_test):
    if memory_test:
        logging.warning("Using a test file in memory. Nothing will be recorded!")
        file=":memory:"
    db = sqlite3.connect(file)
    cursor = db.cursor()
    create_tables(cursor)
    logging.debug("Tables created successfully.")
    
 

if __name__ == '__main__':
    cli.add_command(create)   
    cli()