import numpy as np
from PIL import Image
from scipy import ndimage as nd
import json, sys
def load(f):
    im=np.array(Image.open(f"concepts/{f}.png").convert("L")).astype(np.float32); return im
def rgba(g, fill):
    a=nd.gaussian_filter(fill.astype(np.float32),0.8)*255
    out=np.zeros(g.shape+(2,),np.uint8); out[...,0]=g.clip(0,255); out[...,1]=a.clip(0,255); return Image.fromarray(out,"LA")
def cutbox(g, box, H=None, pad=6):
    y0,y1,x0,x1=box; y0=max(0,y0-pad);x0=max(0,x0-pad);y1=min(g.shape[0],y1+pad);x1=min(g.shape[1],x1+pad)
    sub=g[y0:y1,x0:x1]; m=sub<228
    m=nd.binary_dilation(m,iterations=2); fill=nd.binary_fill_holes(nd.binary_closing(m,iterations=3))
    # keep largest-ish components only (drop specks)
    lab,n=nd.label(fill); 
    if n>1:
        sz=nd.sum(fill,lab,range(1,n+1)); keep=[i+1 for i,s in enumerate(sz) if s>0.01*sz.max()]
        fill=np.isin(lab,keep)
    im=rgba(sub,fill)
    ys,xs=np.where(fill); im=im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    if H: 
        w=round(im.width*H/im.height); im=im.resize((w,H),Image.LANCZOS)
    return im
def sheet5(f,H):
    g=load(f); m=g<225; col=m.sum(0).astype(float); W=g.shape[1]
    cuts=[0]
    for k in range(1,5):
        c=int(k*W/5); w=int(W/10); seg=col[c-w:c+w]; cuts.append(c-w+int(np.argmin(nd.uniform_filter1d(seg,9))))
    cuts.append(W); res=[]
    for i in range(5):
        x0,x1=cuts[i],cuts[i+1]; sub=m[:,x0:x1]; ys,xs=np.where(sub)
        res.append(cutbox(g,(ys.min(),ys.max(),x0+xs.min(),x0+xs.max()),H,pad=2))
    return res
def comps(f,k,H,dil=14):
    g=load(f); m=g<225; md=nd.binary_dilation(m,iterations=dil); lab,n=nd.label(md)
    sl=nd.find_objects(lab); sizes=nd.sum(md,lab,range(1,n+1)); idx=np.argsort(-sizes)[:k]
    boxes=[(sl[i][0].start+dil,sl[i][0].stop-dil,sl[i][1].start+dil,sl[i][1].stop-dil) for i in idx]
    boxes.sort(key=lambda b:(round(b[0]/ (g.shape[0]/ (3 if k>=6 else 2))), b[2]))
    return [cutbox(g,b,H) for b in boxes]
out={}
for name,H in [("heroine_A_chibi",300),("demon_C_chibi",300),("demon_D_chibi",300),("heroine_A",420),("demon_C_normal",420),("demon_D_normal",420),("demon_D2_chibi",300),("demon_D2_normal_clean",420)]:
    for i,im in enumerate(sheet5(name,H)): im.save(f"assets/{name}_{i}.png"); 
for i,im in enumerate(comps("animal_forms",6,260)): im.save(f"assets/animal_{i}.png")
for i,im in enumerate(comps("props",12,320)): im.save(f"assets/prop_{i}.png")
pan=Image.open("concepts/panorama.png").convert("L"); pan=pan.resize((1800,600)); pan.save("assets/panorama.png")
# animal grid fix
import glob,os
for f in glob.glob("assets/animal_*.png"): os.remove(f)
g=load("animal_forms"); m=g<215
cells=[(0,340,0,600),(0,340,600,1536),(340,720,0,600),(340,720,600,1536),(720,1024,0,750),(720,1024,750,1536)]
for i,(y0,y1,x0,x1) in enumerate(cells):
    sub=nd.binary_opening(m[y0:y1,x0:x1],iterations=1); ys,xs=np.where(sub)
    cutbox(g,(y0+ys.min(),y0+ys.max(),x0+xs.min(),x0+xs.max()),240,pad=4).save(f"assets/animal_{i}.png")
