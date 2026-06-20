const PILLAR_NAMES = ["年柱", "月柱", "日柱", "時柱"];
const ELEMENTS = ["木", "火", "土", "金", "水"];
const GAN_ELEMENT = {
  "甲": "木",
  "乙": "木",
  "丙": "火",
  "丁": "火",
  "戊": "土",
  "己": "土",
  "庚": "金",
  "辛": "金",
  "壬": "水",
  "癸": "水",
};
const ZHI_ELEMENT = {
  "子": "水",
  "丑": "土",
  "寅": "木",
  "卯": "木",
  "辰": "土",
  "巳": "火",
  "午": "火",
  "未": "土",
  "申": "金",
  "酉": "金",
  "戌": "土",
  "亥": "水",
};
const STEM_YINYANG = {
  "甲": "陽",
  "乙": "陰",
  "丙": "陽",
  "丁": "陰",
  "戊": "陽",
  "己": "陰",
  "庚": "陽",
  "辛": "陰",
  "壬": "陽",
  "癸": "陰",
};
const BRANCH_YINYANG = {
  "子": "陽",
  "丑": "陰",
  "寅": "陽",
  "卯": "陰",
  "辰": "陽",
  "巳": "陰",
  "午": "陽",
  "未": "陰",
  "申": "陽",
  "酉": "陰",
  "戌": "陽",
  "亥": "陰",
};
const ELEMENT_GENERATES = {
  "木": "火",
  "火": "土",
  "土": "金",
  "金": "水",
  "水": "木",
};
const ELEMENT_CONTROLS = {
  "木": "土",
  "土": "水",
  "水": "火",
  "火": "金",
  "金": "木",
};
const BRANCH_HIDDEN_STEMS = {
  "子": ["癸"],
  "丑": ["己", "癸", "辛"],
  "寅": ["甲", "丙", "戊"],
  "卯": ["乙"],
  "辰": ["戊", "乙", "癸"],
  "巳": ["丙", "戊", "庚"],
  "午": ["丁", "己"],
  "未": ["己", "丁", "乙"],
  "申": ["庚", "壬", "戊"],
  "酉": ["辛"],
  "戌": ["戊", "辛", "丁"],
  "亥": ["壬", "甲"],
};
const TEN_GOD_MEANINGS = {
  "日主": "日主就是命主本人，也是八字判讀的中心點；其他天干、藏干都要看它與日主的生剋關係。",
  "比肩": "同我之星，代表自我、同輩、競爭、獨立、主見與不想被管束。",
  "劫財": "同我異陰陽，代表朋友、人脈、分財、競爭、衝動與資源被分走。",
  "食神": "我生同陰陽，代表才華輸出、口福、享受、穩定創造與溫和表達。",
  "傷官": "我生異陰陽，代表表達、創意、技術突破、反骨與挑戰規則。",
  "偏財": "我剋同陰陽，代表偏門財、業務財、投資、流動資源與外部機會。",
  "正財": "我剋異陰陽，代表薪資、穩定收入、務實管理、可控資產與現實責任。",
  "七殺": "剋我同陰陽，代表壓力、競爭、風險、權力挑戰、危機感與行動魄力。",
  "正官": "剋我異陰陽，代表規範、職位、責任、名聲、制度與穩定權威。",
  "偏印": "生我同陰陽，代表靈感、特殊學習、偏門知識、保護與孤獨感。",
  "正印": "生我異陰陽，代表學歷、貴人、母性照顧、證照、保護與穩定支援。",
};
const NAYIN_ELEMENT_HINTS = {
  "木": "納音木偏看生長、教育、規劃、作品成形與人際擴張，重點在是否有足夠環境讓才華慢慢長出來。",
  "火": "納音火偏看名聲、曝光、熱情、表達與精神能量，重點在是否能把熱度轉成穩定影響力。",
  "土": "納音土偏看承載、資產、信用、家庭基礎與穩定度，重點在是否能累積可落地的資源。",
  "金": "納音金偏看規格、決斷、技術、財務紀律與價值提煉，重點在是否能把事情做得精準有制度。",
  "水": "納音水偏看流動、智慧、溝通、資訊、遠方與變通能力，重點在是否能順勢而動又不失方向。",
};
const CORE_FIELD_EXPLANATIONS = {
  "命宮": "命宮是紫微斗數的核心宮位，主先天個性、人生主軸、外在呈現與做事基調；解盤時會先看命宮星曜，再合三方四正判斷成局方向。",
  "身宮": "身宮看命主實際投入的位置、行動慣性、身體感受與人生後段更常用力的地方；它不是第二個命宮，而是命主把力氣落在哪個人生場景。",
  "來因宮": "來因宮以生年天干對照十二宮宮干定位，代表此生命盤的事件入口、內在動機與最容易牽動命主的原局課題。",
  "五行局": "五行局由命宮納音推定，例如水二局、木三局、金四局、土五局、火六局；它會影響紫微起星、行運節奏與命盤底層氣質，但不等同八字五行強弱。",
};
const TOPIC_CONFIG = {
  property: {
    label: "財富",
    palaces: ["財帛宮", "田宅宮", "官祿宮"],
    elements: ["土", "金"],
    prompt: "看現金流、田宅承載、工作帶財與房產緣。",
  },
  career: {
    label: "事業",
    palaces: ["官祿宮", "命宮", "遷移宮"],
    elements: ["木", "火", "金"],
    prompt: "看職涯方向、執行力、曝光、制度壓力與工作舞台。",
  },
  marriage: {
    label: "姻緣",
    palaces: ["夫妻宮", "命宮", "遷移宮"],
    elements: ["木", "火"],
    prompt: "看正式關係、對象緣分與外部機會。",
  },
  children: {
    label: "子女",
    palaces: ["子女宮", "田宅宮", "福德宮"],
    elements: ["木", "水"],
    prompt: "看子女緣、親子互動、生養照顧、晚輩關係與家庭延續。",
  },
};
const SCOPE_LABELS = {
  decadal: "大限",
  yearly: "流年",
  monthly: "流月",
};
const PALACE_OVERVIEWS = [
  ["命宮", "先天個性、人生主軸、外在呈現與做事基調。"],
  ["兄弟宮", "手足、同輩、合作默契、競爭關係與資源分攤。"],
  ["夫妻宮", "伴侶、婚姻、正式關係、對象類型與相處模式。"],
  ["子女宮", "子女緣、晚輩、創作成果、生育照顧與親子互動。"],
  ["財帛宮", "收入模式、金錢流動、理財習慣與可掌握資源。"],
  ["疾厄宮", "身體狀態、壓力反應、健康弱點與修復方式。"],
  ["遷移宮", "外部舞台、出差旅行、跨城市機會與對外形象。"],
  ["僕役宮", "朋友、人脈、部屬、社群合作與受他人牽動的事。"],
  ["官祿宮", "事業方向、職涯定位、工作能力與社會責任。"],
  ["田宅宮", "房產、居住環境、家庭承載、資產根基與安全感。"],
  ["福德宮", "內在快樂、精神狀態、享受能力與長期福分。"],
  ["父母宮", "父母長輩、制度文件、上級緣分與保護資源。"],
];
const HELPFUL_STARS = [
  "紫微",
  "天府",
  "天相",
  "太陽",
  "太陰",
  "天梁",
  "武曲",
  "天同",
  "左輔",
  "右弼",
  "文昌",
  "文曲",
  "天魁",
  "天鉞",
  "祿存",
  "天馬",
  "化祿",
  "化權",
  "化科",
  "紅鸞",
  "天喜",
  "天姚",
  "龍德",
  "天德",
  "月德",
  "青龍",
  "恩光",
  "封誥",
  "三台",
  "八座",
  "台輔",
  "天福",
];
const CHALLENGE_STARS = [
  "七殺",
  "破軍",
  "廉貞",
  "巨門",
  "擎羊",
  "陀羅",
  "火星",
  "鈴星",
  "地空",
  "地劫",
  "天空",
  "旬空",
  "孤辰",
  "寡宿",
  "天刑",
  "天哭",
  "天虛",
  "大耗",
  "小耗",
  "劫煞",
  "劫殺",
  "災煞",
  "天煞",
  "白虎",
  "喪門",
  "弔客",
  "病符",
  "伏兵",
  "官符",
  "化忌",
];
const FLOWER_STARS = ["紅鸞", "天喜", "天姚", "咸池"];
const STAR_MEANINGS = {
  "紫微": "帝星，主掌領導、權威、資源整合、責任感、名望與掌控格局；也代表容易被期待、被推到核心位置。",
  "天機": "機謀星，主掌智慧、策劃、技術、變動、學習、交通與神經系統；也代表多想、敏捷與不喜固定。",
  "太陽": "光明星，主掌名聲、男性緣、父親、上司、外放能量、公益與曝光；也代表付出、照顧他人與容易勞心。",
  "武曲": "財星與執行星，主掌金錢、紀律、制度、金融、工程、管理與決斷；也代表務實、剛硬與情感表達較直接。",
  "天同": "福星，主掌享受、人緣、舒適、童心、飲食、休閒與被照顧感；也代表安逸、依賴與需要被推動。",
  "廉貞": "次桃花與制度星，主掌規範、審美、感情拉扯、權力邊界、法務稽核與官非風險；也代表魅力、執著與界線議題。",
  "天府": "庫星，主掌資產、保存、管理、組織、穩定、家庭資源與財庫；也代表保守、厚重與重視安全感。",
  "太陰": "月亮與田宅財星，主掌女性緣、母親、房產、儲蓄、金融、審美、照護與內在感受；也代表敏感、細膩與夜間能量。",
  "貪狼": "欲望與才藝星，主掌社交、娛樂、美感、業務、酒色財氣、表演、桃花與開發；也代表慾望強、變化多與人際吸引力。",
  "巨門": "口舌星，主掌溝通、辯論、法律、媒體、語言、研究與暗中資訊；也代表是非、誤會、質疑與需要說清楚。",
  "天相": "印星與輔佐星，主掌形象、合作、制度、服務、協調、公文印信與公關；也代表重視公平、禮節與外在評價。",
  "天梁": "蔭星，主掌長輩、保護、醫藥、教育、公益、解厄與原則；也代表清高、慢熟、責任與逢凶化吉的能力。",
  "七殺": "將星，主掌決斷、開創、軍警、風險、競爭、突破與獨立；也代表孤剛、壓力、快速切換與硬仗。",
  "破軍": "耗星與改革星，主掌破舊立新、變動、創業、消耗、重整、搬遷與冒險；也代表不滿現狀、先破後立。",
  "左輔": "輔助貴人星，主掌助力、團隊、幕僚、協調與旁人扶持；遇吉增吉，遇煞則需分辨人情與依賴。",
  "右弼": "輔助貴人星，主掌合作、人和、支援、修補關係與貴人牽線；也代表柔性資源與人際調和。",
  "文昌": "文書星，主掌考試、寫作、證照、文案、制度文件、理性表達與學習成果。",
  "文曲": "才藝星，主掌藝術、語言、審美、感性表達、創作、談吐與人文能力。",
  "天魁": "貴人星，主掌長官、師長、制度內貴人、機會提拔與危機中的幫手。",
  "天鉞": "貴人星，主掌女性貴人、專業支援、關鍵協助、被看見與被推薦。",
  "祿存": "財祿星，主掌穩定收入、守成、資源、薪資、資產保留與既有利益；也代表保守和不易鬆手。",
  "天馬": "移動星，主掌奔波、遷移、交通、旅行、外地機會、國際與行動帶財。",
  "擎羊": "刑傷星，主掌衝突、手術、刀火金屬、競爭、急迫與硬碰硬；也代表突破但代價較高。",
  "陀羅": "拖磨星，主掌延宕、糾結、慢性壓力、固執、牽制與反覆處理同一問題。",
  "火星": "火爆星，主掌突發、急躁、爆發力、火電、速度、意外與短期衝刺。",
  "鈴星": "暗火星，主掌焦慮、聲響、暗中壓力、突發干擾、爆點與神經緊繃。",
  "地空": "空耗星，主掌落空、理想化、抽離、精神性、計畫變動與不易留住。",
  "地劫": "劫耗星，主掌損耗、破財、突發支出、被切斷、資源流失與重新配置。",
  "天空": "空亡星，主掌落空、想像、精神追求、計畫反覆與需要降低過度期待。",
  "旬空": "空亡星，主掌延後、虛位、暫時不實、等待時機與事情先空後成。",
  "截空": "阻斷星，主掌中斷、截流、突然卡關、期待落差與需要重新定義目標。",
  "化祿": "四化祿，主掌資源、收入、好感、機會、滋養與事情變順。",
  "化權": "四化權，主掌權力、掌控、執行、壓力、責任與事情變強。",
  "化科": "四化科，主掌名聲、貴人、修飾、證照、學習、緩和與事情變漂亮。",
  "化忌": "四化忌，主掌卡點、執著、欠債、牽掛、壓力、反覆與需要補課的地方。",
  "紅鸞": "正桃花星，主掌婚戀機會、喜事、人緣、吸引力與關係啟動。",
  "天喜": "喜慶星，主掌喜事、婚嫁、邀約、愉快互動、社交與好消息。",
  "天姚": "魅力桃花星，主掌吸引力、打扮、藝術、曖昧、情欲與被注意。",
  "咸池": "桃花星，主掌魅力、情感波動、社交誘惑、享樂與外貌吸引。",
  "孤辰": "孤獨星，主掌獨立、晚熟、距離感、內心孤單與不易依靠他人。",
  "寡宿": "孤寡星，主掌情感距離、獨處、慢熱、關係冷感與需要安全空間。",
  "天刑": "刑法星，主掌法規、手術、傷痕、紀律、約束、審判與自我要求。",
  "天哭": "哭泣星，主掌情緒低潮、悲傷、壓抑、同理心與對痛苦較敏感。",
  "天虛": "虛耗星，主掌失落、空想、情緒落差、聲勢大於實質與需要務實確認。",
  "大耗": "大消耗星，主掌大額支出、資源流失、破財、搬遷耗損與情緒消耗。",
  "小耗": "小消耗星，主掌零碎支出、小破財、日常損耗、時間流失與雜務。",
  "劫煞": "劫奪星，主掌突發損失、競爭、被搶先、風險事件與資源被切走。",
  "劫殺": "劫奪星，主掌衝擊、損耗、激烈競爭與需防突發破局。",
  "災煞": "災厄星，主掌意外、壓力事件、外在干擾與需要風險管理。",
  "天煞": "煞曜，主掌突發壓力、人際阻力、情緒衝擊與需要謹慎應對。",
  "白虎": "刑傷星，主掌傷病、手術、衝突、強勢壓力、喪服象徵與警訊。",
  "喪門": "喪耗星，主掌低潮、家宅煩憂、失落、長輩健康與情緒壓力。",
  "弔客": "弔慰星，主掌奔波探視、告別、情緒牽掛、人情往來與家族事件。",
  "病符": "病耗星，主掌健康警訊、疲勞、慢性問題、保養與作息調整。",
  "伏兵": "暗伏星，主掌暗中阻力、誤會、被拖延、隱性競爭與未說出口的問題。",
  "官符": "文書官非星，主掌合約、訴訟、規章、公文、檢查與制度壓力。",
  "龍德": "德曜，主掌貴人、化解、善緣、名聲修復與遇難有人幫。",
  "天德": "德曜，主掌福德、解厄、善意、貴人保護與事情有轉圜。",
  "月德": "德曜，主掌溫和貴人、情緒修復、女性助力與柔性保護。",
  "青龍": "喜慶星，主掌進展、喜訊、文書順利、貴人與事情有生氣。",
  "恩光": "名譽星，主掌被肯定、長輩照拂、表揚、名聲與體面。",
  "封誥": "封賞星，主掌職稱、證照、表揚、名分、資格與被正式承認。",
  "三台": "階梯星，主掌升遷、層級、制度內發展、逐步累積與位置提升。",
  "八座": "座位星，主掌地位、平台、職銜、穩定位置與被安排到重要席位。",
  "台輔": "輔佐星，主掌幕僚、平台支援、文書助力、貴人與行政資源。",
  "天福": "福氣星，主掌享受、福分、舒適、助力、食祿與生活餘裕。",
  "天官": "官祿助星，主掌職銜、名分、制度資源、長官緣與公部門能量。",
  "天廚": "食祿星，主掌飲食、口福、餐飲、人情款待、生活享受與照顧。",
  "天才": "才華星，主掌天分、學習、巧思、特殊能力與解題能力。",
  "天壽": "壽元星，主掌健康延續、長輩緣、耐力、穩定與保守。",
  "龍池": "才藝形象星，主掌儀態、審美、藝術、社交場合與外在包裝。",
  "鳳閣": "才藝名聲星，主掌品味、文采、表達、名氣、禮儀與形象。",
  "解神": "解厄星，主掌化解、轉圜、排除困難、找到出口與事後補救。",
  "天巫": "靈感星，主掌神祕學、療癒、直覺、宗教、身心連結與特殊感知。",
  "陰煞": "陰性煞曜，主掌暗中壓力、情緒陰影、小人、猜疑與不明阻力。",
  "天月": "健康星，主掌病痛、醫藥、照護、敏感體質與身心保養。",
  "破碎": "破損星，主掌分裂、破損、瑕疵、關係裂痕與修補議題。",
  "蜚廉": "流言星，主掌口舌、傳聞、外界評價、速度與人際雜音。",
  "指背": "背後是非星，主掌暗中批評、誤解、被議論與需要減少把柄。",
  "歲建": "太歲主星，主掌當年焦點、主導事件、外在環境壓力與年度主題。",
  "晦氣": "低迷星，主掌不順、情緒灰暗、阻滯、看不清與需保守處理。",
  "貫索": "牽制星，主掌束縛、合約、責任、法律糾纏與被事情綁住。",
  "將星": "權柄星，主掌領導、權力、指揮、責任、競爭與被推上前線。",
  "攀鞍": "機會星，主掌升遷、靠近權力、借勢而上、交通與外部舞台。",
  "歲驛": "移動星，主掌搬遷、旅行、外地、變動與遠方消息。",
  "息神": "休整星，主掌保守、休息、暫停、低調與調養。",
  "華蓋": "孤高才藝星，主掌藝術、宗教、專業、孤獨、清高與自成一格。",
  "博士": "文教星，主掌學習、專業、文書、名聲、教學與知識輸出。",
  "力士": "力量星，主掌執行、體力、支援、勞務、實作與推動。",
  "奏書": "文書星，主掌申請、報告、傳達、證明、溝通與制度流程。",
  "飛廉": "速度與口舌星，主掌快速變化、流言、奔波與訊息擾動。",
  "喜神": "喜悅星，主掌喜事、邀約、人緣、正面情緒與小確幸。",
  "病": "十二長生病位，主掌衰弱、修養、健康警訊、依賴與需要調整。",
  "死": "十二長生死位，主掌停滯、結束、沉澱、收尾與需要放下。",
  "墓": "十二長生墓位，主掌收藏、沉潛、庫藏、延後發作與資源被封存。",
  "絕": "十二長生絕位，主掌斷點、轉折、清空、重新開始前的空窗。",
  "胎": "十二長生胎位，主掌醞釀、準備、未成形、孕育與等待成熟。",
  "養": "十二長生養位，主掌培養、照顧、累積、恢復與慢慢成形。",
  "長生": "十二長生起點，主掌生命力、開端、成長、學習與新機會。",
  "沐浴": "十二長生沐浴位，主掌桃花、清洗、情緒、社交、曝光與不穩定。",
  "冠帶": "十二長生冠帶位，主掌包裝、形象、學習、禮儀與準備上場。",
  "臨官": "十二長生臨官位，主掌能力成熟、職位、執掌、正式發揮。",
  "帝旺": "十二長生旺位，主掌高峰、強勢、能量滿、主導與容易過旺。",
  "衰": "十二長生衰位，主掌退潮、轉弱、收斂、保守與需要補氣。",
};
const AUXILIARY_GROUP_MEANINGS = {
  "歲前": "歲前十二神，偏看流年環境、人際氣氛、外界事件與一年中的吉凶起伏。",
  "將前": "將前十二神，偏看行動力、權力位置、競爭、奔波與事件推進方式。",
  "博士": "博士十二神，偏看學習、名聲、文書、執行、人際支援與日常事件細節。",
  "長生": "十二長生，偏看能量從出生、成長、旺盛到衰退收藏的狀態。",
};
const FLYING_MUTAGEN_TABLE = {
  "甲": { "祿": "廉貞", "權": "破軍", "科": "武曲", "忌": "太陽" },
  "乙": { "祿": "天機", "權": "天梁", "科": "紫微", "忌": "太陰" },
  "丙": { "祿": "天同", "權": "天機", "科": "文昌", "忌": "廉貞" },
  "丁": { "祿": "太陰", "權": "天同", "科": "天機", "忌": "巨門" },
  "戊": { "祿": "貪狼", "權": "太陰", "科": "右弼", "忌": "天機" },
  "己": { "祿": "武曲", "權": "貪狼", "科": "天梁", "忌": "文曲" },
  "庚": { "祿": "太陽", "權": "武曲", "科": "太陰", "忌": "天同" },
  "辛": { "祿": "巨門", "權": "太陽", "科": "文曲", "忌": "文昌" },
  "壬": { "祿": "天梁", "權": "紫微", "科": "左輔", "忌": "武曲" },
  "癸": { "祿": "破軍", "權": "巨門", "科": "太陰", "忌": "貪狼" },
};
const ZIWEI_IMAGE_TYPES = {
  flying: { label: "飛星", title: "紫微飛星圖", filename: "ziwei-flying-stars" },
  sanhe: { label: "三合", title: "三合三方四正圖", filename: "ziwei-sanhe" },
  sihua: { label: "四化", title: "生年四化圖", filename: "ziwei-sihua" },
};
const PARTNER_CAREER_RULES = [
  [["天機", "文昌", "文曲"], ["科技產品、資料分析、顧問、教育研究"]],
  [["巨門"], ["法律、公關、媒體、業務談判、語言溝通"]],
  [["太陽"], ["管理職、公共服務、品牌行銷、外勤型工作"]],
  [["太陰"], ["金融會計、設計美感、不動產、照護服務"]],
  [["武曲", "祿存"], ["金融投資、工程技術、營運管理、制度型職務"]],
  [["天府", "紫微", "天相"], ["行政管理、政府機構、大型組織、資源整合"]],
  [["廉貞"], ["法務稽核、制度管理、審美設計、策略職"]],
  [["貪狼", "紅鸞", "天喜", "天姚", "咸池"], ["業務開發、娛樂美學、餐旅社交、內容行銷"]],
  [["七殺", "破軍"], ["新創、工程現場、軍警消防、專案開拓"]],
  [["天梁", "天魁", "天鉞"], ["醫療照護、教育顧問、專業證照、公益服務"]],
  [["天馬"], ["國際貿易、旅運物流、跨城市移動型工作"]],
];
const ELEMENT_WORDS = {
  "木": "成長、規劃與開展",
  "火": "表達、熱度與曝光",
  "土": "穩定、承載與資產",
  "金": "規則、決斷與收斂",
  "水": "感受、流動與應變",
};
const ASTRO_CONFIG = {
  algorithm: "zhongzhou",
};
const ASTRO_SCHOOL_LABEL = "中州派設定";
const AI_IMAGE_ENDPOINT = "/.netlify/functions/generate-partner-image";
const HOUR_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const BRANCH_GRID = {
  "巳": [1, 1],
  "午": [1, 2],
  "未": [1, 3],
  "申": [1, 4],
  "辰": [2, 1],
  "酉": [2, 4],
  "卯": [3, 1],
  "戌": [3, 4],
  "寅": [4, 1],
  "丑": [4, 2],
  "子": [4, 3],
  "亥": [4, 4],
};
const TW_MAP = {
  "阳": "陽",
  "阴": "陰",
  "时": "時",
  "财": "財",
  "禄": "祿",
  "权": "權",
  "宫": "宮",
  "迁": "遷",
  "仆": "僕",
  "机": "機",
  "杀": "殺",
  "贪": "貪",
  "罗": "羅",
  "铃": "鈴",
  "辅": "輔",
  "马": "馬",
  "钺": "鉞",
  "钧": "鈞",
  "龙": "龍",
  "凤": "鳳",
  "鸾": "鸞",
  "寿": "壽",
  "厨": "廚",
  "华": "華",
  "盖": "蓋",
  "虚": "虛",
  "伤": "傷",
  "灾": "災",
  "岁": "歲",
  "驿": "驛",
  "临": "臨",
  "将": "將",
  "阴": "陰",
  "贵": "貴",
  "劫": "劫",
};

