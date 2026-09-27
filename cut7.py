import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
def loadc(f):
    im=np.array(Image.open(f"concepts/{f}.png").convert("RGB")).astype(np.float32)
    g=im.mean(2); sat=im.max(2)-im.min(2); return im,g,sat
def fg(g,sat): return (g<225)|(sat>40)
def cutc(im,g,sat,box,H,pad=4):
    y0,y1,x0,x1=box; y0=max(0,y0-pad);x0=max(0,x0-pad);y1=min(g.shape[0],y1+pad);x1=min(g.shape[1],x1+pad)
    m=fg(g[y0:y1,x0:x1],sat[y0:y1,x0:x1]); m=nd.binary_dilation(m,iterations=2); fill=nd.binary_fill_holes(nd.binary_closing(m,iterations=3))
    lab,n=nd.label(fill)
    if n>1:
        sz=nd.sum(fill,lab,range(1,n+1)); fill=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>0.02*sz.max()])
    a=(nd.gaussian_filter(fill.astype(np.float32),0.8)*255).clip(0,255)
    rgb=im[y0:y1,x0:x1]; out=np.dstack([rgb,a]).astype(np.uint8); img=Image.fromarray(out,"RGBA")
    ys,xs=np.where(fill); img=img.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    # core: strongly red pixels
    r=rgb[ys.min():ys.max()+1,xs.min():xs.max()+1]; red=(r[...,0]-r[...,1]>90)&(r[...,0]>150)
    core=None
    if red.sum()>15:
        yy,xx=np.where(red); core=[round(float(xx.mean())/img.width,3),round(float(yy.mean())/img.height,3)]
    w=round(img.width*H/img.height); img=img.resize((w,H),Image.LANCZOS); return img,core
def segs(prof,minv,mingap):
    on=prof>minv; out=[]; i=0; n=len(on)
    while i<n:
        if on[i]:
            j=i
            while j<n and (on[j] or (j+mingap<n and on[j:j+mingap].any())): j+=1
            out.append((i,j)); i=j
        else: i+=1
    return out
def row_cut(f,H,prefix,centers,yr=None,start=0,force=None):
    im,g,sat=loadc(f); m=fg(g,sat); m=nd.binary_opening(m,iterations=1)
    y0,y1=yr if yr else (0,g.shape[0]); col=nd.uniform_filter1d(m[y0:y1].sum(0).astype(float),7)
    cuts=[0]+[int(c0+np.argmin(col[int(c0):int(c1)])) for c0,c1 in [(centers[i]+(centers[i+1]-centers[i])*0.25,centers[i]+(centers[i+1]-centers[i])*0.75) for i in range(len(centers)-1)]]+[g.shape[1]]
    if force: cuts=force
    meta={}
    for i in range(len(centers)):
        ca,cb=cuts[i],cuts[i+1]; x0=max(0,ca-90); x1=min(g.shape[1],cb+90); sub=m[y0:y1,x0:x1]; lab,n=nd.label(nd.binary_dilation(sub,iterations=1)); idx=range(1,n+1); sz=nd.sum(sub,lab,idx); cm=nd.center_of_mass(sub,lab,idx)
        sl=nd.find_objects(lab); keep=np.zeros_like(sub); xx=np.arange(x0,x1)[None,:]
        for k in range(n):
            if sz[k]<=30: continue
            a0,a1=x0+sl[k][1].start,x0+sl[k][1].stop; comp=(lab==k+1)
            spans=(a0<ca-40 and a1>ca+40) or (a0<cb-40 and a1>cb+40)
            if spans: keep|=comp&(xx>=ca)&(xx<cb)
            elif ca<=x0+cm[k][1]<cb: keep|=comp
        keep&=sub
        big=max(sz) if n else 1
        ys,xs=np.where(keep); im2=im[y0:y1,x0:x1].copy(); g2=g[y0:y1,x0:x1].copy(); s2=sat[y0:y1,x0:x1].copy()
        img,core=cutc(im2,g2,s2,(ys.min(),ys.max(),xs.min(),xs.max()),H,pad=2)
        k=start+i; img.save(f"assets/{prefix}_{k}.png"); meta[f"{prefix}_{k}"]=core
    print(f,cuts); return meta

meta={}
meta.update(row_cut("heroine_C_chibi",300,"heroine_C_chibi",[170,455,730,985,1260]))
meta.update(row_cut("demon_D7b_chibi",300,"demon_D7_chibi",[120,330,525,715,910],force=[0,243,448,621,806,1024]))
meta.update(row_cut("heroine_poses",300,"hpose",[180,490,775,1020,1250],(0,380)))
meta.update(row_cut("heroine_poses",300,"hpose",[170,500,820,1200],(380,768),5))
meta.update(row_cut("demon_poses_D4",300,"dpose",[170,720,990,1250],force=[0,560,865,1125,1397]))
json.dump(meta,open("assets/core.json","w")); print(meta)
