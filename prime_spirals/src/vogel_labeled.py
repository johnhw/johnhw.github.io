from pyx import canvas, document, path, text, color
from ent import factor
from math import sin, cos, sqrt, pi
       
n = 144
ca = canvas.canvas()

phi = (1 + sqrt(5)) / 2.0
fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040]

t = text.latexrunner(docopt="10pt")
t.preamble("\\usepackage{fbb}")
for j in range(n):   
    i = j + 1 
    r = sqrt(i)
    theta = i * 2 * pi  / (phi*phi)
    x = cos(theta)*r
    y = sin(theta)*r      
    if i in fibs:
        ca.fill(path.circle(x,y,0.6), [color.rgb(0.6, 0.6,1.0)])
    else:
        ca.fill(path.circle(x,y,0.6), [color.rgb(0.6, 0.6,0.6)])
        ca.stroke(path.circle(x,y,0.6))
    
    ca.insert(t.text(x,y,"\\Large "+str(i), [text.halign.boxcenter, text.valign.middle]))
    
           
d = document.document(pages = [document.page(ca, paperformat=document.paperformat.A4, fittosize=1)])
d.writePDFfile("vogel_labeled.pdf")