const form = document.querySelector("#birth-form");
const dateInput = document.querySelector("#birth-date");
const timeInput = document.querySelector("#birth-time");
const sampleButton = document.querySelector("#sample-button");
const errorMessage = document.querySelector("#error-message");
const summaryStrip = document.querySelector("#summary-strip");
const pillarGrid = document.querySelector("#pillar-grid");
const elementBars = document.querySelector("#element-bars");
const nayinList = document.querySelector("#nayin-list");
const astrolabeGrid = document.querySelector("#astrolabe-grid");
const ziweiImageOutput = document.querySelector("#ziwei-image-output");
const scopeSelect = document.querySelector("#scope-select");
const decadalSelect = document.querySelector("#decadal-select");
const targetYearInput = document.querySelector("#target-year");
const targetMonthInput = document.querySelector("#target-month");
const topicSelect = document.querySelector("#topic-select");
const decadalControl = document.querySelector("#decadal-control");
const yearControl = document.querySelector("#year-control");
const monthControl = document.querySelector("#month-control");
const palaceOverviewOutput = document.querySelector("#palace-overview-output");
const readingOutput = document.querySelector("#reading-output");
const partnerOutput = document.querySelector("#partner-output");
const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");

let currentChart = null;
let partnerRenderSalt = 0;
let ziweiImageType = "sanhe";
let partnerImageState = {
  status: "idle",
  imageUrl: "",
  provider: "",
  message: "",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toTraditional(value) {
  return String(value ?? "").replace(/[阳阴时财禄权宫迁仆机杀贪罗铃辅马钺钧龙凤鸾寿厨华盖虚伤灾岁驿临将贵]/g, (char) => TW_MAP[char] || char);
}

function stripStarBrightnessText(value) {
  return toTraditional(value)
    .replace(/[（(](廟|旺|陷|平|得|利|不)[）)]/g, "")
    .replace(/\s+(廟|旺|陷|平|得|利|不)$/g, "");
}

function getFormValues() {
  const birthDate = dateInput.value;
  const birthTime = timeInput.value;
  const gender = new FormData(form).get("gender") || "女";

  if (!birthDate || !birthTime) {
    throw new Error("請填入完整出生日期與時間。");
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);

  return { birthDate, birthTime, gender, year, month, day, hour, minute };
}

function getTimeIndex(hour) {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2);
}

function getTimeRange(index) {
  const ranges = [
    "23:00-00:59",
    "01:00-02:59",
    "03:00-04:59",
    "05:00-06:59",
    "07:00-08:59",
    "09:00-10:59",
    "11:00-12:59",
    "13:00-14:59",
    "15:00-16:59",
    "17:00-18:59",
    "19:00-20:59",
    "21:00-22:59",
  ];
  return ranges[index] || "";
}

function splitPillar(pillar) {
  const text = String(pillar || "");
  return {
    stem: text.slice(0, 1),
    branch: text.slice(1, 2),
    text,
  };
}

function countElements(pillars) {
  const counts = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  pillars.forEach((pillar) => {
    const { stem, branch } = splitPillar(pillar);
    if (GAN_ELEMENT[stem]) counts[GAN_ELEMENT[stem]] += 1;
    if (ZHI_ELEMENT[branch]) counts[ZHI_ELEMENT[branch]] += 1;
  });
  return counts;
}

function getTenGod(dayStem, targetStem) {
  const dayElement = GAN_ELEMENT[dayStem];
  const targetElement = GAN_ELEMENT[targetStem];
  if (!dayElement || !targetElement) return "";
  const samePolarity = STEM_YINYANG[dayStem] === STEM_YINYANG[targetStem];
  if (dayElement === targetElement) return samePolarity ? "比肩" : "劫財";
  if (ELEMENT_GENERATES[dayElement] === targetElement) return samePolarity ? "食神" : "傷官";
  if (ELEMENT_CONTROLS[dayElement] === targetElement) return samePolarity ? "偏財" : "正財";
  if (ELEMENT_CONTROLS[targetElement] === dayElement) return samePolarity ? "七殺" : "正官";
  if (ELEMENT_GENERATES[targetElement] === dayElement) return samePolarity ? "偏印" : "正印";
  return "";
}

function tenGodTooltip(name) {
  return `${name}：${TEN_GOD_MEANINGS[name] || "十神用來看日主與其他天干、地支藏干之間的生剋關係。"}`;
}

function getHiddenStemGods(dayStem, branch) {
  return (BRANCH_HIDDEN_STEMS[branch] || [])
    .map((hiddenStem) => ({
      stem: hiddenStem,
      god: getTenGod(dayStem, hiddenStem),
    }))
    .filter((item) => item.god);
}

function getNaYinElement(name) {
  const text = toTraditional(name);
  return ELEMENTS.find((element) => text.includes(element)) || "";
}

function naYinTooltip(name) {
  const text = toTraditional(name);
  const element = getNaYinElement(text);
  const hint = element ? NAYIN_ELEMENT_HINTS[element] : "納音可輔助觀察四柱氣質、外在包裝、事件呈現方式與五行聲氣。";
  return `${text}：納音是六十甲子的象意五行，用來補充四柱的氣質、外在表現與事件調性。${hint}`;
}

function starName(star) {
  if (!star) return "";
  const name = stripStarBrightnessText(star.name || "");
  const brightness = toTraditional(star.brightness || "");
  return brightness ? `${name}(${brightness})` : name;
}

function tooltipAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function mutagenMeaning(mutagen) {
  return {
    "祿": "資源、好感、收入、機會與滋養",
    "禄": "資源、好感、收入、機會與滋養",
    "權": "權力、掌控、執行、責任與壓力",
    "权": "權力、掌控、執行、責任與壓力",
    "科": "名聲、貴人、修飾、學習與緩和",
    "忌": "卡點、執著、牽掛、欠債與反覆補課",
  }[mutagen] || "特殊轉化";
}

function inferStarMeaning(name, type = "") {
  if (hasAnyKeyword(name, HELPFUL_STARS)) return "吉曜或助力星，常代表貴人、資源、順勢、名聲、修補與事情較容易被推動。";
  if (hasAnyKeyword(name, CHALLENGE_STARS)) return "煞曜或壓力星，常代表阻力、消耗、延誤、衝突、破財、健康警訊或需要謹慎管理的風險。";
  if (hasAnyKeyword(name, FLOWER_STARS)) return "桃花星，常代表吸引力、情感互動、社交緣分、美感、享樂與人際注意力。";
  if (type === "soft") return "輔助星，偏向支援、人緣、貴人、修補與把事情做順。";
  if (type === "tough") return "煞曜，偏向壓力、衝突、急迫、耗損與需要正面處理的挑戰。";
  if (type === "flower") return "桃花或魅力星，偏向吸引力、人緣、情緒與關係互動。";
  if (type === "lucun") return "財祿星系，偏向收入、資源、守成、資產與利益分配。";
  if (type === "tianma") return "移動星系，偏向奔波、遷移、遠方機會、交通與行動帶財。";
  return "此星曜需與所在宮位、主星、四化、亮度與同宮星一起判斷；可視為該宮事件的輔助訊號。";
}

function starTooltip(star) {
  const name = starPlainName(star);
  const display = starDisplayName(star);
  const meaning = STAR_MEANINGS[name] || inferStarMeaning(name, star?.type || "");
  const brightness = toTraditional(star?.brightness || "");
  const mutagen = toTraditional(star?.mutagen || "");
  const details = [];

  if (mutagen) details.push(`四化為化${mutagen}，代表此星在本盤轉成${mutagenMeaning(mutagen)}。`);
  if (brightness) details.push(`亮度為${brightness}，表示星性發揮強弱需要一起評估。`);

  return `${display}：${meaning}${details.length ? ` ${details.join(" ")}` : ""}`;
}

function auxiliaryTooltip(label, value) {
  const name = toTraditional(value);
  const group = AUXILIARY_GROUP_MEANINGS[label] || "輔助星系，用來補充事件細節與吉凶氣氛。";
  const meaning = STAR_MEANINGS[name] || inferStarMeaning(name);
  return `${label} ${name}：${meaning} ${group}`;
}

function renderStarChips(stars, type, limit = 7) {
  if (!stars || stars.length === 0) {
    return "";
  }

  const visible = stars.slice(0, limit);
  const rest = stars.length - visible.length;
  const chips = visible
    .map((star) => {
      const tooltip = starTooltip(star);
      return `<span class="star-chip ${type} has-tooltip" tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}">${escapeHtml(starName(star))}</span>`;
    })
    .join("");
  const moreTooltip = rest > 0
    ? stars.slice(limit).map((star) => starTooltip(star)).join("；")
    : "";
  const more = rest > 0 ? `<span class="star-chip has-tooltip" tabindex="0" aria-label="${tooltipAttribute(moreTooltip)}" data-tooltip="${tooltipAttribute(moreTooltip)}">+${rest}</span>` : "";
  return `<div class="star-line">${chips}${more}</div>`;
}

function renderAuxiliaryChips(palace) {
  const groups = [
    ["歲前", palace.suiqian12],
    ["將前", palace.jiangqian12],
    ["博士", palace.boshi12],
    ["長生", palace.changsheng12],
  ].filter(([, value]) => value);

  if (!groups.length) return "";

  return `
    <div class="aux-line">
      ${groups.map(([label, value]) => `
        <span class="aux-chip has-tooltip" tabindex="0" aria-label="${tooltipAttribute(auxiliaryTooltip(label, value))}" data-tooltip="${tooltipAttribute(auxiliaryTooltip(label, value))}"><b>${escapeHtml(label)}</b>${escapeHtml(toTraditional(value))}</span>
      `).join("")}
    </div>
  `;
}

