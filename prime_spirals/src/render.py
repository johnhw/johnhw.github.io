from ent import *
from math import *
import Numeric
from PIL import Image
from PIL import ImageChops

#optional: if you have psyco installed, 
#uncomment these lines for a massive speed up!
#import psyco
#psyco.full()




# render a single anti-aliased pixel
def wu_pixel(surf, x, y, value):
    xint = int(floor(x))
    fracx = x - floor(x)
    yint = int(floor(y))
    fracy = y - floor(y)    
    btl = (1-fracx)*(1-fracy) * value
    btr = (fracx)*(1-fracy) * value
    bbl = (1-fracx)*(fracy) * value
    bbr = (fracx)*(fracy) * value   
    
    surf[xint,yint] += btl
    surf[xint+1,yint] += btr
    surf[xint,yint+1] += bbl
    surf[xint+1,yint+1] += bbr

#render n points on a res x res grid
def render(res, n):
    #init variables
    pi2 = 2*pi
    half_size = res/2
    basescale = (res/2.2)/ (sqrt(n)+1.0)
    image = Numeric.zeros((res,res), Numeric.Float )

    for j in range(n):
        i = j + 1
              
        # compute co-ordinates
        r = sqrt(i)
        theta = r * pi2    
        x = cos(theta)*r*basescale + half_size
        y = -sin(theta)*r*basescale + half_size
        
        if i%10000==0:
            print '%d (%d)' %(i, int(100*i/float(n)))
        
        #factor
        factors = factor(i)
        
        if(len(factors)>1):            
            strength = pow(2, len(factors)-1)     
            wu_pixel(image, x,y,strength)

    #write the image
    image = image.astype(Numeric.Int8)        
    mode = "L"
    img = Image.fromstring(mode, (image.shape[1], image.shape[0]), image.tostring())
    ImageChops.invert(img).save("spiral.png")

render(res=1024,n = 10000000)    

