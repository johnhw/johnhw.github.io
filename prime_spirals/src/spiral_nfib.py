from pyx import canvas, document, path, text, color
from ent import factor
from math import sin, cos, sqrt, pi

#fibonacci table
fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465, 14930352]  

n = 10000  

#recursive compute nfib(n). This is Sloane sequence A0000119
def nfib(n):
    fibindex = 0
    for i in fibs:
        if i<=n:
            fibindex = fibindex+1
        
    fibindex -= 1
    fibi = fibs[fibindex]
    k = n - fibi
    if n>=0 and n<=2:
        return 1
          
    elif n>2 and k>=0 and k<fibs[fibindex-3]:
        return nfib(fibs[fibindex-2]+k)+nfib(k)
        
    elif n>2 and k>=fibs[fibindex-3] and k<fibs[fibindex-2]:
        return 2 * nfib(k)
    else:
       return nfib(fibs[fibindex+1]-2-k)
       
  
ca = canvas.canvas()

#golden ratio
phi = (1+sqrt(5))/2.0

for j in range(n):   
    i = j + 1
    r = sqrt(i)
    theta = (i * 2 * pi) / (phi*phi)
    x = cos(theta)*r
    y = sin(theta)*r      
    
    radius = 0.01*nfib(i)
    ca.fill(path.circle(x,y, radius))
                                  
                                  
d = document.document(pages = [document.page(ca, paperformat=document.paperformat.A4, fittosize=1)])
d.writePDFfile("spiral_nfib.pdf")