function getSafeNumber(input, fallback, min, max) {
  const value = Number(input.value || fallback);
  if (Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizePalaceName(name) {
  return toTraditional(name).replaceAll("宫", "宮").replaceAll("禄", "祿");
}

function palaceKey(name) {
  return normalizePalaceName(name).replace(/宮$/, "");
}

function findPalaceByName(astrolabe, palaceName) {
  const key = palaceKey(palaceName);
  const aliases = {
    "僕役": ["交友", "奴僕"],
    "官祿": ["事業"],
  }[key] || [];
  return astrolabe.palaces.find((palace) => [key, ...aliases].includes(palaceKey(palace.name)));
}

function getLifePalace(astrolabe) {
  return findPalaceByName(astrolabe, "命宮");
}

function getBodyPalace(astrolabe) {
  return astrolabe.palaces.find((palace) => palace.isBodyPalace) || null;
}

function getCausePalace(astrolabe) {
  const yearStem = astrolabe.rawDates?.chineseDate?.yearly?.[0];
  if (!yearStem) return null;
  return astrolabe.palaces.find((palace) => palace.heavenlyStem === yearStem) || null;
}

function palaceLabel(palace) {
  if (!palace) return "未取得";
  return `${normalizePalaceName(palace.name)} ${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}`;
}

function coreFieldTooltip(label, value) {
  const currentText = value ? `目前${label === "五行局" ? "為" : "落點"}：${value}。` : "";
  return `${label}：${currentText}${CORE_FIELD_EXPLANATIONS[label] || ""}`;
}

function renderCoreLabel(label, tooltip) {
  return `
    <span class="core-field-label">
      ${escapeHtml(label)}
      ${tooltip ? `<b class="core-field-help" aria-hidden="true">?</b>` : ""}
    </span>
  `;
}

function tooltipProps(tooltip) {
  return tooltip ? ` tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}"` : "";
}

function allPalaceStars(palace, extraStars = []) {
  return [
    ...(palace?.majorStars || []),
    ...(palace?.minorStars || []),
    ...(palace?.adjectiveStars || []),
    ...extraStars,
  ];
}

function starPlainName(star) {
  return stripStarBrightnessText(star?.name || "");
}

function starDisplayName(star) {
  const name = starName(star);
  const mutagen = toTraditional(star?.mutagen || "");
  return mutagen ? `${name}化${mutagen}` : name;
}

function starReadingDisplayName(star) {
  const name = starPlainName(star);
  const mutagen = toTraditional(star?.mutagen || "");
  return mutagen ? `${name}化${mutagen}` : name;
}

function hasAnyKeyword(value, keywords) {
  return keywords.some((keyword) => value.includes(keyword));
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function summarizeStarNames(stars, fallback = "未見明顯星曜", formatter = starDisplayName) {
  const names = uniqueItems(stars.map(formatter));
  return names.length ? names.slice(0, 5).join("、") : fallback;
}

function summarizeReadingStarNames(stars, fallback = "未見明顯星曜") {
  return summarizeStarNames(stars, fallback, starReadingDisplayName);
}

function cleanReadingStarNames(names, limit = Infinity) {
  return uniqueItems(names.map(stripStarBrightnessText)).slice(0, limit);
}

function palaceAuxiliaryNames(palace) {
  return [
    palace?.suiqian12,
    palace?.jiangqian12,
    palace?.boshi12,
    palace?.changsheng12,
  ].map(toTraditional).filter(Boolean);
}

function evaluatePalace(palace, extraStars = []) {
  const auxiliaryStars = palaceAuxiliaryNames(palace).map((name) => ({
    name,
    type: "auxiliary",
    scope: "origin",
  }));
  const stars = allPalaceStars(palace, [...auxiliaryStars, ...extraStars]);
  const helpful = [];
  const challenges = [];
  const flowers = [];
  let score = 0;

  stars.forEach((star) => {
    const name = starPlainName(star);
    const display = starDisplayName(star);
    const mutagen = toTraditional(star.mutagen || "");
    const brightness = toTraditional(star.brightness || "");

    if (hasAnyKeyword(name, HELPFUL_STARS) || ["soft", "lucun", "tianma"].includes(star.type)) {
      helpful.push(display);
      score += star.scope === "origin" ? 1.4 : 1;
    }

    if (hasAnyKeyword(name, CHALLENGE_STARS) || star.type === "tough") {
      challenges.push(display);
      score -= star.scope === "origin" ? 1.5 : 1.1;
    }

    if (hasAnyKeyword(name, FLOWER_STARS) || star.type === "flower") {
      flowers.push(display);
      score += 0.8;
    }

    if (["祿", "权", "權", "科"].includes(mutagen)) {
      score += 1.2;
      helpful.push(display);
    }

    if (mutagen === "忌") {
      score -= 1.8;
      challenges.push(display);
    }

    if (["廟", "旺", "得", "利"].includes(brightness)) score += 0.35;
    if (["陷", "不"].includes(brightness)) score -= 0.35;
  });

  return {
    palace,
    score,
    stars,
    helpful: uniqueItems(helpful),
    challenges: uniqueItems(challenges),
    flowers: uniqueItems(flowers),
  };
}

function elementInsight(counts, topic) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const weakestValue = Math.min(...Object.values(counts));
  const weak = sorted.filter(([, value]) => value === weakestValue).map(([element]) => element);
  const supported = topic.elements.filter((element) => counts[element] > 0);
  const missing = topic.elements.filter((element) => counts[element] === 0);
  const score = supported.length * 0.7 - missing.length * 0.9;
  const supportText = supported.length
    ? `${supported.join("、")}有根，對${topic.label}的${supported.map((element) => ELEMENT_WORDS[element]).join("、")}較有支撐`
    : `${topic.label}參考的${topic.elements.join("、")}不明顯，需要靠後天節奏補足`;
  const missingText = missing.length ? `；${missing.join("、")}偏弱時，容易在${topic.prompt}` : "";

  return {
    score,
    dominant: dominant[0],
    weak,
    text: `八字五行以${dominant[0]}較明顯，偏弱為${weak.join("、")}。${supportText}${missingText}。`,
  };
}

function renderDecadalOptions(astrolabe, formValues) {
  const previous = decadalSelect.value;
  decadalSelect.innerHTML = astrolabe.palaces
    .map((palace, index) => {
      const range = palace.decadal?.range;
      const rangeLabel = range ? `${range[0]}-${range[1]}歲` : "未定歲數";
      const branch = `${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}`;
      return `<option value="${index}">${rangeLabel} ${normalizePalaceName(palace.name)} ${branch}</option>`;
    })
    .join("");

  const values = [...decadalSelect.options].map((option) => option.value);
  if (values.includes(previous)) {
    decadalSelect.value = previous;
    return;
  }

  const nominalAge = new Date().getFullYear() - formValues.year + 1;
  const currentIndex = astrolabe.palaces.findIndex((palace) => {
    const range = palace.decadal?.range;
    return range && nominalAge >= range[0] && nominalAge <= range[1];
  });
  decadalSelect.value = String(currentIndex >= 0 ? currentIndex : 0);
}

function getHoroscopeSafe(astrolabe, targetDate) {
  try {
    return astrolabe.horoscope(targetDate);
  } catch (error) {
    return null;
  }
}

function buildPeriodContext(chart) {
  const scope = SCOPE_LABELS[scopeSelect.value] ? scopeSelect.value : "decadal";
  if (scopeSelect.value !== scope) scopeSelect.value = scope;
  const selectedDecadalIndex = getSafeNumber(decadalSelect, 0, 0, 11);
  const targetYear = getSafeNumber(targetYearInput, new Date().getFullYear(), 1900, 2100);
  const targetMonth = getSafeNumber(targetMonthInput, new Date().getMonth() + 1, 1, 12);
  let targetDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  let horoscope = null;
  let periodIndex = null;
  let periodName = SCOPE_LABELS[scope];

  if (scope === "decadal") {
    const range = chart.astrolabe.palaces[selectedDecadalIndex]?.decadal?.range || [1, 10];
    const representativeYear = chart.formValues.year + range[0] - 1;
    targetDate = `${representativeYear}-01-01`;
    horoscope = getHoroscopeSafe(chart.astrolabe, targetDate);
    periodIndex = selectedDecadalIndex;
    periodName = `${SCOPE_LABELS[scope]} ${range[0]}-${range[1]}歲`;
  }

  if (scope === "yearly") {
    horoscope = getHoroscopeSafe(chart.astrolabe, `${targetYear}-01-01`);
    periodIndex = horoscope?.yearly?.index ?? null;
    periodName = `${targetYear} ${SCOPE_LABELS[scope]}`;
  }

  if (scope === "monthly") {
    horoscope = getHoroscopeSafe(chart.astrolabe, targetDate);
    periodIndex = horoscope?.monthly?.index ?? null;
    periodName = `${targetYear}年${targetMonth}月 ${SCOPE_LABELS[scope]}`;
  }

  return {
    scope,
    targetYear,
    targetMonth,
    horoscope,
    periodIndex,
    periodName,
    periodPalace: Number.isInteger(periodIndex) ? chart.astrolabe.palaces[periodIndex] : null,
  };
}

function periodStarsAt(context, index) {
  if (!context.horoscope || !Number.isInteger(index)) return [];
  const layers = [];
  if (["decadal", "yearly", "monthly"].includes(context.scope)) layers.push("decadal");
  if (["yearly", "monthly"].includes(context.scope)) layers.push("yearly");
  if (context.scope === "monthly") layers.push("monthly");
  return layers.flatMap((layer) => context.horoscope?.[layer]?.stars?.[index] || []);
}

function scoreTone(score) {
  if (score >= 7) return "機會明顯，可以主動推進";
  if (score >= 3) return "有支撐，但要把節奏整理好";
  if (score >= 0) return "條件有起伏，需先分辨可用資源與壓力點";
  return "壓力較顯，宜保守處理並先修正盲點";
}

function uniqueStarsByName(stars) {
  const seen = new Set();
  return (stars || []).filter((star) => {
    const key = `${starPlainName(star)}-${toTraditional(star?.mutagen || "")}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function namesFromStars(stars) {
  return cleanReadingStarNames(uniqueStarsByName(stars).map(starReadingDisplayName));
}

function overviewStarsForPalace(palace, options = {}) {
  const { includeMajor = true } = options;
  const major = includeMajor ? (palace?.majorStars || []) : [];
  const minor = palace?.minorStars || [];
  const adjective = palace?.adjectiveStars || [];
  const notable = [...minor, ...adjective].filter((star) => {
    const name = starPlainName(star);
    return star?.mutagen
      || hasAnyKeyword(name, HELPFUL_STARS)
      || hasAnyKeyword(name, CHALLENGE_STARS)
      || hasAnyKeyword(name, FLOWER_STARS)
      || ["soft", "tough", "flower", "lucun", "tianma"].includes(star?.type);
  });
  return uniqueStarsByName([...major, ...notable]);
}

function palaceStorySubject(palace) {
  const key = palaceKey(palace?.name || "");
  return {
    "命": "命主本人",
    "兄弟": "手足同輩與合作圈",
    "夫妻": "另一半與正式關係",
    "子女": "子女、晚輩與作品成果",
    "財帛": "賺錢方式與金錢流動",
    "疾厄": "身體壓力與修復模式",
    "遷移": "外部舞台與遠方機會",
    "僕役": "朋友、人脈與團隊關係",
    "官祿": "事業路線與職涯定位",
    "田宅": "房產、家庭與居住根基",
    "福德": "精神狀態與內在享受",
    "父母": "父母長輩、上級與制度資源",
  }[key] || normalizePalaceName(palace?.name || "此宮");
}

function palaceStarStory(stars, palace, fallback = "星曜訊號不集中，需配合對宮、三方四正與流運再判斷") {
  const selected = uniqueStarsByName(stars);
  const names = namesFromStars(selected);
  if (!names.length) return `${fallback}。`;

  const key = palaceKey(palace?.name || "");
  const subject = palaceStorySubject(palace);
  const sentences = [];
  const coveredKeywords = [];

  if (namesIncludeAny(names, ["天機"]) && namesIncludeAny(names, ["巨門"])) {
    coveredKeywords.push("天機", "巨門");
    if (key === "夫妻") {
      sentences.push("天機加上巨門，另一半多半是高智商、邏輯強、反應快的人，說話有分析力，也容易因想太多或語氣太銳利而需要溝通磨合");
    } else if (key === "官祿") {
      sentences.push("天機加巨門讓事業走向偏腦力、顧問、分析、研究、談判與資訊判讀，適合靠邏輯和表達吃飯");
    } else {
      sentences.push(`天機加巨門讓${subject}帶有高智商、強邏輯與善辯特質，事情常靠思考、討論和反覆推演來成形`);
    }
  }

  if (namesIncludeAny(names, ["紅鸞"])) {
    coveredKeywords.push("紅鸞");
    if (key === "夫妻") {
      sentences.push("紅鸞是斗數最強的正桃花星之一，放在夫妻訊號裡，代表另一半外型精緻、身材線條與風情在人群中很容易被看見，關係也較有正式緣分啟動的味道");
    } else {
      sentences.push(`紅鸞讓${subject}帶有人緣、喜事與吸引力，事情常透過好感、邀約或情面被推動`);
    }
  }

  if (namesIncludeAny(names, ["天喜", "天姚", "咸池"])) {
    coveredKeywords.push("天喜", "天姚", "咸池");
    if (key === "夫妻") {
      sentences.push("天喜、天姚、咸池一類桃花星會讓伴侶緣更重視外貌、氛圍、曖昧感與社交魅力，容易遇到在人群裡有存在感的人");
    } else {
      sentences.push(`桃花星使${subject}帶有社交、人情與美感包裝，容易因形象、人氣或愉快互動得到機會`);
    }
  }

  if (namesIncludeAny(names, ["紫微", "天府", "天相"])) {
    coveredKeywords.push("紫微", "天府", "天相");
    sentences.push(`${names.filter((name) => ["紫微", "天府", "天相"].some((keyword) => name.includes(keyword))).join("、")}讓${subject}偏向穩重、有位置感與資源整合，遇事會重視身份、制度和可長期承擔的架構`);
  }

  if (namesIncludeAny(names, ["武曲", "祿存", "太陰", "天府"])) {
    coveredKeywords.push("武曲", "祿存", "太陰", "天府");
    if (key === "財帛") {
      sentences.push("財務星系集中，命主的錢不是只靠靈感，而是靠紀律、資產配置、儲蓄或可管理的收入管道慢慢累積");
    } else if (key === "田宅") {
      sentences.push("財庫與田宅星系相連，家庭、房產或長期資產容易成為此宮故事的重心，適合用保守規劃累積安全感");
    } else {
      sentences.push(`財務星系讓${subject}帶有務實、計算、守成與資源保存的性質，重點在能不能把好處留下來`);
    }
  }

  if (namesIncludeAny(names, ["七殺", "破軍"])) {
    coveredKeywords.push("七殺", "破軍");
    sentences.push(`七殺、破軍使${subject}帶有開創、衝刺與破舊立新的劇情，通常不喜歡一成不變，但也代表過程會有壓力、切換或重整`);
  }

  if (namesIncludeAny(names, ["天梁", "天魁", "天鉞", "左輔", "右弼"])) {
    coveredKeywords.push("天梁", "天魁", "天鉞", "左輔", "右弼");
    sentences.push(`貴人與保護星進來，${subject}遇到卡關時較容易有長輩、專業人士、制度內資源或旁人牽線協助`);
  }

  if (namesIncludeAny(names, ["擎羊", "陀羅", "火星", "鈴星"])) {
    coveredKeywords.push("擎羊", "陀羅", "火星", "鈴星");
    sentences.push(`煞星加入後，${subject}不是完全輕鬆的宮位，會帶出急迫、衝突、拖磨或情緒爆點，需要用規則和節奏管理`);
  }

  if (namesIncludeAny(names, ["地空", "地劫", "天空", "旬空", "截空"])) {
    coveredKeywords.push("地空", "地劫", "天空", "旬空", "截空");
    sentences.push(`空劫系讓${subject}有理想化、落空或留不住的現象，承諾與資源需要落到文件、時間表和可驗證條件`);
  }

  const uncovered = names.filter((name) => !coveredKeywords.some((keyword) => name.includes(keyword)));
  if (uncovered.length) {
    sentences.push(`另外${uncovered.slice(0, 4).join("、")}會把${subject}補成更有個人色彩的劇情，實際表現要看它們和主星、對宮及流運如何互相牽動`);
  }

  if (!sentences.length) {
    sentences.push(`${subject}以${names.slice(0, 4).join("、")}為主要訊號，事件會圍繞這些星曜形成的性格、資源與壓力展開，需要再用三方四正確認成局方向`);
  }

  return `${sentences.slice(0, 3).join("。")}。`;
}

function palaceOverviewReading(palace, astrolabe) {
  if (!palace) {
    return {
      stars: "未取得",
      text: "目前沒有取得此宮資料，暫時無法針對命主此宮做判讀。",
      note: "",
    };
  }

  const hasMajorStars = Boolean(palace.majorStars?.length);
  const opposite = astrolabe ? palaceByBranch(astrolabe, oppositeBranch(palace.earthlyBranch)) : null;
  const directStars = overviewStarsForPalace(palace);
  const directSupportStars = overviewStarsForPalace(palace, { includeMajor: false });
  const oppositeStars = overviewStarsForPalace(opposite);
  const borrowedPalaceName = opposite ? normalizePalaceName(opposite.name) : "對宮";
  const stars = hasMajorStars
    ? summarizeReadingStarNames(directStars, "星曜不集中")
    : `無主星；借${borrowedPalaceName}：${summarizeReadingStarNames(oppositeStars, "對宮星曜不突出")}${directSupportStars.length ? `；本宮輔曜：${summarizeReadingStarNames(directSupportStars, "")}` : ""}`;
  const readingText = hasMajorStars
    ? palaceStarStory(directStars, palace)
    : `本宮無主星，需借${borrowedPalaceName}定調；${palaceStarStory([...oppositeStars, ...directSupportStars], palace, "對宮與本宮輔曜訊號都不集中，需回到三方四正補判")}`;

  return {
    stars,
    text: readingText,
    note: palaceAuxiliaryNames(palace).length ? `輔助訊號：${palaceAuxiliaryNames(palace).slice(0, 3).join("、")}` : "",
  };
}

function topicAdvice(topicKey) {
  return {
    marriage: "建議看重可長期磨合的生活節奏，不只看短期吸引力。",
    career: "事業分析會看官祿宮的職涯主軸，再用命宮看個人能力，用遷移宮看外部舞台、曝光與跨城市機會。",
    property: "財富分析會特別看田宅宮；若田宅有助力星且財帛/官祿能接上，房產緣較容易落地。仍建議保守估現金流、貸款壓力與維修成本。",
    children: "子女分析會以子女宮為主，輔看田宅宮的家庭承載與福德宮的相處舒適度；若煞忌較重，重點會落在照顧壓力、溝通節奏或緣分來得較晚。",
  }[topicKey] || "";
}

function describePalaceEvaluation(evaluation) {
  const palace = evaluation.palace;
  const mainStars = summarizeReadingStarNames(palace.majorStars || [], "主星不突出");
  const helpfulStars = cleanReadingStarNames(evaluation.helpful, 4);
  const challengeStars = cleanReadingStarNames(evaluation.challenges, 4);
  const helpful = helpfulStars.length ? `助力見${helpfulStars.join("、")}` : "助力星不算集中";
  const challenges = challengeStars.length ? `壓力點見${challengeStars.join("、")}` : "煞忌壓力不重";
  return `${normalizePalaceName(palace.name)}在${toTraditional(palace.heavenlyStem)}${toTraditional(palace.earthlyBranch)}，主星為${mainStars}，${helpful}，${challenges}`;
}

function resolveTopicPalaces(topicKey, chart) {
  if (topicKey === "cause") return [getCausePalace(chart.astrolabe)].filter(Boolean);
  if (topicKey === "body") return [getBodyPalace(chart.astrolabe)].filter(Boolean);
  const topic = TOPIC_CONFIG[topicKey];
  return (topic?.palaces || [])
    .map((palaceName) => findPalaceByName(chart.astrolabe, palaceName))
    .filter(Boolean);
}

function topicPalaceLabels(topicKey, chart) {
  if (topicKey === "cause") return resolveTopicPalaces(topicKey, chart).map(palaceLabel);
  if (topicKey === "body") return resolveTopicPalaces(topicKey, chart).map(palaceLabel);
  return TOPIC_CONFIG[topicKey]?.palaces || [];
}

function uniquePalaces(palaces) {
  const seen = new Set();
  return (palaces || []).filter((palace) => {
    if (!palace) return false;
    const key = Number.isInteger(palace.index)
      ? `index-${palace.index}`
      : `${normalizePalaceName(palace.name || "")}-${toTraditional(palace.earthlyBranch || "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanfangSizhengPalaces(astrolabe, palace) {
  if (!astrolabe || !palace) return [];
  const triad = sameTriadBranches(palace.earthlyBranch)
    .map((branch) => palaceByBranch(astrolabe, branch))
    .filter(Boolean);
  const opposite = palaceByBranch(astrolabe, oppositeBranch(palace.earthlyBranch));
  return uniquePalaces([...triad, opposite].filter(Boolean));
}

function relatedPalaceNames(topicKey) {
  return {
    property: ["財帛宮", "田宅宮", "官祿宮", "福德宮", "遷移宮", "命宮"],
    career: ["官祿宮", "命宮", "遷移宮", "財帛宮", "父母宮", "福德宮"],
    marriage: ["夫妻宮", "福德宮", "遷移宮", "命宮", "官祿宮", "子女宮"],
    children: ["子女宮", "田宅宮", "福德宮", "夫妻宮", "命宮", "父母宮"],
  }[topicKey] || TOPIC_CONFIG[topicKey]?.palaces || [];
}

function topicNetworkPalaces(topicKey, chart, context) {
  const basePalaces = resolveTopicPalaces(topicKey, chart);
  const squarePalaces = basePalaces.flatMap((palace) => sanfangSizhengPalaces(chart.astrolabe, palace));
  const related = relatedPalaceNames(topicKey)
    .map((palaceName) => findPalaceByName(chart.astrolabe, palaceName))
    .filter(Boolean);
  return uniquePalaces([
    ...basePalaces,
    ...squarePalaces,
    ...related,
    getCausePalace(chart.astrolabe),
    getBodyPalace(chart.astrolabe),
    context?.periodPalace,
  ]);
}

function evaluateTopicNetwork(topicKey, chart, context) {
  const basePalaces = resolveTopicPalaces(topicKey, chart);
  const baseIndexes = new Set(basePalaces.map((palace) => palace.index));
  const periodIndex = context?.periodPalace?.index;
  const networkPalaces = topicNetworkPalaces(topicKey, chart, context);
  const evaluations = networkPalaces.map((palace) => {
    const evaluation = evaluatePalace(palace, periodStarsAt(context, palace.index));
    const weight = baseIndexes.has(palace.index)
      ? 1
      : palace.index === periodIndex
        ? 0.48
        : 0.36;
    return { ...evaluation, weight };
  });

  return {
    basePalaces,
    networkPalaces,
    evaluations,
    baseEvaluations: evaluations.filter((item) => baseIndexes.has(item.palace.index)),
    supportStars: cleanReadingStarNames(evaluations.flatMap((item) => item.helpful), 8),
    pressureStars: cleanReadingStarNames(evaluations.flatMap((item) => item.challenges), 8),
    flowerStars: cleanReadingStarNames(evaluations.flatMap((item) => item.flowers), 5),
    score: evaluations.reduce((sum, item) => sum + item.score * item.weight, 0),
  };
}

function palaceListText(palaces, limit = 8) {
  const names = uniqueItems((palaces || []).map((palace) => normalizePalaceName(palace.name || "")));
  return names.length ? names.slice(0, limit).join("、") : "未取得";
}

function getBaziTenGodRecords(chart) {
  const pillars = chart.pillars || [];
  const dayStem = splitPillar(pillars[2] || "").stem;
  return pillars.flatMap((pillar, index) => {
    const { stem, branch } = splitPillar(pillar);
    const stemGod = index === 2 ? "日主" : getTenGod(dayStem, stem);
    const hiddenGods = getHiddenStemGods(dayStem, branch);
    return [
      stemGod ? { pillar: PILLAR_NAMES[index], stem, branch, god: stemGod, source: "天干" } : null,
      ...hiddenGods.map(({ stem: hiddenStem, god }) => ({
        pillar: PILLAR_NAMES[index],
        stem: hiddenStem,
        branch,
        god,
        source: "藏干",
      })),
    ].filter(Boolean);
  });
}

function tenGodCounts(chart) {
  const counts = {};
  getBaziTenGodRecords(chart).forEach(({ god }) => {
    counts[god] = (counts[god] || 0) + 1;
  });
  return counts;
}

function godCountText(counts, gods) {
  return gods.map((god) => `${god}${counts[god] || 0}`).join("、");
}

function baziTopicAnalysis(topicKey, chart, topic) {
  const counts = tenGodCounts(chart);
  const element = elementInsight(chart.elementCounts, topic);
  const wealthText = `正財看穩定收入與可控資產，偏財看投資、業務、外部機會與非固定收入；本盤${godCountText(counts, ["正財", "偏財"])}，食傷生財訊號為${godCountText(counts, ["食神", "傷官"])}。`;
  const outputText = (counts["食神"] || 0) + (counts["傷官"] || 0) > 0
    ? "有食傷時，偏財運較適合靠技能輸出、內容、業務表達或資訊差轉成機會。"
    : "食傷不明顯時，偏財不宜靠衝動追價，較適合用紀律、資料與長期規劃承接。";
  const map = {
    property: `${wealthText}偏財運重點不是只看有沒有偏財，而是偏財能否被食傷啟動、又能否回到正財與田宅形成可留住的資產。${outputText}${element.text}`,
    career: `八字事業看官殺的責任壓力、印星的學習證照、食傷的輸出表達與財星的資源變現；本盤${godCountText(counts, ["正官", "七殺", "正印", "偏印", "食神", "傷官"])}。${element.text}`,
    marriage: `八字姻緣看伴侶星與日主互動；女命重看正官、七殺，男命重看正財、偏財，再輔看食傷的相處表達與印星的安全感。本盤${godCountText(counts, ["正官", "七殺", "正財", "偏財", "食神", "傷官"])}。${element.text}`,
    children: `八字子女看食神、傷官，也看印星是否過重而壓住表達。本盤${godCountText(counts, ["食神", "傷官", "正印", "偏印"])}；食傷越能流通，越利於子女、作品、晚輩緣與創造力。${element.text}`,
  };

  return {
    text: map[topicKey] || element.text,
    element,
    counts,
    tags: uniqueItems([
      `正財${counts["正財"] || 0}`,
      `偏財${counts["偏財"] || 0}`,
      `食神${counts["食神"] || 0}`,
      `傷官${counts["傷官"] || 0}`,
      `五行偏強：${element.dominant}`,
    ]),
  };
}

function ziweiTopicAnalysis(topicKey, chart, context, network) {
  const topic = TOPIC_CONFIG[topicKey];
  const primary = network.baseEvaluations[0] || network.evaluations[0];
  const primaryStory = primary ? palaceOverviewReading(primary.palace, chart.astrolabe).text : "主宮資料不足，需要以三方四正與八字補看。";
  const squarePalaces = primary ? sanfangSizhengPalaces(chart.astrolabe, primary.palace) : [];
  const support = network.supportStars.length ? `助力星見${network.supportStars.slice(0, 5).join("、")}。` : "助力星不算集中。";
  const pressure = network.pressureStars.length ? `壓力星見${network.pressureStars.slice(0, 5).join("、")}，要留意延誤、衝突或資源消耗。` : "煞忌壓力不重。";
  const flower = network.flowerStars.length ? `桃花/人氣訊號有${network.flowerStars.join("、")}。` : "";
  const period = context.periodPalace
    ? `${context.periodName}落${palaceLabel(context.periodPalace)}，會把當期事件焦點帶進判斷。`
    : "目前未取得流運宮位，先以原局網絡判斷。";
  const property = topicKey === "property" ? propertyAffinityText(chart, context) : "";
  const career = topicKey === "career" ? careerFitText(chart, context) : "";

  return [
    `紫微斗數以${topic.label}主宮為起點，但不單看一宮；本次同時納入${palaceListText(network.networkPalaces)}，並以${primary ? normalizePalaceName(primary.palace.name) : "主宮"}的三方四正${palaceListText(squarePalaces)}確認成局。`,
    primary ? describePalaceEvaluation(primary) + "。" : "",
    primaryStory,
    support,
    pressure,
    flower,
    property,
    career,
    period,
  ].filter(Boolean).join(" ");
}

function integratedTopicSummary(topicKey, chart, context, network, bazi) {
  const topic = TOPIC_CONFIG[topicKey];
  const ziweiTone = scoreTone(network.score + bazi.element.score);
  const causePalace = getCausePalace(chart.astrolabe);
  const cause = causePalace ? `來因宮${palaceLabel(causePalace)}指出事件入口常從${palaceKey(causePalace.name)}議題被觸發。` : "";
  const wealth = topicKey === "property"
    ? `財富綜合看，紫微若財帛、田宅、官祿能串起來，八字又見偏財或食傷生財，偏財運才比較適合主動操作；若只見偏財而承接宮位不穩，投資與副業要先控風險。`
    : "";
  return `${topic.label}綜合統整：${ziweiTone}。紫微斗數看事件落在哪些宮位互相牽動，八字看日主能否承接同一件事；兩邊合看後，重點是先用三方四正確認資源來源與壓力出口，再用八字五行與十神決定行動方式。${cause}${wealth}${topicAdvice(topicKey)}`;
}

function peachBlossomBranchFor(branch) {
  const value = toTraditional(branch);
  if (["申", "子", "辰"].includes(value)) return "酉";
  if (["寅", "午", "戌"].includes(value)) return "卯";
  if (["巳", "酉", "丑"].includes(value)) return "午";
  if (["亥", "卯", "未"].includes(value)) return "子";
  return "";
}

function baziPeachBlossomSignals(chart) {
  const pillars = chart.pillars || [];
  const branches = pillars.map((pillar, index) => ({
    label: PILLAR_NAMES[index],
    branch: splitPillar(pillar).branch,
  }));
  const references = [
    { label: "年支", branch: branches[0]?.branch },
    { label: "日支", branch: branches[2]?.branch },
  ].map((item) => ({ ...item, peachBranch: peachBlossomBranchFor(item.branch) }));

  return references
    .filter((item) => item.peachBranch && branches.some((branchItem) => branchItem.branch === item.peachBranch))
    .map((item) => {
      const hitPillars = branches
        .filter((branchItem) => branchItem.branch === item.peachBranch)
        .map((branchItem) => branchItem.label)
        .join("、");
      return `${item.label}${item.branch}起桃花在${item.peachBranch}，四柱見於${hitPillars}`;
    });
}

function palacePeachSignals(palace) {
  const names = palaceStarNames(palace);
  const peachKeywords = ["紅鸞", "天喜", "天姚", "咸池", "貪狼", "廉貞", "文曲", "沐浴"];
  return names.filter((name) => peachKeywords.some((keyword) => name.includes(keyword)));
}

function nativePeachBlossomAnalysis(chart, network) {
  const astrolabe = chart.astrolabe;
  const focusPalaces = uniquePalaces([
    getLifePalace(astrolabe),
    findPalaceByName(astrolabe, "夫妻宮"),
    findPalaceByName(astrolabe, "福德宮"),
    findPalaceByName(astrolabe, "遷移宮"),
    findPalaceByName(astrolabe, "僕役宮"),
    findPalaceByName(astrolabe, "官祿宮"),
  ]);
  const palaceSignals = uniqueItems(focusPalaces.flatMap(palacePeachSignals));
  const baziSignals = baziPeachBlossomSignals(chart);
  const pressureSignals = uniqueItems(focusPalaces.flatMap((palace) => palaceStarNames(palace)).filter((name) => (
    ["孤辰", "寡宿", "地空", "地劫", "天空", "旬空", "截空", "化忌"].some((keyword) => name.includes(keyword))
  )));
  const strongStars = palaceSignals.filter((name) => ["紅鸞", "天喜", "天姚", "咸池"].some((keyword) => name.includes(keyword)));
  const score = strongStars.length * 1.6
    + Math.max(0, palaceSignals.length - strongStars.length) * 0.9
    + baziSignals.length * 1.3
    + network.flowerStars.length * 1.1
    - Math.min(pressureSignals.length * 0.45, 1.8);
  const level = score >= 5 ? "桃花旺" : score >= 2.5 ? "桃花中等" : "桃花偏慢熱";
  const palaceText = palaceSignals.length
    ? `紫微斗數在${palaceListText(focusPalaces, 6)}見${palaceSignals.slice(0, 8).join("、")}，代表命主有被注意、被邀約或因社交場景啟動感情的條件。`
    : `紫微斗數在${palaceListText(focusPalaces, 6)}未見桃花星特別集中，命主的桃花較需要靠環境、形象經營與主動互動催動。`;
  const baziText = baziSignals.length
    ? `八字桃花訊號為${baziSignals.join("；")}。`
    : "八字年支、日支桃花未明顯入四柱，桃花較不屬於自動被追求型。";
  const pressureText = pressureSignals.length
    ? `但${pressureSignals.slice(0, 5).join("、")}也會帶來距離感、落空感或關係反覆，需要避免只停在曖昧與想像。`
    : "阻隔桃花的孤空訊號不算集中，重點在是否願意進入人群與建立互動。";
  const lifestyleWarning = level === "桃花旺"
    ? "提醒：桃花旺代表吸引力與緣分入口較強，但如果命主生活模式長期兩點一線、沒有社交、沒有曝光、沒有新圈層，桃花旺也不會顯著，容易變成只有內在條件、沒有實際對象。"
    : "";

  return {
    level,
    text: `命主桃花分析：${level}。${palaceText}${baziText}${pressureText}${lifestyleWarning}`,
    tags: [`命主桃花：${level}`, ...palaceSignals.slice(0, 3)],
  };
}

function buildYearContext(chart, year) {
  const horoscope = getHoroscopeSafe(chart.astrolabe, `${year}-01-01`);
  const periodIndex = horoscope?.yearly?.index ?? null;
  return {
    scope: "yearly",
    targetYear: year,
    targetMonth: 1,
    horoscope,
    periodIndex,
    periodName: `${year} 流年`,
    periodPalace: Number.isInteger(periodIndex) ? chart.astrolabe.palaces[periodIndex] : null,
  };
}

function timelineRecords(topicKey, chart, span = 12) {
  const topic = TOPIC_CONFIG[topicKey];
  const startYear = new Date().getFullYear();
  return Array.from({ length: span }, (_, offset) => {
    const year = startYear + offset;
    const context = buildYearContext(chart, year);
    const network = evaluateTopicNetwork(topicKey, chart, context);
    const bazi = baziTopicAnalysis(topicKey, chart, topic);
    const starNames = uniqueItems(network.evaluations.flatMap((item) => item.stars.flatMap((star) => [
      starPlainName(star),
      starReadingDisplayName(star),
    ])));
    return {
      year,
      age: year - chart.formValues.year + 1,
      context,
      network,
      bazi,
      starNames,
      score: network.score + bazi.element.score,
    };
  });
}

function periodHits(record, palaceNames) {
  const key = palaceKey(record.context.periodPalace?.name || "");
  return palaceNames.some((name) => palaceKey(name) === key);
}

function starHits(record, keywords) {
  return keywords.reduce((count, keyword) => (
    count + (record.starNames.some((name) => name.includes(keyword)) ? 1 : 0)
  ), 0);
}

function pickTimelineRecord(records, scoreFn, usedYears = []) {
  const used = new Set(usedYears);
  const ranked = records
    .map((record) => ({ record, score: scoreFn(record) }))
    .sort((a, b) => b.score - a.score);
  return (ranked.find((item) => !used.has(item.record.year)) || ranked[0])?.record || records[0];
}

function timelineReason(record, text) {
  const palace = record.context.periodPalace ? `流年走到${palaceLabel(record.context.periodPalace)}` : "流年宮位未取得";
  return `${palace}，${text}`;
}

function timelineEntry(label, record, text) {
  return {
    label,
    year: record.year,
    age: record.age,
    text: timelineReason(record, text),
  };
}

function childGenderSymbol(chart) {
  const childPalace = findPalaceByName(chart.astrolabe, "子女宮");
  if (!childPalace) return "子女性別象意：目前未取得子女宮資料。";
  const branch = toTraditional(childPalace.earthlyBranch || "");
  const yinYang = BRANCH_YINYANG[branch] || "";
  const names = palaceStarNames(childPalace);
  let lean = yinYang === "陽" ? "男孩象較明顯" : "女孩象較明顯";
  if (namesIncludeAny(names, ["太陽", "武曲", "七殺", "天梁"])) lean = "男孩象較明顯";
  if (namesIncludeAny(names, ["太陰", "天同", "紅鸞", "天喜", "天姚", "咸池"])) lean = "女孩象較明顯";
  return `子女性別象意：${lean}；此為命理象意傾向，不作現實保證。`;
}

function buildTopicTimeline(topicKey, chart) {
  const records = timelineRecords(topicKey, chart);
  const usedYears = [];
  const pick = (scoreFn) => {
    const record = pickTimelineRecord(records, scoreFn, usedYears);
    usedYears.push(record.year);
    return record;
  };
  const items = [];
  let note = "時間軸以未來十二年流年宮位、主題宮位三方四正、來因宮與八字十神共同推估。";

  if (topicKey === "marriage") {
    const meet = pick((record) => record.score
      + record.network.flowerStars.length * 1.4
      + (periodHits(record, ["夫妻宮", "遷移宮", "福德宮"]) ? 2.4 : 0)
      + starHits(record, ["紅鸞", "天喜", "天姚", "咸池", "天馬"]) * 0.7
      - record.network.pressureStars.length * 0.35);
    const marry = pick((record) => record.score
      + (periodHits(record, ["夫妻宮", "田宅宮", "福德宮", "命宮"]) ? 2.2 : 0)
      + starHits(record, ["紅鸞", "天喜", "祿存", "天府", "太陰"]) * 0.65
      - record.network.pressureStars.length * 0.45);
    const commit = pick((record) => record.score
      + (periodHits(record, ["夫妻宮", "官祿宮", "父母宮"]) ? 1.8 : 0)
      + starHits(record, ["化科", "化祿", "天魁", "天鉞", "左輔", "右弼"]) * 0.55);
    items.push(
      timelineEntry("遇到正緣", meet, "夫妻、遷移、福德與桃花星的牽動較明顯，適合多出現在外部場域與社交場合。"),
      timelineEntry("關係穩定", commit, "關係較容易從互動走向明確承諾，適合談清楚期待、距離、工作與家庭節奏。"),
      timelineEntry("適合結婚", marry, "夫妻宮與田宅/福德的承接較好，較適合把關係落到生活安排與正式承諾。"),
    );
  } else if (topicKey === "children") {
    const child = pick((record) => record.score
      + (periodHits(record, ["子女宮", "田宅宮", "福德宮"]) ? 2.4 : 0)
      + starHits(record, ["天喜", "紅鸞", "天同", "太陰", "天府", "左輔", "右弼"]) * 0.7
      - record.network.pressureStars.length * 0.35);
    const prepare = pick((record) => record.score
      + (periodHits(record, ["田宅宮", "福德宮", "夫妻宮"]) ? 1.9 : 0)
      + starHits(record, ["天府", "太陰", "祿存", "化祿", "天魁", "天鉞"]) * 0.55);
    const pressure = pick((record) => -record.score
      + record.network.pressureStars.length * 1.1
      + (periodHits(record, ["疾厄宮", "子女宮"]) ? 1.5 : 0));
    items.push(
      timelineEntry("備孕與家庭準備", prepare, "田宅、福德、夫妻的承接較適合先整理生活、住處、照顧分工與資源。"),
      timelineEntry("子女緣較明顯", child, "子女宮與家庭承載宮位被流年帶動，較容易出現懷孕、生育、照顧或晚輩相關事件。"),
      timelineEntry("照顧壓力較高", pressure, "子女或疾厄相關壓力較明顯，適合先處理作息、健康檢查與支援系統。"),
    );
    note = childGenderSymbol(chart);
  } else if (topicKey === "career") {
    const change = pick((record) => record.score
      + (periodHits(record, ["官祿宮", "遷移宮", "命宮"]) ? 2.2 : 0)
      + starHits(record, ["天馬", "七殺", "破軍", "擎羊", "陀羅", "化權"]) * 0.7);
    const best = pick((record) => record.score
      + (periodHits(record, ["官祿宮", "遷移宮", "財帛宮", "父母宮"]) ? 2.1 : 0)
      + starHits(record, ["化祿", "化科", "祿存", "天魁", "天鉞", "左輔", "右弼"]) * 0.8
      - record.network.pressureStars.length * 0.25);
    const promote = pick((record) => record.score
      + (periodHits(record, ["官祿宮", "父母宮", "命宮"]) ? 1.8 : 0)
      + starHits(record, ["紫微", "天府", "天相", "太陽", "化權", "化科"]) * 0.65);
    items.push(
      timelineEntry("換工作/轉職", change, "官祿、遷移或命宮被啟動，變動星也較明顯，適合評估轉職、換團隊或跨區域機會。"),
      timelineEntry("升遷與能見度", promote, "官祿與制度資源較能接上，適合爭取職位、負責大型專案或建立專業名聲。"),
      timelineEntry("事業機會最好", best, "貴人、祿科與外部舞台較有支撐，是比較適合主動投履歷、談合作或擴大版圖的窗口。"),
    );
  } else {
    const windfall = pick((record) => record.score
      + (record.bazi.counts["偏財"] || 0) * 0.55
      + ((record.bazi.counts["食神"] || 0) + (record.bazi.counts["傷官"] || 0)) * 0.35
      + (periodHits(record, ["財帛宮", "遷移宮", "官祿宮"]) ? 2.1 : 0)
      + starHits(record, ["化祿", "祿存", "天馬", "貪狼", "武曲"]) * 0.7);
    const property = pick((record) => record.score
      + (periodHits(record, ["田宅宮", "財帛宮", "官祿宮"]) ? 2.4 : 0)
      + starHits(record, ["太陰", "天府", "祿存", "武曲", "化祿"]) * 0.8
      - record.network.pressureStars.length * 0.3);
    const cautious = pick((record) => -record.score
      + record.network.pressureStars.length * 1.2
      + starHits(record, ["地空", "地劫", "大耗", "化忌", "擎羊", "陀羅"]) * 0.8);
    items.push(
      timelineEntry("偏財/副業窗口", windfall, "偏財、食傷生財與財帛/遷移/官祿牽動較明顯，適合嘗試副業、業務、投資研究或外部機會。"),
      timelineEntry("資產/房產窗口", property, "田宅、財帛與官祿承接較好，適合規劃買房、換屋、長期資產配置或現金流整理。"),
      timelineEntry("保守控風險", cautious, "耗損、空劫或忌煞訊號較高，投資與借貸要降低槓桿，先守住現金流。"),
    );
  }

  return {
    items: items.sort((a, b) => a.year - b.year || a.age - b.age || a.label.localeCompare(b.label, "zh-Hant")),
    note,
  };
}

function renderTopicTimeline(topicKey, chart) {
  const timeline = buildTopicTimeline(topicKey, chart);
  return `
    <section class="reading-timeline">
      <h4>時間軸</h4>
      <div class="timeline-list">
        ${timeline.items.map((item) => `
          <article class="timeline-item">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(String(item.year))}<small>約${escapeHtml(String(item.age))}歲</small></strong>
            <p>${escapeHtml(item.text)}</p>
          </article>
        `).join("")}
      </div>
      <p class="timeline-note">${escapeHtml(timeline.note)}</p>
    </section>
  `;
}

function timelinePlainText(topicKey, chart) {
  const timeline = buildTopicTimeline(topicKey, chart);
  return timeline.items
    .map((item) => `${item.label}：${item.year}年約${item.age}歲，${item.text}`)
    .concat(timeline.note)
    .join(" ");
}

function propertyAffinityText(chart, context) {
  const propertyPalace = findPalaceByName(chart.astrolabe, "田宅宮");
  const wealthPalace = findPalaceByName(chart.astrolabe, "財帛宮");
  const careerPalace = findPalaceByName(chart.astrolabe, "官祿宮");
  if (!propertyPalace) return "房產緣：目前未取得田宅宮資料，無法判定房產承載力。";

  const propertyEvaluation = evaluatePalace(propertyPalace, periodStarsAt(context, propertyPalace.index));
  const wealthEvaluation = wealthPalace ? evaluatePalace(wealthPalace, periodStarsAt(context, wealthPalace.index)) : null;
  const careerEvaluation = careerPalace ? evaluatePalace(careerPalace, periodStarsAt(context, careerPalace.index)) : null;
  const supportScore = propertyEvaluation.score
    + (wealthEvaluation?.score || 0) * 0.35
    + (careerEvaluation?.score || 0) * 0.25;
  const tone = supportScore >= 5
    ? "房產緣偏強，較有機會透過穩定收入、家庭資源或長期配置累積不動產"
    : supportScore >= 1.5
      ? "有房產緣，但需要現金流、貸款節奏與持有成本配合"
      : "房產緣較慢熱，適合先累積資金與信用條件，避免被短期價格或人情壓力推著買";
  const propertyStars = summarizeReadingStarNames(allPalaceStars(propertyPalace), "田宅宮星曜不集中");
  const challengeStars = cleanReadingStarNames(propertyEvaluation.challenges, 4);
  const challenge = challengeStars.length
    ? `田宅宮壓力點見${challengeStars.join("、")}，要留意修繕、搬遷、合約或資金消耗。`
    : "田宅宮煞忌壓力不重，較能用規劃與耐心處理資產。";

  return `房產緣：${tone}。田宅宮為${palaceLabel(propertyPalace)}，星曜為${propertyStars}。${challenge}`;
}

function careerFitText(chart, context) {
  const careerPalace = findPalaceByName(chart.astrolabe, "官祿宮");
  if (!careerPalace) return "";

  const starNames = palaceStarNames(careerPalace);
  const suitable = [];
  const branchElement = ZHI_ELEMENT[careerPalace.earthlyBranch] || "";

  if (namesIncludeAny(starNames, ["天機", "文昌", "文曲"])) {
    suitable.push("科技產品、資料分析、顧問、研究、教育訓練、企劃");
  }
  if (namesIncludeAny(starNames, ["太陽"])) {
    suitable.push("管理職、公眾服務、品牌行銷、外勤、需要曝光與承擔的工作");
  }
  if (namesIncludeAny(starNames, ["武曲", "祿存"])) {
    suitable.push("金融、投資、工程、營運、制度管理、成本控管");
  }
  if (namesIncludeAny(starNames, ["天府", "紫微", "天相"])) {
    suitable.push("大型組織、行政管理、政府機構、資源整合、專案統籌");
  }
  if (namesIncludeAny(starNames, ["廉貞", "巨門"])) {
    suitable.push("法務、稽核、公關、談判、媒體、策略、審美設計");
  }
  if (namesIncludeAny(starNames, ["貪狼", "紅鸞", "天喜", "天姚", "咸池"])) {
    suitable.push("業務開發、娛樂美學、內容行銷、餐旅社交、客戶經營");
  }
  if (namesIncludeAny(starNames, ["七殺", "破軍", "天馬"])) {
    suitable.push("新創、專案開拓、工程現場、危機處理、旅運物流、跨城市工作");
  }
  if (namesIncludeAny(starNames, ["天梁", "天魁", "天鉞"])) {
    suitable.push("醫療照護、教育顧問、專業證照、公益服務、風險把關");
  }

  if (!suitable.length) {
    if (branchElement === "木") suitable.push("企劃、教育、顧問、產品成長、需要規劃與培養的工作");
    if (branchElement === "火") suitable.push("行銷、表達、內容、品牌、需要曝光與速度的工作");
    if (branchElement === "土") suitable.push("營運、專案管理、不動產、資產管理、需要穩定承載的工作");
    if (branchElement === "金") suitable.push("金融、法務、工程、制度、品質管理、需要規則與決斷的工作");
    if (branchElement === "水") suitable.push("研究、協調、心理諮詢、旅運貿易、需要流動與應變的工作");
  }

  return `職業適配：命主較適合${uniqueItems(suitable).slice(0, 5).join("、")}。`;
}

function palaceStarNames(palace) {
  return uniqueItems([
    ...(palace?.majorStars || []).map(starDisplayName),
    ...(palace?.minorStars || []).map(starDisplayName),
    ...(palace?.adjectiveStars || []).map(starDisplayName),
    ...palaceAuxiliaryNames(palace),
  ]);
}

function namesIncludeAny(names, keywords) {
  return keywords.some((keyword) => names.some((name) => name.includes(keyword)));
}

function inferPartnerCareers(starNames, spousePalace) {
  const careers = [];
  PARTNER_CAREER_RULES.forEach(([keywords, options]) => {
    if (namesIncludeAny(starNames, keywords)) {
      careers.push(...options);
    }
  });

  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "";
  if (branchElement === "木") careers.push("企劃、教育、顧問、產品成長相關");
  if (branchElement === "火") careers.push("行銷、公眾表達、內容、表演或曝光型工作");
  if (branchElement === "土") careers.push("不動產、營運、專案管理、資產管理");
  if (branchElement === "金") careers.push("金融、法務、工程、制度與品質管理");
  if (branchElement === "水") careers.push("研究、跨域協調、心理諮詢、旅運貿易");

  return uniqueItems(careers).slice(0, 5);
}

function inferPartnerAppearance(starNames, spousePalace) {
  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "木";
  const base = {
    "木": {
      build: "修長、四肢比例明顯，動作帶彈性",
      face: "臉型偏長或橢圓，眉眼清秀，氣質年輕",
      avatarClass: "tall",
    },
    "火": {
      build: "偏精瘦或運動型，走路速度快，存在感強",
      face: "眼神亮、表情鮮明，笑起來有記憶點",
      avatarClass: "athletic",
    },
    "土": {
      build: "身形穩、肩背或骨架較有份量",
      face: "臉部線條較厚實，給人可靠、耐看的印象",
      avatarClass: "solid",
    },
    "金": {
      build: "骨架俐落，比例乾淨，穿著偏簡潔",
      face: "輪廓分明，鼻樑、下顎或眉骨較有線條",
      avatarClass: "sharp",
    },
    "水": {
      build: "線條柔和，身形不一定壯但有流動感",
      face: "眼神柔、膚質或氣色較細膩，容易有親近感",
      avatarClass: "soft",
    },
  }[branchElement];
  const notes = [];

  if (namesIncludeAny(starNames, ["天機"])) notes.push("天機使外型更顯機靈、敏捷，眼神與肢體反應快。");
  if (namesIncludeAny(starNames, ["巨門"])) notes.push("巨門強化口條與嘴部表情，聲音、說話方式容易成為辨識點。");
  if (namesIncludeAny(starNames, ["太陽"])) notes.push("太陽使氣場較明朗，五官或笑容比較外放。");
  if (namesIncludeAny(starNames, ["太陰"])) notes.push("太陰使外貌偏柔和、乾淨，氣質較安靜細緻。");
  if (namesIncludeAny(starNames, ["武曲", "七殺", "破軍"])) notes.push("武殺破系會讓身形更俐落，骨架或肌肉感較明顯。");
  if (namesIncludeAny(starNames, ["紅鸞", "天喜", "天姚", "咸池"])) notes.push("桃花星使打扮、親和力或吸引力更容易被注意。");
  if (namesIncludeAny(starNames, ["擎羊", "陀羅", "火星", "鈴星"])) notes.push("煞星入參考時，外型可能帶銳利、冷感或高壓工作的痕跡。");

  return {
    ...base,
    element: branchElement,
    notes,
  };
}

function partnerTargetGender(chart) {
  return chart.formValues.gender === "女" ? "男性" : "女性";
}

function compactQuery(value) {
  return String(value)
    .replace(/[，。；、]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPartnerProfile(chart) {
  const astrolabe = chart.astrolabe;
  const spousePalace = findPalaceByName(astrolabe, "夫妻宮");
  const travelPalace = findPalaceByName(astrolabe, "遷移宮");
  const fortunePalace = findPalaceByName(astrolabe, "福德宮");
  const lifePalace = getLifePalace(astrolabe);
  const careerPalace = findPalaceByName(astrolabe, "官祿宮");
  const wealthPalace = findPalaceByName(astrolabe, "財帛宮");
  const causePalace = getCausePalace(astrolabe);
  const spouseSquarePalaces = sanfangSizhengPalaces(astrolabe, spousePalace);
  const focusPalaces = uniquePalaces([
    spousePalace,
    ...spouseSquarePalaces,
    travelPalace,
    fortunePalace,
    lifePalace,
    careerPalace,
    wealthPalace,
    causePalace,
  ]);
  const spouseStars = palaceStarNames(spousePalace);
  const supportStars = uniqueItems([
    ...spouseStars,
    ...spouseSquarePalaces.flatMap((palace) => palaceStarNames(palace)).slice(0, 12),
    ...palaceStarNames(travelPalace).slice(0, 4),
    ...palaceStarNames(fortunePalace).slice(0, 4),
    ...palaceStarNames(lifePalace).slice(0, 3),
    ...palaceStarNames(careerPalace).slice(0, 4),
    ...palaceStarNames(wealthPalace).slice(0, 3),
    ...palaceStarNames(causePalace).slice(0, 3),
  ]);
  const careers = inferPartnerCareers(supportStars, careerPalace || spousePalace);
  const appearance = inferPartnerAppearance(supportStars, spousePalace);
  const spouseEvaluation = spousePalace ? evaluatePalace(spousePalace) : null;
  const spouseMain = summarizeStarNames(spousePalace?.majorStars || [], "夫妻宮主星不明顯");
  const meeting = [];

  if (spousePalace) meeting.push(`夫妻宮三方四正為${palaceListText(spouseSquarePalaces)}，用來看正緣本質、對宮投射、關係資源與成局條件。`);
  if (travelPalace) meeting.push(`遷移宮${palaceLabel(travelPalace)}，正緣較可能透過外部場域、跨城市移動、工作曝光或朋友圈延伸出現。`);
  if (causePalace) meeting.push(`來因宮${palaceLabel(causePalace)}，關係課題容易牽動${palaceKey(causePalace.name)}相關場景。`);
  if (fortunePalace) meeting.push(`福德宮${palaceLabel(fortunePalace)}可看相處舒服度，星曜為${summarizeStarNames(allPalaceStars(fortunePalace), "無主星，以神煞與對宮輔看")}。`);
  if (careerPalace) meeting.push(`官祿宮${palaceLabel(careerPalace)}輔助推估對方職業型態與社會角色。`);
  if (lifePalace) meeting.push(`命宮${palaceLabel(lifePalace)}用來看命主會被哪種氣質吸引，也會修正正緣輪廓。`);

  return {
    spousePalace,
    spouseSquarePalaces,
    focusPalaces,
    travelPalace,
    fortunePalace,
    lifePalace,
    careerPalace,
    wealthPalace,
    causePalace,
    spouseStars,
    supportStars,
    careers,
    appearance,
    spouseEvaluation,
    spouseMain,
    meeting,
  };
}

function hashText(value) {
  return [...String(value)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function partnerPalette(profile) {
  const seed = hashText(profile.supportStars.join("")) + partnerRenderSalt;
  const palettes = [
    { bg1: "#dfece6", bg2: "#f8f1df", hair: "#2f2b27", outfit: "#186b5a", accent: "#b98731" },
    { bg1: "#e9e3f1", bg2: "#f7efe4", hair: "#3a2d32", outfit: "#315f8d", accent: "#b23a2e" },
    { bg1: "#eef0e5", bg2: "#f3e4dc", hair: "#222927", outfit: "#704f7a", accent: "#186b5a" },
    { bg1: "#e5edf3", bg2: "#f3ecda", hair: "#362b25", outfit: "#8a4f35", accent: "#315f8d" },
  ];
  return palettes[seed % palettes.length];
}

function buildPartnerPortraitSvg(chart, profile) {
  const palette = partnerPalette(profile);
  const targetGender = partnerTargetGender(chart);
  const avatar = profile.appearance.avatarClass;
  const faceWidth = avatar === "tall" ? 88 : avatar === "sharp" ? 94 : avatar === "solid" ? 118 : 106;
  const shoulderWidth = avatar === "solid" ? 224 : avatar === "athletic" ? 210 : avatar === "tall" ? 168 : 190;
  const faceShape = avatar === "sharp" ? "M153 109 C158 66 202 60 217 109 C229 153 207 187 185 191 C162 187 140 153 153 109Z" : "M150 110 C150 72 220 72 220 110 C220 160 204 190 185 190 C166 190 150 160 150 110Z";
  const mouth = namesIncludeAny(profile.supportStars, ["太陽", "紅鸞", "天喜", "天姚"]) ? "M174 161 Q185 169 196 161" : "M176 163 Q185 166 194 163";
  const eyeY = namesIncludeAny(profile.supportStars, ["天機", "巨門"]) ? 126 : 130;
  const hairPath = targetGender === "男性"
    ? `M139 112 C136 72 162 52 188 54 C220 56 236 81 226 119 C211 101 181 94 139 112Z`
    : `M132 121 C128 72 160 46 190 48 C226 50 244 83 235 136 C223 112 203 94 160 102 C146 108 138 115 132 121Z`;
  const career = profile.careers[0] || "專業人士";
  const title = `${targetGender}・${career}`;
  const subtitle = `${profile.appearance.face}｜${profile.appearance.build}`;

  return `
    <svg class="partner-generated-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 500" role="img" aria-label="正緣概念肖像">
      <defs>
        <linearGradient id="portrait-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.bg1}" />
          <stop offset="100%" stop-color="${palette.bg2}" />
        </linearGradient>
        <linearGradient id="portrait-cloth" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.outfit}" />
          <stop offset="100%" stop-color="${palette.accent}" />
        </linearGradient>
      </defs>
      <rect width="370" height="500" rx="26" fill="url(#portrait-bg)" />
      <circle cx="74" cy="72" r="34" fill="${palette.accent}" opacity="0.18" />
      <circle cx="305" cy="120" r="54" fill="${palette.outfit}" opacity="0.12" />
      <path d="M${185 - shoulderWidth / 2} 322 C${185 - shoulderWidth / 2 + 20} 260 ${185 + shoulderWidth / 2 - 20} 260 ${185 + shoulderWidth / 2} 322 L${185 + shoulderWidth / 2 + 18} 430 L${185 - shoulderWidth / 2 - 18} 430Z" fill="url(#portrait-cloth)" />
      <path d="M162 260 C166 292 204 292 208 260 L205 222 L165 222Z" fill="#dfb995" />
      <path d="${hairPath}" fill="${palette.hair}" />
      <path d="${faceShape}" fill="#edc9a8" />
      <path d="M${185 - faceWidth / 2} 111 C160 88 209 88 ${185 + faceWidth / 2} 111" fill="none" stroke="${palette.hair}" stroke-width="18" stroke-linecap="round" />
      <circle cx="170" cy="${eyeY}" r="4" fill="#222927" />
      <circle cx="200" cy="${eyeY}" r="4" fill="#222927" />
      <path d="M185 135 C180 145 181 151 187 153" fill="none" stroke="#b98a69" stroke-width="3" stroke-linecap="round" />
      <path d="${mouth}" fill="none" stroke="#9c5149" stroke-width="4" stroke-linecap="round" />
      <path d="M143 330 C165 350 205 350 227 330" fill="none" stroke="#fffdf7" stroke-width="10" opacity="0.46" stroke-linecap="round" />
      <rect x="32" y="394" width="306" height="72" rx="16" fill="#fffdf7" opacity="0.88" />
      <text x="52" y="424" fill="#1f2523" font-size="18" font-weight="800">${escapeHtml(title.slice(0, 18))}</text>
      <text x="52" y="449" fill="#66716c" font-size="12">${escapeHtml(subtitle.slice(0, 30))}</text>
    </svg>
  `;
}

function partnerImageEndpointAvailable() {
  return window.location.protocol !== "file:";
}

function buildPartnerImagePayload(chart, profile) {
  return {
    targetGender: partnerTargetGender(chart),
    school: ASTRO_SCHOOL_LABEL,
    careers: profile.careers.slice(0, 4),
    appearance: {
      face: profile.appearance.face,
      build: profile.appearance.build,
      element: profile.appearance.element,
      notes: profile.appearance.notes.slice(0, 6),
    },
    palaces: {
      spouse: palaceLabel(profile.spousePalace),
      spouseSquare: palaceListText(profile.spouseSquarePalaces),
      travel: palaceLabel(profile.travelPalace),
      fortune: palaceLabel(profile.fortunePalace),
      life: palaceLabel(profile.lifePalace),
      career: palaceLabel(profile.careerPalace),
      wealth: palaceLabel(profile.wealthPalace),
      cause: palaceLabel(profile.causePalace),
    },
    stars: profile.supportStars.slice(0, 16),
    reasons: profile.meeting.slice(0, 7),
  };
}

function renderPartnerImageStatus() {
  if (!partnerImageState.message) return "";
  const statusClass = ["loading", "ready", "error"].includes(partnerImageState.status)
    ? partnerImageState.status
    : "idle";
  return `<p class="ai-image-status ${statusClass}">${escapeHtml(partnerImageState.message)}</p>`;
}

function renderPartnerVisual(chart, profile) {
  const hasAiImage = Boolean(partnerImageState.imageUrl);
  const isLoading = partnerImageState.status === "loading";
  const visual = hasAiImage
    ? `<img class="partner-ai-image" src="${escapeHtml(partnerImageState.imageUrl)}" alt="AI 生成的正緣輪廓圖片" loading="lazy" />`
    : buildPartnerPortraitSvg(chart, profile);
  const caption = hasAiImage
    ? `由${partnerImageState.provider || "AI 圖像模型"}生成，依夫妻宮三方四正、命宮、遷移、福德、官祿、財帛與來因宮摘要製作。`
    : partnerImageEndpointAvailable()
      ? "按下生成後會由後端呼叫 AI 圖像模型，頁面不會顯示提示詞。"
      : "目前是本機 file 預覽，先顯示概念圖；部署到 Netlify 並設定 API key 後即可生成 AI 圖片。";
  const generateLabel = isLoading
    ? "生成中..."
    : hasAiImage
      ? "重新生成 AI 圖片"
      : "生成 AI 圖片";

  return `
    <div class="generated-portrait-card">
      <p class="eyebrow">${hasAiImage ? "AI Portrait" : "Preview Portrait"}</p>
      ${visual}
      <p class="partner-caption">${escapeHtml(caption)}</p>
      ${renderPartnerImageStatus()}
      <div class="portrait-actions">
        <button type="button" data-generate-ai-partner ${isLoading ? "disabled" : ""}>${escapeHtml(generateLabel)}</button>
        <button type="button" data-download-partner>下載圖片</button>
      </div>
    </div>
  `;
}

function renderPartnerProfile(chart) {
  const profile = buildPartnerProfile(chart);
  chart.partnerProfile = profile;
  const careerText = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中，需以實際互動與工作背景校正";
  const starText = profile.supportStars.slice(0, 8).join("、") || "未見明顯星曜";
  const focusText = palaceListText(profile.focusPalaces, 10);
  const reasons = [
    `以夫妻宮為主，夫妻宮為${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}，但不單看夫妻宮。`,
    `正緣輪廓同時參考${focusText}；本盤參考星曜包含${starText}。`,
    `職業推估以夫妻宮看對象本質，官祿宮看社會角色，遷移宮看出現場域，財帛宮看資源與工作型態。`,
    `外貌身形以夫妻宮地支五行${profile.appearance.element}作底，再用夫妻宮三方四正、主星、桃花與煞曜修正。`,
    ...profile.meeting,
  ];

  partnerOutput.innerHTML = `
    <div class="partner-main">
      <div class="partner-visual">
        ${renderPartnerVisual(chart, profile)}
      </div>
      <div class="partner-copy">
        <div>
          <p class="eyebrow">正緣模擬</p>
          <h3>${escapeHtml(profile.appearance.face)}</h3>
        </div>
        <div class="partner-grid">
          <div class="partner-cell"><span>可能職業</span><strong>${escapeHtml(careerText)}</strong></div>
          <div class="partner-cell"><span>身材輪廓</span><strong>${escapeHtml(profile.appearance.build)}</strong></div>
          <div class="partner-cell"><span>氣質辨識</span><strong>${escapeHtml(profile.appearance.notes[0] || "氣質訊號偏中性，需以實際互動校正。")}</strong></div>
          <div class="partner-cell"><span>參考宮位</span><strong>${escapeHtml(focusText)}</strong></div>
        </div>
        <ul class="partner-list">
          ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          ${profile.appearance.notes.slice(1).map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function palaceChatSummary(palace) {
  if (!palace) return "目前找不到這個宮位。";
  const stars = [
    summarizeStarNames(palace.majorStars || [], "無主星"),
    summarizeStarNames(palace.minorStars || [], ""),
    summarizeStarNames(palace.adjectiveStars || [], ""),
    palaceAuxiliaryNames(palace).join("、"),
  ].filter(Boolean).join("；");
  return `${palaceLabel(palace)}：${stars || "星曜訊號不集中"}。`;
}

function topicFromQuestion(question) {
  const q = question.replace(/\s+/g, "");
  if (/正緣|姻緣|婚|伴侶|另一半|對象/.test(q)) return "marriage";
  if (/子女|小孩|孩子|生育|懷孕|親子|晚輩/.test(q)) return "children";
  if (/事業|工作|職涯|升遷|公司|官祿/.test(q)) return "career";
  if (/財富|財|錢|收入|資產|房|田宅|投資|房地產|不動產/.test(q)) return "property";
  return null;
}

function chatTopicAnswer(topicKey) {
  const topic = TOPIC_CONFIG[topicKey];
  const context = buildPeriodContext(currentChart);
  const network = evaluateTopicNetwork(topicKey, currentChart, context);
  const bazi = baziTopicAnalysis(topicKey, currentChart, topic);
  const ziweiText = ziweiTopicAnalysis(topicKey, currentChart, context, network);
  const integratedText = integratedTopicSummary(topicKey, currentChart, context, network, bazi);
  const peachText = topicKey === "marriage"
    ? nativePeachBlossomAnalysis(currentChart, network).text
    : "";

  return [
    `紫微斗數：${ziweiText}`,
    `八字：${bazi.text}`,
    peachText,
    `綜合統整：${integratedText}`,
    `時間軸：${timelinePlainText(topicKey, currentChart)}`,
  ].filter(Boolean).join(" ");
}

function chatPartnerAnswer() {
  const profile = currentChart.partnerProfile || buildPartnerProfile(currentChart);
  const careers = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中";
  const appearance = `${profile.appearance.build}，${profile.appearance.face}`;
  const notes = profile.appearance.notes.length ? `外貌修正：${profile.appearance.notes.join(" ")}` : "";

  return [
    `正緣以夫妻宮為主，但會合看夫妻宮三方四正與相關宮位：${palaceListText(profile.focusPalaces, 10)}。夫妻宮為${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}。`,
    `可能職業方向：${careers}。`,
    `身材長相模擬：${appearance}。`,
    profile.causePalace ? `來因宮是${palaceLabel(profile.causePalace)}，關係事件常會從${palaceKey(profile.causePalace.name)}議題切入。` : "",
    "正緣輪廓區可按「生成 AI 圖片」，部署到 Netlify 並設定 API key 後會直接回傳圖片；本機預覽會先保留概念圖。",
    notes,
  ].filter(Boolean).join(" ");
}

function chatPalaceAnswer(question) {
  const palaceNames = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "僕役宮", "官祿宮", "田宅宮", "福德宮", "父母宮"];
  const matched = palaceNames.find((name) => question.includes(name.replace("宮", "")) || question.includes(name));
  if (!matched) return "";
  return palaceChatSummary(findPalaceByName(currentChart.astrolabe, matched));
}

function buildBotAnswer(question) {
  if (!currentChart) return "請先輸入出生資料並排盤，我才能用目前命盤回答。";
  const q = question.trim();
  const causePalace = getCausePalace(currentChart.astrolabe);
  const bodyPalace = getBodyPalace(currentChart.astrolabe);
  const context = buildPeriodContext(currentChart);

  if (/正緣|另一半|伴侶|對象|長相|身材|職業/.test(q)) {
    return chatPartnerAnswer();
  }

  if (/來因/.test(q)) {
    return causePalace
      ? `來因宮是${palaceLabel(causePalace)}。判定方式是用生年天干${currentChart.astrolabe.rawDates?.chineseDate?.yearly?.[0] || ""}對照十二宮宮干；解盤時我會把它當作事件入口與原局動機。${palaceChatSummary(causePalace)}`
      : "目前沒有取得來因宮。";
  }

  if (/身宮/.test(q)) {
    return bodyPalace
      ? `身宮是${palaceLabel(bodyPalace)}，代表行動慣性、身體投入感與人生後段更常用力的位置。${palaceChatSummary(bodyPalace)}`
      : "目前沒有取得身宮。";
  }

  if (/大限|流年|流月|今年|本月/.test(q)) {
    return `${context.periodName}目前${context.periodPalace ? `落在${palaceLabel(context.periodPalace)}，` : ""}我會把這個宮位視為當期事件焦點，再疊加你問的主題宮位。`;
  }

  const palaceAnswer = chatPalaceAnswer(q);
  if (palaceAnswer) return palaceAnswer;

  const topicKey = topicFromQuestion(q);
  if (topicKey) return chatTopicAnswer(topicKey);

  return `我會用目前命盤回答：中州派設定、八字五行、命宮/身宮/來因宮、夫妻宮、財帛宮與田宅宮都會納入。這題若要精準一點，可以問「我的正緣長相」、「有沒有房產緣」、「身宮怎麼看」或「來因宮怎麼看」。`;
}

function addChatMessage(text, role = "bot") {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function seedChat() {
  if (chatLog.children.length > 0) return;
  addChatMessage("命盤已載入。你可以問財富、房地產、事業、姻緣、子女、正緣、來因宮、身宮、大限或流年。");
}

function regeneratePartnerPortrait() {
  if (!currentChart) return;
  partnerRenderSalt += 1;
  renderPartnerProfile(currentChart);
}

async function generatePartnerAiImage() {
  if (!currentChart) return;

  if (!partnerImageEndpointAvailable()) {
    partnerImageState = {
      status: "error",
      imageUrl: "",
      provider: "",
      message: "本機 file 預覽無法呼叫 AI 後端；部署到 Netlify 並設定 OPENAI_API_KEY 或 GEMINI_API_KEY 後即可生成。",
    };
    renderPartnerProfile(currentChart);
    addChatMessage("目前是本機檔案預覽，所以不能直接呼叫 AI 生圖。部署到 Netlify 並設定 API key 後，這顆按鈕就會直接產生圖片。");
    return;
  }

  const profile = currentChart.partnerProfile || buildPartnerProfile(currentChart);
  partnerImageState = {
    ...partnerImageState,
    status: "loading",
    message: "AI 圖片生成中，通常需要 10 到 30 秒。",
  };
  renderPartnerProfile(currentChart);

  try {
    const response = await fetch(AI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPartnerImagePayload(currentChart, profile)),
    });
    const responseText = await response.text();
    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      result = {};
    }

    if (!response.ok) {
      const detail = result.error || responseText.trim().slice(0, 240);
      throw new Error(detail || `AI 圖片生成失敗，Netlify 回傳 HTTP ${response.status}。`);
    }
    if (!result.imageUrl) {
      throw new Error("AI 圖片服務沒有回傳圖片。");
    }

    partnerImageState = {
      status: "ready",
      imageUrl: result.imageUrl,
      provider: result.provider || "AI 圖像模型",
      message: "AI 圖片已生成，可以直接下載或重新生成。",
    };
    renderPartnerProfile(currentChart);
    addChatMessage("AI 正緣圖片已生成。這張圖是依夫妻宮、遷移宮、福德宮與來因宮摘要生成，不會顯示提示詞。");
  } catch (error) {
    partnerImageState = {
      ...partnerImageState,
      status: "error",
      message: error.message || "AI 圖片生成失敗。",
    };
    renderPartnerProfile(currentChart);
    addChatMessage(`AI 圖片暫時沒有生成成功：${partnerImageState.message}`);
  }
}

function aiImageExtension(src) {
  if (src.startsWith("data:image/jpeg")) return "jpg";
  if (src.startsWith("data:image/webp")) return "webp";
  return "png";
}

function downloadPartnerPortrait() {
  const aiImage = document.querySelector(".partner-ai-image");
  if (aiImage?.src) {
    const anchor = document.createElement("a");
    anchor.href = aiImage.src;
    anchor.download = `partner-ai-portrait.${aiImageExtension(aiImage.src)}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    addChatMessage("AI 正緣圖片已下載。");
    return;
  }

  const svg = document.querySelector(".partner-generated-svg");
  if (!svg) return;
  const source = `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}`;
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "partner-portrait.svg";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  addChatMessage("正緣概念肖像已下載為 SVG 圖片。");
}

function renderPalaceOverview(astrolabe) {
  const squareTooltip = "三方四正：三方是本宮的三合宮位，四正是在三方之外再加對宮；用來判斷該宮事件的外部支援、牽動來源與真正成局條件。";
  return `
    <section class="palace-overview">
      <div class="palace-overview-head">
        <span>十二宮總覽</span>
      </div>
      <div class="palace-overview-grid">
        ${PALACE_OVERVIEWS.map(([name, meaning]) => {
          const palace = findPalaceByName(astrolabe, name);
          const stemBranch = palace ? `${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}` : "未取得";
          const reading = palaceOverviewReading(palace, astrolabe);
          const tooltip = `${name}：${meaning}`;
          return `
            <article class="palace-overview-item">
              <div class="palace-overview-title">
                <span class="palace-overview-name">
                  <strong>${escapeHtml(name)}</strong>
                  <span class="palace-overview-tip" tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}">?</span>
                </span>
                <span>${escapeHtml(stemBranch)}</span>
              </div>
              <em>主星：${escapeHtml(reading.stars)}</em>
              <p>${escapeHtml(reading.text)}</p>
              ${reading.note ? `<small>${escapeHtml(reading.note)}</small>` : ""}
            </article>
          `;
        }).join("")}
      </div>
      <p class="palace-overview-note">
        單看各宮仍屬偏頗，仍需觀看三方四正
        <span class="palace-overview-tip" tabindex="0" aria-label="${tooltipAttribute(squareTooltip)}" data-tooltip="${tooltipAttribute(squareTooltip)}">?</span>
        後再做整體判斷。
      </p>
    </section>
  `;
}

function buildReading(chart) {
  const topicKey = topicSelect.value;
  const topic = TOPIC_CONFIG[topicKey];
  const context = buildPeriodContext(chart);
  const causePalace = getCausePalace(chart.astrolabe);
  const yearStem = chart.astrolabe.rawDates?.chineseDate?.yearly?.[0] || "";
  const network = evaluateTopicNetwork(topicKey, chart, context);
  const primary = network.baseEvaluations[0] || network.evaluations[0];
  const bazi = baziTopicAnalysis(topicKey, chart, topic);
  const finalScore = network.score + bazi.element.score;
  const tone = scoreTone(finalScore);
  const causeText = causePalace
    ? `來因宮以生年天干${yearStem}對照宮干定位，本盤落在${palaceLabel(causePalace)}；解盤會把它視為原局動機與事件入口。`
    : "來因宮未能從生年天干與宮干定位取得。";
  const topicPalacesText = topicPalaceLabels(topicKey, chart).join("、") || topic.palaces.join("、");
  const ziweiText = ziweiTopicAnalysis(topicKey, chart, context, network);
  const integratedText = integratedTopicSummary(topicKey, chart, context, network, bazi);
  const peach = topicKey === "marriage" ? nativePeachBlossomAnalysis(chart, network) : null;
  const why = [
    `${ASTRO_SCHOOL_LABEL}：星曜安置與神煞顯示使用 iztro 的 zhongzhou 演算法設定。`,
    `${topic.label}主題先取${topicPalacesText}，再加入三方四正、對宮、來因宮、身宮與當期流運宮位，避免單宮斷事。`,
    primary ? describePalaceEvaluation(primary) : "找不到主宮資料，因此以輔助宮位與八字五行補看。",
    peach ? peach.text : "",
    causeText,
    `八字以日主十神輔判：${godCountText(bazi.counts, ["正財", "偏財", "正官", "七殺", "食神", "傷官", "正印", "偏印"])}。`,
    bazi.element.text,
  ].filter(Boolean);
  const tags = [
    context.periodName,
    causePalace ? `來因：${palaceLabel(causePalace)}` : "",
    ...topicPalaceLabels(topicKey, chart),
    network.supportStars.length ? `助力：${network.supportStars.slice(0, 3).join("、")}` : "",
    network.pressureStars.length ? `壓力：${network.pressureStars.slice(0, 3).join("、")}` : "",
    network.flowerStars.length ? `桃花：${network.flowerStars.join("、")}` : "",
    ...(peach?.tags || []),
    ...bazi.tags,
  ].filter(Boolean);

  return `
    <div class="reading-main">
      <div class="reading-copy">
        <div class="reading-status">${escapeHtml(context.periodName)} · ${escapeHtml(topic.label)}</div>
        <h3>${escapeHtml(topic.label)}：${escapeHtml(tone)}</h3>
        <section class="reading-block">
          <h4>紫微斗數</h4>
          <p>${escapeHtml(ziweiText)}</p>
        </section>
        <section class="reading-block">
          <h4>八字</h4>
          <p>${escapeHtml(bazi.text)}</p>
        </section>
        ${peach ? `
          <section class="reading-block">
            <h4>命主桃花分析</h4>
            <p>${escapeHtml(peach.text)}</p>
          </section>
        ` : ""}
        <section class="reading-block">
          <h4>綜合統整</h4>
          <p>${escapeHtml(integratedText)}</p>
        </section>
        ${renderTopicTimeline(topicKey, chart)}
        <div class="reading-tags">
          ${tags.map((tag) => `<span class="reading-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <aside class="reading-side">
        <h4>為何如此解盤</h4>
        <ul class="why-list">
          ${why.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </aside>
    </div>
  `;
}

function updateReading() {
  if (!currentChart) return;
  const context = buildPeriodContext(currentChart);
  decadalControl.hidden = scopeSelect.value !== "decadal";
  yearControl.hidden = !["yearly", "monthly"].includes(scopeSelect.value);
  monthControl.hidden = scopeSelect.value !== "monthly";
  if (palaceOverviewOutput) palaceOverviewOutput.innerHTML = renderPalaceOverview(currentChart.astrolabe);
  readingOutput.innerHTML = buildReading(currentChart);
  renderPartnerProfile(currentChart);
  renderAstrolabe(currentChart.astrolabe, context.periodIndex);
  renderZiweiImage(currentChart.astrolabe, context.periodIndex);
}

function renderSummary(astrolabe, lunar, formValues, timeIndex) {
  const lunarDate = `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const causePalace = getCausePalace(astrolabe);
  const lifePalaceLabel = palaceLabel(lifePalace);
  const bodyPalaceLabel = palaceLabel(bodyPalace);
  const causePalaceLabel = palaceLabel(causePalace);
  const fiveElementsClass = toTraditional(astrolabe.fiveElementsClass);
  const summary = [
    { label: "公曆", value: `${formValues.birthDate} ${formValues.birthTime}` },
    { label: "農曆", value: toTraditional(lunarDate) },
    { label: "時辰", value: `${HOUR_BRANCHES[timeIndex]}時 ${getTimeRange(timeIndex)}` },
    {
      label: "命宮 / 身宮",
      value: `${lifePalaceLabel} / ${bodyPalaceLabel}`,
      tooltip: `${coreFieldTooltip("命宮", lifePalaceLabel)} ${coreFieldTooltip("身宮", bodyPalaceLabel)}`,
    },
    {
      label: "來因宮",
      value: causePalaceLabel,
      tooltip: coreFieldTooltip("來因宮", causePalaceLabel),
    },
    {
      label: "五行局",
      value: fiveElementsClass,
      tooltip: coreFieldTooltip("五行局", fiveElementsClass),
    },
  ];

  summaryStrip.innerHTML = summary
    .map(({ label, value, tooltip }) => `
      <div class="summary-item ${tooltip ? "has-tooltip" : ""}"${tooltipProps(tooltip)}>
        ${renderCoreLabel(label, tooltip)}
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join("");
}

function renderPillars(pillars) {
  const dayStem = splitPillar(pillars[2] || "").stem;
  pillarGrid.innerHTML = pillars
    .map((pillar, index) => {
      const { stem, branch } = splitPillar(pillar);
      const stemElement = GAN_ELEMENT[stem] || "-";
      const branchElement = ZHI_ELEMENT[branch] || "-";
      const stemGod = index === 2 ? "日主" : getTenGod(dayStem, stem);
      const hiddenGods = getHiddenStemGods(dayStem, branch);
      const stemGodLabel = stemGod || "-";
      const stemGodTooltip = tenGodTooltip(stemGodLabel);
      const hiddenGodHtml = hiddenGods.length
        ? hiddenGods
            .map(({ stem: hiddenStem, god }) => {
              const tooltip = `${hiddenStem}${god}：地支「${branch}」藏${hiddenStem}，對日主形成${god}。${TEN_GOD_MEANINGS[god] || ""}`;
              return `<span class="pillar-hidden-god has-tooltip" tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}">${escapeHtml(hiddenStem)}${escapeHtml(god)}</span>`;
            })
            .join("")
        : `<span class="pillar-hidden-god muted">無藏干</span>`;
      return `
        <article class="pillar-card">
          <header>
            <span class="pillar-name">${PILLAR_NAMES[index]}</span>
            <span class="pillar-meta">${stemElement}${branchElement}</span>
          </header>
          <div class="pillar-main">
            <div class="pillar-char">${escapeHtml(stem)}</div>
            <div class="pillar-char">${escapeHtml(branch)}</div>
          </div>
          <div class="pillar-ten-row">
            <span class="pillar-ten-god has-tooltip" tabindex="0" aria-label="${tooltipAttribute(stemGodTooltip)}" data-tooltip="${tooltipAttribute(stemGodTooltip)}">天干 ${escapeHtml(stemGodLabel)}</span>
          </div>
          <div class="pillar-hidden-row">
            ${hiddenGodHtml}
          </div>
          <footer class="pillar-footer">
            <span>天干 ${escapeHtml(stemElement)}</span>
            <span>地支 ${escapeHtml(branchElement)}</span>
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderElementBars(counts) {
  const max = Math.max(...Object.values(counts), 1);
  elementBars.innerHTML = ELEMENTS.map((element) => {
    const value = counts[element] || 0;
    const width = Math.max(8, (value / max) * 100);
    return `
      <div class="element-row" data-element="${element}">
        <strong>${element}</strong>
        <div class="element-track"><div class="element-fill" style="width: ${width}%"></div></div>
        <span>${value}</span>
      </div>
    `;
  }).join("");
}

function renderNaYin(naYin) {
  nayinList.innerHTML = naYin
    .map((item, index) => {
      const tooltip = naYinTooltip(item);
      return `
      <div class="nayin-item has-tooltip" tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}">
        <span class="nayin-label">${PILLAR_NAMES[index]}</span>
        <strong>${escapeHtml(toTraditional(item))}</strong>
      </div>
    `;
    })
    .join("");
}

function renderCenterFact(label, value, tooltip = "") {
  return `
    <div class="center-fact ${tooltip ? "has-tooltip" : ""}"${tooltipProps(tooltip)}>
      ${renderCoreLabel(label, tooltip)}<br>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderCenterPlate(astrolabe) {
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const causePalace = getCausePalace(astrolabe);
  const lifePalaceLabel = palaceLabel(lifePalace);
  const bodyPalaceLabel = palaceLabel(bodyPalace);
  const causePalaceLabel = palaceLabel(causePalace);
  const fiveElementsClass = toTraditional(astrolabe.fiveElementsClass);
  return `
    <section class="center-plate">
      <div>
        <p class="eyebrow">${escapeHtml(ASTRO_SCHOOL_LABEL)}</p>
        <strong>${escapeHtml(toTraditional(astrolabe.chineseDate))}</strong>
      </div>
      <div class="center-facts">
        ${renderCenterFact("命宮", lifePalaceLabel, coreFieldTooltip("命宮", lifePalaceLabel))}
        ${renderCenterFact("身宮", bodyPalaceLabel, coreFieldTooltip("身宮", bodyPalaceLabel))}
        ${renderCenterFact("來因宮", causePalaceLabel, coreFieldTooltip("來因宮", causePalaceLabel))}
        ${renderCenterFact("五行局", fiveElementsClass, coreFieldTooltip("五行局", fiveElementsClass))}
        ${renderCenterFact("生肖", toTraditional(astrolabe.zodiac))}
        ${renderCenterFact("命主 / 身主", `${toTraditional(astrolabe.soul)} / ${toTraditional(astrolabe.body)}`)}
        ${renderCenterFact("星座", toTraditional(astrolabe.sign))}
      </div>
    </section>
  `;
}

function svgEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wrapTextLines(value, maxChars = 18, maxLines = 8) {
  const text = String(value || "").replace(/\s+/g, "");
  if (!text) return [];
  const parts = text.split(/(?=、|；)|(?<=、|；)/).filter(Boolean);
  const lines = [];
  let line = "";

  parts.forEach((part) => {
    if ((line + part).length <= maxChars) {
      line += part;
      return;
    }
    if (line) lines.push(line.replace(/[、；]$/, ""));
    line = part.replace(/^[、；]/, "");
  });

  if (line) lines.push(line.replace(/[、；]$/, ""));
  if (lines.length > maxLines) {
    const visible = lines.slice(0, maxLines);
    visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, Math.max(1, maxChars - 1))}…`;
    return visible;
  }
  return lines.map((item) => item.length > maxChars ? `${item.slice(0, Math.max(1, maxChars - 1))}…` : item);
}

function svgTextBlock(text, x, y, options = {}) {
  const {
    maxChars = 18,
    maxLines = 8,
    size = 18,
    fill = "#2d3330",
    weight = 650,
    lineHeight = 24,
  } = options;
  return wrapTextLines(text, maxChars, maxLines)
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-size="${size}" font-weight="${weight}">${svgEscape(line)}</text>`)
    .join("");
}

function palaceImageStars(palace) {
  const lines = [
    `主：${summarizeStarNames(palace.majorStars || [], "無主星")}`,
    palace.minorStars?.length ? `輔：${summarizeStarNames(palace.minorStars || [], "")}` : "",
    palace.adjectiveStars?.length ? `雜：${summarizeStarNames(palace.adjectiveStars || [], "")}` : "",
    palaceAuxiliaryNames(palace).length ? `曜：${palaceAuxiliaryNames(palace).join("、")}` : "",
  ].filter(Boolean);
  return lines.join("；");
}

function findPalaceByStarName(astrolabe, starNameValue) {
  return astrolabe.palaces.find((palace) => allPalaceStars(palace).some((star) => starPlainName(star) === starNameValue)) || null;
}

function palaceFlyingText(palace, astrolabe) {
  const stem = toTraditional(palace.heavenlyStem || "");
  const table = FLYING_MUTAGEN_TABLE[stem];
  if (!table) return `宮干${stem || "未定"}，飛星資料不足`;
  return Object.entries(table)
    .map(([mutagen, star]) => {
      const target = findPalaceByStarName(astrolabe, star);
      return `${mutagen}${star}→${target ? normalizePalaceName(target.name) : "未落宮"}`;
    })
    .join("；");
}

function sameTriadBranches(branch) {
  const groups = [
    ["申", "子", "辰"],
    ["寅", "午", "戌"],
    ["巳", "酉", "丑"],
    ["亥", "卯", "未"],
  ];
  return groups.find((group) => group.includes(toTraditional(branch))) || [toTraditional(branch)];
}

function oppositeBranch(branch) {
  return {
    "子": "午",
    "午": "子",
    "丑": "未",
    "未": "丑",
    "寅": "申",
    "申": "寅",
    "卯": "酉",
    "酉": "卯",
    "辰": "戌",
    "戌": "辰",
    "巳": "亥",
    "亥": "巳",
  }[toTraditional(branch)] || "";
}

function palaceByBranch(astrolabe, branch) {
  return astrolabe.palaces.find((item) => toTraditional(item.earthlyBranch) === branch) || null;
}

function palaceSanheText(palace, astrolabe) {
  const triadPalaces = sameTriadBranches(palace.earthlyBranch)
    .map((branch) => palaceByBranch(astrolabe, branch))
    .filter(Boolean);
  const opposite = palaceByBranch(astrolabe, oppositeBranch(palace.earthlyBranch));
  const triadText = triadPalaces.map((item) => normalizePalaceName(item.name)).join("、");
  const squareText = uniqueItems([...triadPalaces, opposite].filter(Boolean).map((item) => normalizePalaceName(item.name))).join("、");
  return [
    `三合：${triadText || "未定"}`,
    `對宮：${opposite ? normalizePalaceName(opposite.name) : "未定"}`,
    `三方四正：${squareText || "未定"}`,
  ].join("；");
}

function palaceFourTransformationText(palace) {
  const items = allPalaceStars(palace)
    .filter((star) => star?.mutagen)
    .map((star) => `${starPlainName(star)}化${toTraditional(star.mutagen)}`);
  return items.length ? `本宮四化：${uniqueItems(items).join("、")}` : "本宮未見生年四化星";
}

function palaceImageContent(palace, astrolabe, imageType) {
  if (imageType === "flying") return palaceFlyingText(palace, astrolabe);
  if (imageType === "sanhe") return palaceSanheText(palace, astrolabe);
  if (imageType === "sihua") return palaceFourTransformationText(palace);
  return palaceImageStars(palace);
}

function imageModeColor(imageType) {
  return {
    flying: "#0f8d6b",
    sanhe: "#1b5bb8",
    sihua: "#ba2d72",
  }[imageType] || "#1b5bb8";
}

function compactStarText(stars, fallback = "", limit = 6) {
  const names = uniqueItems((stars || []).map(starDisplayName));
  return names.length ? names.slice(0, limit).join("、") : fallback;
}

function svgBadgeGroup(labels, x, y) {
  return labels.map((label, index) => {
    const width = label.length > 2 ? 42 : 34;
    const offset = labels.slice(0, index).reduce((sum, item) => sum + (item.length > 2 ? 46 : 38), 0);
    return `
      <rect x="${x + offset}" y="${y}" width="${width}" height="22" rx="3" fill="#f3f7ff" stroke="#9fb3dc" />
      <text x="${x + offset + width / 2}" y="${y + 16}" fill="#1b5bb8" font-size="14" font-weight="850" text-anchor="middle">${svgEscape(label)}</text>
    `;
  }).join("");
}

function centerModeTabsSvg(imageType, x, y) {
  const keys = ["flying", "sanhe", "sihua"];
  return keys.map((key, index) => {
    const item = ZIWEI_IMAGE_TYPES[key];
    const active = key === imageType;
    const tabX = x + index * 116;
    return `
      <rect x="${tabX}" y="${y}" width="106" height="34" rx="4" fill="${active ? imageModeColor(key) : "#f2f4f7"}" stroke="#b9c3d6" />
      <text x="${tabX + 53}" y="${y + 23}" fill="${active ? "#ffffff" : "#4f5968"}" font-size="18" font-weight="900" text-anchor="middle">${svgEscape(item.label)}</text>
    `;
  }).join("");
}

function renderPalaceImageBlock(palace, astrolabe, imageType, periodIndex = null, causeIndex = null) {
  const grid = BRANCH_GRID[palace.earthlyBranch] || [1, 1];
  const cell = 330;
  const gap = 0;
  const margin = 40;
  const x = margin + (grid[1] - 1) * (cell + gap);
  const y = margin + (grid[0] - 1) * (cell + gap);
  const isLifePalace = palaceKey(palace.name) === "命";
  const modeColor = imageModeColor(imageType);
  const markers = [
    isLifePalace ? "命宮" : "",
    palace.isBodyPalace ? "身宮" : "",
    palace.index === causeIndex ? "來因" : "",
    palace.index === periodIndex ? "流運" : "",
  ].filter(Boolean);
  const stroke = palace.index === periodIndex
    ? "#b98731"
    : palace.index === causeIndex
      ? "#315f8d"
      : isLifePalace
        ? "#b23a2e"
        : palace.isBodyPalace
          ? "#186b5a"
          : "#343840";
  const stage = palace.decadal?.range ? `大限 ${palace.decadal.range[0]}-${palace.decadal.range[1]}` : "";
  const title = normalizePalaceName(palace.name);
  const stemBranch = `${toTraditional(palace.heavenlyStem || "")}${toTraditional(palace.earthlyBranch || "")}`;
  const markerText = markers.length ? markers.join(" / ") : toTraditional(palace.earthlyBranch || "");
  const titleColor = palace.index === periodIndex
    ? "#b98731"
    : isLifePalace
      ? "#d4212c"
      : palace.isBodyPalace
        ? "#0f8d6b"
        : "#1f2523";
  const majorText = compactStarText(palace.majorStars, "無主星", 5);
  const minorText = compactStarText(palace.minorStars, "", 6);
  const adjectiveText = compactStarText(palace.adjectiveStars, "", 5);
  const auxiliaryText = palaceAuxiliaryNames(palace).join("、");
  const modeTitle = ZIWEI_IMAGE_TYPES[imageType]?.label || "三合";

  return `
    <g>
      <rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="#ffffff" stroke="${stroke}" stroke-width="${stroke === "#343840" ? "1.4" : "2.8"}" />
      <rect x="${x}" y="${y}" width="${cell}" height="38" fill="#f4f6fb" stroke="#343840" stroke-width="1" />
      <line x1="${x}" y1="${y + 244}" x2="${x + cell}" y2="${y + 244}" stroke="#d9deea" stroke-width="1" />
      <text x="${x + 12}" y="${y + 27}" fill="${titleColor}" font-size="22" font-weight="950">${svgEscape(title)}</text>
      <text x="${x + cell - 12}" y="${y + 27}" fill="#343840" font-size="18" font-weight="900" text-anchor="end">${svgEscape(stemBranch)}</text>
      ${svgBadgeGroup(markers, x + 12, y + 46)}
      <text x="${x + cell - 12}" y="${y + 65}" fill="${titleColor}" font-size="17" font-weight="900" text-anchor="end">${svgEscape(markerText)}</text>
      ${svgTextBlock(majorText, x + 12, y + 92, { maxChars: 11, maxLines: 3, size: 20, lineHeight: 25, fill: "#c12f38", weight: 900 })}
      ${minorText ? svgTextBlock(minorText, x + 12, y + 168, { maxChars: 12, maxLines: 2, size: 17, lineHeight: 23, fill: "#1b5bb8", weight: 820 }) : ""}
      ${adjectiveText ? svgTextBlock(adjectiveText, x + 166, y + 168, { maxChars: 10, maxLines: 2, size: 16, lineHeight: 22, fill: "#7d3ea8", weight: 780 }) : ""}
      ${auxiliaryText ? svgTextBlock(auxiliaryText, x + 12, y + 220, { maxChars: 15, maxLines: 1, size: 15, lineHeight: 20, fill: "#56706a", weight: 760 }) : ""}
      <text x="${x + 12}" y="${y + 262}" fill="${modeColor}" font-size="16" font-weight="950">${svgEscape(modeTitle)}</text>
      ${svgTextBlock(palaceImageContent(palace, astrolabe, imageType), x + 12, y + 284, { maxChars: 17, maxLines: 2, size: 14, lineHeight: 19, fill: modeColor, weight: 780 })}
      <text x="${x + 12}" y="${y + cell - 8}" fill="#66716c" font-size="15" font-weight="760">${svgEscape(toTraditional(palace.changsheng12 || ""))}</text>
      <text x="${x + cell - 52}" y="${y + cell - 8}" fill="#66716c" font-size="15" font-weight="760" text-anchor="end">${svgEscape(stage)}</text>
      <text x="${x + cell - 14}" y="${y + cell - 8}" fill="#111827" font-size="30" font-weight="950" text-anchor="end">${svgEscape(toTraditional(palace.earthlyBranch || ""))}</text>
    </g>
  `;
}

function centerModeNote(imageType) {
  if (imageType === "flying") return "飛星圖以各宮宮干起飛，顯示祿、權、科、忌分別飛入的目標宮位。";
  if (imageType === "sanhe") return "三合圖顯示各宮位的三合、對宮與三方四正，用來看事件互相牽動的結構。";
  if (imageType === "sihua") return "四化圖標示本命生年四化落宮，用來觀察資源、權力、名聲與卡點。";
  return "飛星、三合、四化圖皆保留命宮、身宮、來因宮與流運標記。";
}

function buildZiweiChartSvg(astrolabe, periodIndex = null, imageType = "sanhe") {
  const causePalace = getCausePalace(astrolabe);
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const imageMeta = ZIWEI_IMAGE_TYPES[imageType] || ZIWEI_IMAGE_TYPES.sanhe;
  const centerFacts = [
    `命宮：${palaceLabel(lifePalace)}`,
    `身宮：${palaceLabel(bodyPalace)}`,
    `來因：${palaceLabel(causePalace)}`,
    `五行局：${toTraditional(astrolabe.fiveElementsClass)}`,
    `命主/身主：${toTraditional(astrolabe.soul)} / ${toTraditional(astrolabe.body)}`,
    `生肖/星座：${toTraditional(astrolabe.zodiac)} / ${toTraditional(astrolabe.sign)}`,
  ];
  const centerX = 370;
  const centerY = 370;
  const centerSize = 660;
  const centerMid = centerX + centerSize / 2;

  return `
    <svg class="ziwei-generated-svg" data-image-type="${svgEscape(imageType)}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1400" role="img" aria-label="${svgEscape(imageMeta.title)}">
      <rect width="1400" height="1400" fill="#eef1f6" />
      <rect x="40" y="40" width="1320" height="1320" fill="#ffffff" stroke="#343840" stroke-width="2" />
      ${astrolabe.palaces.map((palace) => renderPalaceImageBlock(palace, astrolabe, imageType, periodIndex, causePalace?.index ?? null)).join("")}
      <rect x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" fill="#ffffff" stroke="#343840" stroke-width="2" />
      <rect x="${centerX + 20}" y="${centerY + 20}" width="${centerSize - 40}" height="${centerSize - 40}" fill="#f8f9fc" stroke="#d4dbea" stroke-width="1.4" />
      <line x1="${centerX + 42}" y1="${centerY + 42}" x2="${centerX + centerSize - 42}" y2="${centerY + centerSize - 42}" stroke="#dfe5f1" stroke-width="1.2" stroke-dasharray="8 10" />
      <line x1="${centerX + centerSize - 42}" y1="${centerY + 42}" x2="${centerX + 42}" y2="${centerY + centerSize - 42}" stroke="#dfe5f1" stroke-width="1.2" stroke-dasharray="8 10" />
      <text x="${centerMid}" y="${centerY + 58}" fill="#b23a2e" font-size="22" font-weight="900" text-anchor="middle">${svgEscape(ASTRO_SCHOOL_LABEL)}</text>
      <text x="${centerMid}" y="${centerY + 110}" fill="#1f2523" font-size="42" font-weight="950" text-anchor="middle">${svgEscape(imageMeta.title)}</text>
      <text x="${centerMid}" y="${centerY + 150}" fill="#66716c" font-size="22" font-weight="800" text-anchor="middle">${svgEscape(toTraditional(astrolabe.chineseDate))}</text>
      ${centerModeTabsSvg(imageType, centerX + 156, centerY + 178)}
      ${centerFacts.map((fact, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = centerX + 58 + col * 304;
        const y = centerY + 278 + row * 72;
        return `
          <rect x="${x}" y="${y - 33}" width="258" height="52" rx="4" fill="#ffffff" stroke="#cbd5e6" />
          ${svgTextBlock(fact, x + 14, y + 1, { maxChars: 15, maxLines: 1, size: 17, lineHeight: 22, weight: 850 })}
        `;
      }).join("")}
      <text x="${centerMid}" y="${centerY + 555}" fill="#66716c" font-size="18" font-weight="760" text-anchor="middle">命宮、身宮、來因宮與流運皆以色框標示。</text>
      ${svgTextBlock(centerModeNote(imageType), centerX + 70, centerY + 602, { maxChars: 31, maxLines: 2, size: 17, lineHeight: 24, fill: "#66716c", weight: 760 })}
    </svg>
  `;
}

function renderZiweiImage(astrolabe, periodIndex = null) {
  if (!ziweiImageOutput) return;
  const imageMeta = ZIWEI_IMAGE_TYPES[ziweiImageType] || ZIWEI_IMAGE_TYPES.sanhe;
  ziweiImageOutput.innerHTML = `
    <div class="ziwei-image-card">
      <div class="ziwei-image-preview">
        ${buildZiweiChartSvg(astrolabe, periodIndex, ziweiImageType)}
      </div>
      <div class="ziwei-image-actions">
        <div class="ziwei-image-tabs" role="tablist" aria-label="命盤圖片類型">
          ${Object.entries(ZIWEI_IMAGE_TYPES).map(([key, item]) => `
            <button type="button" class="${key === ziweiImageType ? "is-active" : ""}" data-ziwei-image-type="${escapeHtml(key)}">${escapeHtml(item.label)}</button>
          `).join("")}
        </div>
        <p>目前顯示「${escapeHtml(imageMeta.label)}」圖片，可切換飛星、三合與四化後下載。</p>
        <button type="button" data-download-ziwei-image>下載${escapeHtml(imageMeta.label)}圖片</button>
      </div>
    </div>
  `;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function downloadZiweiChartImage() {
  const svg = document.querySelector(".ziwei-generated-svg");
  if (!svg) return;
  const imageType = svg.dataset.imageType || ziweiImageType || "sanhe";
  const imageMeta = ZIWEI_IMAGE_TYPES[imageType] || ZIWEI_IMAGE_TYPES.sanhe;

  const source = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}`;
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    const loaded = new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    image.src = url;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1400;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f4f0e6";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!pngBlob) throw new Error("PNG 轉換失敗");
    downloadBlob(pngBlob, `${imageMeta.filename}.png`);
    addChatMessage(`${imageMeta.label}圖片已下載為 PNG。`);
  } catch (error) {
    downloadBlob(svgBlob, `${imageMeta.filename}.svg`);
    addChatMessage(`此瀏覽器無法轉成 PNG，已改下載 SVG ${imageMeta.label}圖片。`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renderPalace(palace, periodIndex = null, causeIndex = null) {
  const position = BRANCH_GRID[palace.earthlyBranch] || [1, 1];
  const isLifePalace = palaceKey(palace.name) === "命";
  const classes = [
    "palace-card",
    isLifePalace ? "is-life" : "",
    palace.isBodyPalace ? "is-body" : "",
    palace.index === causeIndex ? "is-cause" : "",
    palace.index === periodIndex ? "is-period" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const major = renderStarChips(palace.majorStars, "major", 99);
  const minor = renderStarChips(palace.minorStars, "minor", 99);
  const adjective = renderStarChips(palace.adjectiveStars, "", 99);
  const auxiliary = renderAuxiliaryChips(palace);
  const empty = !major && !minor && !adjective && !auxiliary ? `<span class="muted">空宮</span>` : "";
  const stage = palace.decadal?.range ? `${palace.decadal.range[0]}-${palace.decadal.range[1]}` : "";
  const markers = [
    isLifePalace ? "命宮" : "",
    palace.isBodyPalace ? "身宮" : "",
    palace.index === causeIndex ? "來因" : "",
    palace.index === periodIndex ? "流運" : "",
  ].filter(Boolean);

  return `
    <article class="${classes}" style="grid-row: ${position[0]}; grid-column: ${position[1]};">
      <header class="palace-head">
        <div>
          <div class="palace-title">${escapeHtml(toTraditional(palace.name))}</div>
          <div class="palace-meta">${escapeHtml(toTraditional(palace.heavenlyStem))}${escapeHtml(toTraditional(palace.earthlyBranch))}</div>
        </div>
        <div class="palace-badges">
          ${markers.map((marker) => `<span class="palace-marker">${escapeHtml(marker)}</span>`).join("")}
          <span class="branch-chip">${escapeHtml(toTraditional(palace.earthlyBranch))}</span>
        </div>
      </header>
      <div class="star-groups">
        ${major}
        ${minor}
        ${adjective}
        ${auxiliary}
        ${empty}
      </div>
      <footer class="palace-foot">
        <span>${escapeHtml(toTraditional(palace.changsheng12 || ""))}</span>
        <span>${stage ? `大限 ${stage}` : ""}</span>
      </footer>
    </article>
  `;
}

function renderAstrolabe(astrolabe, periodIndex = null) {
  const causeIndex = getCausePalace(astrolabe)?.index ?? null;
  astrolabeGrid.innerHTML = [
    renderCenterPlate(astrolabe),
    ...astrolabe.palaces.map((palace) => renderPalace(palace, periodIndex, causeIndex)),
  ].join("");
}

function showError(error) {
  errorMessage.hidden = false;
  errorMessage.textContent = error.message || "排盤時發生錯誤。";
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function calculate() {
  clearError();

  if (!window.Solar || !window.iztro?.astro) {
    throw new Error("排盤函式庫尚未載入。");
  }

  const formValues = getFormValues();
  const solar = Solar.fromYmdHms(
    formValues.year,
    formValues.month,
    formValues.day,
    formValues.hour,
    formValues.minute,
    0,
  );
  const lunar = solar.getLunar();
  const timeIndex = getTimeIndex(formValues.hour);
  iztro.astro.config(ASTRO_CONFIG);
  const astrolabe = iztro.astro.bySolar(
    `${formValues.year}-${formValues.month}-${formValues.day}`,
    timeIndex,
    formValues.gender,
    true,
    "zh-TW",
  );
  const pillars = lunar.getBaZi();
  const elementCounts = countElements(pillars);

  currentChart = {
    astrolabe,
    elementCounts,
    formValues,
    lunar,
    pillars,
    timeIndex,
  };
  partnerImageState = {
    status: "idle",
    imageUrl: "",
    provider: "",
    message: "",
  };

  if (!targetYearInput.value) targetYearInput.value = String(new Date().getFullYear());
  if (!targetMonthInput.value) targetMonthInput.value = String(new Date().getMonth() + 1);

  renderSummary(astrolabe, lunar, formValues, timeIndex);
  renderPillars(pillars);
  renderElementBars(elementCounts);
  renderNaYin(lunar.getBaZiNaYin());
  renderDecadalOptions(astrolabe, formValues);
  updateReading();
}

function setSample() {
  dateInput.value = "2000-08-16";
  timeInput.value = "04:00";
  form.querySelector('input[name="gender"][value="女"]').checked = true;
  calculate();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    calculate();
  } catch (error) {
    showError(error);
  }
});

sampleButton.addEventListener("click", setSample);
[
  scopeSelect,
  decadalSelect,
  targetYearInput,
  targetMonthInput,
  topicSelect,
].forEach((control) => {
  control.addEventListener("change", updateReading);
  control.addEventListener("input", updateReading);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  addChatMessage(question, "user");
  chatInput.value = "";
  addChatMessage(buildBotAnswer(question), "bot");
});

document.addEventListener("click", (event) => {
  const imageTypeButton = event.target.closest("[data-ziwei-image-type]");
  if (imageTypeButton) {
    ziweiImageType = imageTypeButton.dataset.ziweiImageType || "sanhe";
    if (currentChart) {
      const context = buildPeriodContext(currentChart);
      renderZiweiImage(currentChart.astrolabe, context.periodIndex);
    }
  }
  if (event.target.matches("[data-regenerate-partner]")) {
    regeneratePartnerPortrait();
  }
  if (event.target.matches("[data-generate-ai-partner]")) {
    generatePartnerAiImage();
  }
  if (event.target.matches("[data-download-partner]")) {
    downloadPartnerPortrait();
  }
  if (event.target.matches("[data-download-ziwei-image]")) {
    downloadZiweiChartImage();
  }
});

setSample();
seedChat();
