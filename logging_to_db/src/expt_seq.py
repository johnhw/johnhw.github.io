
    

def map_tree(states, prefix=None, context=None):
    prefix = prefix or []
    context = context or {}    
    for node in states:        
        children = node.get("children", [])        
        context = context | node.get("values", {})        
        path = prefix + [node["name"]]
        res = yield tuple(path), context   
        if type(children)==int:                            
            children = [{"name": i} for i in range(children)]            
        yield from map_tree(children, prefix=path)
    
tree = [{"name":"a"}, {"name":"b"}, {"name":"c", "values":{"offset":0}, "children":[{"name":"g", "values":{"offset":10, "kind":"chi"}, "children":3}, {"name":"e"}, ]}, {"name":"d"}]

class FSM:
    special_states = ["START", "COMPLETE", "ABORTED", "PAUSED"]

    def __init__(self, spec, pre_state_change=None, post_state_change=None):
        self.init_from_spec(spec)
       
        self.history = []
        # set up state change callbacks
        self.pre_state_change = pre_state_change or (lambda: None)
        self.post_state_change = post_state_change or (lambda: None)
        self.state = "START"
        self.paused_state = None 
        self.prev_state = None
        self.prev_reason = ""

    def init_from_spec(self, spec):
        tree = [elt for elt in map_tree(spec)]
        self.paths = {path:ix for ix, (path, ctx) in enumerate(self.states)}
        self.path_order = [path for path, ctx in self.states]
        self.ix = 0

    def jump(self, state, reason=""):
        """Jump directly to the given state (as a tuple)"""        
        if state in self.paths:
            self.ix = self.paths[state]
        else:
            raise ValueError("Tried to jump to non-existent state", state)
        self.state_changed(state, reason)

    def undo(self, n=1):
        """Undo the last n state changes"""
        for i in range(n):
            if len(self.history)>0:
                state = self.history.pop()
                self.state_change(state, f"UNDO:{n}")
            else:
                break

    def state_change(self, new_state, reason):
        """Change state, calling pre_state_change and post_state_change callbacks"""
        self.prev_state = self.state
        self.pre_state_change(self.state, new_state, reason)        
        self.state = new_state
        self.post_state_change(self.prev_state, new_state, reason)
        self.prev_reason = reason

    def path(self):
        return "/"+"/".join([str(c) for c in self.state])

    def complete(self, reason):
        self.state_change("COMPLETE", reason)

    def abort(self, reason):
        self.state_change("ABORTED", reason)

    def pause(self, reason=""):
        self.paused_state = self.state 
        self.state_change("PAUSED", reason)

    def unpause(self, reason=""):
        self.state_change(self.paused_state, reason)
        self.paused_state = None



class ExptState:
    def __init__(self, tree):
        self.states = [elt for elt in map_tree(tree)]
        self.paths = {path:ix for ix, (path, ctx) in enumerate(self.states)}
        self.path_order = [path for path, ctx in self.states]
        self.ix = 0
        self.state = self.states[self.ix][0]

    def next(self, n=1, k=0, reason=""):
        """Advance state by n steps. If k>0, change at most the
        last k elements of the path."""
        if n==0: # no change; just "re-enter" the current state
            self.state_changed(reason)
            return 
        # no limit
        if k==0:
            self.ix += n 
        else:
            # limited by prefix
            sign = 1 if n>0 else -1 
            prefix = self.state[:-k]                             
            while self.ix>0 and self.ix<len(self.states) and self.path_order[self.ix][:len(prefix)] == prefix:
                self.ix += sign 
            self.ix -= sign
        self.state_changed(reason)    
        
    def jump(self, path, reason=""):
        """Jump directly to the given state (as a tuple)"""        
        if path in self.paths:
            self.ix = self.paths[path]
        else:
            raise ValueError("Tried to jump to non-existent path", path)
        self.state_changed(reason)

    def state_changed(self, reason):
        """The state changed; update the index, write a log."""
        old_state = self.state 
        if self.ix<0:
            self.ix = 0
        if self.ix >= len(self.states):
            self.ix = len(self.states)-1
        self.state = self.states[self.ix][0]
        print(f"{old_state} to {self.state} because of <{reason}>")

    def up(self, n, reason=""):
        """Go back (n<=0) or forward (n>0) until at least the last n elements
        of the path have changed."""
        sign = 1 if n>0 else -1 
        n = abs(n)             
        path = self.path_order[self.ix]
        k = len(path) - n 
        if k<0:
            k = 0
        while self.ix>0 and self.ix<len(self.states) and self.path_order[self.ix][:k]==path[:k]:
            self.ix += sign 
        self.ix -= sign
        self.state_changed(reason)   

    def state(self):
        return self.state

    
    def path(self):
        return "/"+"/".join([str(c) for c in self.state])

    def context(self):
        return self.states[self.ix][1]
        
            
        

g = PathState(tree)
g.next()
g.next()
g.next()
g.jump(('c', 'g', 1))
print(g.path())

