import random 
from datetime import datetime 
from dateutil.tz import tzlocal 
import platform 
import sys 
import json 
from uuid import getnode as get_mac
import machineid
import git
import time 
import os
from hashlib import sha256

def sha(s):
    return sha256(s.encode()).hexdigest()

def get_time():
    return datetime.now(tzlocal())

def get_time_string():
    # return ISO 8601 format with timezone and milliseconds
    return get_time().isoformat(timespec='milliseconds')

def get_perf_counter_time():
    return time.perf_counter_ns()

def get_precise_time():
    # return ISO 8601 format with timezone and microseconds
    # *and* the performance counter value
    return get_time(), get_perf_counter_time()

def get_precise_time_string():
    return get_time_string() + f";{get_perf_counter_time()}"

def get_modules():
    import pkg_resources
    installed_packages = {d.project_name: d.version for d in pkg_resources.working_set}
    return installed_packages

def get_id():
    time = get_time_string()
    hostname = '-'.join(platform.uname())
    pyversion = json.dumps([sys.version, sys.executable])
    try:
        repo = git.Repo(search_parent_directories=True)
        git_sha = repo.head.commit.hexsha
        git_name = os.path.basename(repo.working_tree_dir)
        git_sha = f"{git_name}:{git_sha}"
    except:
        git_sha = "null"
    seed = json.dumps((random.getstate()))    
    uuid = machineid.id()
    user = os.getlogin()    

    module_hash = sha(json.dumps(get_modules()))
    return {"time":time, "nanos":get_perf_counter_time(), "hostname":hostname, "pyversion":pyversion, "git_sha":git_sha,  "uuid":uuid, "user":user, "mac":get_mac(), "module_hash":module_hash}

if __name__=="__main__":
    print("ID:", get_id())
    print("Time:", get_time_string())
    print("Precise time:", get_precise_time_string())
    print("Modules:", get_modules())
    print("Seed:", random.getstate())