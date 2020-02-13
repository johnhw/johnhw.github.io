from pyx import canvas, document, path
from ent import factor
from math import sin, cos, sqrt, pi
        
n = 100_000    
ca = canvas.canvas()

phi = (1 + sqrt(5)) / 2.0
for j in range(n):   
    i = j + 1 
    r = sqrt(i)
    theta = i * 2 * pi  / (phi*phi)
    x = cos(theta)*r
    y = -sin(theta)*r        
    factors = factor(i)               
    if(len(factors)>1):            
        radius = 0.05*pow(2,len(factors)-1)
        ca.fill(path.circle(x,y, radius))
d = document.document(pages = [document.page(ca, 
                            paperformat=document.paperformat.A4, 
                            fittosize=1)])
d.writePDFfile('spiral_vogel_1e5.pdf')