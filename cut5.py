# round-5 cutter: works on files in concepts/ (restore with: git sparse-checkout disable) or ~/work
import sys,os; sys.argv=[sys.argv[0]]
src=os.environ.get("SRC","concepts")
exec(open("cut.py").read().split("out={}")[0].replace('f"concepts/{f}.png"','f"'+src+'/{f}.png"'))
from PIL import Image
for i,im in enumerate(sheet5("demon_D5_chibi",300)): im.save(f"assets/demon_D5_chibi_{i}.png")
g=load("buildings"); m=g<215; Hh,Ww=g.shape
for i in range(6):
    r,c=divmod(i,3); y0,y1,x0,x1=r*Hh//2,(r+1)*Hh//2,c*Ww//3,(c+1)*Ww//3
    sub=nd.binary_opening(m[y0:y1,x0:x1],iterations=1); ys,xs=np.where(sub)
    cutbox(g,(y0+ys.min(),y0+ys.max(),x0+xs.min(),x0+xs.max()),340,pad=4).save(f"assets/bld_{i}.png")
for i in range(1,6):
    im=Image.open(f"{src}/cg{i}.png").convert("L").resize((1280,720),Image.LANCZOS); im.save(f"assets/cg_{i}.png")
# open the arch hole (fill_holes closed it)
im=Image.open("assets/bld_5.png"); a=np.array(im); g0=a[...,0]; al=a[...,1]
white=(g0>232)&(al>0); lab,n=nd.label(white)
if n:
    sz=nd.sum(white,lab,range(1,n+1)); k=int(np.argmax(sz))+1
    hole=nd.binary_dilation(lab==k,iterations=1); a[...,1][hole]=0; Image.fromarray(a,"LA").save("assets/bld_5.png")
