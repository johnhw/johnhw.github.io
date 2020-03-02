
import numpy as np
import matplotlib.pyplot as plt
import imageio
from life_utils import to_numpy, autoguess_life_file, zpad
import IPython.display
import scipy.ndimage
import colorcet
from PIL import Image, ImageDraw, ImageFont

kernel = np.array([[2,2,2], [2,1,2], [2,2,2]])
import scipy.signal
def life_numpy(np_cells, boundary="wrap", mode="same"):
    """Compute next generation from a binary NumPy array 
    representing the cell states"""
    result = scipy.signal.convolve2d(np_cells, kernel, mode=mode, boundary=boundary)        
    return np.where(((result>4) & (result<8)), 1, 0)
 

def get_cmap(cmap):
    """Return a colormap object,
    either from colorcet or matplotlib"""
    if cmap in colorcet.cm:
        cm = colorcet.cm[cmap]
    else:
        cm = plt.get_cmap(cmap)
    return cm


def load_lif(fname):
    """Return the given life file as a numpy array"""
    return to_numpy(autoguess_life_file(fname)[0])

def show_lif(np_cells):
    """Show a life file as a grayscale image"""
    fig, ax = plt.subplots()
    ax.imshow(np_cells, cmap='gray')
    ax.set_aspect(1.0)
    ax.axis("off")

def blit(dest, src, loc):
    """Copy src to dest, with an offset given by loc, cropping the
    src as required"""
    # from https://stackoverflow.com/questions/28676187/numpy-blit-copy-part-of-an-array-to-another-one-with-a-different-size    
    pos = [i if i >= 0 else None for i in loc]
    neg = [-i if i < 0 else None for i in loc]
    target = dest[tuple([slice(i,None) for i in pos])]
    src = src[tuple([slice(i, j) for i,j in zip(neg, target.shape)])]
    target[tuple([slice(None, i) for i in src.shape])] = src   
    return dest

def apply_subpixel_translate(np_cell_anim, translate, scale):        
    """Translate each frame of np_cell_anim by translate (fractional)
    multiplied by scale"""
    imgs = []
    dx, dy = 0, 0 
    img = np.zeros_like(np_cell_anim[0,:,:,:])                    
    for i in range(np_cell_anim.shape[0]):
        dx, dy = dx+translate[0], dy+translate[1]            
        img = img * 0
        imgs.append(blit(img, np_cell_anim[i], (int(dy*scale), int(dx*scale), 0)))            
    return np.array(imgs)



def add_label(frames, label, size=24):
    """Render a label on each frame of an animation"""    
    font =  ImageFont.truetype("fonts/Lato-regular.ttf", size)
    w, h = font.getsize(label)
    x = frames.shape[2] // 2 - w//2
    y = int(frames.shape[1] - h * 1.5)
    labelled_frames = []
    for frame in frames:
        img = Image.fromarray(frame)
        draw = ImageDraw.ImageDraw(img)
        draw.text((x, y), label, font=font)
        labelled_frames.append(np.array(img))
    return labelled_frames

            
def make_gif(np_cell_anim, fname="temp.gif", fps=1, scale=None, target_px=512, translate=None, label=None):     
    """Turn a sequence of floating point images into a gif, and return it. Optionally, scale
    and translate the image"""
    np_cell_anim = np.array(np_cell_anim)
    # autoscale to target size if no scale given
    if scale is None:
        largest = np.max(np_cell_anim.shape[1:3])
        scale = target_px // largest    
        
    # rescale and convert to uint8 3 channel colour
    if len(np_cell_anim.shape)==3:
        np_cell_anim = np.tile(np_cell_anim[:,:,:,None], (1,1,1,3))        
    np_cell_anim = scipy.ndimage.zoom(np_cell_anim, (1, scale, scale, 1), order=0)
    
    if translate is not None:
        np_cell_anim = apply_subpixel_translate(np_cell_anim, translate, scale)
    np_cell_anim = (np.clip(np_cell_anim, 0, 1) * 255.0).astype(np.uint8)
    
    if label is not None:
        np_cell_anim = add_label(np_cell_anim, label)

    imageio.mimsave(fname, np_cell_anim, fps=fps)
    # return image for easy notebook display
    return IPython.display.Image(filename=fname, width="50%")

def life_anim(np_cells, n, pad=0, boundary="wrap"):
    """Animate running the Game of Life  on
    an initial pattern np_cells
    and return a [n, w, h] cell array"""
    np_cells = zpad(np_cells, pad)
    np_cells_anim = []
    for i in range(n):
        np_cells_anim.append(life_numpy(np_cells))
        np_cells = life_numpy(np_cells, boundary=boundary)
    return np_cells_anim