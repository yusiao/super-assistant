(function () {
  const homes = {
    Toyota: "https://www.toyota.com.tw/showroom/", Lexus: "https://www.lexus.com.tw/", Honda: "https://www.honda-taiwan.com.tw/Auto",
    Nissan: "https://www.nissan.com.tw/", Mitsubishi: "https://www.mitsubishi-motors.com.tw/", Subaru: "https://www.subaru.asia/tw/zh/home/",
    Suzuki: "https://www.suzukimotor.com.tw/", Mazda: "https://www.mazda.com.tw/", Hyundai: "https://www.hyundai-motor.com.tw/",
    Kia: "https://www.kia.com/tw/", Ford: "https://www.ford.com.tw/", Tesla: "https://www.tesla.com/zh_tw/",
    Volkswagen: "https://www.volkswagen.com.tw/", "Volkswagen Commercial Vehicles": "https://www.volkswagen-commercial.com.tw/",
    "Škoda": "https://www.skoda.com.tw/", Audi: "https://www.audi.com.tw/", BMW: "https://www.bmw.com.tw/", "Mercedes-Benz": "https://www.mercedes-benz.com.tw/",
    Porsche: "https://www.porsche.com/taiwan/zh/", Volvo: "https://www.volvocars.com/tw/", Peugeot: "https://www.peugeot.com.tw/",
    "Citroën": "https://www.citroen.com.tw/", Opel: "https://www.opel.tw/", MG: "https://www.mgmotor.com.tw/", CMC: "https://www.china-motor.com.tw/",
    Luxgen: "https://www.luxgen-motor.com.tw/", "Alfa Romeo": "https://www.alfaromeo.com.tw/", Jaguar: "https://www.jaguar.tw/",
    "Land Rover": "https://www.landrover.tw/", Mini: "https://www.mini.com.tw/", Bentley: "https://www.bentleymotors.com/", "Rolls-Royce": "https://www.rolls-roycemotorcars.com/",
    "Aston Martin": "https://www.astonmartin.com/", Lotus: "https://www.lotuscars.com/", McLaren: "https://cars.mclaren.com/",
    Ferrari: "https://www.ferrari.com/", Lamborghini: "https://www.lamborghini.com/", Maserati: "https://www.maserati.com/tw/zh",
    Ineos: "https://ineosgrenadier.com/"
  };

  const colors = ["white", "black", "gray", "blue", "red"];
  const prioritiesFor = (body, power) => {
    if (body === "sports") return ["driving", "design", "tech"];
    if (body === "mpv") return ["space", "comfort", "value"];
    if (power === "electric") return ["tech", "economy", "comfort"];
    if (power === "hybrid") return ["economy", "comfort", "tech"];
    if (body === "hatch") return ["city", "design", "value"];
    if (body === "sedan") return ["comfort", "driving", "design"];
    return ["space", "comfort", "tech"];
  };
  const C = (brand, model, price, body = "suv", power = "gas", seats = 5, priorities) => ({
    brand, name: `${brand} ${model}`, variant: "台灣在售車系", price, priceLabel: `約 ${price} 萬起`, body, power, seats,
    priorities: priorities || prioritiesFor(body, power), colors: [...colors],
    tagline: "收錄於台灣授權新車市場。",
    note: "台灣總代理或授權通路公開販售／接單車系；起始價格為市場級距參考，請以原廠最新報價為準。",
    url: homes[brand]
  });

  window.JARVIS_MARKET_CARS = [
    C("Toyota", "Vios", 60.9, "sedan"), C("Toyota", "Corolla Altis", 73.5, "sedan"), C("Toyota", "Yaris Cross", 69.5),
    C("Toyota", "Corolla Cross", 80.9), C("Toyota", "Corolla Sport", 96.9, "hatch"), C("Toyota", "Camry", 98.5, "sedan", "hybrid"),
    C("Toyota", "RAV4", 104, "suv", "hybrid"), C("Toyota", "Urban Cruiser EV", 127, "suv", "electric"), C("Toyota", "bZ4X", 128, "suv", "electric"),
    C("Toyota", "Crown", 157, "sedan", "hybrid"), C("Toyota", "GR86", 173, "sports", "gas", 4), C("Toyota", "GR Yaris", 195, "hatch"),
    C("Toyota", "GR Supra", 266, "sports", "gas", 2), C("Toyota", "Alphard", 315, "mpv", "hybrid", 7), C("Toyota", "Sienna", 280, "mpv", "hybrid", 7),
    C("Toyota", "Granvia", 190, "mpv", "diesel", 7), C("Toyota", "Land Cruiser Prado", 288, "suv", "diesel", 7), C("Toyota", "Hilux", 159.5, "suv", "diesel", 5),
    C("Toyota", "Town Ace Van", 53.9, "mpv", "gas", 5), C("Toyota", "Town Ace Truck", 51.5, "mpv", "gas", 3),

    C("Lexus", "LBX", 129.9), C("Lexus", "UX", 149.9, "suv", "hybrid"), C("Lexus", "NX", 171, "suv", "hybrid"), C("Lexus", "RZ", 185, "suv", "electric"),
    C("Lexus", "RX", 238, "suv", "hybrid"), C("Lexus", "GX", 349, "suv", "gas", 7), C("Lexus", "LX", 480, "suv", "gas", 7),
    C("Lexus", "ES", 169, "sedan", "hybrid"), C("Lexus", "IS", 199, "sedan"), C("Lexus", "LS", 385, "sedan", "hybrid"),
    C("Lexus", "LM", 429, "mpv", "hybrid", 7), C("Lexus", "LC", 515, "sports", "hybrid", 4),

    C("Honda", "Fit", 75.9, "hatch", "gas"), C("Honda", "Fit e:HEV", 82.9, "hatch", "hybrid"), C("Honda", "HR-V", 79.9),
    C("Honda", "ZR-V e:HEV", 119.9, "suv", "hybrid"), C("Honda", "Civic e:HEV", 139.9, "sedan", "hybrid"),
    C("Honda", "Civic Type R", 219, "hatch"), C("Honda", "Prelude", 174.9, "sports", "hybrid", 4),

    C("Nissan", "Kicks", 79.9), C("Nissan", "Sentra", 76.5, "sedan"), C("Nissan", "X-Trail e-Power", 119.9, "suv", "hybrid"),
    C("Nissan", "Ariya", 168.9, "suv", "electric"), C("Nissan", "Juke", 116.9),
    C("Mitsubishi", "Colt Plus", 56.9, "hatch"), C("Mitsubishi", "Grand Lancer", 69.9, "sedan"), C("Mitsubishi", "XForce", 79.9),
    C("Mitsubishi", "Outlander", 95.9), C("Mitsubishi", "Delica Van", 76.8, "mpv", "gas", 7), C("Mitsubishi", "Delica Truck", 67.8, "mpv", "gas", 3),

    C("Subaru", "Crosstrek", 109.8), C("Subaru", "Forester", 129.8, "suv", "hybrid"), C("Subaru", "Outback", 159.8),
    C("Subaru", "WRX", 169.8, "sedan"), C("Subaru", "WRX Wagon", 176.8, "hatch"), C("Subaru", "BRZ", 169.8, "sports", "gas", 4), C("Subaru", "Solterra", 189.8, "suv", "electric"),
    C("Suzuki", "Swift", 73.8, "hatch"), C("Suzuki", "Ignis", 69.8, "hatch"), C("Suzuki", "Vitara", 82.8), C("Suzuki", "S-Cross", 96.8),
    C("Suzuki", "Jimny", 87.8, "suv", "gas", 4), C("Suzuki", "Carry", 55.8, "mpv", "gas", 2),

    C("Mazda", "Mazda3", 88.8, "sedan"), C("Mazda", "Mazda3 5D", 89.8, "hatch"), C("Mazda", "CX-3", 84.9), C("Mazda", "CX-30", 89.8),
    C("Mazda", "CX-5", 104.9), C("Mazda", "CX-60", 139.9), C("Mazda", "CX-90", 179.9, "suv", "hybrid", 7), C("Mazda", "MX-5 RF", 158, "sports", "gas", 2),
    C("Hyundai", "Venue", 73.9), C("Hyundai", "Mufasa", 85.9), C("Hyundai", "Tucson L", 99), C("Hyundai", "Tucson L Hybrid", 111.9, "suv", "hybrid"),
    C("Hyundai", "Santa Fe", 172.9, "suv", "hybrid", 7), C("Hyundai", "Custin", 130.9, "mpv", "gas", 7), C("Hyundai", "Staria CEO", 198.8, "mpv", "diesel", 7),
    C("Hyundai", "Inster", 94.9, "hatch", "electric", 4), C("Hyundai", "Ioniq 5", 169.9, "suv", "electric"), C("Hyundai", "Ioniq 5 N", 264.9, "suv", "electric"), C("Hyundai", "Kona Electric", 139.9, "suv", "electric"),

    C("Kia", "Picanto", 59.9, "hatch"), C("Kia", "Stonic", 76.9), C("Kia", "Ceed Sportswagon", 106.9, "hatch"), C("Kia", "Sportage", 114.9),
    C("Kia", "Sorento", 166.9, "suv", "hybrid", 7), C("Kia", "Carnival", 164.9, "mpv", "diesel", 7), C("Kia", "EV3", 119.9, "suv", "electric"),
    C("Kia", "EV6", 166.9, "suv", "electric"), C("Kia", "EV9", 279.9, "suv", "electric", 7), C("Kia", "K2500", 79.9, "mpv", "diesel", 3),
    C("Ford", "Focus", 83.9, "hatch"), C("Ford", "Focus Wagon", 89.9, "hatch"), C("Ford", "Kuga", 94.9), C("Ford", "Territory Hybrid", 99.9, "suv", "hybrid"),
    C("Ford", "Ranger", 135.8, "suv", "diesel"), C("Ford", "Tourneo Connect", 119.8, "mpv", "diesel", 7), C("Ford", "Tourneo Custom", 189.8, "mpv", "diesel", 7),
    C("Ford", "Mustang", 170.9, "sports", "gas", 4), C("Ford", "Mustang Mach-E", 189.9, "suv", "electric"),
    C("Tesla", "Model 3", 169.99, "sedan", "electric"), C("Tesla", "Model Y", 189.99, "suv", "electric"),

    C("Volkswagen", "Polo", 96.8, "hatch"), C("Volkswagen", "Golf", 118.8, "hatch"), C("Volkswagen", "Golf R", 198.8, "hatch"),
    C("Volkswagen", "T-Cross", 89.8), C("Volkswagen", "T-Roc", 112.8), C("Volkswagen", "Tiguan", 139.8), C("Volkswagen", "Tayron", 159.8, "suv", "gas", 7),
    C("Volkswagen", "ID.4", 169.8, "suv", "electric"), C("Volkswagen", "ID.5", 189.8, "suv", "electric"),
    C("Volkswagen Commercial Vehicles", "Caddy", 119.8, "mpv", "diesel", 7), C("Volkswagen Commercial Vehicles", "Caddy Cargo", 109.8, "mpv", "diesel", 2),
    C("Volkswagen Commercial Vehicles", "Multivan", 248.8, "mpv", "gas", 7), C("Volkswagen Commercial Vehicles", "Caravelle", 219.8, "mpv", "diesel", 7),
    C("Volkswagen Commercial Vehicles", "California", 318.8, "mpv", "diesel", 4), C("Volkswagen Commercial Vehicles", "Amarok", 199.8, "suv", "diesel"), C("Volkswagen Commercial Vehicles", "Crafter", 189.8, "mpv", "diesel", 3),

    C("Škoda", "Fabia", 89.9, "hatch"), C("Škoda", "Scala", 99.9, "hatch"), C("Škoda", "Octavia", 115.9, "sedan"), C("Škoda", "Octavia Combi", 121.9, "hatch"),
    C("Škoda", "Superb", 159.9, "sedan"), C("Škoda", "Kamiq", 99.9), C("Škoda", "Karoq", 119.9), C("Škoda", "Kodiaq", 149.9, "suv", "gas", 7), C("Škoda", "Enyaq", 169.9, "suv", "electric"),
    C("Audi", "A3 Sportback", 169, "hatch"), C("Audi", "A5", 229, "sedan"), C("Audi", "A6", 285, "sedan"), C("Audi", "A6 e-tron", 299, "sedan", "electric"), C("Audi", "A8", 468, "sedan"),
    C("Audi", "Q3", 188), C("Audi", "Q4 e-tron", 222, "suv", "electric"), C("Audi", "Q5", 249), C("Audi", "Q6 e-tron", 289, "suv", "electric"), C("Audi", "Q7", 339, "suv", "gas", 7), C("Audi", "Q8", 399),
    C("Audi", "e-tron GT", 548, "sports", "electric", 4), C("Audi", "RS 3", 365, "sedan"), C("Audi", "RS 6 Avant", 728, "hatch"), C("Audi", "RS Q8", 738),

    C("BMW", "1 Series", 168, "hatch"), C("BMW", "2 Series Active Tourer", 179, "hatch"), C("BMW", "2 Series Coupé", 219, "sports", "gas", 4),
    C("BMW", "3 Series", 229, "sedan"), C("BMW", "4 Series", 275, "sports", "gas", 4), C("BMW", "5 Series", 315, "sedan", "hybrid"), C("BMW", "7 Series", 498, "sedan"),
    C("BMW", "X1", 189), C("BMW", "X2", 209), C("BMW", "X3", 269), C("BMW", "X5", 389), C("BMW", "X6", 428), C("BMW", "X7", 528, "suv", "gas", 7),
    C("BMW", "i4", 255, "sedan", "electric"), C("BMW", "i5", 329, "sedan", "electric"), C("BMW", "i7", 519, "sedan", "electric"), C("BMW", "iX1", 199, "suv", "electric"), C("BMW", "iX", 398, "suv", "electric"),
    C("BMW", "Z4", 298, "sports", "gas", 2), C("BMW", "M2", 398, "sports", "gas", 4), C("BMW", "M3", 558, "sedan"), C("BMW", "M4", 598, "sports", "gas", 4), C("BMW", "XM", 688, "suv", "hybrid"),

    C("Mercedes-Benz", "A-Class", 166, "hatch"), C("Mercedes-Benz", "B-Class", 180, "hatch"), C("Mercedes-Benz", "CLA", 199, "sedan"), C("Mercedes-Benz", "C-Class", 229, "sedan"),
    C("Mercedes-Benz", "E-Class", 329, "sedan"), C("Mercedes-Benz", "S-Class", 555, "sedan"), C("Mercedes-Benz", "CLE Coupé", 298, "sports", "gas", 4),
    C("Mercedes-Benz", "GLA", 199), C("Mercedes-Benz", "GLB", 222, "suv", "gas", 7), C("Mercedes-Benz", "GLC", 273), C("Mercedes-Benz", "GLE", 389), C("Mercedes-Benz", "GLS", 529, "suv", "gas", 7), C("Mercedes-Benz", "G-Class", 698),
    C("Mercedes-Benz", "EQA", 199, "suv", "electric"), C("Mercedes-Benz", "EQB", 219, "suv", "electric", 7), C("Mercedes-Benz", "EQE", 329, "sedan", "electric"), C("Mercedes-Benz", "EQS", 499, "sedan", "electric"),
    C("Mercedes-Benz", "EQE SUV", 389, "suv", "electric"), C("Mercedes-Benz", "EQS SUV", 559, "suv", "electric", 7), C("Mercedes-Benz", "V-Class", 298, "mpv", "diesel", 7),
    C("Mercedes-Benz", "Mercedes-AMG GT", 688, "sports", "gas", 4), C("Mercedes-Benz", "Mercedes-AMG SL", 698, "sports", "gas", 4), C("Mercedes-Benz", "Mercedes-Maybach S-Class", 1058, "sedan"), C("Mercedes-Benz", "Mercedes-Maybach GLS", 958, "suv"),
    C("Porsche", "911", 677, "sports", "gas", 4), C("Porsche", "Taycan", 438, "sedan", "electric"), C("Porsche", "Panamera", 548, "sedan", "hybrid"),
    C("Porsche", "Macan", 358), C("Porsche", "Macan Electric", 373, "suv", "electric"), C("Porsche", "Cayenne", 469, "suv", "hybrid"),

    C("Volvo", "EX30", 139.9, "suv", "electric"), C("Volvo", "EX40", 189, "suv", "electric"), C("Volvo", "EC40", 199, "suv", "electric"),
    C("Volvo", "XC40", 166, "suv", "hybrid"), C("Volvo", "XC60", 219, "suv", "hybrid"), C("Volvo", "XC90", 319, "suv", "hybrid", 7),
    C("Volvo", "V60", 209, "hatch", "hybrid"), C("Volvo", "V90 Cross Country", 299, "hatch", "hybrid"),
    C("Peugeot", "2008", 109.9), C("Peugeot", "3008", 139.9, "suv", "hybrid"), C("Peugeot", "408", 159.9, "hatch", "hybrid"), C("Peugeot", "5008", 169.9, "suv", "hybrid", 7), C("Peugeot", "Rifter", 129.9, "mpv", "diesel", 7),
    C("Citroën", "C4", 119.9, "hatch"), C("Citroën", "C5 Aircross", 139.9), C("Citroën", "Berlingo", 125.9, "mpv", "diesel", 7),
    C("Opel", "Corsa", 99.9, "hatch"), C("Opel", "Astra", 119.9, "hatch"), C("Opel", "Mokka", 109.9), C("Opel", "Mokka Electric", 139.9, "suv", "electric"), C("Opel", "Grandland", 139.9, "suv", "hybrid"),

    C("MG", "ZS", 74.9), C("MG", "HS", 91.5), C("MG", "HS PHEV", 121.9, "suv", "hybrid"), C("MG", "MG4", 99.9, "hatch", "electric"),
    C("CMC", "J Space", 59.8, "mpv", "gas", 5), C("CMC", "Zinger", 79.9, "mpv", "gas", 7), C("CMC", "Zinger Pick Up", 76.9, "suv", "gas", 5),
    C("CMC", "Veryca", 49.9, "mpv", "gas", 5), C("CMC", "e-Veryca", 99.9, "mpv", "electric", 5), C("Luxgen", "n7", 99.9, "suv", "electric", 7),
    C("Alfa Romeo", "Junior", 159.8, "suv", "hybrid"), C("Alfa Romeo", "Giulia", 218, "sedan"), C("Alfa Romeo", "Stelvio", 238),
    C("Jaguar", "F-Pace", 310),
    C("Land Rover", "Defender 90", 308.6), C("Land Rover", "Defender 110", 324, "suv", "diesel", 7), C("Land Rover", "Defender 130", 428, "suv", "diesel", 7),
    C("Land Rover", "Discovery Sport", 238, "suv", "hybrid", 7), C("Land Rover", "Discovery", 406.6, "suv", "diesel", 7), C("Land Rover", "Range Rover Evoque", 268),
    C("Land Rover", "Range Rover Velar", 329), C("Land Rover", "Range Rover Sport", 489), C("Land Rover", "Range Rover", 658),

    C("Mini", "Cooper 3-Door", 159, "hatch"), C("Mini", "Cooper 5-Door", 169, "hatch"), C("Mini", "Cooper Electric", 189, "hatch", "electric"),
    C("Mini", "Aceman", 192, "suv", "electric"), C("Mini", "Countryman", 179), C("Mini", "Countryman Electric", 209, "suv", "electric"),
    C("Bentley", "Bentayga", 1180), C("Bentley", "Continental GT", 1680, "sports", "hybrid", 4), C("Bentley", "Continental GTC", 1780, "sports", "hybrid", 4), C("Bentley", "Flying Spur", 1580, "sedan", "hybrid"),
    C("Rolls-Royce", "Ghost", 1980, "sedan"), C("Rolls-Royce", "Cullinan", 2580), C("Rolls-Royce", "Spectre", 2380, "sports", "electric", 4), C("Rolls-Royce", "Phantom", 3280, "sedan"),
    C("Aston Martin", "Vantage", 998, "sports", "gas", 2), C("Aston Martin", "DB12", 1288, "sports", "gas", 4), C("Aston Martin", "Vanquish", 1888, "sports", "gas", 2), C("Aston Martin", "DBX707", 1398),
    C("Lotus", "Emira", 598, "sports", "gas", 2), C("Lotus", "Eletre", 588, "suv", "electric"), C("Lotus", "Emeya", 598, "sedan", "electric"),
    C("McLaren", "Artura", 1280, "sports", "hybrid", 2), C("McLaren", "Artura Spider", 1380, "sports", "hybrid", 2), C("McLaren", "GTS", 1580, "sports", "gas", 2), C("McLaren", "750S", 1980, "sports", "gas", 2),
    C("Ferrari", "296 GTB", 1880, "sports", "hybrid", 2), C("Ferrari", "296 GTS", 2080, "sports", "hybrid", 2), C("Ferrari", "12Cilindri", 2380, "sports", "gas", 2),
    C("Ferrari", "12Cilindri Spider", 2680, "sports", "gas", 2), C("Ferrari", "Purosangue", 2580), C("Ferrari", "Roma Spider", 1780, "sports", "gas", 4),
    C("Lamborghini", "Temerario", 1880, "sports", "hybrid", 2), C("Lamborghini", "Revuelto", 2980, "sports", "hybrid", 2), C("Lamborghini", "Urus SE", 1680, "suv", "hybrid"),
    C("Maserati", "Grecale", 358), C("Maserati", "GranTurismo", 968, "sports", "gas", 4), C("Maserati", "GranCabrio", 1088, "sports", "gas", 4), C("Maserati", "MC20", 1580, "sports", "gas", 2),
    C("Ineos", "Grenadier", 358, "suv", "diesel"), C("Ineos", "Grenadier Quartermaster", 378, "suv", "diesel")
  ];

  const B = (name, monogram, origin, chapter, story, position, positioning, keywords) => ({
    name, monogram, origin, chapter, story, position, positioning, keywords, source: homes[name]
  });
  window.JARVIS_BRANDS = {
    Lexus: B("Lexus", "L", "1989 / JAPAN", "把可靠與精密，做成安靜而克制的豪華。", "Toyota 於 1989 年推出 Lexus，從北美豪華房車市場出發，逐步建立日式工藝、靜肅與服務體驗。", "日系舒適豪華與油電效率派", "在台灣擁有完整油電休旅與房車陣容，重視妥善、舒適與低調質感。", ["日式豪華", "油電", "高妥善"]),
    Nissan: B("Nissan", "N", "1933 / JAPAN", "從大眾房車到電動技術，實驗精神一直都在。", "Nissan 於 1930 年代成形，從 Datsun 走向全球，並以 GT-R、Z 與 Leaf 等車系跨越性能和電動化。", "日系科技與舒適家用派", "在台灣以房車、跨界休旅與 e-Power 電驅技術提供務實而有科技感的選擇。", ["e-Power", "舒適", "日系科技"]),
    Mitsubishi: B("Mitsubishi", "M", "1917 / JAPAN", "越野、商用與耐用，是三菱最深的底色。", "Mitsubishi 的汽車歷史可追溯至 1917 年 Model A，後以 Pajero、Lancer Evolution 與商用車累積工程聲譽。", "耐用機能與務實商用派", "在台灣深耕國產與商用市場，產品強調空間、耐用與使用成本。", ["耐用", "商用", "機能"]),
    Subaru: B("Subaru", "S", "1953 / JAPAN", "水平對臥與四輪驅動，把工程堅持變成性格。", "Subaru 源自富士重工，以水平對臥引擎、對稱式四輪驅動與拉力賽經驗建立獨特路線。", "安全與全時四驅的工程派", "適合重視雨天穩定、戶外能力與駕駛回饋的使用者。", ["四輪驅動", "安全", "戶外"]),
    Suzuki: B("Suzuki", "S", "1909 / JAPAN", "把有限尺碼用到極致，是小車專家的本事。", "Suzuki 從織機起家，1950 年代進入汽車市場，長期專注小型車、輕型越野與實用商用車。", "輕巧實用的小車專家", "在台灣以好停、低負擔與簡單耐用吸引都會與戶外用家。", ["小車", "輕量", "實用"]),
    Kia: B("Kia", "K", "1944 / KOREA", "從高性價比走向設計與電動化，Kia 已經換了一套語言。", "Kia 從零件與自行車製造起步，後加入 Hyundai Motor Group，近年以設計轉型與 EV 專用平台走向全球。", "設計感鮮明的高配備挑戰者", "台灣產品橫跨小車、家庭休旅、MPV 與純電，配備和保固是重要賣點。", ["設計", "高配備", "EV"]),
    Ford: B("Ford", "F", "1903 / U.S.A.", "讓汽車走入大眾生活，也始終保留美式冒險性格。", "Ford 以流水線改變汽車量產，並用 Mustang、F-Series 與全球車系延續性能和實用兩條主線。", "操控、休旅與皮卡的美式實用派", "在台灣有在地生產基礎，強項是底盤、主動安全、旅行車與戶外車型。", ["操控", "美式", "戶外"]),
    Volkswagen: B("Volkswagen", "V", "1937 / GERMANY", "大眾之名，核心是把德國工程做進日常。", "Volkswagen 從 Beetle 成為全球品牌，Golf 則建立現代掀背車基準，產品長期強調完整性。", "歐系均衡與駕駛質感派", "台灣市場以掀背與休旅為主，適合重視高速穩定、座艙與整體完成度的人。", ["德國工程", "均衡", "掀背"]),
    "Volkswagen Commercial Vehicles": B("Volkswagen Commercial Vehicles", "VW", "1950 / GERMANY", "從 Transporter 開始，把工作與旅行裝進同一個方盒子。", "Volkswagen 商旅以經典 Transporter 車系為核心，延伸至廂車、露營車與皮卡。", "高質感歐系商旅與露營派", "提供家庭多人、商務接待、貨運與 Vanlife 的完整解法。", ["商旅", "露營", "多人座"]),
    "Škoda": B("Škoda", "Š", "1895 / CZECHIA", "聰明不是堆配備，而是每個細節都知道你會怎麼用。", "Škoda 從自行車與機械工業起步，是歷史悠久的歐洲車廠，現為 Volkswagen Group 成員。", "空間大、配備實在的歐系務實派", "在台灣以旅行車、家庭休旅和 Simply Clever 機能建立口碑。", ["大空間", "歐系", "聰明機能"]),
    Audi: B("Audi", "A", "1909 / GERMANY", "技術、四輪驅動與極簡設計，組成 Audi 的精準感。", "Audi 的四環代表四家公司結盟，並以 quattro、鋁合金與燈光科技累積技術形象。", "科技感強烈的德系豪華", "設計較克制、座艙數位化，並提供完整純電與高性能 RS 陣容。", ["quattro", "科技", "極簡"]),
    BMW: B("BMW", "B", "1916 / GERMANY", "即使變成電動車，駕駛仍然要坐在故事中央。", "BMW 從航空引擎與機車走向汽車，以後輪驅動、直六引擎與駕駛導向座艙建立品牌。", "駕駛導向的德系豪華", "從入門掀背到 M 性能與 i 純電產品都強調動態反應與科技。", ["駕駛樂趣", "豪華", "性能"]),
    "Mercedes-Benz": B("Mercedes-Benz", "M", "1886 / GERMANY", "汽車的發明者，把安全與豪華持續變成新標準。", "Karl Benz 的 Patent-Motorwagen 被視為現代汽車起點，品牌之後在安全、舒適與性能持續創新。", "舒適、科技與身份感的豪華標竿", "台灣產品線最完整，從都會車、七人座、純電到 AMG 與 Maybach 皆有布局。", ["舒適", "科技", "豪華"]),
    Porsche: B("Porsche", "P", "1948 / GERMANY", "跑車不是一種車身，而是一套所有車都遵守的反應。", "Porsche 以 356 起步，911 成為核心圖騰，之後把跑車工程延伸到休旅、房車與電動車。", "以跑車工程為核心的豪華性能品牌", "即使是 SUV 也重視方向、煞車與底盤溝通，適合把駕駛感受放第一的人。", ["跑車", "底盤", "性能"]),
    Volvo: B("Volvo", "V", "1927 / SWEDEN", "安全不是配備表，而是品牌看待人的方式。", "Volvo 在瑞典哥德堡創立，三點式安全帶等發明奠定安全聲譽，近年轉向電動化與北歐永續。", "安全與北歐舒適豪華派", "設計簡潔、座椅舒適，產品特別適合家庭與長途使用。", ["安全", "北歐", "舒適"]),
    Peugeot: B("Peugeot", "P", "1810 / FRANCE", "法式設計不只好看，也喜歡重新安排駕駛的感官。", "Peugeot 的工業歷史早於汽車，19 世紀末開始造車，長期在小車、賽事與柴油技術留下足跡。", "設計前衛的法系駕駛派", "小方向盤座艙、鮮明造型與舒適底盤是台灣車系辨識度來源。", ["法式設計", "座艙", "底盤"]),
    "Citroën": B("Citroën", "C", "1919 / FRANCE", "舒適可以很大膽，實用也不必無聊。", "Citroën 以量產、前輪驅動、液壓懸吊與特殊造型聞名，始終挑戰汽車設計慣例。", "舒適與空間創意的法系個性派", "台灣主力是跨界與廂型車，強調乘坐柔和、造型和機能。", ["舒適", "創意", "機能"]),
    Opel: B("Opel", "O", "1862 / GERMANY", "德國工程走務實路線，不必把每件事都說得很大聲。", "Opel 從縫紉機、自行車轉向汽車，長期以大眾化德國車服務歐洲市場。", "價格親近的德系設計與操控", "在台灣以掀背與小型休旅提供不同於主流日系的選擇。", ["德系", "務實", "設計"]),
    MG: B("MG", "MG", "1924 / U.K.", "從英倫跑車徽章，走向人人可及的科技配備。", "MG 源自英國 Morris Garages 的跑車傳統，現隸屬上汽集團並成為全球化品牌。", "高配備與價格競爭力派", "台灣以國產休旅與純電車切入，核心是以價格提供越級配備。", ["CP值", "配備", "電動"]),
    CMC: B("CMC", "C", "1969 / TAIWAN", "真正懂台灣巷弄與頭家的車，往往不是最華麗的那一台。", "中華汽車長期在台灣生產商用與多功能車，建立深入地方使用情境的產品經驗。", "台灣輕型商用與多功能車專家", "強項是低持有成本、載貨機能與遍布全台的服務體系。", ["台灣製造", "商用", "低成本"]),
    Luxgen: B("Luxgen", "L", "2009 / TAIWAN", "從自主品牌到電動合作，台灣造車仍在找自己的新路。", "Luxgen 由裕隆集團創立，曾以智慧車機建立特色，近年以 n7 純電休旅開啟新階段。", "台灣純電大空間價值派", "n7 以七人座、價格與在地服務成為台灣電動家庭車選項。", ["台灣品牌", "純電", "七人座"]),
    "Alfa Romeo": B("Alfa Romeo", "A", "1910 / ITALY", "漂亮不是裝飾，而是速度留下來的形狀。", "Alfa Romeo 於米蘭創立，賽車、輕量底盤與熱情設計貫穿百年歷史。", "義式設計與操控性能派", "重返台灣後以 Giulia、Stelvio 與 Junior 提供有情感的豪華選擇。", ["義式", "操控", "設計"]),
    Jaguar: B("Jaguar", "J", "1922 / U.K.", "優雅和速度，不必各自站在道路兩端。", "Jaguar 從側車製造起步，後以 XK、E-Type 與賽車勝利塑造英倫性能形象。", "英倫優雅的運動豪華", "目前台灣公開車系以 F-Pace 跑旅為主，適合重視設計稀有度與動態的人。", ["英倫", "優雅", "性能"]),
    "Land Rover": B("Land Rover", "LR", "1948 / U.K.", "豪華之前，它先學會到任何地方。", "Land Rover 從戰後實用四輪驅動車起步，逐步發展 Defender、Discovery 與 Range Rover 家族。", "正統越野與英倫豪華休旅", "台灣陣容從硬派 Defender 到旗艦 Range Rover，戶外能力與身份感兼具。", ["越野", "英倫", "豪華休旅"]),
    Mini: B("Mini", "M", "1959 / U.K.", "小，不代表只能做減法；也可以把個性濃縮。", "經典 Mini 為回應能源危機而生，以橫置引擎創造大空間，後由 BMW 延續為現代精品小車。", "精品都會與個性設計派", "好停、好玩、客製化程度高，現已擴展至跨界與純電。", ["都會", "個性", "精品"]),
    Bentley: B("Bentley", "B", "1919 / U.K.", "速度與手工豪華，可以坐在同一張真皮座椅上。", "Bentley 由 W.O. Bentley 創立，早期賽事成功奠定高性能豪華旅行車傳統。", "手工豪華的高性能 GT", "適合追求長途速度、頂級材質與高度客製的買家。", ["手工", "GT", "奢華"]),
    "Rolls-Royce": B("Rolls-Royce", "RR", "1904 / U.K.", "它不追逐豪華標準，它自己就是衡量單位。", "Rolls-Royce 由 Charles Rolls 與 Henry Royce 合作創立，以極致安靜、工藝與客製聞名。", "超豪華移動藝術品", "產品重點不是規格競賽，而是無上限客製、乘坐與身份象徵。", ["超豪華", "客製", "靜謐"]),
    "Aston Martin": B("Aston Martin", "A", "1913 / U.K.", "英國跑車的戲劇感，從不需要太多台詞。", "Aston Martin 由 Lionel Martin 與 Robert Bamford 創立，賽事與 GT 跑車構成品牌主線。", "優雅稀有的英倫 GT", "在性能之外更強調比例、聲浪、皮革工藝與收藏性。", ["GT", "英倫", "稀有"]),
    Lotus: B("Lotus", "L", "1948 / U.K.", "加速的方法很多，減輕重量是最聰明的一種。", "Colin Chapman 創立 Lotus，以輕量化與賽車工程聞名，近年延伸至高性能電動車。", "輕量操控與電動性能派", "Emira 保留純粹跑車，Eletre、Emeya 則把品牌帶入高性能 EV。", ["輕量", "操控", "電動性能"]),
    McLaren: B("McLaren", "M", "1963 / U.K.", "每一公斤與每一毫秒，都值得重新工程化。", "McLaren 源自 Bruce McLaren 的賽車隊，之後以 F1 公路跑車和碳纖維技術建立超跑地位。", "極致輕量的工程超跑", "產品聚焦駕駛回饋、碳纖維底盤與高性能，稀有且目的明確。", ["碳纖維", "輕量", "超跑"]),
    Ferrari: B("Ferrari", "F", "1947 / ITALY", "賽車不是行銷背景，而是所有公路車的母語。", "Enzo Ferrari 由賽車隊發展出公路跑車品牌，F1 與 V12 傳統成為核心文化。", "賽道血統與收藏價值的超跑標竿", "性能、聲浪、限量與品牌歷史共同構成極高的情感及收藏價值。", ["F1", "超跑", "收藏"]),
    Lamborghini: B("Lamborghini", "L", "1963 / ITALY", "如果超跑要像海報，它就應該讓每條線都不安分。", "Ferruccio Lamborghini 創立品牌，以中置引擎 Miura、剪刀門 Countach 等作品改寫超跑外觀。", "戲劇化設計的義式超跑", "外型、聲浪與性能都追求高張力，Urus 則把風格延伸到休旅。", ["戲劇感", "V12", "超跑"]),
    Maserati: B("Maserati", "M", "1914 / ITALY", "義大利 GT 的魅力，是快得很有餘裕。", "Maserati 由兄弟家族創立於波隆那，賽事、三叉戟與豪華旅行車構成百年脈絡。", "義式豪華 GT 與聲浪派", "比主流豪華品牌更稀有，強調設計、旅行舒適與駕駛情緒。", ["義式", "GT", "聲浪"]),
    Ineos: B("Ineos", "I", "2017 / U.K.", "當經典越野車變得太精緻，就重新造一台工具。", "Ineos Grenadier 由 Jim Ratcliffe 發起，目標是打造結構單純、耐用且真正能工作的現代越野車。", "硬派工具型越野專家", "梯形大樑、機械四驅與高改裝潛力，適合真正會離開柏油路的人。", ["硬派越野", "工具車", "耐用"])
  };
})();
