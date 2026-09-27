import sys,os
src=os.environ.get("SRC","concepts")
exec(open("cut.py").read().split("out={}")[0].replace('f"concepts/{f}.png"','f"'+src+'/{f}.png"'))
from PIL import Image
for i,im in enumerate(sheet5("demon_D6b_chibi",300)): im.save(f"assets/demon_D6_chibi_{i}.png")
def grid(f,R,C,H,prefix):
    g=load(f); m=g<215; Hh,Ww=g.shape
    for i in range(R*C):
        r,c=divmod(i,C); y0,y1,x0,x1=r*Hh//R,(r+1)*Hh//R,c*Ww//C,(c+1)*Ww//C
        sub=nd.binary_opening(m[y0:y1,x0:x1],iterations=1); ys,xs=np.where(sub)
        cutbox(g,(y0+ys.min(),y0+ys.max(),x0+xs.min(),x0+xs.max()),H,pad=4).save(f"assets/{prefix}_{i}.png")
grid("items2",2,4,112,"key")
grid("mansion",1,4,420,"man")
