import zlib, struct

# pixel-art baby creature (same as app), chars -> color
PAL = {'o':(59,109,59), 'b':(126,201,126), 'l':(168,224,168)}
BG  = (223,232,218)  # soft green
BABY = [
".....oooo.....",
"...oobbbboo...",
"..obbllllbbo..",
".obbllllllbbo.",
".obboobboobbo.",
".obbllllllbbo.",
".obbllllllbbo.",
".obbboooobbbo.",
"..obbllllbbo..",
"..obbbbbbbbo..",
"...o.ooo.o...",
"...o.o.o.o..."]

def make(size, fname):
    grid_w = len(BABY[0]); grid_h = len(BABY)
    # scale art to ~70% of icon, centered
    cell = int(size*0.062)
    art_w = grid_w*cell; art_h = grid_h*cell
    ox = (size-art_w)//2; oy = (size-art_h)//2 + int(size*0.02)
    # build RGB buffer
    img = [[BG for _ in range(size)] for _ in range(size)]
    for gy,row in enumerate(BABY):
        for gx,ch in enumerate(row):
            if ch in PAL:
                col = PAL[ch]
                for dy in range(cell):
                    for dx in range(cell):
                        px = ox+gx*cell+dx; py = oy+gy*cell+dy
                        if 0<=px<size and 0<=py<size:
                            img[py][px]=col
    # encode PNG
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw += bytes(img[y][x])
    def chunk(typ,data):
        c = struct.pack(">I",len(data))+typ+data
        return c+struct.pack(">I", zlib.crc32(typ+data)&0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack(">IIBBBBB", size,size,8,2,0,0,0)
    idat = zlib.compress(bytes(raw),9)
    png = sig+chunk(b'IHDR',ihdr)+chunk(b'IDAT',idat)+chunk(b'IEND',b'')
    open(fname,'wb').write(png)
    print("wrote",fname,size)

make(180,"icons/icon-180.png")
make(192,"icons/icon-192.png")
make(512,"icons/icon-512.png")
