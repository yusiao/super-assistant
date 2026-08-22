(function () {
  const colors = ["white","black","gray","blue","red"];
  const prioritiesFor = (body, power) => {
    if (body === "sports") return ["driving", "design", "tech"];
    if (body === "mpv") return ["space", "comfort", "value"];
    if (power === "electric") return ["tech", "economy", "comfort"];
    if (power === "hybrid") return ["economy", "comfort", "tech"];
    if (body === "hatch") return ["city", "design", "value"];
    if (body === "sedan") return ["comfort", "driving", "design"];
    return ["space", "comfort", "tech"];
  };
  const C = car => ({
    ...car,
    priorities: car.priorities || prioritiesFor(car.body, car.power),
    colors: car.colors || [...colors]
  });

  window.JARVIS_MARKET_CARS = [
  {
    "brand": "Alfa Romeo",
    "name": "Alfa Romeo Junior Ibrida",
    "variant": "U-CAR new-car catalog",
    "price": 139.8,
    "priceLabel": "139.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Junior Ibrida: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7200.jpg",
    "url": "https://newcar.u-car.com.tw/alfa%20romeo/junior%20ibrida/7200/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/alfa%20romeo/junior%20ibrida/7200/overall",
    "source": "ucar"
  },
  {
    "brand": "Alfa Romeo",
    "name": "Alfa Romeo Junior Elettrica",
    "variant": "U-CAR new-car catalog",
    "price": 189.8,
    "priceLabel": "189.8 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Junior Elettrica: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7201.jpg",
    "url": "https://newcar.u-car.com.tw/alfa%20romeo/junior%20elettrica/7201/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/alfa%20romeo/junior%20elettrica/7201/overall",
    "source": "ucar"
  },
  {
    "brand": "Alfa Romeo",
    "name": "Alfa Romeo Giulia",
    "variant": "U-CAR new-car catalog",
    "price": 218.9,
    "priceLabel": "218.9-448.9 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Giulia: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7006.jpg",
    "url": "https://newcar.u-car.com.tw/alfa%20romeo/giulia/7006/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/alfa%20romeo/giulia/7006/overall",
    "source": "ucar"
  },
  {
    "brand": "Alfa Romeo",
    "name": "Alfa Romeo Stelvio",
    "variant": "U-CAR new-car catalog",
    "price": 228.9,
    "priceLabel": "228.9-258.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Stelvio: synced from Taiwan new-car catalog.",
    "note": "豪華級距SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7007.jpg",
    "url": "https://newcar.u-car.com.tw/alfa%20romeo/stelvio/7007/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/alfa%20romeo/stelvio/7007/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin Vantage",
    "variant": "U-CAR new-car catalog",
    "price": 1198,
    "priceLabel": "1198 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vantage: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7075.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/vantage/7075/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/vantage/7075/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin Vantage Roadster",
    "variant": "U-CAR new-car catalog",
    "price": 1288,
    "priceLabel": "1288 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vantage Roadster: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7099.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/vantage%20roadster/7099/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/vantage%20roadster/7099/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin DB12",
    "variant": "U-CAR new-car catalog",
    "price": 1488,
    "priceLabel": "1488 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "DB12: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7092.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/db12/7092/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/db12/7092/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin DBX",
    "variant": "U-CAR new-car catalog",
    "price": 1588,
    "priceLabel": "1588 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "DBX: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7094.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/dbx/7094/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/dbx/7094/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin Vanquish",
    "variant": "U-CAR new-car catalog",
    "price": 2358,
    "priceLabel": "2358 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vanquish: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7095.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/vanquish/7095/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/vanquish/7095/overall",
    "source": "ucar"
  },
  {
    "brand": "Aston Martin",
    "name": "Aston Martin Vanquish Volante",
    "variant": "U-CAR new-car catalog",
    "price": 2558,
    "priceLabel": "2558 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vanquish Volante: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7096.jpg",
    "url": "https://newcar.u-car.com.tw/aston%20martin/vanquish%20volante/7096/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/aston%20martin/vanquish%20volante/7096/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A1 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 128.5,
    "priceLabel": "128.5-152 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A1 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7027.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a1%20sportback/7027/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a1%20sportback/7027/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q2",
    "variant": "U-CAR new-car catalog",
    "price": 139.9,
    "priceLabel": "139.9-245 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q2: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7132.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q2/7132/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q2/7132/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A3 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 142,
    "priceLabel": "142-182 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A3 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7047.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a3%20sportback/7047/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a3%20sportback/7047/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q3",
    "variant": "U-CAR new-car catalog",
    "price": 191,
    "priceLabel": "191-228 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q3: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7185.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q3/7185/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q3/7185/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q3 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 198,
    "priceLabel": "198-235 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q3 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7186.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q3%20sportback/7186/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q3%20sportback/7186/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q4 e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 219,
    "priceLabel": "219-240 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q4 e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6914.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q4%20e-tron/6914/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q4%20e-tron/6914/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q4 Sportback e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 226,
    "priceLabel": "226-251 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q4 Sportback e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6915.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q4%20sportback%20e-tron/6915/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q4%20sportback%20e-tron/6915/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A5",
    "variant": "U-CAR new-car catalog",
    "price": 227,
    "priceLabel": "227-367.1 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A5: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7242.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a5/7242/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a5/7242/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A5 Avant",
    "variant": "U-CAR new-car catalog",
    "price": 227,
    "priceLabel": "227-367.1 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A5 Avant: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7243.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a5%20avant/7243/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a5%20avant/7243/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q5",
    "variant": "U-CAR new-car catalog",
    "price": 240,
    "priceLabel": "240-341.5 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q5: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7249.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q5/7249/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q5/7249/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q5 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 251,
    "priceLabel": "251-352.5 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q5 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7250.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q5%20sportback/7250/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q5%20sportback/7250/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q6 e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 276,
    "priceLabel": "276-360 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q6 e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7247.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q6%20e-tron/7247/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q6%20e-tron/7247/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A6 Avant e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 280,
    "priceLabel": "280-480 TWD 10k",
    "body": "hatch",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A6 Avant e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7245.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a6%20avant%20e-tron/7245/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a6%20avant%20e-tron/7245/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A6 Sportback e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 280,
    "priceLabel": "280-480 TWD 10k",
    "body": "hatch",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A6 Sportback e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7244.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a6%20sportback%20e-tron/7244/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a6%20sportback%20e-tron/7244/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q6 Sportback e-tron",
    "variant": "U-CAR new-car catalog",
    "price": 287,
    "priceLabel": "287-370 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q6 Sportback e-tron: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7248.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q6%20sportback%20e-tron/7248/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q6%20sportback%20e-tron/7248/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A6",
    "variant": "U-CAR new-car catalog",
    "price": 288,
    "priceLabel": "288-346 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A6: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7020.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a6/7020/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a6/7020/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A6 Avant",
    "variant": "U-CAR new-car catalog",
    "price": 298,
    "priceLabel": "298-356 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A6 Avant: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7026.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a6%20avant/7026/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a6%20avant/7026/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q7",
    "variant": "U-CAR new-car catalog",
    "price": 329,
    "priceLabel": "329-566 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q7: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7055.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q7/7055/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q7/7055/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi RS 3 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 350.3,
    "priceLabel": "350.3 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RS 3 Sportback: synced from Taiwan new-car catalog.",
    "note": "性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6979.jpg",
    "url": "https://newcar.u-car.com.tw/audi/rs%203%20sportback/6979/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/rs%203%20sportback/6979/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi RS Q3",
    "variant": "U-CAR new-car catalog",
    "price": 354,
    "priceLabel": "354 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RS Q3: synced from Taiwan new-car catalog.",
    "note": "性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6522.jpg",
    "url": "https://newcar.u-car.com.tw/audi/rs%20q3/6522/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/rs%20q3/6522/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi RS 3 Sedan",
    "variant": "U-CAR new-car catalog",
    "price": 359.3,
    "priceLabel": "359.3 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RS 3 Sedan: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6980.jpg",
    "url": "https://newcar.u-car.com.tw/audi/rs%203%20sedan/6980/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/rs%203%20sedan/6980/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi RS Q3 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 365.5,
    "priceLabel": "365.5 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RS Q3 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6523.jpg",
    "url": "https://newcar.u-car.com.tw/audi/rs%20q3%20sportback/6523/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/rs%20q3%20sportback/6523/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A7 Sportback",
    "variant": "U-CAR new-car catalog",
    "price": 372.5,
    "priceLabel": "372.5-414.5 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A7 Sportback: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6519.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a7%20sportback/6519/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a7%20sportback/6519/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi Q8",
    "variant": "U-CAR new-car catalog",
    "price": 413,
    "priceLabel": "413-423 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Q8: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7056.jpg",
    "url": "https://newcar.u-car.com.tw/audi/q8/7056/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/q8/7056/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi A8",
    "variant": "U-CAR new-car catalog",
    "price": 462,
    "priceLabel": "462-593 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A8: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7246.jpg",
    "url": "https://newcar.u-car.com.tw/audi/a8/7246/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/a8/7246/overall",
    "source": "ucar"
  },
  {
    "brand": "Audi",
    "name": "Audi RS Q8",
    "variant": "U-CAR new-car catalog",
    "price": 781,
    "priceLabel": "781 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RS Q8: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7112.jpg",
    "url": "https://newcar.u-car.com.tw/audi/rs%20q8/7112/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/audi/rs%20q8/7112/overall",
    "source": "ucar"
  },
  {
    "brand": "Bentley",
    "name": "Bentley Bentayga",
    "variant": "U-CAR new-car catalog",
    "price": 1280,
    "priceLabel": "1280-1588 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Bentayga: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7067.jpg",
    "url": "https://newcar.u-car.com.tw/bentley/bentayga/7067/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bentley/bentayga/7067/overall",
    "source": "ucar"
  },
  {
    "brand": "Bentley",
    "name": "Bentley Flying Spur",
    "variant": "U-CAR new-car catalog",
    "price": 1380,
    "priceLabel": "1380-1880 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Flying Spur: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7066.jpg",
    "url": "https://newcar.u-car.com.tw/bentley/flying%20spur/7066/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bentley/flying%20spur/7066/overall",
    "source": "ucar"
  },
  {
    "brand": "Bentley",
    "name": "Bentley Bentayga EWB",
    "variant": "U-CAR new-car catalog",
    "price": 1458,
    "priceLabel": "1458 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Bentayga EWB: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7068.jpg",
    "url": "https://newcar.u-car.com.tw/bentley/bentayga%20ewb/7068/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bentley/bentayga%20ewb/7068/overall",
    "source": "ucar"
  },
  {
    "brand": "Bentley",
    "name": "Bentley Continental GT",
    "variant": "U-CAR new-car catalog",
    "price": 1460,
    "priceLabel": "1460-1930 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Continental GT: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7064.jpg",
    "url": "https://newcar.u-car.com.tw/bentley/continental%20gt/7064/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bentley/continental%20gt/7064/overall",
    "source": "ucar"
  },
  {
    "brand": "Bentley",
    "name": "Bentley Continental GTC",
    "variant": "U-CAR new-car catalog",
    "price": 1580,
    "priceLabel": "1580-2030 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Continental GTC: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7065.jpg",
    "url": "https://newcar.u-car.com.tw/bentley/continental%20gtc/7065/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bentley/continental%20gtc/7065/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 1 Series",
    "variant": "U-CAR new-car catalog",
    "price": 155,
    "priceLabel": "155-268 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "1 Series: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6976.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/1%20series/6976/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/1%20series/6976/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 2 Series Active Tourer",
    "variant": "U-CAR new-car catalog",
    "price": 155,
    "priceLabel": "155-195 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "2 Series Active Tourer: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6630.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/2%20series%20active%20tourer/6630/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/2%20series%20active%20tourer/6630/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 2 Series Gran Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 190,
    "priceLabel": "190-275 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "2 Series Gran Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7139.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/2%20series%20gran%20coup%C3%A9/7139/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/2%20series%20gran%20coup%C3%A9/7139/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 3 Series Touring",
    "variant": "U-CAR new-car catalog",
    "price": 199,
    "priceLabel": "199-375 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "3 Series Touring: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7267.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/3%20series%20touring/7267/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/3%20series%20touring/7267/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X1",
    "variant": "U-CAR new-car catalog",
    "price": 199,
    "priceLabel": "199-220 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X1: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7049.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x1/7049/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x1/7049/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW iX1",
    "variant": "U-CAR new-car catalog",
    "price": 205,
    "priceLabel": "205-235 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "iX1: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7256.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/ix1/7256/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/ix1/7256/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 2 Series Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 212,
    "priceLabel": "212-306 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "2 Series Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6846.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/2%20series%20coup%C3%A9/6846/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/2%20series%20coup%C3%A9/6846/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 3 Series",
    "variant": "U-CAR new-car catalog",
    "price": 219,
    "priceLabel": "219-368 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "3 Series: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6816.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/3%20series/6816/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/3%20series/6816/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X2",
    "variant": "U-CAR new-car catalog",
    "price": 225,
    "priceLabel": "225-289 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X2: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7060.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x2/7060/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x2/7060/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW iX2",
    "variant": "U-CAR new-car catalog",
    "price": 243,
    "priceLabel": "243 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "iX2: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7257.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/ix2/7257/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/ix2/7257/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X3",
    "variant": "U-CAR new-car catalog",
    "price": 249,
    "priceLabel": "249-383 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X3: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7115.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x3/7115/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x3/7115/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 4 Series Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 269,
    "priceLabel": "269-388 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "4 Series Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7146.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/4%20series%20coup%C3%A9/7146/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/4%20series%20coup%C3%A9/7146/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 4 Series Gran Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 271,
    "priceLabel": "271-324 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "4 Series Gran Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7147.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/4%20series%20gran%20coup%C3%A9/7147/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/4%20series%20gran%20coup%C3%A9/7147/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW i4",
    "variant": "U-CAR new-car catalog",
    "price": 279,
    "priceLabel": "279-333 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "i4: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7059.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/i4/7059/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/i4/7059/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW iX3",
    "variant": "U-CAR new-car catalog",
    "price": 280,
    "priceLabel": "280-325 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "iX3: synced from Taiwan new-car catalog.",
    "note": "Taiwan new-car listing; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7254.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/ix3/7254/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/ix3/7254/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 5 Series",
    "variant": "U-CAR new-car catalog",
    "price": 299,
    "priceLabel": "299-339 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "5 Series: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7073.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/5%20series/7073/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/5%20series/7073/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 5 Series Touring",
    "variant": "U-CAR new-car catalog",
    "price": 309,
    "priceLabel": "309 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "5 Series Touring: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7074.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/5%20series%20touring/7074/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/5%20series%20touring/7074/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW i5",
    "variant": "U-CAR new-car catalog",
    "price": 329,
    "priceLabel": "329-485 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "i5: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6967.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/i5/6967/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/i5/6967/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW iX",
    "variant": "U-CAR new-car catalog",
    "price": 338,
    "priceLabel": "338-488 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "iX: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6960.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/ix/6960/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/ix/6960/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW i5 Touring",
    "variant": "U-CAR new-car catalog",
    "price": 339,
    "priceLabel": "339-495 TWD 10k",
    "body": "hatch",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "i5 Touring: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6968.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/i5%20touring/6968/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/i5%20touring/6968/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X5",
    "variant": "U-CAR new-car catalog",
    "price": 354,
    "priceLabel": "354-399 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X5: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7170.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x5/7170/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x5/7170/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 4 Series Convertible",
    "variant": "U-CAR new-car catalog",
    "price": 355,
    "priceLabel": "355 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "4 Series Convertible: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7148.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/4%20series%20convertible/7148/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/4%20series%20convertible/7148/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW Z4",
    "variant": "U-CAR new-car catalog",
    "price": 372,
    "priceLabel": "372 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Z4: synced from Taiwan new-car catalog.",
    "note": "敞蓬車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7078.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/z4/7078/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/z4/7078/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M2",
    "variant": "U-CAR new-car catalog",
    "price": 375,
    "priceLabel": "375 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M2: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6850.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m2/6850/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m2/6850/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X6",
    "variant": "U-CAR new-car catalog",
    "price": 406,
    "priceLabel": "406-565 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X6: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7171.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x6/7171/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x6/7171/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW 7 Series",
    "variant": "U-CAR new-car catalog",
    "price": 493,
    "priceLabel": "493-640 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "7 Series: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6498.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/7%20series/6498/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/7%20series/6498/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X7",
    "variant": "U-CAR new-car catalog",
    "price": 529,
    "priceLabel": "529-716 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X7: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6493.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x7/6493/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x7/6493/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW i7",
    "variant": "U-CAR new-car catalog",
    "price": 598,
    "priceLabel": "598-888 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "i7: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6645.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/i7/6645/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/i7/6645/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M3",
    "variant": "U-CAR new-car catalog",
    "price": 618,
    "priceLabel": "618 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M3: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6735.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m3/6735/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m3/6735/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M4 Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 622,
    "priceLabel": "622 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M4 Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6664.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m4%20coup%C3%A9/6664/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m4%20coup%C3%A9/6664/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M3 Touring",
    "variant": "U-CAR new-car catalog",
    "price": 626,
    "priceLabel": "626 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M3 Touring: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6736.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m3%20touring/6736/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m3%20touring/6736/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M4 Convertible",
    "variant": "U-CAR new-car catalog",
    "price": 646,
    "priceLabel": "646 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M4 Convertible: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6665.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m4%20convertible/6665/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m4%20convertible/6665/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW X6 M",
    "variant": "U-CAR new-car catalog",
    "price": 760,
    "priceLabel": "760 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X6 M: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6436.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/x6%20m/6436/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/x6%20m/6436/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M5",
    "variant": "U-CAR new-car catalog",
    "price": 763,
    "priceLabel": "763 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M5: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6924.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m5/6924/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m5/6924/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW M5 Touring",
    "variant": "U-CAR new-car catalog",
    "price": 775,
    "priceLabel": "775 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "M5 Touring: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6922.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/m5%20touring/6922/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/m5%20touring/6922/overall",
    "source": "ucar"
  },
  {
    "brand": "BMW",
    "name": "BMW XM",
    "variant": "U-CAR new-car catalog",
    "price": 889,
    "priceLabel": "889 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "XM: synced from Taiwan new-car catalog.",
    "note": "豪華級距SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6395.jpg",
    "url": "https://newcar.u-car.com.tw/bmw/xm/6395/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/bmw/xm/6395/overall",
    "source": "ucar"
  },
  {
    "brand": "Citroën",
    "name": "Citroën Berlingo Van",
    "variant": "U-CAR new-car catalog",
    "price": 118.8,
    "priceLabel": "118.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Berlingo Van: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6789.jpg",
    "url": "https://newcar.u-car.com.tw/citro%C3%ABn/berlingo%20van/6789/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/citro%C3%ABn/berlingo%20van/6789/overall",
    "source": "ucar"
  },
  {
    "brand": "Citroën",
    "name": "Citroën Berlingo短軸",
    "variant": "U-CAR new-car catalog",
    "price": 118.8,
    "priceLabel": "118.8-131.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Berlingo短軸: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6787.jpg",
    "url": "https://newcar.u-car.com.tw/citro%C3%ABn/berlingo%E7%9F%AD%E8%BB%B8/6787/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/citro%C3%ABn/berlingo%E7%9F%AD%E8%BB%B8/6787/overall",
    "source": "ucar"
  },
  {
    "brand": "Citroën",
    "name": "Citroën C5 Aircross",
    "variant": "U-CAR new-car catalog",
    "price": 126.8,
    "priceLabel": "126.8-139.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "C5 Aircross: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7187.jpg",
    "url": "https://newcar.u-car.com.tw/citro%C3%ABn/c5%20aircross/7187/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/citro%C3%ABn/c5%20aircross/7187/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC Veryca A190貨車",
    "variant": "U-CAR new-car catalog",
    "price": 48.1,
    "priceLabel": "48.1-56.2 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Veryca A190貨車: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6802.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/veryca%20a190%E8%B2%A8%E8%BB%8A/6802/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/veryca%20a190%E8%B2%A8%E8%BB%8A/6802/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC J Space廂型車",
    "variant": "U-CAR new-car catalog",
    "price": 55.3,
    "priceLabel": "55.3-74.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "J Space廂型車: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7208.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/j%20space%E5%BB%82%E5%9E%8B%E8%BB%8A/7208/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/j%20space%E5%BB%82%E5%9E%8B%E8%BB%8A/7208/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC Zinger Pick Up",
    "variant": "U-CAR new-car catalog",
    "price": 64.4,
    "priceLabel": "64.4-70 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Zinger Pick Up: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6821.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/zinger%20pick%20up/6821/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/zinger%20pick%20up/6821/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC Zinger",
    "variant": "U-CAR new-car catalog",
    "price": 72.9,
    "priceLabel": "72.9-92.5 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Zinger: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7168.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/zinger/7168/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/zinger/7168/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC P350 Hybrid",
    "variant": "U-CAR new-car catalog",
    "price": 74.9,
    "priceLabel": "74.9-77 TWD 10k",
    "body": "mpv",
    "power": "hybrid",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "P350 Hybrid: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6820.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/p350%20hybrid/6820/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/p350%20hybrid/6820/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC E300",
    "variant": "U-CAR new-car catalog",
    "price": 91.2,
    "priceLabel": "91.2-99.7 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "E300: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6358.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/e300/6358/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/e300/6358/overall",
    "source": "ucar"
  },
  {
    "brand": "CMC",
    "name": "CMC ET35",
    "variant": "U-CAR new-car catalog",
    "price": 138.9,
    "priceLabel": "138.9-142.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ET35: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7030.jpg",
    "url": "https://newcar.u-car.com.tw/cmc/et35/7030/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/cmc/et35/7030/overall",
    "source": "ucar"
  },
  {
    "brand": "DFSK",
    "name": "DFSK 金穩發",
    "variant": "U-CAR new-car catalog",
    "price": 49.8,
    "priceLabel": "49.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "金穩發: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6210.jpg",
    "url": "https://newcar.u-car.com.tw/dfsk/%E9%87%91%E7%A9%A9%E7%99%BC/6210/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/dfsk/%E9%87%91%E7%A9%A9%E7%99%BC/6210/overall",
    "source": "ucar"
  },
  {
    "brand": "DFSK",
    "name": "DFSK A380 WINMAX",
    "variant": "U-CAR new-car catalog",
    "price": 65.8,
    "priceLabel": "65.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A380 WINMAX: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6706.jpg",
    "url": "https://newcar.u-car.com.tw/dfsk/a380%20winmax/6706/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/dfsk/a380%20winmax/6706/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari Amalfi",
    "variant": "U-CAR new-car catalog",
    "price": 1390,
    "priceLabel": "1390 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Amalfi: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7100.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/amalfi/7100/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/amalfi/7100/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari Amalfi Spider",
    "variant": "U-CAR new-car catalog",
    "price": 1565,
    "priceLabel": "1565 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Amalfi Spider: synced from Taiwan new-car catalog.",
    "note": "Taiwan new-car listing; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7227.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/amalfi%20spider/7227/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/amalfi%20spider/7227/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 296 GTB",
    "variant": "U-CAR new-car catalog",
    "price": 1688,
    "priceLabel": "1688 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "296 GTB: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6218.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/296%20gtb/6218/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/296%20gtb/6218/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 296 GTS",
    "variant": "U-CAR new-car catalog",
    "price": 1822,
    "priceLabel": "1822 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "296 GTS: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6299.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/296%20gts/6299/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/296%20gts/6299/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari Purosangue",
    "variant": "U-CAR new-car catalog",
    "price": 2221,
    "priceLabel": "2221 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Purosangue: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6356.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/purosangue/6356/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/purosangue/6356/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 296 Speciale",
    "variant": "U-CAR new-car catalog",
    "price": 2385,
    "priceLabel": "2385 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "296 Speciale: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6988.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/296%20speciale/6988/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/296%20speciale/6988/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 12Cilindri",
    "variant": "U-CAR new-car catalog",
    "price": 2403.8,
    "priceLabel": "2403.8 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "12Cilindri: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6761.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/12cilindri/6761/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/12cilindri/6761/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari Luce",
    "variant": "U-CAR new-car catalog",
    "price": 2608,
    "priceLabel": "2608 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Luce: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7270.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/luce/7270/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/luce/7270/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 12Cilindri Spider",
    "variant": "U-CAR new-car catalog",
    "price": 2644.18,
    "priceLabel": "2644.18 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "12Cilindri Spider: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7090.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/12cilindri%20spider/7090/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/12cilindri%20spider/7090/overall",
    "source": "ucar"
  },
  {
    "brand": "Ferrari",
    "name": "Ferrari 849 Testarossa",
    "variant": "U-CAR new-car catalog",
    "price": 2713.8,
    "priceLabel": "2713.8 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "849 Testarossa: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7193.jpg",
    "url": "https://newcar.u-car.com.tw/ferrari/849%20testarossa/7193/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ferrari/849%20testarossa/7193/overall",
    "source": "ucar"
  },
  {
    "brand": "Ford",
    "name": "Ford Territory",
    "variant": "U-CAR new-car catalog",
    "price": 94.9,
    "priceLabel": "94.9-109.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Territory: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7063.jpg",
    "url": "https://newcar.u-car.com.tw/ford/territory/7063/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ford/territory/7063/overall",
    "source": "ucar"
  },
  {
    "brand": "Ford",
    "name": "Ford Tourneo Connect",
    "variant": "U-CAR new-car catalog",
    "price": 119.8,
    "priceLabel": "119.8-129.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Tourneo Connect: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6869.jpg",
    "url": "https://newcar.u-car.com.tw/ford/tourneo%20connect/6869/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ford/tourneo%20connect/6869/overall",
    "source": "ucar"
  },
  {
    "brand": "Ford",
    "name": "Ford Tourneo Custom",
    "variant": "U-CAR new-car catalog",
    "price": 151.8,
    "priceLabel": "151.8-188.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Tourneo Custom: synced from Taiwan new-car catalog.",
    "note": "其他級距進口MPV廂式休旅車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6928.jpg",
    "url": "https://newcar.u-car.com.tw/ford/tourneo%20custom/6928/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ford/tourneo%20custom/6928/overall",
    "source": "ucar"
  },
  {
    "brand": "Ford",
    "name": "Ford Ranger",
    "variant": "U-CAR new-car catalog",
    "price": 164.8,
    "priceLabel": "164.8-208.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ranger: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6925.jpg",
    "url": "https://newcar.u-car.com.tw/ford/ranger/6925/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ford/ranger/6925/overall",
    "source": "ucar"
  },
  {
    "brand": "Ford",
    "name": "Ford Mustang",
    "variant": "U-CAR new-car catalog",
    "price": 170.9,
    "priceLabel": "170.9-235.9 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mustang: synced from Taiwan new-car catalog.",
    "note": "性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7232.jpg",
    "url": "https://newcar.u-car.com.tw/ford/mustang/7232/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ford/mustang/7232/overall",
    "source": "ucar"
  },
  {
    "brand": "Foxtron",
    "name": "Foxtron Bria",
    "variant": "U-CAR new-car catalog",
    "price": 89.9,
    "priceLabel": "89.9-114.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Bria: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7079.jpg",
    "url": "https://newcar.u-car.com.tw/foxtron/bria/7079/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/foxtron/bria/7079/overall",
    "source": "ucar"
  },
  {
    "brand": "Foxtron",
    "name": "Foxtron Cavira",
    "variant": "U-CAR new-car catalog",
    "price": 123.9,
    "priceLabel": "123.9-138.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Cavira: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7220.jpg",
    "url": "https://newcar.u-car.com.tw/foxtron/cavira/7220/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/foxtron/cavira/7220/overall",
    "source": "ucar"
  },
  {
    "brand": "Honda",
    "name": "Honda Fit",
    "variant": "U-CAR new-car catalog",
    "price": 75.9,
    "priceLabel": "75.9-82.9 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Fit: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6307.jpg",
    "url": "https://newcar.u-car.com.tw/honda/fit/6307/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/honda/fit/6307/overall",
    "source": "ucar"
  },
  {
    "brand": "Honda",
    "name": "Honda HR-V",
    "variant": "U-CAR new-car catalog",
    "price": 79.9,
    "priceLabel": "79.9-98.5 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "HR-V: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6946.jpg",
    "url": "https://newcar.u-car.com.tw/honda/hr-v/6946/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/honda/hr-v/6946/overall",
    "source": "ucar"
  },
  {
    "brand": "Honda",
    "name": "Honda CR-V",
    "variant": "U-CAR new-car catalog",
    "price": 99.9,
    "priceLabel": "99.9-129.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CR-V: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7214.jpg",
    "url": "https://newcar.u-car.com.tw/honda/cr-v/7214/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/honda/cr-v/7214/overall",
    "source": "ucar"
  },
  {
    "brand": "Honda",
    "name": "Honda Civic",
    "variant": "U-CAR new-car catalog",
    "price": 127.9,
    "priceLabel": "127.9 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Civic: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6910.jpg",
    "url": "https://newcar.u-car.com.tw/honda/civic/6910/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/honda/civic/6910/overall",
    "source": "ucar"
  },
  {
    "brand": "Honda",
    "name": "Honda Prelude",
    "variant": "U-CAR new-car catalog",
    "price": 174.9,
    "priceLabel": "174.9-176.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Prelude: synced from Taiwan new-car catalog.",
    "note": "跑車/跑房車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7269.jpg",
    "url": "https://newcar.u-car.com.tw/honda/prelude/7269/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/honda/prelude/7269/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Venue",
    "variant": "U-CAR new-car catalog",
    "price": 73.9,
    "priceLabel": "73.9-81.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Venue: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6662.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/venue/6662/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/venue/6662/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Porter II",
    "variant": "U-CAR new-car catalog",
    "price": 74.8,
    "priceLabel": "74.8-95.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Porter II: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6831.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/porter%20ii/6831/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/porter%20ii/6831/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Mufasa",
    "variant": "U-CAR new-car catalog",
    "price": 85.9,
    "priceLabel": "85.9-94.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mufasa: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7091.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/mufasa/7091/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/mufasa/7091/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Inster",
    "variant": "U-CAR new-car catalog",
    "price": 94.9,
    "priceLabel": "94.9-109.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Inster: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7048.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/inster/7048/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/inster/7048/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Tucson L",
    "variant": "U-CAR new-car catalog",
    "price": 99.9,
    "priceLabel": "99.9-125.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Tucson L: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7206.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/tucson%20l/7206/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/tucson%20l/7206/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Staria Van",
    "variant": "U-CAR new-car catalog",
    "price": 126.8,
    "priceLabel": "126.8-159.4 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Staria Van: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7008.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/staria%20van/7008/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/staria%20van/7008/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Custin",
    "variant": "U-CAR new-car catalog",
    "price": 130.9,
    "priceLabel": "130.9-163.9 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Custin: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7236.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/custin/7236/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/custin/7236/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Staria",
    "variant": "U-CAR new-car catalog",
    "price": 159.8,
    "priceLabel": "159.8-224.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Staria: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6859.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/staria/6859/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/staria/6859/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Ioniq 5",
    "variant": "U-CAR new-car catalog",
    "price": 159.9,
    "priceLabel": "159.9-187.9 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ioniq 5: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6917.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/ioniq%205/6917/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/ioniq%205/6917/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Santa Fe",
    "variant": "U-CAR new-car catalog",
    "price": 172.9,
    "priceLabel": "172.9-214.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Santa Fe: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7181.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/santa%20fe/7181/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/santa%20fe/7181/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Palisade",
    "variant": "U-CAR new-car catalog",
    "price": 258,
    "priceLabel": "258-288 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Palisade: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7272.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/palisade/7272/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/palisade/7272/overall",
    "source": "ucar"
  },
  {
    "brand": "Hyundai",
    "name": "Hyundai Ioniq 5 N",
    "variant": "U-CAR new-car catalog",
    "price": 264.9,
    "priceLabel": "264.9 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ioniq 5 N: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6834.jpg",
    "url": "https://newcar.u-car.com.tw/hyundai/ioniq%205%20n/6834/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/hyundai/ioniq%205%20n/6834/overall",
    "source": "ucar"
  },
  {
    "brand": "Ineos Grenadier",
    "name": "Ineos Grenadier Grenadier Quartermaster",
    "variant": "U-CAR new-car catalog",
    "price": 338,
    "priceLabel": "338 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grenadier Quartermaster: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7222.jpg",
    "url": "https://newcar.u-car.com.tw/ineos%20grenadier/grenadier%20quartermaster/7222/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ineos%20grenadier/grenadier%20quartermaster/7222/overall",
    "source": "ucar"
  },
  {
    "brand": "Ineos Grenadier",
    "name": "Ineos Grenadier Grenadier",
    "variant": "U-CAR new-car catalog",
    "price": 398,
    "priceLabel": "398 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grenadier: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7221.jpg",
    "url": "https://newcar.u-car.com.tw/ineos%20grenadier/grenadier/7221/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/ineos%20grenadier/grenadier/7221/overall",
    "source": "ucar"
  },
  {
    "brand": "Infiniti",
    "name": "Infiniti QX50",
    "variant": "U-CAR new-car catalog",
    "price": 189,
    "priceLabel": "189-245 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "QX50: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6396.jpg",
    "url": "https://newcar.u-car.com.tw/infiniti/qx50/6396/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/infiniti/qx50/6396/overall",
    "source": "ucar"
  },
  {
    "brand": "Infiniti",
    "name": "Infiniti QX55",
    "variant": "U-CAR new-car catalog",
    "price": 222.5,
    "priceLabel": "222.5-255 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "QX55: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6315.jpg",
    "url": "https://newcar.u-car.com.tw/infiniti/qx55/6315/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/infiniti/qx55/6315/overall",
    "source": "ucar"
  },
  {
    "brand": "Infiniti",
    "name": "Infiniti QX60",
    "variant": "U-CAR new-car catalog",
    "price": 268,
    "priceLabel": "268-285 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "QX60: synced from Taiwan new-car catalog.",
    "note": "豪華級距SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7127.jpg",
    "url": "https://newcar.u-car.com.tw/infiniti/qx60/7127/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/infiniti/qx60/7127/overall",
    "source": "ucar"
  },
  {
    "brand": "Jaguar",
    "name": "Jaguar E-Pace",
    "variant": "U-CAR new-car catalog",
    "price": 218,
    "priceLabel": "218 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "E-Pace: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6550.jpg",
    "url": "https://newcar.u-car.com.tw/jaguar/e-pace/6550/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/jaguar/e-pace/6550/overall",
    "source": "ucar"
  },
  {
    "brand": "Jaguar",
    "name": "Jaguar F-Pace",
    "variant": "U-CAR new-car catalog",
    "price": 286,
    "priceLabel": "286-501 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "F-Pace: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6251.jpg",
    "url": "https://newcar.u-car.com.tw/jaguar/f-pace/6251/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/jaguar/f-pace/6251/overall",
    "source": "ucar"
  },
  {
    "brand": "Jaguar",
    "name": "Jaguar I-Pace",
    "variant": "U-CAR new-car catalog",
    "price": 298,
    "priceLabel": "298-332 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "I-Pace: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6500.jpg",
    "url": "https://newcar.u-car.com.tw/jaguar/i-pace/6500/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/jaguar/i-pace/6500/overall",
    "source": "ucar"
  },
  {
    "brand": "Jaguar",
    "name": "Jaguar F-Type",
    "variant": "U-CAR new-car catalog",
    "price": 381,
    "priceLabel": "381-575 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "F-Type: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6514.jpg",
    "url": "https://newcar.u-car.com.tw/jaguar/f-type/6514/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/jaguar/f-type/6514/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Picanto",
    "variant": "U-CAR new-car catalog",
    "price": 59.9,
    "priceLabel": "59.9-67.9 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Picanto: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6893.jpg",
    "url": "https://newcar.u-car.com.tw/kia/picanto/6893/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/picanto/6893/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia K2500",
    "variant": "U-CAR new-car catalog",
    "price": 76.8,
    "priceLabel": "76.8-102.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "K2500: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6684.jpg",
    "url": "https://newcar.u-car.com.tw/kia/k2500/6684/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/k2500/6684/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Stonic",
    "variant": "U-CAR new-car catalog",
    "price": 89.9,
    "priceLabel": "89.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Stonic: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7142.jpg",
    "url": "https://newcar.u-car.com.tw/kia/stonic/7142/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/stonic/7142/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Ceed Sportswagon",
    "variant": "U-CAR new-car catalog",
    "price": 112.9,
    "priceLabel": "112.9 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ceed Sportswagon: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7037.jpg",
    "url": "https://newcar.u-car.com.tw/kia/ceed%20sportswagon/7037/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/ceed%20sportswagon/7037/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Sportage",
    "variant": "U-CAR new-car catalog",
    "price": 119.9,
    "priceLabel": "119.9-138.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Sportage: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7184.jpg",
    "url": "https://newcar.u-car.com.tw/kia/sportage/7184/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/sportage/7184/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia EV6",
    "variant": "U-CAR new-car catalog",
    "price": 166.9,
    "priceLabel": "166.9-208.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EV6: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6933.jpg",
    "url": "https://newcar.u-car.com.tw/kia/ev6/6933/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/ev6/6933/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Carnival",
    "variant": "U-CAR new-car catalog",
    "price": 167.9,
    "priceLabel": "167.9-208.9 TWD 10k",
    "body": "mpv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Carnival: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7015.jpg",
    "url": "https://newcar.u-car.com.tw/kia/carnival/7015/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/carnival/7015/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia Sorento",
    "variant": "U-CAR new-car catalog",
    "price": 169.9,
    "priceLabel": "169.9-194.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Sorento: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7207.jpg",
    "url": "https://newcar.u-car.com.tw/kia/sorento/7207/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/sorento/7207/overall",
    "source": "ucar"
  },
  {
    "brand": "Kia",
    "name": "Kia EV9",
    "variant": "U-CAR new-car catalog",
    "price": 279.9,
    "priceLabel": "279.9-299.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EV9: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6670.jpg",
    "url": "https://newcar.u-car.com.tw/kia/ev9/6670/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/kia/ev9/6670/overall",
    "source": "ucar"
  },
  {
    "brand": "Lamborghini",
    "name": "Lamborghini Urus",
    "variant": "U-CAR new-car catalog",
    "price": 1338,
    "priceLabel": "1338 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Urus: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7118.jpg",
    "url": "https://newcar.u-car.com.tw/lamborghini/urus/7118/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lamborghini/urus/7118/overall",
    "source": "ucar"
  },
  {
    "brand": "Lamborghini",
    "name": "Lamborghini Temerario",
    "variant": "U-CAR new-car catalog",
    "price": 1798,
    "priceLabel": "1798 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Temerario: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6837.jpg",
    "url": "https://newcar.u-car.com.tw/lamborghini/temerario/6837/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lamborghini/temerario/6837/overall",
    "source": "ucar"
  },
  {
    "brand": "Lamborghini",
    "name": "Lamborghini Revuelto",
    "variant": "U-CAR new-car catalog",
    "price": 2799,
    "priceLabel": "2799 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Revuelto: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6393.jpg",
    "url": "https://newcar.u-car.com.tw/lamborghini/revuelto/6393/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lamborghini/revuelto/6393/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Discovery Sport",
    "variant": "U-CAR new-car catalog",
    "price": 228,
    "priceLabel": "228-246 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Discovery Sport: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7229.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/discovery%20sport/7229/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/discovery%20sport/7229/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Range Rover Evoque",
    "variant": "U-CAR new-car catalog",
    "price": 228,
    "priceLabel": "228-245 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Range Rover Evoque: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7215.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20evoque/7215/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20evoque/7215/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Defender 90",
    "variant": "U-CAR new-car catalog",
    "price": 277,
    "priceLabel": "277-305 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Defender 90: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7111.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/defender%2090/7111/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/defender%2090/7111/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Defender 110",
    "variant": "U-CAR new-car catalog",
    "price": 299,
    "priceLabel": "299-858 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Defender 110: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7110.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/defender%20110/7110/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/defender%20110/7110/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Range Rover Velar",
    "variant": "U-CAR new-car catalog",
    "price": 329,
    "priceLabel": "329 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Range Rover Velar: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7216.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20velar/7216/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20velar/7216/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Discovery",
    "variant": "U-CAR new-car catalog",
    "price": 367,
    "priceLabel": "367-403 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Discovery: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7180.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/discovery/7180/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/discovery/7180/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Range Rover Sport",
    "variant": "U-CAR new-car catalog",
    "price": 399,
    "priceLabel": "399-730 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Range Rover Sport: synced from Taiwan new-car catalog.",
    "note": "豪華級距SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7134.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20sport/7134/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/range%20rover%20sport/7134/overall",
    "source": "ucar"
  },
  {
    "brand": "Land Rover",
    "name": "Land Rover Range Rover",
    "variant": "U-CAR new-car catalog",
    "price": 615,
    "priceLabel": "615-1030 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Range Rover: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7135.jpg",
    "url": "https://newcar.u-car.com.tw/land%20rover/range%20rover/7135/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/land%20rover/range%20rover/7135/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus LBX",
    "variant": "U-CAR new-car catalog",
    "price": 129.9,
    "priceLabel": "129.9-169 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "LBX: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6982.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/lbx/6982/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/lbx/6982/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus UX",
    "variant": "U-CAR new-car catalog",
    "price": 149.9,
    "priceLabel": "149.9-171.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "UX: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7128.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/ux/7128/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/ux/7128/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus NX",
    "variant": "U-CAR new-car catalog",
    "price": 171,
    "priceLabel": "171-284.5 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "NX: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6984.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/nx/6984/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/nx/6984/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus ES",
    "variant": "U-CAR new-car catalog",
    "price": 177,
    "priceLabel": "177-197 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ES: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7178.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/es/7178/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/es/7178/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus IS",
    "variant": "U-CAR new-car catalog",
    "price": 189,
    "priceLabel": "189-214 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "IS: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7084.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/is/7084/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/is/7084/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus ES Electric",
    "variant": "U-CAR new-car catalog",
    "price": 205,
    "priceLabel": "205-250 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ES Electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7179.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/es%20electric/7179/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/es%20electric/7179/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus RZ",
    "variant": "U-CAR new-car catalog",
    "price": 215,
    "priceLabel": "215-255 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RZ: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7071.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/rz/7071/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/rz/7071/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus RX",
    "variant": "U-CAR new-car catalog",
    "price": 246,
    "priceLabel": "246-361 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RX: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6764.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/rx/6764/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/rx/6764/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus LM",
    "variant": "U-CAR new-car catalog",
    "price": 429,
    "priceLabel": "429-596 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "LM: synced from Taiwan new-car catalog.",
    "note": "豪華級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6983.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/lm/6983/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/lm/6983/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus LS",
    "variant": "U-CAR new-car catalog",
    "price": 515,
    "priceLabel": "515-590 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "LS: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6313.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/ls/6313/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/ls/6313/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus LC",
    "variant": "U-CAR new-car catalog",
    "price": 620,
    "priceLabel": "620-650 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "LC: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6391.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/lc/6391/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/lc/6391/overall",
    "source": "ucar"
  },
  {
    "brand": "Lexus",
    "name": "Lexus LC Convertible",
    "variant": "U-CAR new-car catalog",
    "price": 648,
    "priceLabel": "648 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "LC Convertible: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6392.jpg",
    "url": "https://newcar.u-car.com.tw/lexus/lc%20convertible/6392/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lexus/lc%20convertible/6392/overall",
    "source": "ucar"
  },
  {
    "brand": "Lotus",
    "name": "Lotus Emira",
    "variant": "U-CAR new-car catalog",
    "price": 585,
    "priceLabel": "585-650 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Emira: synced from Taiwan new-car catalog.",
    "note": "跑車/跑房車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7088.jpg",
    "url": "https://newcar.u-car.com.tw/lotus/emira/7088/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/lotus/emira/7088/overall",
    "source": "ucar"
  },
  {
    "brand": "Luxgen",
    "name": "Luxgen U6 Neo",
    "variant": "U-CAR new-car catalog",
    "price": 75.9,
    "priceLabel": "75.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "U6 Neo: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6908.jpg",
    "url": "https://newcar.u-car.com.tw/luxgen/u6%20neo/6908/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/luxgen/u6%20neo/6908/overall",
    "source": "ucar"
  },
  {
    "brand": "Luxgen",
    "name": "Luxgen URX Neo",
    "variant": "U-CAR new-car catalog",
    "price": 83.9,
    "priceLabel": "83.9-100.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "URX Neo: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6909.jpg",
    "url": "https://newcar.u-car.com.tw/luxgen/urx%20neo/6909/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/luxgen/urx%20neo/6909/overall",
    "source": "ucar"
  },
  {
    "brand": "Luxgen",
    "name": "Luxgen n⁷",
    "variant": "U-CAR new-car catalog",
    "price": 99.9,
    "priceLabel": "99.9-149.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "n⁷: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6734.jpg",
    "url": "https://newcar.u-car.com.tw/luxgen/n%E2%81%B7/6734/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/luxgen/n%E2%81%B7/6734/overall",
    "source": "ucar"
  },
  {
    "brand": "Mahindra",
    "name": "Mahindra KUV100",
    "variant": "U-CAR new-car catalog",
    "price": 55.8,
    "priceLabel": "55.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "KUV100: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6187.jpg",
    "url": "https://newcar.u-car.com.tw/mahindra/kuv100/6187/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mahindra/kuv100/6187/overall",
    "source": "ucar"
  },
  {
    "brand": "Mahindra",
    "name": "Mahindra Pikup",
    "variant": "U-CAR new-car catalog",
    "price": 75.8,
    "priceLabel": "75.8-105.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Pikup: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6180.jpg",
    "url": "https://newcar.u-car.com.tw/mahindra/pikup/6180/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mahindra/pikup/6180/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati Grecale",
    "variant": "U-CAR new-car catalog",
    "price": 368,
    "priceLabel": "368-602 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grecale: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6938.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/grecale/6938/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/grecale/6938/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati Grecale Folgore",
    "variant": "U-CAR new-car catalog",
    "price": 499,
    "priceLabel": "499 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grecale Folgore: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6658.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/grecale%20folgore/6658/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/grecale%20folgore/6658/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati GranTurismo",
    "variant": "U-CAR new-car catalog",
    "price": 788,
    "priceLabel": "788-958 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GranTurismo: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6458.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/granturismo/6458/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/granturismo/6458/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati GranCabrio",
    "variant": "U-CAR new-car catalog",
    "price": 880,
    "priceLabel": "880-1128 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GranCabrio: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6730.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/grancabrio/6730/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/grancabrio/6730/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati GranTurismo Folgore",
    "variant": "U-CAR new-car catalog",
    "price": 899,
    "priceLabel": "899 TWD 10k",
    "body": "sedan",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GranTurismo Folgore: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6659.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/granturismo%20folgore/6659/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/granturismo%20folgore/6659/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati GranCabrio Folgore",
    "variant": "U-CAR new-car catalog",
    "price": 969,
    "priceLabel": "969 TWD 10k",
    "body": "sports",
    "power": "electric",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GranCabrio Folgore: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6987.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/grancabrio%20folgore/6987/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/grancabrio%20folgore/6987/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati MC20",
    "variant": "U-CAR new-car catalog",
    "price": 1338,
    "priceLabel": "1338 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "MC20: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6217.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/mc20/6217/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/mc20/6217/overall",
    "source": "ucar"
  },
  {
    "brand": "Maserati",
    "name": "Maserati MC20 Cielo",
    "variant": "U-CAR new-car catalog",
    "price": 1580,
    "priceLabel": "1580 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "MC20 Cielo: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6540.jpg",
    "url": "https://newcar.u-car.com.tw/maserati/mc20%20cielo/6540/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/maserati/mc20%20cielo/6540/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda Mazda2",
    "variant": "U-CAR new-car catalog",
    "price": 64.9,
    "priceLabel": "64.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mazda2: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7199.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/mazda2/7199/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/mazda2/7199/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda CX-3",
    "variant": "U-CAR new-car catalog",
    "price": 84.9,
    "priceLabel": "84.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CX-3: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7021.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/cx-3/7021/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/cx-3/7021/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda Mazda3 四門",
    "variant": "U-CAR new-car catalog",
    "price": 88.8,
    "priceLabel": "88.8-101.8 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mazda3 四門: synced from Taiwan new-car catalog.",
    "note": "一般級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7126.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/mazda3%20%E5%9B%9B%E9%96%80/7126/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/mazda3%20%E5%9B%9B%E9%96%80/7126/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda CX-30",
    "variant": "U-CAR new-car catalog",
    "price": 89.8,
    "priceLabel": "89.8-111.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CX-30: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7124.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/cx-30/7124/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/cx-30/7124/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda CX-5",
    "variant": "U-CAR new-car catalog",
    "price": 94.9,
    "priceLabel": "94.9-116.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CX-5: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7264.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/cx-5/7264/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/cx-5/7264/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda CX-60",
    "variant": "U-CAR new-car catalog",
    "price": 118.9,
    "priceLabel": "118.9-171.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CX-60: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6959.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/cx-60/6959/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/cx-60/6959/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda MX-5",
    "variant": "U-CAR new-car catalog",
    "price": 140,
    "priceLabel": "140-150 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "MX-5: synced from Taiwan new-car catalog.",
    "note": "敞蓬車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7113.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/mx-5/7113/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/mx-5/7113/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda MX-5 RF",
    "variant": "U-CAR new-car catalog",
    "price": 159,
    "priceLabel": "159 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "MX-5 RF: synced from Taiwan new-car catalog.",
    "note": "敞蓬車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7114.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/mx-5%20rf/7114/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/mx-5%20rf/7114/overall",
    "source": "ucar"
  },
  {
    "brand": "Mazda",
    "name": "Mazda CX-90",
    "variant": "U-CAR new-car catalog",
    "price": 179.9,
    "priceLabel": "179.9-211.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CX-90: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6833.jpg",
    "url": "https://newcar.u-car.com.tw/mazda/cx-90/6833/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mazda/cx-90/6833/overall",
    "source": "ucar"
  },
  {
    "brand": "McLaren",
    "name": "McLaren GTS",
    "variant": "U-CAR new-car catalog",
    "price": 1368,
    "priceLabel": "1368 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GTS: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7000.jpg",
    "url": "https://newcar.u-car.com.tw/mclaren/gts/7000/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mclaren/gts/7000/overall",
    "source": "ucar"
  },
  {
    "brand": "McLaren",
    "name": "McLaren Artura Coupe",
    "variant": "U-CAR new-car catalog",
    "price": 1438,
    "priceLabel": "1438 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Artura Coupe: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6998.jpg",
    "url": "https://newcar.u-car.com.tw/mclaren/artura%20coupe/6998/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mclaren/artura%20coupe/6998/overall",
    "source": "ucar"
  },
  {
    "brand": "McLaren",
    "name": "McLaren Artura Spider",
    "variant": "U-CAR new-car catalog",
    "price": 1580,
    "priceLabel": "1580 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Artura Spider: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6999.jpg",
    "url": "https://newcar.u-car.com.tw/mclaren/artura%20spider/6999/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mclaren/artura%20spider/6999/overall",
    "source": "ucar"
  },
  {
    "brand": "McLaren",
    "name": "McLaren 750S Coupe",
    "variant": "U-CAR new-car catalog",
    "price": 1818,
    "priceLabel": "1818 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "750S Coupe: synced from Taiwan new-car catalog.",
    "note": "豪華級距超級跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6996.jpg",
    "url": "https://newcar.u-car.com.tw/mclaren/750s%20coupe/6996/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mclaren/750s%20coupe/6996/overall",
    "source": "ucar"
  },
  {
    "brand": "McLaren",
    "name": "McLaren 750S Spider",
    "variant": "U-CAR new-car catalog",
    "price": 1998,
    "priceLabel": "1998 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "750S Spider: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6997.jpg",
    "url": "https://newcar.u-car.com.tw/mclaren/750s%20spider/6997/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mclaren/750s%20spider/6997/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz A-Class",
    "variant": "U-CAR new-car catalog",
    "price": 165,
    "priceLabel": "165 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7188.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/a-class/7188/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/a-class/7188/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz B-Class",
    "variant": "U-CAR new-car catalog",
    "price": 180,
    "priceLabel": "180 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "B-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6939.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/b-class/6939/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/b-class/6939/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz A-Class Sedan",
    "variant": "U-CAR new-car catalog",
    "price": 186,
    "priceLabel": "186 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "A-Class Sedan: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6937.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/a-class%20sedan/6937/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/a-class%20sedan/6937/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLA with EQ Technology",
    "variant": "U-CAR new-car catalog",
    "price": 187,
    "priceLabel": "187-220 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLA with EQ Technology: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7145.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cla%20with%20eq%20technology/7145/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cla%20with%20eq%20technology/7145/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLA",
    "variant": "U-CAR new-car catalog",
    "price": 190,
    "priceLabel": "190-216 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLA: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7191.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/gla/7191/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/gla/7191/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLA",
    "variant": "U-CAR new-car catalog",
    "price": 192,
    "priceLabel": "192-225 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLA: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7144.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cla/7144/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cla/7144/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLA Shooting Brake with EQ technology",
    "variant": "U-CAR new-car catalog",
    "price": 194,
    "priceLabel": "194-227 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLA Shooting Brake with EQ technology: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7202.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cla%20shooting%20brake%20with%20eq%20technology/7202/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cla%20shooting%20brake%20with%20eq%20technology/7202/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLB electric",
    "variant": "U-CAR new-car catalog",
    "price": 198,
    "priceLabel": "198-241 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 7,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLB electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7255.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/glb%20electric/7255/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/glb%20electric/7255/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLA Shooting Brake",
    "variant": "U-CAR new-car catalog",
    "price": 199,
    "priceLabel": "199 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLA Shooting Brake: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7203.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cla%20shooting%20brake/7203/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cla%20shooting%20brake/7203/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz V-Class",
    "variant": "U-CAR new-car catalog",
    "price": 210,
    "priceLabel": "210-360 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "V-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7253.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/v-class/7253/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/v-class/7253/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLB",
    "variant": "U-CAR new-car catalog",
    "price": 215,
    "priceLabel": "215-236 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLB: synced from Taiwan new-car catalog.",
    "note": "Taiwan new-car listing; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7258.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/glb/7258/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/glb/7258/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQA",
    "variant": "U-CAR new-car catalog",
    "price": 217,
    "priceLabel": "217 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQA: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6944.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqa/6944/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqa/6944/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQB",
    "variant": "U-CAR new-car catalog",
    "price": 222,
    "priceLabel": "222-267 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQB: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6945.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqb/6945/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqb/6945/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz C-Class",
    "variant": "U-CAR new-car catalog",
    "price": 225,
    "priceLabel": "225-305 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "C-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7151.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/c-class/7151/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/c-class/7151/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG A-Class",
    "variant": "U-CAR new-car catalog",
    "price": 243,
    "priceLabel": "243-349 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG A-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7190.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20a-class/7190/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20a-class/7190/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz C-Class Estate",
    "variant": "U-CAR new-car catalog",
    "price": 266,
    "priceLabel": "266-310 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "C-Class Estate: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7153.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/c-class%20estate/7153/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/c-class%20estate/7153/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLC",
    "variant": "U-CAR new-car catalog",
    "price": 274,
    "priceLabel": "274-319 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLC: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7155.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/glc/7155/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/glc/7155/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLA",
    "variant": "U-CAR new-car catalog",
    "price": 274,
    "priceLabel": "274 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLA: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7192.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gla/7192/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gla/7192/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLE Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 289,
    "priceLabel": "289-343 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLE Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7163.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cle%20coup%C3%A9/7163/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cle%20coup%C3%A9/7163/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLC Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 295,
    "priceLabel": "295-336 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLC Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7157.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/glc%20coup%C3%A9/7157/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/glc%20coup%C3%A9/7157/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQE SUV",
    "variant": "U-CAR new-car catalog",
    "price": 300,
    "priceLabel": "300-359 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQE SUV: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7231.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqe%20suv/7231/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqe%20suv/7231/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz E-Class",
    "variant": "U-CAR new-car catalog",
    "price": 301,
    "priceLabel": "301-362 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "E-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7172.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/e-class/7172/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/e-class/7172/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLB",
    "variant": "U-CAR new-car catalog",
    "price": 308,
    "priceLabel": "308 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLB: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6991.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glb/6991/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glb/6991/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz CLE Cabriolet",
    "variant": "U-CAR new-car catalog",
    "price": 322,
    "priceLabel": "322 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "CLE Cabriolet: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7165.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/cle%20cabriolet/7165/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/cle%20cabriolet/7165/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz E-Class Estate",
    "variant": "U-CAR new-car catalog",
    "price": 327,
    "priceLabel": "327 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "E-Class Estate: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7173.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/e-class%20estate/7173/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/e-class%20estate/7173/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQE",
    "variant": "U-CAR new-car catalog",
    "price": 331,
    "priceLabel": "331 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQE: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7230.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqe/7230/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqe/7230/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLE",
    "variant": "U-CAR new-car catalog",
    "price": 343,
    "priceLabel": "343-415 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLE: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7237.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/gle/7237/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/gle/7237/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLE Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 367,
    "priceLabel": "367 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLE Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7239.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/gle%20coup%C3%A9/7239/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/gle%20coup%C3%A9/7239/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG C-Class",
    "variant": "U-CAR new-car catalog",
    "price": 391,
    "priceLabel": "391 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG C-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7152.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20c-class/7152/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20c-class/7152/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLC",
    "variant": "U-CAR new-car catalog",
    "price": 402,
    "priceLabel": "402 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLC: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7156.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glc/7156/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glc/7156/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG C-Class Estate",
    "variant": "U-CAR new-car catalog",
    "price": 405,
    "priceLabel": "405 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG C-Class Estate: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7154.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20c-class%20estate/7154/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20c-class%20estate/7154/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLC Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 414,
    "priceLabel": "414-624 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLC Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7158.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glc%20coup%C3%A9/7158/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20glc%20coup%C3%A9/7158/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG CLE Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 439,
    "priceLabel": "439 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG CLE Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7164.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20cle%20coup%C3%A9/7164/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20cle%20coup%C3%A9/7164/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLE",
    "variant": "U-CAR new-car catalog",
    "price": 457,
    "priceLabel": "457 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLE: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7238.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gle/7238/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gle/7238/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG CLE Cabriolet",
    "variant": "U-CAR new-car catalog",
    "price": 481,
    "priceLabel": "481 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG CLE Cabriolet: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7166.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20cle%20cabriolet/7166/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20cle%20cabriolet/7166/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GLE Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 490,
    "priceLabel": "490 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GLE Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7240.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gle%20coup%C3%A9/7240/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gle%20coup%C3%A9/7240/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG E-Class",
    "variant": "U-CAR new-car catalog",
    "price": 492,
    "priceLabel": "492 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG E-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7174.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20e-class/7174/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20e-class/7174/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz S-Class",
    "variant": "U-CAR new-car catalog",
    "price": 499,
    "priceLabel": "499-855 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "S-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7218.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/s-class/7218/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/s-class/7218/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz GLS",
    "variant": "U-CAR new-car catalog",
    "price": 503,
    "priceLabel": "503 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GLS: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6479.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/gls/6479/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/gls/6479/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GT 4-Door Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 579,
    "priceLabel": "579 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GT 4-Door Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6341.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gt%204-door%20coup%C3%A9/6341/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gt%204-door%20coup%C3%A9/6341/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQS",
    "variant": "U-CAR new-car catalog",
    "price": 588,
    "priceLabel": "588 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQS: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6627.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqs/6627/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqs/6627/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz EQS SUV",
    "variant": "U-CAR new-car catalog",
    "price": 603,
    "priceLabel": "603 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EQS SUV: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6628.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/eqs%20suv/6628/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/eqs%20suv/6628/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG GT",
    "variant": "U-CAR new-car catalog",
    "price": 648,
    "priceLabel": "648-1077 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG GT: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7252.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gt/7252/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20gt/7252/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG SL",
    "variant": "U-CAR new-car catalog",
    "price": 677,
    "priceLabel": "677 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG SL: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7251.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20sl/7251/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20sl/7251/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz G-Class",
    "variant": "U-CAR new-car catalog",
    "price": 699,
    "priceLabel": "699-796 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "G-Class: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7161.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/g-class/7161/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/g-class/7161/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Electric G-Class",
    "variant": "U-CAR new-car catalog",
    "price": 809,
    "priceLabel": "809 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Electric G-Class: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7162.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/electric%20g-class/7162/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/electric%20g-class/7162/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-Maybach EQS SUV",
    "variant": "U-CAR new-car catalog",
    "price": 970,
    "priceLabel": "970 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-Maybach EQS SUV: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6661.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20eqs%20suv/6661/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20eqs%20suv/6661/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-AMG G-Class",
    "variant": "U-CAR new-car catalog",
    "price": 994,
    "priceLabel": "994 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-AMG G-Class: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7226.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20g-class/7226/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-amg%20g-class/7226/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-Maybach GLS",
    "variant": "U-CAR new-car catalog",
    "price": 1147,
    "priceLabel": "1147 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-Maybach GLS: synced from Taiwan new-car catalog.",
    "note": "豪華級距超豪華車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6480.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20gls/6480/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20gls/6480/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-Maybach S-Class",
    "variant": "U-CAR new-car catalog",
    "price": 1166,
    "priceLabel": "1166 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-Maybach S-Class: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7160.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20s-class/7160/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20s-class/7160/overall",
    "source": "ucar"
  },
  {
    "brand": "Mercedes-Benz",
    "name": "Mercedes-Benz Mercedes-Maybach SL",
    "variant": "U-CAR new-car catalog",
    "price": 1196,
    "priceLabel": "1196 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mercedes-Maybach SL: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7019.jpg",
    "url": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20sl/7019/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mercedes-benz/mercedes-maybach%20sl/7019/overall",
    "source": "ucar"
  },
  {
    "brand": "MG",
    "name": "MG ZS",
    "variant": "U-CAR new-car catalog",
    "price": 69.9,
    "priceLabel": "69.9-72.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ZS: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7265.jpg",
    "url": "https://newcar.u-car.com.tw/mg/zs/7265/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mg/zs/7265/overall",
    "source": "ucar"
  },
  {
    "brand": "MG",
    "name": "MG HS",
    "variant": "U-CAR new-car catalog",
    "price": 93.9,
    "priceLabel": "93.9-124.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "HS: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6829.jpg",
    "url": "https://newcar.u-car.com.tw/mg/hs/6829/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mg/hs/6829/overall",
    "source": "ucar"
  },
  {
    "brand": "MG",
    "name": "MG MG4",
    "variant": "U-CAR new-car catalog",
    "price": 99.9,
    "priceLabel": "99.9-118.9 TWD 10k",
    "body": "hatch",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "MG4: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6668.jpg",
    "url": "https://newcar.u-car.com.tw/mg/mg4/6668/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mg/mg4/6668/overall",
    "source": "ucar"
  },
  {
    "brand": "MG",
    "name": "MG G50 Plus",
    "variant": "U-CAR new-car catalog",
    "price": 108.5,
    "priceLabel": "108.5 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "G50 Plus: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6981.jpg",
    "url": "https://newcar.u-car.com.tw/mg/g50%20plus/6981/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mg/g50%20plus/6981/overall",
    "source": "ucar"
  },
  {
    "brand": "Mini",
    "name": "Mini Mini Cooper 3-Door",
    "variant": "U-CAR new-car catalog",
    "price": 153,
    "priceLabel": "153-210 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mini Cooper 3-Door: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6897.jpg",
    "url": "https://newcar.u-car.com.tw/mini/mini%20cooper%203-door/6897/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mini/mini%20cooper%203-door/6897/overall",
    "source": "ucar"
  },
  {
    "brand": "Mini",
    "name": "Mini Mini Cooper 5-Door",
    "variant": "U-CAR new-car catalog",
    "price": 158,
    "priceLabel": "158-186 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mini Cooper 5-Door: synced from Taiwan new-car catalog.",
    "note": "豪華級距小型轎車及掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6748.jpg",
    "url": "https://newcar.u-car.com.tw/mini/mini%20cooper%205-door/6748/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mini/mini%20cooper%205-door/6748/overall",
    "source": "ucar"
  },
  {
    "brand": "Mini",
    "name": "Mini Countryman",
    "variant": "U-CAR new-car catalog",
    "price": 177,
    "priceLabel": "177-246 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Countryman: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6613.jpg",
    "url": "https://newcar.u-car.com.tw/mini/countryman/6613/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mini/countryman/6613/overall",
    "source": "ucar"
  },
  {
    "brand": "Mini",
    "name": "Mini Countryman Electric",
    "variant": "U-CAR new-car catalog",
    "price": 179,
    "priceLabel": "179-206 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Countryman Electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7070.jpg",
    "url": "https://newcar.u-car.com.tw/mini/countryman%20electric/7070/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mini/countryman%20electric/7070/overall",
    "source": "ucar"
  },
  {
    "brand": "Mini",
    "name": "Mini Mini Cabrio",
    "variant": "U-CAR new-car catalog",
    "price": 210,
    "priceLabel": "210-235 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mini Cabrio: synced from Taiwan new-car catalog.",
    "note": "敞蓬車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7217.jpg",
    "url": "https://newcar.u-car.com.tw/mini/mini%20cabrio/7217/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mini/mini%20cabrio/7217/overall",
    "source": "ucar"
  },
  {
    "brand": "Mitsubishi",
    "name": "Mitsubishi Colt Plus",
    "variant": "U-CAR new-car catalog",
    "price": 54.6,
    "priceLabel": "54.6-58.6 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Colt Plus: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6768.jpg",
    "url": "https://newcar.u-car.com.tw/mitsubishi/colt%20plus/6768/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mitsubishi/colt%20plus/6768/overall",
    "source": "ucar"
  },
  {
    "brand": "Mitsubishi",
    "name": "Mitsubishi Delica廂車",
    "variant": "U-CAR new-car catalog",
    "price": 74.8,
    "priceLabel": "74.8-81.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Delica廂車: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6822.jpg",
    "url": "https://newcar.u-car.com.tw/mitsubishi/delica%E5%BB%82%E8%BB%8A/6822/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mitsubishi/delica%E5%BB%82%E8%BB%8A/6822/overall",
    "source": "ucar"
  },
  {
    "brand": "Mitsubishi",
    "name": "Mitsubishi XForce",
    "variant": "U-CAR new-car catalog",
    "price": 79.9,
    "priceLabel": "79.9-84.2 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "XForce: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7082.jpg",
    "url": "https://newcar.u-car.com.tw/mitsubishi/xforce/7082/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mitsubishi/xforce/7082/overall",
    "source": "ucar"
  },
  {
    "brand": "Mitsubishi",
    "name": "Mitsubishi Outlander",
    "variant": "U-CAR new-car catalog",
    "price": 89.9,
    "priceLabel": "89.9-108.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Outlander: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6825.jpg",
    "url": "https://newcar.u-car.com.tw/mitsubishi/outlander/6825/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/mitsubishi/outlander/6825/overall",
    "source": "ucar"
  },
  {
    "brand": "Morgan",
    "name": "Morgan Plus Six",
    "variant": "U-CAR new-car catalog",
    "price": 618,
    "priceLabel": "618-663 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Plus Six: synced from Taiwan new-car catalog.",
    "note": "敞蓬車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6205.jpg",
    "url": "https://newcar.u-car.com.tw/morgan/plus%20six/6205/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/morgan/plus%20six/6205/overall",
    "source": "ucar"
  },
  {
    "brand": "Nissan",
    "name": "Nissan Kicks",
    "variant": "U-CAR new-car catalog",
    "price": 74.9,
    "priceLabel": "74.9-85.5 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Kicks: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7263.jpg",
    "url": "https://newcar.u-car.com.tw/nissan/kicks/7263/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/nissan/kicks/7263/overall",
    "source": "ucar"
  },
  {
    "brand": "Nissan",
    "name": "Nissan Sentra",
    "variant": "U-CAR new-car catalog",
    "price": 78.5,
    "priceLabel": "78.5-88.9 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Sentra: synced from Taiwan new-car catalog.",
    "note": "一般級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7137.jpg",
    "url": "https://newcar.u-car.com.tw/nissan/sentra/7137/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/nissan/sentra/7137/overall",
    "source": "ucar"
  },
  {
    "brand": "Nissan",
    "name": "Nissan X-Trail",
    "variant": "U-CAR new-car catalog",
    "price": 99.9,
    "priceLabel": "99.9-151.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "X-Trail: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7233.jpg",
    "url": "https://newcar.u-car.com.tw/nissan/x-trail/7233/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/nissan/x-trail/7233/overall",
    "source": "ucar"
  },
  {
    "brand": "Nissan",
    "name": "Nissan Ariya",
    "variant": "U-CAR new-car catalog",
    "price": 168.9,
    "priceLabel": "168.9-188.9 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ariya: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6692.jpg",
    "url": "https://newcar.u-car.com.tw/nissan/ariya/6692/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/nissan/ariya/6692/overall",
    "source": "ucar"
  },
  {
    "brand": "Opel",
    "name": "Opel Mokka",
    "variant": "U-CAR new-car catalog",
    "price": 112.9,
    "priceLabel": "112.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mokka: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6293.jpg",
    "url": "https://newcar.u-car.com.tw/opel/mokka/6293/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/opel/mokka/6293/overall",
    "source": "ucar"
  },
  {
    "brand": "Opel",
    "name": "Opel Astra",
    "variant": "U-CAR new-car catalog",
    "price": 117.9,
    "priceLabel": "117.9-129.9 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Astra: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6380.jpg",
    "url": "https://newcar.u-car.com.tw/opel/astra/6380/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/opel/astra/6380/overall",
    "source": "ucar"
  },
  {
    "brand": "Opel",
    "name": "Opel Combo",
    "variant": "U-CAR new-car catalog",
    "price": 126.9,
    "priceLabel": "126.9-133.9 TWD 10k",
    "body": "mpv",
    "power": "diesel",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Combo: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6961.jpg",
    "url": "https://newcar.u-car.com.tw/opel/combo/6961/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/opel/combo/6961/overall",
    "source": "ucar"
  },
  {
    "brand": "Opel",
    "name": "Opel Grandland",
    "variant": "U-CAR new-car catalog",
    "price": 129.9,
    "priceLabel": "129.9-148.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grandland: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6357.jpg",
    "url": "https://newcar.u-car.com.tw/opel/grandland/6357/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/opel/grandland/6357/overall",
    "source": "ucar"
  },
  {
    "brand": "Opel",
    "name": "Opel Mokka Electric",
    "variant": "U-CAR new-car catalog",
    "price": 139.9,
    "priceLabel": "139.9 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Mokka Electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6294.jpg",
    "url": "https://newcar.u-car.com.tw/opel/mokka%20electric/6294/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/opel/mokka%20electric/6294/overall",
    "source": "ucar"
  },
  {
    "brand": "Peugeot",
    "name": "Peugeot 208",
    "variant": "U-CAR new-car catalog",
    "price": 99.8,
    "priceLabel": "99.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "208: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7259.jpg",
    "url": "https://newcar.u-car.com.tw/peugeot/208/7259/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/peugeot/208/7259/overall",
    "source": "ucar"
  },
  {
    "brand": "Peugeot",
    "name": "Peugeot 2008",
    "variant": "U-CAR new-car catalog",
    "price": 119.8,
    "priceLabel": "119.8-124.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "2008: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6575.jpg",
    "url": "https://newcar.u-car.com.tw/peugeot/2008/6575/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/peugeot/2008/6575/overall",
    "source": "ucar"
  },
  {
    "brand": "Peugeot",
    "name": "Peugeot 408",
    "variant": "U-CAR new-car catalog",
    "price": 122.8,
    "priceLabel": "122.8-159.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "408: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6843.jpg",
    "url": "https://newcar.u-car.com.tw/peugeot/408/6843/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/peugeot/408/6843/overall",
    "source": "ucar"
  },
  {
    "brand": "Peugeot",
    "name": "Peugeot 3008",
    "variant": "U-CAR new-car catalog",
    "price": 128.8,
    "priceLabel": "128.8-154.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "3008: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6962.jpg",
    "url": "https://newcar.u-car.com.tw/peugeot/3008/6962/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/peugeot/3008/6962/overall",
    "source": "ucar"
  },
  {
    "brand": "Peugeot",
    "name": "Peugeot 5008",
    "variant": "U-CAR new-car catalog",
    "price": 138.8,
    "priceLabel": "138.8-164.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "5008: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6963.jpg",
    "url": "https://newcar.u-car.com.tw/peugeot/5008/6963/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/peugeot/5008/6963/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Macan",
    "variant": "U-CAR new-car catalog",
    "price": 322,
    "priceLabel": "322-502 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Macan: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6626.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/macan/6626/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/macan/6626/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 718 Cayman",
    "variant": "U-CAR new-car catalog",
    "price": 347,
    "priceLabel": "347-778 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "718 Cayman: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6416.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/718%20cayman/6416/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/718%20cayman/6416/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 718 Boxster",
    "variant": "U-CAR new-car catalog",
    "price": 352,
    "priceLabel": "352-794 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "718 Boxster: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6857.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/718%20boxster/6857/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/718%20boxster/6857/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Macan Electric",
    "variant": "U-CAR new-car catalog",
    "price": 358,
    "priceLabel": "358-541 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Macan Electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7050.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/macan%20electric/7050/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/macan%20electric/7050/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Taycan",
    "variant": "U-CAR new-car catalog",
    "price": 416,
    "priceLabel": "416-1032 TWD 10k",
    "body": "sports",
    "power": "electric",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Taycan: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7224.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/taycan/7224/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/taycan/7224/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Cayenne",
    "variant": "U-CAR new-car catalog",
    "price": 419,
    "priceLabel": "419-568 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Cayenne: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7119.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/cayenne/7119/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/cayenne/7119/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Cayenne Electric",
    "variant": "U-CAR new-car catalog",
    "price": 419,
    "priceLabel": "419-769 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Cayenne Electric: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7133.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/cayenne%20electric/7133/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/cayenne%20electric/7133/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Cayenne Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 443,
    "priceLabel": "443-1008 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Cayenne Coupé: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7120.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/cayenne%20coup%C3%A9/7120/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/cayenne%20coup%C3%A9/7120/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Taycan Cross Turismo",
    "variant": "U-CAR new-car catalog",
    "price": 475,
    "priceLabel": "475-761 TWD 10k",
    "body": "sports",
    "power": "electric",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Taycan Cross Turismo: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7225.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/taycan%20cross%20turismo/7225/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/taycan%20cross%20turismo/7225/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche Panamera",
    "variant": "U-CAR new-car catalog",
    "price": 574,
    "priceLabel": "574-1173 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Panamera: synced from Taiwan new-car catalog.",
    "note": "豪華級距大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6693.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/panamera/6693/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/panamera/6693/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911",
    "variant": "U-CAR new-car catalog",
    "price": 747,
    "priceLabel": "747-1610 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6902.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911/6902/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911/6902/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911 Cabriolet",
    "variant": "U-CAR new-car catalog",
    "price": 1050,
    "priceLabel": "1050-1095 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911 Cabriolet: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6903.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911%20cabriolet/6903/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911%20cabriolet/6903/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911 Targa",
    "variant": "U-CAR new-car catalog",
    "price": 1095,
    "priceLabel": "1095 TWD 10k",
    "body": "sports",
    "power": "hybrid",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911 Targa: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6904.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911%20targa/6904/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911%20targa/6904/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911 GT3",
    "variant": "U-CAR new-car catalog",
    "price": 1103,
    "priceLabel": "1103 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911 GT3: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6905.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911%20gt3/6905/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911%20gt3/6905/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911 Turbo",
    "variant": "U-CAR new-car catalog",
    "price": 1128,
    "priceLabel": "1128-1311 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911 Turbo: synced from Taiwan new-car catalog.",
    "note": "豪華級距性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6420.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911%20turbo/6420/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911%20turbo/6420/overall",
    "source": "ucar"
  },
  {
    "brand": "Porsche",
    "name": "Porsche 911 Turbo Cabriolet",
    "variant": "U-CAR new-car catalog",
    "price": 1384,
    "priceLabel": "1384 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "911 Turbo Cabriolet: synced from Taiwan new-car catalog.",
    "note": "豪華級距敞篷車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6419.jpg",
    "url": "https://newcar.u-car.com.tw/porsche/911%20turbo%20cabriolet/6419/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/porsche/911%20turbo%20cabriolet/6419/overall",
    "source": "ucar"
  },
  {
    "brand": "Rolls-Royce",
    "name": "Rolls-Royce Ghost Series II",
    "variant": "U-CAR new-car catalog",
    "price": 2472.7,
    "priceLabel": "2472.7-2836.8 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Ghost Series II: synced from Taiwan new-car catalog.",
    "note": "豪華級距超豪華車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6911.jpg",
    "url": "https://newcar.u-car.com.tw/rolls-royce/ghost%20series%20ii/6911/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/rolls-royce/ghost%20series%20ii/6911/overall",
    "source": "ucar"
  },
  {
    "brand": "Rolls-Royce",
    "name": "Rolls-Royce Spectre",
    "variant": "U-CAR new-car catalog",
    "price": 2492.6,
    "priceLabel": "2492.6 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Spectre: synced from Taiwan new-car catalog.",
    "note": "豪華級距轎跑車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6530.jpg",
    "url": "https://newcar.u-car.com.tw/rolls-royce/spectre/6530/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/rolls-royce/spectre/6530/overall",
    "source": "ucar"
  },
  {
    "brand": "Rolls-Royce",
    "name": "Rolls-Royce Cullinan Series II",
    "variant": "U-CAR new-car catalog",
    "price": 2700,
    "priceLabel": "2700-3033.4 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Cullinan Series II: synced from Taiwan new-car catalog.",
    "note": "豪華級距超豪華車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6832.jpg",
    "url": "https://newcar.u-car.com.tw/rolls-royce/cullinan%20series%20ii/6832/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/rolls-royce/cullinan%20series%20ii/6832/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Fabia",
    "variant": "U-CAR new-car catalog",
    "price": 87.8,
    "priceLabel": "87.8-101.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Fabia: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7101.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/fabia/7101/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/fabia/7101/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Scala",
    "variant": "U-CAR new-car catalog",
    "price": 100.8,
    "priceLabel": "100.8-106.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Scala: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7107.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/scala/7107/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/scala/7107/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Kamiq",
    "variant": "U-CAR new-car catalog",
    "price": 102.8,
    "priceLabel": "102.8-108.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Kamiq: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7102.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/kamiq/7102/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/kamiq/7102/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Octavia",
    "variant": "U-CAR new-car catalog",
    "price": 109.8,
    "priceLabel": "109.8-151.8 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Octavia: synced from Taiwan new-car catalog.",
    "note": "一般級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7105.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/octavia/7105/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/octavia/7105/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Karoq",
    "variant": "U-CAR new-car catalog",
    "price": 119.8,
    "priceLabel": "119.8-136.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Karoq: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7103.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/karoq/7103/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/karoq/7103/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Octavia Combi",
    "variant": "U-CAR new-car catalog",
    "price": 131.8,
    "priceLabel": "131.8-161.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Octavia Combi: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7106.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/octavia%20combi/7106/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/octavia%20combi/7106/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Superb",
    "variant": "U-CAR new-car catalog",
    "price": 131.8,
    "priceLabel": "131.8-183.8 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Superb: synced from Taiwan new-car catalog.",
    "note": "一般級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7108.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/superb/7108/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/superb/7108/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Superb Combi",
    "variant": "U-CAR new-car catalog",
    "price": 141.8,
    "priceLabel": "141.8-186.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Superb Combi: synced from Taiwan new-car catalog.",
    "note": "一般級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7109.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/superb%20combi/7109/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/superb%20combi/7109/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Kodiaq",
    "variant": "U-CAR new-car catalog",
    "price": 154.8,
    "priceLabel": "154.8-190.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Kodiaq: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7104.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/kodiaq/7104/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/kodiaq/7104/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Enyaq",
    "variant": "U-CAR new-car catalog",
    "price": 163.8,
    "priceLabel": "163.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Enyaq: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6694.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/enyaq/6694/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/enyaq/6694/overall",
    "source": "ucar"
  },
  {
    "brand": "Škoda",
    "name": "Škoda Enyaq Coupé",
    "variant": "U-CAR new-car catalog",
    "price": 171.8,
    "priceLabel": "171.8-198.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Enyaq Coupé: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6695.jpg",
    "url": "https://newcar.u-car.com.tw/%C5%A1koda/enyaq%20coup%C3%A9/6695/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/%C5%A1koda/enyaq%20coup%C3%A9/6695/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru Crosstrek",
    "variant": "U-CAR new-car catalog",
    "price": 114.8,
    "priceLabel": "114.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Crosstrek: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6366.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/crosstrek/6366/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/crosstrek/6366/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru Forester",
    "variant": "U-CAR new-car catalog",
    "price": 129.8,
    "priceLabel": "129.8-149.8 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Forester: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6970.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/forester/6970/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/forester/6970/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru Outback",
    "variant": "U-CAR new-car catalog",
    "price": 162.8,
    "priceLabel": "162.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Outback: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6204.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/outback/6204/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/outback/6204/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru WRX",
    "variant": "U-CAR new-car catalog",
    "price": 166.8,
    "priceLabel": "166.8-183.8 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "WRX: synced from Taiwan new-car catalog.",
    "note": "一般級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6368.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/wrx/6368/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/wrx/6368/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru Solterra",
    "variant": "U-CAR new-car catalog",
    "price": 169.8,
    "priceLabel": "169.8 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Solterra: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7176.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/solterra/7176/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/solterra/7176/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru WRX Wagon",
    "variant": "U-CAR new-car catalog",
    "price": 169.8,
    "priceLabel": "169.8-189.8 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "WRX Wagon: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6369.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/wrx%20wagon/6369/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/wrx%20wagon/6369/overall",
    "source": "ucar"
  },
  {
    "brand": "Subaru",
    "name": "Subaru BRZ",
    "variant": "U-CAR new-car catalog",
    "price": 171.8,
    "priceLabel": "171.8-172.8 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "BRZ: synced from Taiwan new-car catalog.",
    "note": "性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6260.jpg",
    "url": "https://newcar.u-car.com.tw/subaru/brz/6260/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/subaru/brz/6260/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki Carry",
    "variant": "U-CAR new-car catalog",
    "price": 49.9,
    "priceLabel": "49.9 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Carry: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6191.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/carry/6191/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/carry/6191/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki Swift",
    "variant": "U-CAR new-car catalog",
    "price": 73,
    "priceLabel": "73 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Swift: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6683.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/swift/6683/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/swift/6683/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki Jimny",
    "variant": "U-CAR new-car catalog",
    "price": 84.9,
    "priceLabel": "84.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Jimny: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7234.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/jimny/7234/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/jimny/7234/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki SX4 S-Cross",
    "variant": "U-CAR new-car catalog",
    "price": 98,
    "priceLabel": "98 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "SX4 S-Cross: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7260.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/sx4%20s-cross/7260/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/sx4%20s-cross/7260/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki Vitara",
    "variant": "U-CAR new-car catalog",
    "price": 104,
    "priceLabel": "104 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vitara: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7261.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/vitara/7261/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/vitara/7261/overall",
    "source": "ucar"
  },
  {
    "brand": "Suzuki",
    "name": "Suzuki e Vitara",
    "variant": "U-CAR new-car catalog",
    "price": 115,
    "priceLabel": "115-123 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "e Vitara: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7081.jpg",
    "url": "https://newcar.u-car.com.tw/suzuki/e%20vitara/7081/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/suzuki/e%20vitara/7081/overall",
    "source": "ucar"
  },
  {
    "brand": "Tesla",
    "name": "Tesla Model 3",
    "variant": "U-CAR new-car catalog",
    "price": 174.99,
    "priceLabel": "174.99-233.79 TWD 10k",
    "body": "sedan",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Model 3: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7036.jpg",
    "url": "https://newcar.u-car.com.tw/tesla/model%203/7036/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/tesla/model%203/7036/overall",
    "source": "ucar"
  },
  {
    "brand": "Tesla",
    "name": "Tesla Model Y",
    "variant": "U-CAR new-car catalog",
    "price": 189.99,
    "priceLabel": "189.99-249.99 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Model Y: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7089.jpg",
    "url": "https://newcar.u-car.com.tw/tesla/model%20y/7089/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/tesla/model%20y/7089/overall",
    "source": "ucar"
  },
  {
    "brand": "Tesla",
    "name": "Tesla Model S",
    "variant": "U-CAR new-car catalog",
    "price": 324.99,
    "priceLabel": "324.99-339.99 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Model S: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6947.jpg",
    "url": "https://newcar.u-car.com.tw/tesla/model%20s/6947/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/tesla/model%20s/6947/overall",
    "source": "ucar"
  },
  {
    "brand": "Tesla",
    "name": "Tesla Model X",
    "variant": "U-CAR new-car catalog",
    "price": 349.99,
    "priceLabel": "349.99-370.99 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Model X: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6948.jpg",
    "url": "https://newcar.u-car.com.tw/tesla/model%20x/6948/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/tesla/model%20x/6948/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Town Ace",
    "variant": "U-CAR new-car catalog",
    "price": 51.5,
    "priceLabel": "51.5-57.5 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Town Ace: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6271.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/town%20ace/6271/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/town%20ace/6271/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Town Ace Van",
    "variant": "U-CAR new-car catalog",
    "price": 53.9,
    "priceLabel": "53.9-63.5 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Town Ace Van: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6927.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/town%20ace%20van/6927/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/town%20ace%20van/6927/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Vios",
    "variant": "U-CAR new-car catalog",
    "price": 60.9,
    "priceLabel": "60.9-67.5 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Vios: synced from Taiwan new-car catalog.",
    "note": "一般級距小型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6696.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/vios/6696/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/vios/6696/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Yaris Cross",
    "variant": "U-CAR new-car catalog",
    "price": 69.5,
    "priceLabel": "69.5-79.5 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Yaris Cross: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6741.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/yaris%20cross/6741/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/yaris%20cross/6741/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Corolla Altis",
    "variant": "U-CAR new-car catalog",
    "price": 73.5,
    "priceLabel": "73.5-91.9 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Corolla Altis: synced from Taiwan new-car catalog.",
    "note": "一般級距中型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7182.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/corolla%20altis/7182/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/corolla%20altis/7182/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Corolla Cross",
    "variant": "U-CAR new-car catalog",
    "price": 80.9,
    "priceLabel": "80.9-98.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Corolla Cross: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7183.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/corolla%20cross/7183/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/corolla%20cross/7183/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Corolla Sport",
    "variant": "U-CAR new-car catalog",
    "price": 96.9,
    "priceLabel": "96.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Corolla Sport: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7262.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/corolla%20sport/7262/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/corolla%20sport/7262/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota RAV4",
    "variant": "U-CAR new-car catalog",
    "price": 104,
    "priceLabel": "104-149 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "RAV4: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7143.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/rav4/7143/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/rav4/7143/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Camry",
    "variant": "U-CAR new-car catalog",
    "price": 110.9,
    "priceLabel": "110.9-125 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Camry: synced from Taiwan new-car catalog.",
    "note": "一般級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7268.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/camry/7268/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/camry/7268/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Hiace",
    "variant": "U-CAR new-car catalog",
    "price": 126.6,
    "priceLabel": "126.6-128.2 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Hiace: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7196.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/hiace/7196/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/hiace/7196/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Urban Cruiser",
    "variant": "U-CAR new-car catalog",
    "price": 127,
    "priceLabel": "127 TWD 10k",
    "body": "sedan",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Urban Cruiser: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7083.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/urban%20cruiser/7083/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/urban%20cruiser/7083/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota bZ4X",
    "variant": "U-CAR new-car catalog",
    "price": 128,
    "priceLabel": "128 TWD 10k",
    "body": "sports",
    "power": "electric",
    "seats": 2,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "bZ4X: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7034.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/bz4x/7034/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/bz4x/7034/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Prius PHEV",
    "variant": "U-CAR new-car catalog",
    "price": 129.9,
    "priceLabel": "129.9-137.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Prius PHEV: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6986.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/prius%20phev/6986/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/prius%20phev/6986/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Crown",
    "variant": "U-CAR new-car catalog",
    "price": 157,
    "priceLabel": "157-210 TWD 10k",
    "body": "sedan",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Crown: synced from Taiwan new-car catalog.",
    "note": "一般級距中大型轎車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6640.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/crown/6640/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/crown/6640/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Hilux",
    "variant": "U-CAR new-car catalog",
    "price": 161.9,
    "priceLabel": "161.9 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Hilux: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7228.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/hilux/7228/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/hilux/7228/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Granvia",
    "variant": "U-CAR new-car catalog",
    "price": 175.2,
    "priceLabel": "175.2-199.3 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Granvia: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7197.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/granvia/7197/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/granvia/7197/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota GR 86",
    "variant": "U-CAR new-car catalog",
    "price": 177,
    "priceLabel": "177-178 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GR 86: synced from Taiwan new-car catalog.",
    "note": "跑車/跑房車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7271.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/gr%2086/7271/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/gr%2086/7271/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota GR Yaris",
    "variant": "U-CAR new-car catalog",
    "price": 195,
    "priceLabel": "195-199 TWD 10k",
    "body": "sedan",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "comfort",
      "driving",
      "design"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GR Yaris: synced from Taiwan new-car catalog.",
    "note": "性能車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7223.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/gr%20yaris/7223/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/gr%20yaris/7223/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Sienna",
    "variant": "U-CAR new-car catalog",
    "price": 239,
    "priceLabel": "239-296 TWD 10k",
    "body": "mpv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Sienna: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7241.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/sienna/7241/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/sienna/7241/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota GR Supra",
    "variant": "U-CAR new-car catalog",
    "price": 266,
    "priceLabel": "266-280 TWD 10k",
    "body": "sports",
    "power": "gas",
    "seats": 4,
    "priorities": [
      "driving",
      "design",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "GR Supra: synced from Taiwan new-car catalog.",
    "note": "跑車/跑房車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6932.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/gr%20supra/6932/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/gr%20supra/6932/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Land Cruiser",
    "variant": "U-CAR new-car catalog",
    "price": 288,
    "priceLabel": "288-290 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Land Cruiser: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7167.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/land%20cruiser/7167/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/land%20cruiser/7167/overall",
    "source": "ucar"
  },
  {
    "brand": "Toyota",
    "name": "Toyota Alphard",
    "variant": "U-CAR new-car catalog",
    "price": 316,
    "priceLabel": "316-330 TWD 10k",
    "body": "mpv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Alphard: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6844.jpg",
    "url": "https://newcar.u-car.com.tw/toyota/alphard/6844/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/toyota/alphard/6844/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Polo",
    "variant": "U-CAR new-car catalog",
    "price": 88.8,
    "priceLabel": "88.8-124.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Polo: synced from Taiwan new-car catalog.",
    "note": "一般級距小型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7062.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/polo/7062/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/polo/7062/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen T-Cross",
    "variant": "U-CAR new-car catalog",
    "price": 89.8,
    "priceLabel": "89.8-106.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "T-Cross: synced from Taiwan new-car catalog.",
    "note": "一般級距小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6956.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/t-cross/6956/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/t-cross/6956/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Golf",
    "variant": "U-CAR new-car catalog",
    "price": 118.8,
    "priceLabel": "118.8-159.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Golf: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7209.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/golf/7209/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/golf/7209/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen T-Roc",
    "variant": "U-CAR new-car catalog",
    "price": 129.8,
    "priceLabel": "129.8-131.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "T-Roc: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7266.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/t-roc/7266/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/t-roc/7266/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Golf Variant",
    "variant": "U-CAR new-car catalog",
    "price": 138.8,
    "priceLabel": "138.8-148.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Golf Variant: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6919.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/golf%20variant/6919/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/golf%20variant/6919/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Tiguan",
    "variant": "U-CAR new-car catalog",
    "price": 139.8,
    "priceLabel": "139.8-198.8 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Tiguan: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7087.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/tiguan/7087/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/tiguan/7087/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Touran",
    "variant": "U-CAR new-car catalog",
    "price": 142.8,
    "priceLabel": "142.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Touran: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6809.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/touran/6809/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/touran/6809/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Passat Variant",
    "variant": "U-CAR new-car catalog",
    "price": 157.8,
    "priceLabel": "157.8-197.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Passat Variant: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7086.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/passat%20variant/7086/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/passat%20variant/7086/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen ID.4",
    "variant": "U-CAR new-car catalog",
    "price": 169.8,
    "priceLabel": "169.8-199.8 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ID.4: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6725.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/id.4/6725/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/id.4/6725/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen ID.5",
    "variant": "U-CAR new-car catalog",
    "price": 186.8,
    "priceLabel": "186.8-209.8 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ID.5: synced from Taiwan new-car catalog.",
    "note": "一般級距大中型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6726.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/id.5/6726/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/id.5/6726/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Golf R",
    "variant": "U-CAR new-car catalog",
    "price": 207.8,
    "priceLabel": "207.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Golf R: synced from Taiwan new-car catalog.",
    "note": "一般級距中型掀背; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7210.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/golf%20r/7210/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/golf%20r/7210/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen",
    "name": "Volkswagen Golf R Variant",
    "variant": "U-CAR new-car catalog",
    "price": 220.8,
    "priceLabel": "220.8 TWD 10k",
    "body": "hatch",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "city",
      "design",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Golf R Variant: synced from Taiwan new-car catalog.",
    "note": "其他級距進口旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6921.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen/golf%20r%20variant/6921/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen/golf%20r%20variant/6921/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Caddy Cargo",
    "variant": "U-CAR new-car catalog",
    "price": 89.8,
    "priceLabel": "89.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Caddy Cargo: synced from Taiwan new-car catalog.",
    "note": "商用車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7029.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caddy%20cargo/7029/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caddy%20cargo/7029/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Caddy Maxi",
    "variant": "U-CAR new-car catalog",
    "price": 124.9,
    "priceLabel": "124.9-150.8 TWD 10k",
    "body": "mpv",
    "power": "diesel",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Caddy Maxi: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7169.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caddy%20maxi/7169/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caddy%20maxi/7169/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Caravelle",
    "variant": "U-CAR new-car catalog",
    "price": 173.8,
    "priceLabel": "173.8-211.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Caravelle: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7138.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caravelle/7138/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/caravelle/7138/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Amarok",
    "variant": "U-CAR new-car catalog",
    "price": 179.9,
    "priceLabel": "179.9-189.9 TWD 10k",
    "body": "suv",
    "power": "gas",
    "seats": 5,
    "priorities": [
      "space",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Amarok: synced from Taiwan new-car catalog.",
    "note": "Pickup; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7053.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/amarok/7053/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/amarok/7053/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Multivan",
    "variant": "U-CAR new-car catalog",
    "price": 210,
    "priceLabel": "210-257 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Multivan: synced from Taiwan new-car catalog.",
    "note": "豪華級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7069.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/multivan/7069/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/multivan/7069/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles ID.Buzz LWB",
    "variant": "U-CAR new-car catalog",
    "price": 245,
    "priceLabel": "245-269.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "ID.Buzz LWB: synced from Taiwan new-car catalog.",
    "note": "一般級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7054.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/id.buzz%20lwb/7054/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/id.buzz%20lwb/7054/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles California",
    "variant": "U-CAR new-car catalog",
    "price": 255.8,
    "priceLabel": "255.8-349.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "California: synced from Taiwan new-car catalog.",
    "note": "豪華級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6571.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/california/6571/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/california/6571/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Crafter",
    "variant": "U-CAR new-car catalog",
    "price": 289.8,
    "priceLabel": "289.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 2,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Crafter: synced from Taiwan new-car catalog.",
    "note": "Taiwan new-car listing; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7052.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/crafter/7052/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/crafter/7052/overall",
    "source": "ucar"
  },
  {
    "brand": "Volkswagen Commercial Vehicles",
    "name": "Volkswagen Commercial Vehicles Grand California",
    "variant": "U-CAR new-car catalog",
    "price": 408.8,
    "priceLabel": "408.8 TWD 10k",
    "body": "mpv",
    "power": "gas",
    "seats": 7,
    "priorities": [
      "space",
      "comfort",
      "value"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "Grand California: synced from Taiwan new-car catalog.",
    "note": "豪華級距MPV廂式休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6686.jpg",
    "url": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/grand%20california/6686/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volkswagen%20commercial%20vehicles/grand%20california/6686/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo EX30",
    "variant": "U-CAR new-car catalog",
    "price": 139.9,
    "priceLabel": "139.9-174.99 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EX30: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6973.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/ex30/6973/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/ex30/6973/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo EX40",
    "variant": "U-CAR new-car catalog",
    "price": 169,
    "priceLabel": "169-189 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EX40: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7129.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/ex40/7129/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/ex40/7129/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo XC40",
    "variant": "U-CAR new-car catalog",
    "price": 169,
    "priceLabel": "169-199 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "XC40: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7131.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/xc40/7131/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/xc40/7131/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo EC40",
    "variant": "U-CAR new-car catalog",
    "price": 179,
    "priceLabel": "179-199 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 5,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EC40: synced from Taiwan new-car catalog.",
    "note": "電動車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7130.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/ec40/7130/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/ec40/7130/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo V60",
    "variant": "U-CAR new-car catalog",
    "price": 195,
    "priceLabel": "195-277.6 TWD 10k",
    "body": "hatch",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "V60: synced from Taiwan new-car catalog.",
    "note": "豪華級距旅行車; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7098.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/v60/7098/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/v60/7098/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo XC60",
    "variant": "U-CAR new-car catalog",
    "price": 239,
    "priceLabel": "239-299 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 5,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "XC60: synced from Taiwan new-car catalog.",
    "note": "豪華中型小型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7177.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/xc60/7177/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/xc60/7177/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo XC90",
    "variant": "U-CAR new-car catalog",
    "price": 295.6,
    "priceLabel": "295.6-377.6 TWD 10k",
    "body": "suv",
    "power": "hybrid",
    "seats": 7,
    "priorities": [
      "economy",
      "comfort",
      "tech"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "XC90: synced from Taiwan new-car catalog.",
    "note": "豪華大型SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_6995.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/xc90/6995/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/xc90/6995/overall",
    "source": "ucar"
  },
  {
    "brand": "Volvo",
    "name": "Volvo EX90",
    "variant": "U-CAR new-car catalog",
    "price": 299,
    "priceLabel": "299-383 TWD 10k",
    "body": "suv",
    "power": "electric",
    "seats": 7,
    "priorities": [
      "tech",
      "economy",
      "comfort"
    ],
    "colors": [
      "white",
      "black",
      "gray",
      "blue",
      "red"
    ],
    "tagline": "EX90: synced from Taiwan new-car catalog.",
    "note": "豪華級距SUV運動休旅; monthly synced from U-CAR. Price uses the lowest catalog value shown on the source page.",
    "imageUrl": "https://image.u-car.com.tw/newcar_7219.jpg",
    "url": "https://newcar.u-car.com.tw/volvo/ex90/7219/overall",
    "sourceUrl": "https://newcar.u-car.com.tw/volvo/ex90/7219/overall",
    "source": "ucar"
  }
].map(C);

  window.JARVIS_BRANDS = {
  "Lexus": {
    "name": "Lexus",
    "monogram": "L",
    "origin": "1989 / JAPAN",
    "chapter": "把可靠與精密，做成安靜而克制的豪華。",
    "story": "Toyota 於 1989 年推出 Lexus，從北美豪華房車市場出發，逐步建立日式工藝、靜肅與服務體驗。",
    "position": "日系舒適豪華與油電效率派",
    "positioning": "在台灣擁有完整油電休旅與房車陣容，重視妥善、舒適與低調質感。",
    "keywords": [
      "日式豪華",
      "油電",
      "高妥善"
    ],
    "source": "https://www.lexus.com.tw/"
  },
  "Nissan": {
    "name": "Nissan",
    "monogram": "N",
    "origin": "1933 / JAPAN",
    "chapter": "從大眾房車到電動技術，實驗精神一直都在。",
    "story": "Nissan 於 1930 年代成形，從 Datsun 走向全球，並以 GT-R、Z 與 Leaf 等車系跨越性能和電動化。",
    "position": "日系科技與舒適家用派",
    "positioning": "在台灣以房車、跨界休旅與 e-Power 電驅技術提供務實而有科技感的選擇。",
    "keywords": [
      "e-Power",
      "舒適",
      "日系科技"
    ],
    "source": "https://www.nissan.com.tw/"
  },
  "Mitsubishi": {
    "name": "Mitsubishi",
    "monogram": "M",
    "origin": "1917 / JAPAN",
    "chapter": "越野、商用與耐用，是三菱最深的底色。",
    "story": "Mitsubishi 的汽車歷史可追溯至 1917 年 Model A，後以 Pajero、Lancer Evolution 與商用車累積工程聲譽。",
    "position": "耐用機能與務實商用派",
    "positioning": "在台灣深耕國產與商用市場，產品強調空間、耐用與使用成本。",
    "keywords": [
      "耐用",
      "商用",
      "機能"
    ],
    "source": "https://www.mitsubishi-motors.com.tw/"
  },
  "Subaru": {
    "name": "Subaru",
    "monogram": "S",
    "origin": "1953 / JAPAN",
    "chapter": "水平對臥與四輪驅動，把工程堅持變成性格。",
    "story": "Subaru 源自富士重工，以水平對臥引擎、對稱式四輪驅動與拉力賽經驗建立獨特路線。",
    "position": "安全與全時四驅的工程派",
    "positioning": "適合重視雨天穩定、戶外能力與駕駛回饋的使用者。",
    "keywords": [
      "四輪驅動",
      "安全",
      "戶外"
    ],
    "source": "https://www.subaru.asia/tw/zh/home/"
  },
  "Suzuki": {
    "name": "Suzuki",
    "monogram": "S",
    "origin": "1909 / JAPAN",
    "chapter": "把有限尺碼用到極致，是小車專家的本事。",
    "story": "Suzuki 從織機起家，1950 年代進入汽車市場，長期專注小型車、輕型越野與實用商用車。",
    "position": "輕巧實用的小車專家",
    "positioning": "在台灣以好停、低負擔與簡單耐用吸引都會與戶外用家。",
    "keywords": [
      "小車",
      "輕量",
      "實用"
    ],
    "source": "https://www.suzukimotor.com.tw/"
  },
  "Kia": {
    "name": "Kia",
    "monogram": "K",
    "origin": "1944 / KOREA",
    "chapter": "從高性價比走向設計與電動化，Kia 已經換了一套語言。",
    "story": "Kia 從零件與自行車製造起步，後加入 Hyundai Motor Group，近年以設計轉型與 EV 專用平台走向全球。",
    "position": "設計感鮮明的高配備挑戰者",
    "positioning": "台灣產品橫跨小車、家庭休旅、MPV 與純電，配備和保固是重要賣點。",
    "keywords": [
      "設計",
      "高配備",
      "EV"
    ],
    "source": "https://www.kia.com/tw/"
  },
  "Ford": {
    "name": "Ford",
    "monogram": "F",
    "origin": "1903 / U.S.A.",
    "chapter": "讓汽車走入大眾生活，也始終保留美式冒險性格。",
    "story": "Ford 以流水線改變汽車量產，並用 Mustang、F-Series 與全球車系延續性能和實用兩條主線。",
    "position": "操控、休旅與皮卡的美式實用派",
    "positioning": "在台灣有在地生產基礎，強項是底盤、主動安全、旅行車與戶外車型。",
    "keywords": [
      "操控",
      "美式",
      "戶外"
    ],
    "source": "https://www.ford.com.tw/"
  },
  "Volkswagen": {
    "name": "Volkswagen",
    "monogram": "V",
    "origin": "1937 / GERMANY",
    "chapter": "大眾之名，核心是把德國工程做進日常。",
    "story": "Volkswagen 從 Beetle 成為全球品牌，Golf 則建立現代掀背車基準，產品長期強調完整性。",
    "position": "歐系均衡與駕駛質感派",
    "positioning": "台灣市場以掀背與休旅為主，適合重視高速穩定、座艙與整體完成度的人。",
    "keywords": [
      "德國工程",
      "均衡",
      "掀背"
    ],
    "source": "https://www.volkswagen.com.tw/"
  },
  "Volkswagen Commercial Vehicles": {
    "name": "Volkswagen Commercial Vehicles",
    "monogram": "VW",
    "origin": "1950 / GERMANY",
    "chapter": "從 Transporter 開始，把工作與旅行裝進同一個方盒子。",
    "story": "Volkswagen 商旅以經典 Transporter 車系為核心，延伸至廂車、露營車與皮卡。",
    "position": "高質感歐系商旅與露營派",
    "positioning": "提供家庭多人、商務接待、貨運與 Vanlife 的完整解法。",
    "keywords": [
      "商旅",
      "露營",
      "多人座"
    ],
    "source": "https://www.volkswagen-commercial.com.tw/"
  },
  "Škoda": {
    "name": "Škoda",
    "monogram": "Š",
    "origin": "1895 / CZECHIA",
    "chapter": "聰明不是堆配備，而是每個細節都知道你會怎麼用。",
    "story": "Škoda 從自行車與機械工業起步，是歷史悠久的歐洲車廠，現為 Volkswagen Group 成員。",
    "position": "空間大、配備實在的歐系務實派",
    "positioning": "在台灣以旅行車、家庭休旅和 Simply Clever 機能建立口碑。",
    "keywords": [
      "大空間",
      "歐系",
      "聰明機能"
    ],
    "source": "https://www.skoda.com.tw/"
  },
  "Audi": {
    "name": "Audi",
    "monogram": "A",
    "origin": "1909 / GERMANY",
    "chapter": "技術、四輪驅動與極簡設計，組成 Audi 的精準感。",
    "story": "Audi 的四環代表四家公司結盟，並以 quattro、鋁合金與燈光科技累積技術形象。",
    "position": "科技感強烈的德系豪華",
    "positioning": "設計較克制、座艙數位化，並提供完整純電與高性能 RS 陣容。",
    "keywords": [
      "quattro",
      "科技",
      "極簡"
    ],
    "source": "https://www.audi.com.tw/"
  },
  "BMW": {
    "name": "BMW",
    "monogram": "B",
    "origin": "1916 / GERMANY",
    "chapter": "即使變成電動車，駕駛仍然要坐在故事中央。",
    "story": "BMW 從航空引擎與機車走向汽車，以後輪驅動、直六引擎與駕駛導向座艙建立品牌。",
    "position": "駕駛導向的德系豪華",
    "positioning": "從入門掀背到 M 性能與 i 純電產品都強調動態反應與科技。",
    "keywords": [
      "駕駛樂趣",
      "豪華",
      "性能"
    ],
    "source": "https://www.bmw.com.tw/"
  },
  "Mercedes-Benz": {
    "name": "Mercedes-Benz",
    "monogram": "M",
    "origin": "1886 / GERMANY",
    "chapter": "汽車的發明者，把安全與豪華持續變成新標準。",
    "story": "Karl Benz 的 Patent-Motorwagen 被視為現代汽車起點，品牌之後在安全、舒適與性能持續創新。",
    "position": "舒適、科技與身份感的豪華標竿",
    "positioning": "台灣產品線最完整，從都會車、七人座、純電到 AMG 與 Maybach 皆有布局。",
    "keywords": [
      "舒適",
      "科技",
      "豪華"
    ],
    "source": "https://www.mercedes-benz.com.tw/"
  },
  "Porsche": {
    "name": "Porsche",
    "monogram": "P",
    "origin": "1948 / GERMANY",
    "chapter": "跑車不是一種車身，而是一套所有車都遵守的反應。",
    "story": "Porsche 以 356 起步，911 成為核心圖騰，之後把跑車工程延伸到休旅、房車與電動車。",
    "position": "以跑車工程為核心的豪華性能品牌",
    "positioning": "即使是 SUV 也重視方向、煞車與底盤溝通，適合把駕駛感受放第一的人。",
    "keywords": [
      "跑車",
      "底盤",
      "性能"
    ],
    "source": "https://www.porsche.com/taiwan/zh/"
  },
  "Volvo": {
    "name": "Volvo",
    "monogram": "V",
    "origin": "1927 / SWEDEN",
    "chapter": "安全不是配備表，而是品牌看待人的方式。",
    "story": "Volvo 在瑞典哥德堡創立，三點式安全帶等發明奠定安全聲譽，近年轉向電動化與北歐永續。",
    "position": "安全與北歐舒適豪華派",
    "positioning": "設計簡潔、座椅舒適，產品特別適合家庭與長途使用。",
    "keywords": [
      "安全",
      "北歐",
      "舒適"
    ],
    "source": "https://www.volvocars.com/tw/"
  },
  "Peugeot": {
    "name": "Peugeot",
    "monogram": "P",
    "origin": "1810 / FRANCE",
    "chapter": "法式設計不只好看，也喜歡重新安排駕駛的感官。",
    "story": "Peugeot 的工業歷史早於汽車，19 世紀末開始造車，長期在小車、賽事與柴油技術留下足跡。",
    "position": "設計前衛的法系駕駛派",
    "positioning": "小方向盤座艙、鮮明造型與舒適底盤是台灣車系辨識度來源。",
    "keywords": [
      "法式設計",
      "座艙",
      "底盤"
    ],
    "source": "https://www.peugeot.com.tw/"
  },
  "Citroën": {
    "name": "Citroën",
    "monogram": "C",
    "origin": "1919 / FRANCE",
    "chapter": "舒適可以很大膽，實用也不必無聊。",
    "story": "Citroën 以量產、前輪驅動、液壓懸吊與特殊造型聞名，始終挑戰汽車設計慣例。",
    "position": "舒適與空間創意的法系個性派",
    "positioning": "台灣主力是跨界與廂型車，強調乘坐柔和、造型和機能。",
    "keywords": [
      "舒適",
      "創意",
      "機能"
    ],
    "source": "https://www.citroen.com.tw/"
  },
  "Opel": {
    "name": "Opel",
    "monogram": "O",
    "origin": "1862 / GERMANY",
    "chapter": "德國工程走務實路線，不必把每件事都說得很大聲。",
    "story": "Opel 從縫紉機、自行車轉向汽車，長期以大眾化德國車服務歐洲市場。",
    "position": "價格親近的德系設計與操控",
    "positioning": "在台灣以掀背與小型休旅提供不同於主流日系的選擇。",
    "keywords": [
      "德系",
      "務實",
      "設計"
    ],
    "source": "https://www.opel.tw/"
  },
  "MG": {
    "name": "MG",
    "monogram": "MG",
    "origin": "1924 / U.K.",
    "chapter": "從英倫跑車徽章，走向人人可及的科技配備。",
    "story": "MG 源自英國 Morris Garages 的跑車傳統，現隸屬上汽集團並成為全球化品牌。",
    "position": "高配備與價格競爭力派",
    "positioning": "台灣以國產休旅與純電車切入，核心是以價格提供越級配備。",
    "keywords": [
      "CP值",
      "配備",
      "電動"
    ],
    "source": "https://www.mgmotor.com.tw/"
  },
  "CMC": {
    "name": "CMC",
    "monogram": "C",
    "origin": "1969 / TAIWAN",
    "chapter": "真正懂台灣巷弄與頭家的車，往往不是最華麗的那一台。",
    "story": "中華汽車長期在台灣生產商用與多功能車，建立深入地方使用情境的產品經驗。",
    "position": "台灣輕型商用與多功能車專家",
    "positioning": "強項是低持有成本、載貨機能與遍布全台的服務體系。",
    "keywords": [
      "台灣製造",
      "商用",
      "低成本"
    ],
    "source": "https://www.china-motor.com.tw/"
  },
  "Luxgen": {
    "name": "Luxgen",
    "monogram": "L",
    "origin": "2009 / TAIWAN",
    "chapter": "從自主品牌到電動合作，台灣造車仍在找自己的新路。",
    "story": "Luxgen 由裕隆集團創立，曾以智慧車機建立特色，近年以 n7 純電休旅開啟新階段。",
    "position": "台灣純電大空間價值派",
    "positioning": "n7 以七人座、價格與在地服務成為台灣電動家庭車選項。",
    "keywords": [
      "台灣品牌",
      "純電",
      "七人座"
    ],
    "source": "https://www.luxgen-motor.com.tw/"
  },
  "Alfa Romeo": {
    "name": "Alfa Romeo",
    "monogram": "A",
    "origin": "1910 / ITALY",
    "chapter": "漂亮不是裝飾，而是速度留下來的形狀。",
    "story": "Alfa Romeo 於米蘭創立，賽車、輕量底盤與熱情設計貫穿百年歷史。",
    "position": "義式設計與操控性能派",
    "positioning": "重返台灣後以 Giulia、Stelvio 與 Junior 提供有情感的豪華選擇。",
    "keywords": [
      "義式",
      "操控",
      "設計"
    ],
    "source": "https://www.alfaromeo.com.tw/"
  },
  "Jaguar": {
    "name": "Jaguar",
    "monogram": "J",
    "origin": "1922 / U.K.",
    "chapter": "優雅和速度，不必各自站在道路兩端。",
    "story": "Jaguar 從側車製造起步，後以 XK、E-Type 與賽車勝利塑造英倫性能形象。",
    "position": "英倫優雅的運動豪華",
    "positioning": "目前台灣公開車系以 F-Pace 跑旅為主，適合重視設計稀有度與動態的人。",
    "keywords": [
      "英倫",
      "優雅",
      "性能"
    ],
    "source": "https://www.jaguar.tw/"
  },
  "Land Rover": {
    "name": "Land Rover",
    "monogram": "LR",
    "origin": "1948 / U.K.",
    "chapter": "豪華之前，它先學會到任何地方。",
    "story": "Land Rover 從戰後實用四輪驅動車起步，逐步發展 Defender、Discovery 與 Range Rover 家族。",
    "position": "正統越野與英倫豪華休旅",
    "positioning": "台灣陣容從硬派 Defender 到旗艦 Range Rover，戶外能力與身份感兼具。",
    "keywords": [
      "越野",
      "英倫",
      "豪華休旅"
    ],
    "source": "https://www.landrover.tw/"
  },
  "Mini": {
    "name": "Mini",
    "monogram": "M",
    "origin": "1959 / U.K.",
    "chapter": "小，不代表只能做減法；也可以把個性濃縮。",
    "story": "經典 Mini 為回應能源危機而生，以橫置引擎創造大空間，後由 BMW 延續為現代精品小車。",
    "position": "精品都會與個性設計派",
    "positioning": "好停、好玩、客製化程度高，現已擴展至跨界與純電。",
    "keywords": [
      "都會",
      "個性",
      "精品"
    ],
    "source": "https://www.mini.com.tw/"
  },
  "Bentley": {
    "name": "Bentley",
    "monogram": "B",
    "origin": "1919 / U.K.",
    "chapter": "速度與手工豪華，可以坐在同一張真皮座椅上。",
    "story": "Bentley 由 W.O. Bentley 創立，早期賽事成功奠定高性能豪華旅行車傳統。",
    "position": "手工豪華的高性能 GT",
    "positioning": "適合追求長途速度、頂級材質與高度客製的買家。",
    "keywords": [
      "手工",
      "GT",
      "奢華"
    ],
    "source": "https://www.bentleymotors.com/"
  },
  "Rolls-Royce": {
    "name": "Rolls-Royce",
    "monogram": "RR",
    "origin": "1904 / U.K.",
    "chapter": "它不追逐豪華標準，它自己就是衡量單位。",
    "story": "Rolls-Royce 由 Charles Rolls 與 Henry Royce 合作創立，以極致安靜、工藝與客製聞名。",
    "position": "超豪華移動藝術品",
    "positioning": "產品重點不是規格競賽，而是無上限客製、乘坐與身份象徵。",
    "keywords": [
      "超豪華",
      "客製",
      "靜謐"
    ],
    "source": "https://www.rolls-roycemotorcars.com/"
  },
  "Aston Martin": {
    "name": "Aston Martin",
    "monogram": "A",
    "origin": "1913 / U.K.",
    "chapter": "英國跑車的戲劇感，從不需要太多台詞。",
    "story": "Aston Martin 由 Lionel Martin 與 Robert Bamford 創立，賽事與 GT 跑車構成品牌主線。",
    "position": "優雅稀有的英倫 GT",
    "positioning": "在性能之外更強調比例、聲浪、皮革工藝與收藏性。",
    "keywords": [
      "GT",
      "英倫",
      "稀有"
    ],
    "source": "https://www.astonmartin.com/"
  },
  "Lotus": {
    "name": "Lotus",
    "monogram": "L",
    "origin": "1948 / U.K.",
    "chapter": "加速的方法很多，減輕重量是最聰明的一種。",
    "story": "Colin Chapman 創立 Lotus，以輕量化與賽車工程聞名，近年延伸至高性能電動車。",
    "position": "輕量操控與電動性能派",
    "positioning": "Emira 保留純粹跑車，Eletre、Emeya 則把品牌帶入高性能 EV。",
    "keywords": [
      "輕量",
      "操控",
      "電動性能"
    ],
    "source": "https://www.lotuscars.com/"
  },
  "McLaren": {
    "name": "McLaren",
    "monogram": "M",
    "origin": "1963 / U.K.",
    "chapter": "每一公斤與每一毫秒，都值得重新工程化。",
    "story": "McLaren 源自 Bruce McLaren 的賽車隊，之後以 F1 公路跑車和碳纖維技術建立超跑地位。",
    "position": "極致輕量的工程超跑",
    "positioning": "產品聚焦駕駛回饋、碳纖維底盤與高性能，稀有且目的明確。",
    "keywords": [
      "碳纖維",
      "輕量",
      "超跑"
    ],
    "source": "https://cars.mclaren.com/"
  },
  "Ferrari": {
    "name": "Ferrari",
    "monogram": "F",
    "origin": "1947 / ITALY",
    "chapter": "賽車不是行銷背景，而是所有公路車的母語。",
    "story": "Enzo Ferrari 由賽車隊發展出公路跑車品牌，F1 與 V12 傳統成為核心文化。",
    "position": "賽道血統與收藏價值的超跑標竿",
    "positioning": "性能、聲浪、限量與品牌歷史共同構成極高的情感及收藏價值。",
    "keywords": [
      "F1",
      "超跑",
      "收藏"
    ],
    "source": "https://www.ferrari.com/"
  },
  "Lamborghini": {
    "name": "Lamborghini",
    "monogram": "L",
    "origin": "1963 / ITALY",
    "chapter": "如果超跑要像海報，它就應該讓每條線都不安分。",
    "story": "Ferruccio Lamborghini 創立品牌，以中置引擎 Miura、剪刀門 Countach 等作品改寫超跑外觀。",
    "position": "戲劇化設計的義式超跑",
    "positioning": "外型、聲浪與性能都追求高張力，Urus 則把風格延伸到休旅。",
    "keywords": [
      "戲劇感",
      "V12",
      "超跑"
    ],
    "source": "https://www.lamborghini.com/"
  },
  "Maserati": {
    "name": "Maserati",
    "monogram": "M",
    "origin": "1914 / ITALY",
    "chapter": "義大利 GT 的魅力，是快得很有餘裕。",
    "story": "Maserati 由兄弟家族創立於波隆那，賽事、三叉戟與豪華旅行車構成百年脈絡。",
    "position": "義式豪華 GT 與聲浪派",
    "positioning": "比主流豪華品牌更稀有，強調設計、旅行舒適與駕駛情緒。",
    "keywords": [
      "義式",
      "GT",
      "聲浪"
    ],
    "source": "https://www.maserati.com/tw/zh"
  },
  "Ineos": {
    "name": "Ineos",
    "monogram": "I",
    "origin": "2017 / U.K.",
    "chapter": "當經典越野車變得太精緻，就重新造一台工具。",
    "story": "Ineos Grenadier 由 Jim Ratcliffe 發起，目標是打造結構單純、耐用且真正能工作的現代越野車。",
    "position": "硬派工具型越野專家",
    "positioning": "梯形大樑、機械四驅與高改裝潛力，適合真正會離開柏油路的人。",
    "keywords": [
      "硬派越野",
      "工具車",
      "耐用"
    ],
    "source": "https://ineosgrenadier.com/"
  },
  "DFSK": {
    "name": "DFSK",
    "monogram": "D",
    "origin": "Taiwan new-car catalog",
    "chapter": "DFSK is currently listed in Taiwan's new-car market.",
    "story": "DFSK appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/dfsk"
  },
  "Foxtron": {
    "name": "Foxtron",
    "monogram": "F",
    "origin": "Taiwan new-car catalog",
    "chapter": "Foxtron is currently listed in Taiwan's new-car market.",
    "story": "Foxtron appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/foxtron"
  },
  "Honda": {
    "name": "Honda",
    "monogram": "H",
    "origin": "Taiwan new-car catalog",
    "chapter": "Honda is currently listed in Taiwan's new-car market.",
    "story": "Honda appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/honda"
  },
  "Hyundai": {
    "name": "Hyundai",
    "monogram": "H",
    "origin": "Taiwan new-car catalog",
    "chapter": "Hyundai is currently listed in Taiwan's new-car market.",
    "story": "Hyundai appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/hyundai"
  },
  "Ineos Grenadier": {
    "name": "Ineos Grenadier",
    "monogram": "IG",
    "origin": "Taiwan new-car catalog",
    "chapter": "Ineos Grenadier is currently listed in Taiwan's new-car market.",
    "story": "Ineos Grenadier appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/ineosgrenadier"
  },
  "Infiniti": {
    "name": "Infiniti",
    "monogram": "I",
    "origin": "Taiwan new-car catalog",
    "chapter": "Infiniti is currently listed in Taiwan's new-car market.",
    "story": "Infiniti appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/infiniti"
  },
  "Mahindra": {
    "name": "Mahindra",
    "monogram": "M",
    "origin": "Taiwan new-car catalog",
    "chapter": "Mahindra is currently listed in Taiwan's new-car market.",
    "story": "Mahindra appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/mahindra"
  },
  "Mazda": {
    "name": "Mazda",
    "monogram": "M",
    "origin": "Taiwan new-car catalog",
    "chapter": "Mazda is currently listed in Taiwan's new-car market.",
    "story": "Mazda appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/mazda"
  },
  "Morgan": {
    "name": "Morgan",
    "monogram": "M",
    "origin": "Taiwan new-car catalog",
    "chapter": "Morgan is currently listed in Taiwan's new-car market.",
    "story": "Morgan appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/morgan"
  },
  "Tesla": {
    "name": "Tesla",
    "monogram": "T",
    "origin": "Taiwan new-car catalog",
    "chapter": "Tesla is currently listed in Taiwan's new-car market.",
    "story": "Tesla appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/tesla"
  },
  "Toyota": {
    "name": "Toyota",
    "monogram": "T",
    "origin": "Taiwan new-car catalog",
    "chapter": "Toyota is currently listed in Taiwan's new-car market.",
    "story": "Toyota appears in the U-CAR new-car catalog tracked by Jarvis Drive. This placeholder profile is created automatically and can be enriched with brand history later.",
    "position": "Taiwan-market listed brand",
    "positioning": "Tracked by the monthly vehicle updater. Product positioning, availability, and equipment should still be checked with the Taiwan distributor.",
    "keywords": [
      "Taiwan market",
      "monthly update",
      "new cars"
    ],
    "source": "https://newcar.u-car.com.tw/list/toyota"
  }
};

  window.JARVIS_DATA_META = {
  "sourceName": "U-CAR new-car catalog",
  "sourceUrl": "https://newcar.u-car.com.tw/newcar",
  "updatedAt": "2026-08-22T07:31:15.644Z",
  "updateCadence": "monthly",
  "fetchedBrands": 47,
  "fetchedCars": 369,
  "publishedCars": 369,
  "pruneMissing": true,
  "failedBrands": []
};
})();
