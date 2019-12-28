import os
import sys
import json
from PIL import Image

def readTileFile(root, x, y):
    pathNoExt = f'{root}{x}_{y}'
    pathJpg = f'{pathNoExt}.jpg'
    pathPng = f'{pathNoExt}.png'
    if os.path.exists(pathJpg):
        width, height = Image.open(pathJpg).size
        return width, height, f'{x}_{y}.jpg'
    elif os.path.exists(pathPng):
        width, height = Image.open(pathPng).size
        return width, height, f'{x}_{y}.png'
    else:
        return None, None, None


def getTilesetInfo(root):
    x = 0
    x_pos = 0
    y = 0
    y_pos = 0
    tiles = []

    while True:
        width, _, name = readTileFile(root, x, y)
        if name is None:
            break
        while True:
            _, height, name = readTileFile(root, x, y)
            if name is None:
                y = 0
                y_pos = 0
                break
            print(name)
            tiles.append({
                'x': x_pos,
                'y': y_pos,
                'name': name
            })
            y_pos += height
            y += 1
        x_pos += width
        x += 1

    return tiles


def getMultipleTilesetsInfo(root):
    dirs = [f for f in os.listdir(root) if os.path.isdir(os.path.join(root, f))]
    print(f'{len(dirs)} dirs found')
    data = []
    for d_name in dirs:
        d_path = os.path.join(root, d_name) + '\\'
        print(d_path)
        data.append({
            'key': d_name,
            'tiles': getTilesetInfo(d_path)
        })
    return data

def parse_args():
    scale = int(sys.argv[2]) if len(sys.argv) > 1 else 1
    root = sys.argv[3] if len(sys.argv) > 3 else os.getcwd() + '\\'
    print(f'scale@{scale}')
    return scale, root

def util_tileset():
    scale, root = parse_args()
    result = {
        'scale': scale,
        'tiles': getTilesetInfo(root)
    }

    f = open(f'{root}index.json', 'w')
    json.dump(result, f, indent=2)


def util_mtiles():
    scale, root = parse_args()
    result = {
        'scale': scale,
        'areas': getMultipleTilesetsInfo(root)
    }
    f = open(f'{root}index.json', 'w')
    json.dump(result, f, indent=2)


if __name__ == '__main__':
    utilType = sys.argv[1]
    if utilType == 'tileset':
        util_tileset()
    elif utilType == 'mtiles':
        util_mtiles()
    else:
        print('Supported: tileset, mtiles')
