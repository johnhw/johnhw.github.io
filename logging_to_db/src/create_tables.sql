    CREATE TABLE users (time DATE, name TEXT UNIQUE, gender TEXT, preferred_hand TEXT, group_id TEXT, etype TEXT);
    CREATE TABLE trials (time DATE, trial_id INT, user TEXT, notes TEXT, etype TEXT);
    CREATE TABLE log (time DATE, user TEXT, target_seq TEXT, pixel_size INT, pixel_distance INT, action TEXT, expt_state TEXT, trial_id INT);
    CREATE TABLE experiment_state (time DATE, action TEXT, prev_state TEXT, new_state TEXT, trial_id INT);
    CREATE TABLE runs (time DATE, hostname TEXT, git_sha TEXT, pyversion TEXT, pyexec TEXT, action TEXT, random_seed TEXT, experimenter TEXT, trial_id INT);
    CREATE TABLE saves(time DATE, user TEXT, resume_state TEXT, trial_id INT);
    CREATE TABLE debug_log(time DATE, level TEXT, message TEXT, trial_id INT);
    CREATE TABLE notes(time DATE, experimenter TEXT, note TEXT);

    