import json,os,sys,uuid,io,time
from google.cloud import storage
from PIL import Image
import imagehash
DRY = os.environ.get("DRY","0")=="1"
cli=storage.Client.from_service_account_json(os.environ["SA"])
b=cli.bucket("olsenklanen-familieside.firebasestorage.app")
man=json.load(open("_foto_import/manifest.json"))
# eksisterende billeder for de aar vi rorer ved -> phash til dubletkontrol
eks=[]
for aar in sorted({m["aar"] for m in man}):
    bl=list(cli.list_blobs(b,prefix=f"fotovaeg/{aar}/"))
    print(f"::notice::Eksisterende i {aar}: {len(bl)}")
    for x in bl:
        try:
            eks.append((x.name,imagehash.phash(Image.open(io.BytesIO(x.download_as_bytes())).convert("RGB"))))
        except Exception as e: print("kunne ikke laese",x.name,e)
ok=spring=0; sl=[]; t0=int(time.time()*1000)
for i,m in enumerate(man):
    p="_foto_import/"+m["fil"]; h=imagehash.phash(Image.open(p).convert("RGB"))
    d=[n for n,hh in eks if h-hh<=4]
    if d: print("SPRING OVER (findes):",m["fil"],"~",d[0]); sl.append(m["fil"]+" ~ "+d[0].split("/")[-1]); spring+=1; continue
    navn=f"fotovaeg/{m['aar']}/{m['gruppe']}/{t0+i}_{i}_{m['fil']}"
    if DRY: print("ville lægge op:",navn); ok+=1; continue
    bl=b.blob(navn)
    bl.metadata={"tekst":m["tekst"],"navn":m["navn"],"uploaderNr":"8B","firebaseStorageDownloadTokens":str(uuid.uuid4())}
    bl.upload_from_filename(p,content_type="image/jpeg")
    eks.append((navn,h)); ok+=1
    if ok%25==0: print("lagt op:",ok)
print(f"::notice::FAERDIG (DRY={DRY}): {ok} lagt op, {spring} sprunget over som dubletter")
if sl: print("::notice::Dubletter: "+" | ".join(sl)[:3000])
