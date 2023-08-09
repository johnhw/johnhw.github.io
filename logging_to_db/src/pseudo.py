import secrets, random, hashlib, sys

def make_pseudo(*args):
    if len(args)==0:
        token = secrets.token_hex(32)  # random
    else:
        h = hashlib.sha512()  # hashed arguments
        h.update(" ".join(sys.argv[1:]).encode("utf-8"))
        token = h.hexdigest()
    random.seed(int(token, 16))
    c, v = "BCDFGHKLMNPRSTVWZ", "UEIOA"
    pattern = [c, v, c, v, c, "-", v, c, v, c, v]
    return "".join(random.choice(s) for s in pattern)

if __name__ == "__main__":
    print(make_pseudo(*sys.argv[1:]))
    
