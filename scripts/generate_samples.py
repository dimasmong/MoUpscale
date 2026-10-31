import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('public/samples', exist_ok=True)
os.makedirs('tests/fixtures', exist_ok=True)

def create_sample_photo():
    # 160x120 landscape
    img = Image.new('RGB', (160, 120), color=(135, 206, 235))
    draw = ImageDraw.Draw(img)
    # Sky gradient
    for y in range(80):
        r = int(135 + (255 - 135) * (y / 80))
        g = int(206 + (220 - 206) * (y / 80))
        b = int(235 + (180 - 235) * (y / 80))
        draw.line([(0, y), (160, y)], fill=(r, g, b))
    # Sun
    draw.ellipse([110, 15, 140, 45], fill=(255, 220, 50))
    # Mountains
    draw.polygon([(0, 90), (40, 50), (90, 95)], fill=(90, 100, 130))
    draw.polygon([(70, 95), (115, 40), (160, 100)], fill=(75, 85, 115))
    # Hills & water
    draw.rectangle([0, 85, 160, 120], fill=(46, 139, 87))
    draw.rectangle([0, 105, 160, 120], fill=(65, 105, 225))
    
    img.save('public/samples/sample-photo.jpg', quality=85)
    img.save('tests/fixtures/photo_lowres.jpg', quality=85)

def create_sample_anime():
    # 128x128 anime stylized graphic
    img = Image.new('RGB', (128, 128), color=(250, 245, 255))
    draw = ImageDraw.Draw(img)
    # Hair
    draw.polygon([(20, 70), (40, 15), (70, 10), (100, 20), (110, 75), (90, 50), (64, 45), (35, 55)], fill=(120, 60, 220))
    # Face skin
    draw.polygon([(35, 55), (64, 105), (95, 55)], fill=(255, 224, 200))
    # Eyes
    draw.ellipse([45, 60, 55, 75], fill=(30, 20, 60))
    draw.ellipse([48, 63, 52, 69], fill=(255, 255, 255))
    draw.ellipse([73, 60, 83, 75], fill=(30, 20, 60))
    draw.ellipse([76, 63, 80, 69], fill=(255, 255, 255))
    # Smile
    draw.arc([55, 80, 73, 90], 0, 180, fill=(180, 50, 50), width=2)
    # Line art contour
    draw.line([(35, 55), (64, 105)], fill=(100, 70, 50), width=2)
    draw.line([(64, 105), (95, 55)], fill=(100, 70, 50), width=2)

    img.save('public/samples/sample-anime.png')
    img.save('tests/fixtures/anime_character.png')

def create_sample_graphic():
    # 140x140 transparent PNG with crisp logo & text
    img = Image.new('RGBA', (140, 140), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Modern circular badge
    draw.ellipse([15, 15, 125, 125], fill=(253, 141, 20, 230), outline=(255, 255, 255, 255), width=3)
    # Inner shape
    draw.polygon([(45, 95), (70, 40), (95, 95), (70, 75)], fill=(255, 255, 255, 255))
    # Small star
    draw.ellipse([64, 30, 76, 42], fill=(255, 255, 255, 255))

    img.save('public/samples/sample-graphic.png')
    img.save('tests/fixtures/transparent_logo.png')

def create_sample_portrait():
    # 130x160 portrait
    img = Image.new('RGB', (130, 160), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    # Background soft gradient
    for y in range(160):
        draw.line([(0, y), (130, y)], fill=(int(220 + y*0.1), int(225 + y*0.1), int(235 + y*0.1)))
    # Shoulders
    draw.ellipse([15, 110, 115, 200], fill=(40, 50, 70))
    # Neck
    draw.rectangle([54, 85, 76, 115], fill=(235, 195, 170))
    # Head
    draw.ellipse([40, 30, 90, 95], fill=(245, 205, 180))
    # Hair
    draw.ellipse([36, 20, 94, 65], fill=(45, 30, 25))
    # Eyes
    draw.ellipse([49, 54, 57, 62], fill=(60, 45, 35))
    draw.ellipse([73, 54, 81, 62], fill=(60, 45, 35))
    # Nose & lips
    draw.line([(65, 58), (64, 72)], fill=(200, 150, 130), width=2)
    draw.line([(58, 80), (72, 80)], fill=(180, 80, 80), width=2)

    img.save('public/samples/sample-portrait.jpg', quality=80)
    img.save('tests/fixtures/portrait.jpg', quality=80)

def create_odd_and_noisy_fixtures():
    # 127x93 odd dimension image
    odd_img = Image.new('RGB', (127, 93), color=(80, 120, 160))
    odd_draw = ImageDraw.Draw(odd_img)
    odd_draw.text((10, 20), "MoUpscale 127x93", fill=(255, 255, 255))
    odd_draw.rectangle([20, 45, 100, 75], outline=(253, 141, 20), width=2)
    odd_img.save('tests/fixtures/odd_dimensions_127x93.png')

    # Heavy noisy image
    import random
    noisy_img = Image.new('RGB', (100, 100), color=(128, 128, 128))
    pixels = noisy_img.load()
    for y in range(100):
        for x in range(100):
            noise = random.randint(-40, 40)
            base = 120 if (x//20 + y//20)%2 == 0 else 180
            val = min(255, max(0, base + noise))
            pixels[x, y] = (val, val, val)
    noisy_img.save('tests/fixtures/noisy_image.png')

create_sample_photo()
create_sample_anime()
create_sample_graphic()
create_sample_portrait()
create_odd_and_noisy_fixtures()

print("Generated sample images in public/samples/ and tests/fixtures/")
