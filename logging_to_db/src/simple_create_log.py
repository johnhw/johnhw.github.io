import sqlite3 
import sys 

if __name__ == '__main__':
    if len(sys.argv)>1:
        fname = sys.argv[1] 

    db = sqlite3.connect(file)
    print(f"Creating database in {file}.")
    cursor = db.cursor()        
    cursor.executescript("""
    CREATE TABLE users (name TEXT, gender TEXT, preferred_hand TEXT, group_id TEXT, time DATE);
    CREATE TABLE log (time DATE, user TEXT, target_seq TEXT, pixel_size INT, pixel_distance INT, action TEXT, expt_state TEXT);
    CREATE TABLE experiment_state (time DATE, action TEXT, prev_state TEXT, new_state TEXT);
    CREATE TABLE runs (time DATE, hostname TEXT, git_sha TEXT, pyversion TEXT, pyexec TEXT, action TEXT, random_seed TEXT, experimenter TEXT);    
    CREATE TABLE saves(time DATE, user TEXT, resume_state TEXT);
    CREATE TABLE debug_log(time DATE, level TEXT, message TEXT);
    """)
    print("Tables created successfully.")    
    db.close()
    