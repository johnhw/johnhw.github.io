from pyx import *
from ent import *
from math import *
       

ca = canvas.canvas()

n = 100
text.defaulttexrunner.set(mode="latex")
text.defaulttexrunner.preamble("\\usepackage{palatino}")
for j in range(n):   
    i = j + 1 
    r = sqrt(i)
    theta = r * 2 * pi
    x = cos(theta)*r
    y = sin(theta)*r      
    factors = factor(i)
    if len(factors)==1 and factors[0][1]==1:
        ca.fill(path.circle(x,y,0.4), [color.rgb(1.0, 0.7,0.7)])
    elif r == floor(r):
        ca.fill(path.circle(x,y,0.4), [color.rgb(0.7, 0.7,1.0)])
    else:
        ca.fill(path.circle(x,y,0.4), [color.rgb(0.5, 0.5,0.5)])
        ca.stroke(path.circle(x,y,0.4))
    
    ca.text(x,y,str(i), [text.halign.boxcenter, text.valign.middle])
    
           
d = document.document(pages = [document.page(ca, paperformat=document.paperformat.A4, fittosize=1)])
d.writePSfile("spiral_labeled.ps")

