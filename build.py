from PIL import Image; import glob, base64, io, json, os
A={}
for f in sorted(glob.glob("assets/*.png")):
    k=os.path.basename(f)[:-4]
    if k.startswith(("demon_C","demon_D2","demon_D3","demon_D_","demon_D4","demon_D5","heroine_A_0","heroine_A_1","heroine_A_2","heroine_A_3","heroine_A_4")): continue
    im=Image.open(f).convert("RGBA")
    if k=="panorama" or k.startswith("cg_"):
        im=im.convert("RGB")
        if k.startswith("cg_"): im=im.resize((1120,630),Image.LANCZOS)
        b=io.BytesIO(); im.save(b,"JPEG",quality=60 if k.startswith("cg_") else 78); A[k]="data:image/jpeg;base64,"+base64.b64encode(b.getvalue()).decode(); continue
    b=io.BytesIO(); im.save(b,"WEBP",quality=82,method=4); A[k]="data:image/webp;base64,"+base64.b64encode(b.getvalue()).decode()
src=open("game_src.html").read().replace("__ASSETS__",json.dumps(A))
open("index.html","w").write(src); print("ok",len(src)//1024,"KB")
