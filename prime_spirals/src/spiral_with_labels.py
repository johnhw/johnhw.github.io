from pyx import canvas, document, path, text, style, unit
from ent import factor
from math import sin, cos, sqrt, pi, pow

        
n = 1_000_000


# write out a canvas as a ps files
def flush(ca, name):
    # posterformat = document.paperformat(unit.length(24, unit="inch"),unit.length(24, unit="inch"))
    #p = document.page(ca, paperformat = posterformat)
    p = document.page(ca, paperformat = document.paperformat.A4, fittosize=1)
    d = document.document(pages = [p])
    d.writePDFfile(name)


sz = 8
insize = sz * 0.8

def write_label(ca):
    #write out the label at bottom left corner
    label_text = r'\begin{minipage}{4in} \centering {\LARGE The Sacks Spiral}  \vskip 0.05in \hrule \vskip 0.05in \scriptsize $N='+str(n)+r'$ \vskip 0.1in  \tiny  This chart shows each number from 1 to '+str(n)+r', arranged in a spiral formation. Numbers wind out in a anticlockwise Archimedian spiral, beginning with 0 at the dead center. This is a modified version of the \textit{Sacks Spiral} (developed by Robert Sacks in 1994), which is in turn a modified version of the \textit{Ulam Spiral}, which was discovered by Stanislaw Ulam in 1963. The geometric arrangement reveals distinct structure in the distribution of prime and composite numbers. In this chart, dots are drawn if a number if composite. The diameter of the dot is given by $d = 2^{q-1},$ where $q$ is the number of unique prime factors of $i$. The polar co-ordinates of each dot is $r = \sqrt{i}, \theta=\sqrt{i}.$ This aligns the squares $(1,~4,~9,~16,~25,~36,\dots)$ in a straight line heading east from the centre of the spiral. \end{minipage}'
    t = text.latexrunner(docopt="10pt")
    t.preamble("\\usepackage{fbb}")
    ca.insert(t.text(sz * 0.4, -sz * 0.8, label_text))
    
    
def draw_axis(ca):
    #init the latex code
    t = text.latexrunner(docopt="10pt")
    t.preamble("\\usepackage{fbb}")
    #radius of the render circle
       
    
    
    # draw the bounding box
    ca.stroke(path.rect(-sz,-sz,sz*2,sz*2))   

    # draw the tenth of degree ticks
    for i in range(3600):
        #angle in radians
        ang = (i * pi) / 1800.0
        
        #base size of ticks
        width = 0.001
        outsize = 0.1
        
        #scaling for each major tick step level
        wscale = 2
        oscale = 1.6
                       
        
        #compute tick width and length
        if i%900 == 0:
            width *= wscale
            outsize*=oscale
            
        if i%450 == 0:
            width *= wscale
            outsize*=oscale
    
        if i%50 == 0:
            width *= wscale
            outsize*=oscale
    
        if i%10 == 0:
            width *=wscale
            outsize *=oscale
            
            
        lw = style.linewidth(unit.length(width, type="w", unit="cm"))
        
        # compute tick co-ordinates (inner and outer)
        x1 = cos(ang) * insize
        y1 = -sin(ang) * insize
    
        x2 = cos(ang) * (insize+outsize)
        y2 = -sin(ang) * (insize+outsize)
        
            
        ca.stroke(path.line(x1,y1,x2,y2), [lw])
        
        #compute label co-ordinates
        x3 = cos(ang) * (insize+outsize+0.1)
        y3 = -sin(ang) * (insize+outsize+0.1)
        
        #write on labels
        if i%900==0:
            ca.insert(t.text(x3,y3,"\small "+str(i//10),[text.halign.boxcenter, text.valign.middle]))               
        elif i%450==0:
            ca.insert(t.text(x3,y3,"\\scriptsize "+str(i//10),[text.halign.boxcenter, text.valign.middle]))        
        elif i%50==0:
            ca.insert(t.text(x3,y3,"\\tiny "+str(i//10),[text.halign.boxcenter, text.valign.middle]))        
        
    
ca = canvas.canvas()

#scale to just fit inside radius 11 circle
basescale = (insize) / (sqrt(n)+1)
unit.set(defaultunit="inch")

#init variables
pi2 = 2*pi
ctr = 0
pages = 0

for j in range(n):
    i = j + 2   
    ctr += 1   
    
    # compute co-ordinates
    r = sqrt(i)
    theta = r * pi2    
    x = cos(theta)*r*basescale
    y = sin(theta)*r*basescale
   
   #do exactly n
    if i < n:    
        #factor
        factors = factor(i)
               
        #optional: compute total factors (not just unique ones)
        if(len(factors)>1):            
            ca.fill(path.circle(x,y, basescale*0.05*pow(2,((len(factors)-1)))))
                            
           

#draw the label and axes
write_label(ca)
draw_axis(ca)
flush(ca, "spiral_labeled")

