# 全臺地形與 A7–A9 區域觀察圖

查核日期：2026-11-04。此日期不是土地開發或圖資測量日期。

## 範圍的意義

所有本站生活圈觀察框均為參考用途，不能用於土地鑑界、法定重劃範圍認定、
購屋契約或學區判斷。學校、園區及商場基地另外標示，並不冒充整個商圈。
未知範圍不以行政區、多邊形凸包或距離圓圈代替。

- A7：依桃園市 2021 年都市計畫書 PDF 第 7 頁手動轉繪，用郵政物流園區
  與文青國中小地標做座標對位。這是近似計畫圖形，非最新地籍向量；
  圖形誤差未經測量認證。虛線提醒使用者不要當作精密界址。
  https://urplanning.tycg.gov.tw/tycgfiles/Plans/Final/PF000002000901.pdf
- A8：市府介紹列出復興一路、文化二路、文化一路、文昌五街。
  這四條路在此次 OSM 路網並不形成封閉多邊形。因此本站以長庚、復興、
  文昌周邊實際閉合街廓建立「生活圈觀察範圍」，不是官方商圈精確四至。
  https://edb.tycg.gov.tw/News_Content.aspx?Create=1&n=3787&s=546251
- A9：以文化北路一段、仁愛路二段、文化一路一段、八德路圍成觀察範圍，
  這是本站的道路分區，不是整個林口新市鎮或法定重劃區。
  三井周邊依文化三路一段、文化二路一段、八德路、忠孝路圍合，
  再細分一館、二館的基地。商場名稱與位置參考官方網站。
  https://www.mitsui-shopping-park.com.tw/mop/linkou/tw/index.html

## 圖資與授權

- 全臺地形陰影：同一公開高程資料集的 Terrarium zoom 10 圖磚，2026-11-07 下載。
  使用 Web Mercator（EPSG:3857），臺灣緯度下每像元約 140 公尺。
  涵蓋臺灣本島、澎湖、金門、馬祖、綠島、蘭嶼與小琉球，不含東沙、南沙。
  色彩和光影由高程計算，不是等高線、空拍或精密測量；放大不增加資料精度。
  圖片隨網站發布，不需要使用者連線第三方圖磚；與行政區、生活圈及建案分層。
  https://registry.opendata.aws/terrain-tiles/
  https://github.com/tilezen/joerd/blob/master/docs/formats.md
  Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration.
  Global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.
  https://github.com/tilezen/joerd/blob/master/docs/attribution.md
- 道路、園區及商場圖形：© OpenStreetMap contributors，ODbL 1.0。
  下載來源：Geofabrik Taiwan extract，2026-11-04 下載。
  https://download.geofabrik.de/asia/taiwan.html
  https://www.openstreetmap.org/copyright
  本站發布的 station-atlas.geojson（OSM 衍生圖形部分）同以 ODbL 1.0 提供。
  每個引用的園區／基地保留 OSM way ID；道路也保留 way ID。
- 地形：Mapzen Terrain Tiles / AWS Open Data，Terrarium tile 11/1714/876。
  原始數值高程解碼後產生陰影與高度色彩；不是真實地表照片。
  原始像元約 70 公尺，放大後的細節不代表更高測量精度。
  https://registry.opendata.aws/terrain-tiles/
  https://github.com/tilezen/joerd/blob/master/docs/attribution.md
- 行政區與臺北市官方開發區仍使用既有政府開放圖資，與本觀察圖分層。

## 重建方式

網站與 GitHub Actions 只需已生成的靜態檔案，不會每次下載全臺 OSM。
製圖環境另外需要 osmium、shapely、numpy、Pillow。

全臺地形只需 numpy、Pillow。從 repo 根目錄執行：

```powershell
python scripts/a7-line-monitor/build_taiwan_terrain.py --cache tmp/taiwan-terrain-tiles --checked 2026-11-07
```

`taiwan-terrain.webp` 和 `taiwan-terrain.json` 同步發布，原始 PNG 快取不發布。

A7–A9 區域圖重建：

1. 下載 Geofabrik Taiwan PBF，執行 extract_station_roads.py 取得區域道路。
2. 下載指定 Terrarium 高程圖磚。
3. 執行 build_station_atlas.py ways.json terrain.png --checked YYYY-MM-DD。
4. 驗證圖形有效性、道路對位及父子層級，重新做桌面與手機互動測試。

地圖導覽不會改動房市報告資料；沒有經過核實的新建案座標不會出現虛構地圖點。
