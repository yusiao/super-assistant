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
  health: {
    label: "健康",
    palaces: ["疾厄宮", "命宮", "福德宮"],
    elements: ["水", "木", "土"],
    prompt: "看身體弱點、壓力反應、修復能力、作息與長期保養方向。",
  },
};
const SCOPE_LABELS = {
  decadal: "大限",
  age: "小限",
  yearly: "流年",
  monthly: "流月",
  daily: "流日",
  hourly: "流時",
};
const BAZI_SCOPE_LABELS = {
  natal: "原局",
  decadal: "大運",
  yearly: "流年",
  monthly: "流月",
};
const CALIBRATION_EVENT_TYPES = {
  career: { label: "工作／升學", gods: ["正官", "七殺", "正印", "偏印", "食神", "傷官"], pillars: [1, 3] },
  marriage: { label: "感情／婚姻", gods: ["正官", "七殺", "正財", "偏財", "食神", "傷官"], pillars: [2] },
  property: { label: "財務／置產", gods: ["正財", "偏財", "食神", "傷官"], pillars: [1, 2] },
  family: { label: "家庭／搬遷", gods: ["正印", "偏印", "比肩", "劫財"], pillars: [0, 1] },
  children: { label: "子女／作品", gods: ["食神", "傷官", "正印", "偏印"], pillars: [3] },
  health: { label: "健康／壓力", gods: ["正印", "偏印", "正官", "七殺", "傷官"], pillars: [2, 3] },
};
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEM_COMBINATION_RULES = [
  ["甲", "己", "土"],
  ["乙", "庚", "金"],
  ["丙", "辛", "水"],
  ["丁", "壬", "木"],
  ["戊", "癸", "火"],
];
const STEM_CLASH_RULES = [["甲", "庚"], ["乙", "辛"], ["丙", "壬"], ["丁", "癸"]];
const BRANCH_COMBINATION_RULES = [
  ["子", "丑", "土"],
  ["寅", "亥", "木"],
  ["卯", "戌", "火"],
  ["辰", "酉", "金"],
  ["巳", "申", "水"],
  ["午", "未", "土"],
];
const BRANCH_CLASH_RULES = [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]];
const BRANCH_HARM_RULES = [["子", "未"], ["丑", "午"], ["寅", "巳"], ["卯", "辰"], ["申", "亥"], ["酉", "戌"]];
const BRANCH_PUNISHMENT_RULES = [["寅", "巳", "申"], ["丑", "戌", "未"], ["子", "卯"], ["辰", "辰"], ["午", "午"], ["酉", "酉"], ["亥", "亥"]];
const BRANCH_TRIAD_RULES = [
  ["申", "子", "辰", "水"],
  ["亥", "卯", "未", "木"],
  ["寅", "午", "戌", "火"],
  ["巳", "酉", "丑", "金"],
];
const BRANCH_MEETING_RULES = [
  ["亥", "子", "丑", "水"],
  ["寅", "卯", "辰", "木"],
  ["巳", "午", "未", "火"],
  ["申", "酉", "戌", "金"],
];
const BRANCH_BREAK_RULES = [["子", "酉"], ["午", "卯"], ["辰", "丑"], ["戌", "未"], ["寅", "亥"], ["巳", "申"]];
const HIDDEN_STEM_WEIGHTS = {
  1: [1],
  2: [0.7, 0.3],
  3: [0.6, 0.3, 0.1],
};
const PILLAR_LIFE_AREAS = [
  "家族、外部環境與早年根基",
  "父母手足、職場制度與成長環境",
  "命主自身、伴侶與親密關係",
  "子女、作品、晚年安排與長期成果",
];
const STEM_LU_BRANCH = {
  "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
  "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子",
};
const BAZI_TEN_GOD_GROUPS = [
  { label: "比劫", gods: ["比肩", "劫財"], note: "看自我、同輩、人脈、競爭與資源分配" },
  { label: "食傷", gods: ["食神", "傷官"], note: "看才華、輸出、創意、表達與作品" },
  { label: "財星", gods: ["正財", "偏財"], note: "看收入、資源、商業感與資產承接" },
  { label: "官殺", gods: ["正官", "七殺"], note: "看責任、規範、壓力、位置與行動要求" },
  { label: "印星", gods: ["正印", "偏印"], note: "看學習、證照、保護、恢復與支持系統" },
];
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
const FOUR_TRANSFORMATION_META = {
  "祿": { color: "#16845b", markerId: "arrow-lu", meaning: "資源與機會" },
  "權": { color: "#c44a23", markerId: "arrow-quan", meaning: "權責與推動" },
  "科": { color: "#2563b8", markerId: "arrow-ke", meaning: "名聲與緩和" },
  "忌": { color: "#7a2b83", markerId: "arrow-ji", meaning: "牽掛與課題" },
};
const ZIWEI_IMAGE_TYPES = {
  flying: { label: "飛星", title: "紫微飛星圖", filename: "ziwei-flying-stars" },
  sanhe: { label: "三合", title: "三合三方四正圖", filename: "ziwei-sanhe" },
  sihua: { label: "四化飛星", title: "本命與流運四化飛星圖", filename: "ziwei-sihua" },
};
const PARTNER_CAREER_RULES = [
  [["天機", "文昌", "文曲"], ["產品經理", "資料分析師", "管理顧問", "教育研究員"]],
  [["巨門"], ["律師", "公關顧問", "媒體企劃", "業務談判代表"]],
  [["太陽"], ["品牌經理", "公共事務專員", "業務主管", "外勤管理職"]],
  [["太陰"], ["金融分析師", "會計師", "室內設計師", "不動產顧問"]],
  [["武曲", "祿存"], ["投資分析師", "工程師", "營運經理", "風險管理師"]],
  [["天府", "紫微", "天相"], ["專案總監", "行政管理師", "公部門專員", "資源整合經理"]],
  [["廉貞"], ["法遵專員", "稽核師", "策略顧問", "品牌設計師"]],
  [["貪狼", "紅鸞", "天喜", "天姚", "咸池"], ["商務開發", "內容行銷師", "活動企劃", "餐旅經理"]],
  [["七殺", "破軍"], ["新創創辦人", "專案開發經理", "工程現場主管", "危機管理師"]],
  [["天梁", "天魁", "天鉞"], ["醫療照護專員", "教育顧問", "職涯顧問", "社福專員"]],
  [["天馬"], ["國際貿易專員", "旅運規劃師", "物流經理", "海外業務"]],
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
  "长": "長",
  "带": "帶",
  "绝": "絕",
  "养": "養",
  "将": "將",
  "阴": "陰",
  "贵": "貴",
  "劫": "劫",
};

const form = document.querySelector("#birth-form");
const birthYearSelect = document.querySelector("#birth-year");
const birthMonthSelect = document.querySelector("#birth-month");
const birthDaySelect = document.querySelector("#birth-day");
const timeInput = document.querySelector("#birth-time");
const placeInput = document.querySelector("#place-note");
const timezoneOffsetInput = document.querySelector("#timezone-offset");
const birthLongitudeInput = document.querySelector("#birth-longitude");
const trueSolarTimeInput = document.querySelector("#true-solar-time");
const daylightSavingInput = document.querySelector("#daylight-saving");
const dayBoundaryRuleSelect = document.querySelector("#day-boundary-rule");
const errorMessage = document.querySelector("#error-message");
const summaryStrip = document.querySelector("#summary-strip");
const pillarGrid = document.querySelector("#pillar-grid");
const elementBars = document.querySelector("#element-bars");
const nayinList = document.querySelector("#nayin-list");
const baziInsightOutput = document.querySelector("#bazi-insight-output");
const baziLuckTableOutput = document.querySelector("#bazi-luck-table-output");
const baziScopeSelect = document.querySelector("#bazi-scope-select");
const baziDecadalSelect = document.querySelector("#bazi-decadal-select");
const baziTargetYearInput = document.querySelector("#bazi-target-year");
const baziTargetMonthInput = document.querySelector("#bazi-target-month");
const baziDecadalControl = document.querySelector("#bazi-decadal-control");
const baziYearControl = document.querySelector("#bazi-year-control");
const baziMonthControl = document.querySelector("#bazi-month-control");
const baziTopicSelect = document.querySelector("#bazi-topic-select");
const baziReadingOutput = document.querySelector("#bazi-reading-output");
const baziPartnerOutput = document.querySelector("#bazi-partner-output");
const calibrationYearInput = document.querySelector("#calibration-year");
const calibrationTypeSelect = document.querySelector("#calibration-type");
const calibrationNoteInput = document.querySelector("#calibration-note");
const addCalibrationEventButton = document.querySelector("#add-calibration-event");
const baziCalibrationOutput = document.querySelector("#bazi-calibration-output");
const astrolabeGrid = document.querySelector("#astrolabe-grid");
const ziweiImageOutput = document.querySelector("#ziwei-image-output");
const scopeSelect = document.querySelector("#scope-select");
const decadalSelect = document.querySelector("#decadal-select");
const targetYearInput = document.querySelector("#target-year");
const targetMonthInput = document.querySelector("#target-month");
const targetDayInput = document.querySelector("#target-day");
const targetHourInput = document.querySelector("#target-hour");
const topicSelect = document.querySelector("#topic-select");
const decadalControl = document.querySelector("#decadal-control");
const yearControl = document.querySelector("#year-control");
const monthControl = document.querySelector("#month-control");
const dayControl = document.querySelector("#day-control");
const hourControl = document.querySelector("#hour-control");
const palaceOverviewOutput = document.querySelector("#palace-overview-output");
const readingOutput = document.querySelector("#reading-output");
const partnerOutput = document.querySelector("#partner-output");
const combinedCheckOutput = document.querySelector("#combined-check-output");
const chatLog = document.querySelector("#chat-log");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const methodTabs = [...document.querySelectorAll("[data-reading-method]")];
const methodViews = [...document.querySelectorAll("[data-method-view]")];

let currentChart = null;
let partnerRenderSalt = 0;
let ziweiImageType = "sanhe";
let activeReadingMethod = "bazi";
let baziCalibrationEvents = [];
let calibrationChartSignature = "";
let partnerImageState = {
  status: "idle",
  imageUrl: "",
  provider: "",
  message: "",
};
let baziPartnerImageState = {
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
  return String(value ?? "").replace(/[阳阴时财禄权宫迁仆机杀贪罗铃辅马钺钧龙凤鸾寿厨华盖虚伤灾岁驿临长带绝养将贵]/g, (char) => TW_MAP[char] || char);
}

function stripStarBrightnessText(value) {
  return toTraditional(value)
    .replace(/[（(](廟|旺|陷|平|得|利|不)[）)]/g, "")
    .replace(/\s+(廟|旺|陷|平|得|利|不)$/g, "");
}

function getFormValues() {
  const year = Number(birthYearSelect.value);
  const month = Number(birthMonthSelect.value);
  const day = Number(birthDaySelect.value);
  const birthTime = timeInput.value;
  const gender = form.querySelector('input[name="gender"]:checked')?.value || "女";
  const timezoneOffset = Number(timezoneOffsetInput?.value ?? 8);
  const longitude = Number(birthLongitudeInput?.value ?? 121.5654);
  const placeName = placeInput?.value.trim() || "未填出生地";
  const useTrueSolarTime = Boolean(trueSolarTimeInput?.checked);
  const daylightSaving = Boolean(daylightSavingInput?.checked);
  const dayBoundaryRule = dayBoundaryRuleSelect?.value === "midnight" ? "midnight" : "zi";

  if (!year || !month || !day || !birthTime) {
    throw new Error("請填入完整出生日期與時間。");
  }
  if (!Number.isFinite(timezoneOffset) || timezoneOffset < -12 || timezoneOffset > 14) {
    throw new Error("時區需介於 UTC-12 至 UTC+14。");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("出生地經度需介於 -180 至 180 度。");
  }

  const [hour, minute] = birthTime.split(":").map(Number);
  const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    birthDate,
    birthTime,
    inputBirthDate: birthDate,
    inputBirthTime: birthTime,
    gender,
    year,
    month,
    day,
    hour,
    minute,
    timezoneOffset,
    longitude,
    placeName,
    useTrueSolarTime,
    daylightSaving,
    dayBoundaryRule,
  };
}

function dayOfYear(year, month, day) {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000) + 1;
}

function equationOfTimeMinutes(year, month, day) {
  const n = dayOfYear(year, month, day);
  const b = (2 * Math.PI * (n - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function normalizeBirthMoment(values) {
  const standardMeridian = values.timezoneOffset * 15;
  const longitudeCorrection = values.useTrueSolarTime
    ? (values.longitude - standardMeridian) * 4
    : 0;
  const equationCorrection = values.useTrueSolarTime
    ? equationOfTimeMinutes(values.year, values.month, values.day)
    : 0;
  const daylightCorrection = values.daylightSaving ? -60 : 0;
  const correctionMinutes = longitudeCorrection + equationCorrection + daylightCorrection;
  const adjusted = new Date(Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute + correctionMinutes,
  ));
  const year = adjusted.getUTCFullYear();
  const month = adjusted.getUTCMonth() + 1;
  const day = adjusted.getUTCDate();
  const hour = adjusted.getUTCHours();
  const minute = adjusted.getUTCMinutes();
  const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const birthTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return {
    ...values,
    birthDate,
    birthTime,
    year,
    month,
    day,
    hour,
    minute,
    correctionMinutes,
    longitudeCorrection,
    equationCorrection,
    daylightCorrection,
  };
}

function setSelectOptions(select, values, selectedValue, formatLabel) {
  select.replaceChildren(...values.map((value) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = formatLabel(value);
    option.selected = String(value) === String(selectedValue);
    return option;
  }));
}

function updateBirthDayOptions() {
  const year = Number(birthYearSelect.value);
  const month = Number(birthMonthSelect.value);
  if (!year || !month) return;

  const lastDay = new Date(year, month, 0).getDate();
  const selectedDay = Math.min(Number(birthDaySelect.value) || 1, lastDay);
  setSelectOptions(
    birthDaySelect,
    Array.from({ length: lastDay }, (_, index) => index + 1),
    selectedDay,
    (day) => `${day} 日`,
  );
}

function initializeBirthDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  setSelectOptions(
    birthYearSelect,
    Array.from({ length: 201 }, (_, index) => 1900 + index),
    year,
    (value) => `${value} 年`,
  );
  setSelectOptions(
    birthMonthSelect,
    Array.from({ length: 12 }, (_, index) => index + 1),
    month,
    (value) => `${value} 月`,
  );
  setSelectOptions(
    birthDaySelect,
    Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1),
    day,
    (value) => `${value} 日`,
  );
  timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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

function elementThatGenerates(element) {
  return Object.entries(ELEMENT_GENERATES).find(([, target]) => target === element)?.[0] || "";
}

function elementControlledBy(element) {
  return Object.entries(ELEMENT_CONTROLS).find(([, target]) => target === element)?.[0] || "";
}

function seasonForBranch(branch) {
  if (["寅", "卯", "辰"].includes(branch)) return "春";
  if (["巳", "午", "未"].includes(branch)) return "夏";
  if (["申", "酉", "戌"].includes(branch)) return "秋";
  return "冬";
}

function hiddenStemRecords(dayStem, branch) {
  const stems = BRANCH_HIDDEN_STEMS[branch] || [];
  const weights = HIDDEN_STEM_WEIGHTS[stems.length] || [];
  return stems.map((stem, index) => ({
    stem,
    element: GAN_ELEMENT[stem] || "",
    god: getTenGod(dayStem, stem),
    weight: weights[index] || 0,
    role: index === 0 ? "主氣" : index === 1 ? "中氣" : "餘氣",
  }));
}

function baziElementPower(chart) {
  const pillars = chart.pillars || [];
  const dayStem = splitPillar(pillars[2]).stem;
  const power = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  const stemWeights = [0.8, 1, 1, 0.85];
  const branchWeights = [1, 2.4, 1.35, 1];

  pillars.forEach((pillar, index) => {
    const { stem, branch } = splitPillar(pillar);
    const stemElement = GAN_ELEMENT[stem];
    if (stemElement) power[stemElement] += stemWeights[index] || 0.8;
    hiddenStemRecords(dayStem, branch).forEach((record) => {
      if (record.element) power[record.element] += record.weight * (branchWeights[index] || 1);
    });
  });

  return power;
}

function baziHiddenStemProfile(chart) {
  const pillars = chart.pillars || [];
  const dayStem = splitPillar(pillars[2]).stem;
  const visibleStems = pillars.map((pillar) => splitPillar(pillar).stem);
  const dayElement = GAN_ELEMENT[dayStem] || "";
  const records = pillars.map((pillar, index) => {
    const branch = splitPillar(pillar).branch;
    const hidden = hiddenStemRecords(dayStem, branch).map((record) => ({
      ...record,
      visible: visibleStems.includes(record.stem),
      root: record.element === dayElement,
    }));
    return { pillar: PILLAR_NAMES[index], branch, hidden };
  });
  const roots = records.flatMap((record) => record.hidden
    .filter((item) => item.root)
    .map((item) => `${record.pillar}${record.branch}藏${item.stem}${item.role}`));
  const visible = records.flatMap((record) => record.hidden
    .filter((item) => item.visible)
    .map((item) => `${record.pillar}${item.stem}${item.god}透干`));
  return {
    records,
    roots: uniqueItems(roots),
    visible: uniqueItems(visible),
    text: `${records.map((record) => `${record.pillar}${record.branch}藏${record.hidden.map((item) => `${item.stem}${item.god}${Math.round(item.weight * 100)}%`).join("、")}`).join("；")}。${roots.length ? `日主通根見${uniqueItems(roots).join("、")}。` : "日主在四支未見同五行通根，較仰賴印比與行運生扶。"}${visible.length ? `藏干透出：${uniqueItems(visible).join("、")}。` : "藏干未明顯透出天干，力量較偏內在或等待行運引動。"}`,
  };
}

function baziDayMasterProfile(chart) {
  const dayStem = splitPillar(chart.pillars?.[2]).stem;
  const monthBranch = splitPillar(chart.pillars?.[1]).branch;
  const dayElement = GAN_ELEMENT[dayStem] || "";
  const monthElement = ZHI_ELEMENT[monthBranch] || "";
  const resourceElement = elementThatGenerates(dayElement);
  const outputElement = ELEMENT_GENERATES[dayElement] || "";
  const wealthElement = ELEMENT_CONTROLS[dayElement] || "";
  const officerElement = elementControlledBy(dayElement);
  const power = baziElementPower(chart);
  const totalPower = Object.values(power).reduce((sum, value) => sum + value, 0) || 1;
  const supportScore = (power[dayElement] || 0) + (power[resourceElement] || 0);
  const drainScore = totalPower - supportScore;
  const supportRatio = supportScore / totalPower;
  const score = (supportRatio - 0.5) * 10;
  const strength = supportRatio >= 0.62 ? "偏旺" : supportRatio <= 0.38 ? "偏弱" : "中和";
  const favorable = strength === "偏弱"
    ? [resourceElement, dayElement]
    : strength === "偏旺"
      ? [outputElement, wealthElement, officerElement]
      : [outputElement, wealthElement];
  const caution = strength === "偏弱"
    ? [outputElement, wealthElement, officerElement]
    : strength === "偏旺"
      ? [resourceElement, dayElement]
      : [];
  const monthMainStem = (BRANCH_HIDDEN_STEMS[monthBranch] || [])[0] || "";
  const monthGod = monthMainStem ? getTenGod(dayStem, monthMainStem) : "";
  const hiddenProfile = baziHiddenStemProfile(chart);
  const rootText = hiddenProfile.roots.length
    ? `通根見${hiddenProfile.roots.join("、")}`
    : "四支同氣根較少";

  return {
    dayStem,
    dayElement,
    monthBranch,
    monthElement,
    season: seasonForBranch(monthBranch),
    resourceElement,
    outputElement,
    wealthElement,
    officerElement,
    strength,
    score,
    supportScore,
    drainScore,
    supportRatio,
    power,
    hiddenProfile,
    favorable: uniqueItems(favorable.filter(Boolean)),
    caution: uniqueItems(caution.filter(Boolean)),
    monthMainStem,
    monthGod,
    text: `日主為${dayStem}${dayElement}，生於${monthBranch}月（${seasonForBranch(monthBranch)}季${monthElement}氣）。月令與藏干加權後，生扶約占${Math.round(supportRatio * 100)}%，洩耗剋約占${Math.round((1 - supportRatio) * 100)}%，${rootText}，因此判為${strength}；宜先讓${uniqueItems(favorable.filter(Boolean)).join("、")}形成流通${caution.filter(Boolean).length ? `，避免${uniqueItems(caution.filter(Boolean)).join("、")}過度堆疊` : ""}。`,
  };
}

function baziStructureProfile(chart) {
  const profile = baziDayMasterProfile(chart);
  const counts = tenGodCounts(chart);
  const visibleStems = chart.pillars.map((pillar) => splitPillar(pillar).stem);
  const monthGod = profile.monthGod || "月令主氣";
  const isLu = STEM_LU_BRANCH[profile.dayStem] === profile.monthBranch;
  const name = isLu
    ? "建祿格"
    : monthGod === "劫財"
      ? "月劫格"
      : monthGod === "比肩"
        ? "月令比肩格"
        : `${monthGod}格`;
  const visible = visibleStems.includes(profile.monthMainStem);
  const supportRules = {
    "正官": ["正印", "偏印", "正財", "偏財"],
    "七殺": ["食神", "正印", "偏印"],
    "正財": ["食神", "傷官", "正官"],
    "偏財": ["食神", "傷官", "七殺"],
    "食神": ["正財", "偏財"],
    "傷官": ["正財", "偏財", "正印"],
    "正印": ["正官", "七殺", "比肩"],
    "偏印": ["七殺", "比肩", "劫財"],
    "比肩": ["食神", "傷官", "正官"],
    "劫財": ["食神", "傷官", "七殺"],
  }[monthGod] || [];
  const supports = supportRules.filter((god) => counts[god]);
  const pressures = [];
  if (["正官", "七殺"].includes(monthGod) && (counts["傷官"] || 0) >= 2) pressures.push("傷官對官殺形成牽制");
  if (["正財", "偏財"].includes(monthGod) && ((counts["比肩"] || 0) + (counts["劫財"] || 0)) >= 3) pressures.push("比劫較重，財星易被分奪");
  if (["正印", "偏印"].includes(monthGod) && ((counts["正財"] || 0) + (counts["偏財"] || 0)) >= 3) pressures.push("財星較重，印星承壓");
  if (["食神", "傷官"].includes(monthGod) && ((counts["正印"] || 0) + (counts["偏印"] || 0)) >= 3) pressures.push("印星較重，食傷輸出受抑");
  const status = visible && supports.length && !pressures.length
    ? "格神透干且有承接"
    : visible || supports.length
      ? "格局條件部分成立"
      : "格神藏支，待行運引動";
  const extreme = Math.abs(profile.score) >= 3.8;
  const special = extreme
    ? `日主力量偏向極端，需再檢查是否具從格條件；目前仍以${name}及一般扶抑法為主，不直接定從格。`
    : "日主未達極端失衡，先以月令格局與一般扶抑法判讀。";
  return {
    name,
    status,
    visible,
    supports,
    pressures,
    text: `以月令${profile.monthBranch}主氣${profile.monthMainStem}${monthGod}立${name}；${visible ? "格神已透出天干" : "格神未透干、主要藏於月支"}。${supports.length ? `成格助力見${supports.join("、")}。` : "成格助力未集中，需靠行運補足。"}${pressures.length ? `破格或混雜點：${pressures.join("、")}。` : "未見明顯破格衝突。"}${special}`,
  };
}

function baziUsefulGodProfile(chart) {
  const profile = baziDayMasterProfile(chart);
  const powerOrder = Object.entries(profile.power).sort((first, second) => second[1] - first[1]);
  const primary = profile.strength === "偏弱"
    ? profile.resourceElement
    : profile.strength === "偏旺"
      ? profile.outputElement
      : profile.wealthElement || profile.outputElement;
  const secondary = profile.favorable.find((element) => element !== primary) || "";
  const regulating = ["亥", "子", "丑"].includes(profile.monthBranch)
    ? "火"
    : ["巳", "午", "未"].includes(profile.monthBranch)
      ? "水"
      : profile.season === "春"
        ? "金"
        : "火";
  const topElements = powerOrder.slice(0, 2).map(([element]) => element);
  let bridge = "";
  const [first, second] = topElements;
  if (ELEMENT_CONTROLS[first] === second) bridge = ELEMENT_GENERATES[first];
  if (ELEMENT_CONTROLS[second] === first) bridge = ELEMENT_GENERATES[second];
  return {
    primary,
    secondary,
    regulating,
    bridge,
    text: `扶抑用神先取${primary || "五行流通"}${secondary ? `，次取${secondary}` : ""}，用來調整日主${profile.strength}；${profile.season}季調候重點為${regulating}，用來處理寒暖燥濕。${bridge ? `命局較強的${first}、${second}之間有制約，通關可考慮${bridge}。` : "主要五行未形成明顯兩強相戰，通關以整體流通為先。"}喜用神是命理取向，不等同現實中只能使用某種顏色、職業或方位。`,
  };
}

function baziTwelveStageProfile(chart) {
  const eightChar = chart.eightChar;
  const stageMethods = ["getYearDiShi", "getMonthDiShi", "getDayDiShi", "getTimeDiShi"];
  const voidMethods = ["getYearXunKong", "getMonthXunKong", "getDayXunKong", "getTimeXunKong"];
  const records = PILLAR_NAMES.map((name, index) => ({
    name,
    pillar: chart.pillars[index],
    stage: toTraditional(eightChar?.[stageMethods[index]]?.() || "未取得"),
    void: toTraditional(eightChar?.[voidMethods[index]]?.() || "未取得"),
  }));
  return {
    records,
    text: records.map((record) => `${record.name}${record.pillar}為${record.stage}，旬空${record.void}`).join("；"),
  };
}

function baziAuxiliaryPalaceProfile(chart) {
  const eightChar = chart.eightChar;
  const records = [
    { label: "胎元", value: eightChar?.getTaiYuan?.(), naYin: eightChar?.getTaiYuanNaYin?.(), meaning: "受孕與先天承接氣，補看家族資源及早期環境。" },
    { label: "胎息", value: eightChar?.getTaiXi?.(), naYin: eightChar?.getTaiXiNaYin?.(), meaning: "補看內在生命節奏、潛在反應與身心底色。" },
    { label: "命宮", value: eightChar?.getMingGong?.(), naYin: eightChar?.getMingGongNaYin?.(), meaning: "八字輔助命宮，用來補看人生承載與外在處境。" },
    { label: "身宮", value: eightChar?.getShenGong?.(), naYin: eightChar?.getShenGongNaYin?.(), meaning: "八字輔助身宮，用來補看實際行動與後天投入位置。" },
  ].map((record) => ({ ...record, value: toTraditional(record.value || "未取得"), naYin: toTraditional(record.naYin || "") }));
  return {
    records,
    text: records.map((record) => `${record.label}${record.value}${record.naYin ? `（${record.naYin}）` : ""}：${record.meaning}`).join(" "),
  };
}

function branchGroupValue(branch, values) {
  const groups = [
    { branches: ["申", "子", "辰"], value: values[0] },
    { branches: ["寅", "午", "戌"], value: values[1] },
    { branches: ["巳", "酉", "丑"], value: values[2] },
    { branches: ["亥", "卯", "未"], value: values[3] },
  ];
  return groups.find((group) => group.branches.includes(branch))?.value || "";
}

function baziShenShaProfile(chart) {
  const dayStem = splitPillar(chart.pillars[2]).stem;
  const yearBranch = splitPillar(chart.pillars[0]).branch;
  const dayBranch = splitPillar(chart.pillars[2]).branch;
  const branches = chart.pillars.map((pillar) => splitPillar(pillar).branch);
  const rules = [
    { name: "天乙貴人", targets: { "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"], "乙": ["子", "申"], "己": ["子", "申"], "丙": ["亥", "酉"], "丁": ["亥", "酉"], "壬": ["卯", "巳"], "癸": ["卯", "巳"], "辛": ["寅", "午"] }[dayStem] || [], meaning: "危難時較容易接上制度、長輩或專業協助。" },
    { name: "文昌貴人", targets: [{ "甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申", "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯" }[dayStem]].filter(Boolean), meaning: "學習、文字、證照、表達與整理能力較容易被引動。" },
    { name: "祿神", targets: [STEM_LU_BRANCH[dayStem]].filter(Boolean), meaning: "工作收入、自我立足與穩定資源的入口。" },
    { name: "驛馬", targets: uniqueItems([branchGroupValue(yearBranch, ["寅", "申", "亥", "巳"]), branchGroupValue(dayBranch, ["寅", "申", "亥", "巳"])]), meaning: "移動、旅行、換環境、跨城市與行動帶來機會。" },
    { name: "桃花", targets: uniqueItems([branchGroupValue(yearBranch, ["酉", "卯", "午", "子"]), branchGroupValue(dayBranch, ["酉", "卯", "午", "子"])]), meaning: "人際吸引力、審美、社交與感情入口。" },
    { name: "華蓋", targets: uniqueItems([branchGroupValue(yearBranch, ["辰", "戌", "丑", "未"]), branchGroupValue(dayBranch, ["辰", "戌", "丑", "未"])]), meaning: "研究、精神性、藝術、獨處與專門技藝。" },
    { name: "將星", targets: uniqueItems([branchGroupValue(yearBranch, ["子", "午", "酉", "卯"]), branchGroupValue(dayBranch, ["子", "午", "酉", "卯"])]), meaning: "組織、帶領、號召與在群體中承擔位置。" },
  ];
  const records = rules.map((rule) => {
    const hits = branches.map((branch, index) => rule.targets.includes(branch) ? `${PILLAR_NAMES[index]}${branch}` : "").filter(Boolean);
    return { ...rule, hits };
  }).filter((record) => record.hits.length);
  return {
    records,
    text: records.length
      ? `${records.map((record) => `${record.name}落${record.hits.join("、")}，${record.meaning}`).join(" ")}神煞只作輔助定位，仍以月令格局、喜用與行運為主。`
      : "常用輔助神煞未明顯入四柱，不代表吉凶不足；仍以月令格局、喜用與行運為主。",
  };
}

function baziTenGodGroupSummary(chart) {
  const counts = tenGodCounts(chart);
  return BAZI_TEN_GOD_GROUPS.map((group) => ({
    ...group,
    count: group.gods.reduce((sum, god) => sum + (counts[god] || 0), 0),
    detail: group.gods.map((god) => `${god}${counts[god] || 0}`).join("、"),
  }));
}

function baziTenGodInterpretation(chart) {
  const profiles = {
    "比劫": {
      active: "比劫有根，自主性、同輩競爭與人脈互動會比較強，適合自己掌握節奏，但合作與金錢分配要先講清楚。",
      concentrated: "比劫偏集中，行動力與主見很夠，卻容易硬撐、把事情都攬在自己身上；團隊合作宜設定權責與邊界。",
      quiet: "比劫不集中，不代表沒有能力，而是較需要先找到支持環境、同儕夥伴或明確定位，才容易放大行動力。",
    },
    "食傷": {
      active: "食傷有作用，才華、表達、作品與解題能力是重要出口，適合把想法做成看得見的成果。",
      concentrated: "食傷偏集中，創意與輸出動能強，適合內容、產品、技術與商務表達；也要留意太直接、過勞或不耐受規則。",
      quiet: "食傷不集中，輸出風格更需要靠訓練與作品累積建立，不宜只等靈感或一次到位。",
    },
    "財星": {
      active: "財星有根，對資源、現金流與務實成果較敏感，適合把技能、時間與人脈做成可衡量的收入。",
      concentrated: "財星偏集中，對金錢與責任感很強，適合經營現金流與資產；也要避免把安全感全部綁在收入或過度承諾上。",
      quiet: "財星不集中，財務更適合走制度化累積、專業定價與長期規劃，不宜只靠短線機會。",
    },
    "官殺": {
      active: "官殺有作用，容易遇到責任、規範、競爭或被賦予角色，適合把壓力轉成專業、位置與信任。",
      concentrated: "官殺偏集中，責任感與危機感都強，能扛事但也容易長期緊繃；要練習拆分目標、授權與休息。",
      quiet: "官殺不集中，職涯不必硬走權責很重的路線，反而可先靠專長、作品與人脈累積影響力。",
    },
    "印星": {
      active: "印星有作用，學習、證照、貴人、修復與支持系統是命盤的重要底盤。",
      concentrated: "印星偏集中，吸收力與思考深度佳，適合研究與專業累積；也要避免準備太久、只想不做或過度依賴安全感。",
      quiet: "印星不集中，更需要主動建立學習方法、休息制度與可信任的支持網，別把恢復當成理所當然。",
    },
  };
  return baziTenGodGroupSummary(chart)
    .map((group) => {
      const profile = profiles[group.label];
      if (!profile) return "";
      if (group.count >= 3) return `${group.label}${group.count}：${profile.concentrated}`;
      if (group.count >= 1) return `${group.label}${group.count}：${profile.active}`;
      return `${group.label}0：${profile.quiet}`;
    })
    .join(" ");
}

function baziCareerRecommendations(chart, limit = 5) {
  const profile = baziDayMasterProfile(chart);
  const counts = tenGodCounts(chart);
  const scores = new Map();
  const add = (roles, score) => roles.forEach((role, index) => {
    scores.set(role, (scores.get(role) || 0) + score - index * 0.07);
  });

  if ((counts["食神"] || 0) + (counts["傷官"] || 0)) add(["產品經理", "內容策略師", "設計師", "商務企劃"], 1.3);
  if ((counts["正財"] || 0) + (counts["偏財"] || 0)) add(["金融分析師", "商務開發", "不動產顧問", "營運經理"], 1.25);
  if ((counts["正官"] || 0) + (counts["七殺"] || 0)) add(["專案經理", "法遵專員", "風險管理師", "組織管理職"], 1.18);
  if ((counts["正印"] || 0) + (counts["偏印"] || 0)) add(["研究員", "教育顧問", "資料分析師", "醫療照護專員"], 1.05);
  if ((counts["比肩"] || 0) + (counts["劫財"] || 0)) add(["創業者", "顧問", "業務主管", "社群經營者"], 0.88);

  const elementRoles = {
    "木": ["產品經理", "教育培訓師", "策略顧問"],
    "火": ["品牌行銷師", "公關企劃", "內容創作者"],
    "土": ["不動產顧問", "營運經理", "資產管理師"],
    "金": ["金融分析師", "工程師", "法遵專員"],
    "水": ["資料分析師", "國際貿易專員", "研究員"],
  };
  add(elementRoles[profile.dayElement] || [], 0.72);
  add((profile.favorable || []).flatMap((element) => elementRoles[element] || []), 0.46);

  return [...scores.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], "zh-Hant"))
    .slice(0, limit)
    .map(([role]) => role);
}

function baziRelationshipSignal(chart) {
  const relationshipGods = ["正官", "七殺", "正財", "偏財"];
  const records = getBaziTenGodRecords(chart).filter((record) => relationshipGods.includes(record.god));
  const counts = Object.fromEntries(relationshipGods.map((god) => [god, 0]));
  records.forEach((record) => { counts[record.god] += 1; });
  const leadingGods = relationshipGods
    .filter((god) => counts[god])
    .sort((first, second) => counts[second] - counts[first] || first.localeCompare(second, "zh-Hant"));
  const elementCounts = {};
  records.forEach((record) => {
    const element = GAN_ELEMENT[record.stem];
    if (element) elementCounts[element] = (elementCounts[element] || 0) + 1;
  });
  const dayBranch = splitPillar(chart.pillars?.[2]).branch;
  const partnerElement = Object.entries(elementCounts)
    .sort((first, second) => second[1] - first[1])[0]?.[0]
    || ZHI_ELEMENT[dayBranch]
    || "木";
  const relationshipText = leadingGods.length
    ? `關係星見${leadingGods.map((god) => `${god}${counts[god]}`).join("、")}，代表命盤在關係中較容易被${leadingGods.includes("正官") || leadingGods.includes("七殺") ? "有責任感、行動力或專業位置" : "務實、資源感與經營能力"}的對象觸動。`
    : "四柱的關係星不集中，正緣輪廓更要看日支、桃花、干支合沖與行運是否帶動。";
  return { records, counts, leadingGods, partnerElement, dayBranch, relationshipText };
}

function baziPeachBlossomAnalysis(chart) {
  const signals = baziPeachBlossomSignals(chart);
  const dayBranch = splitPillar(chart.pillars?.[2]).branch;
  const relations = baziRelationAnalysis(chart.pillars || []);
  const level = signals.length >= 2 ? "桃花較旺" : signals.length === 1 ? "桃花有入口" : "桃花偏慢熱";
  const relationText = relations.supports.length
    ? `日支${dayBranch}所在四柱有${relations.supports.join("、")}等流通訊號，關係比較容易透過合作、社交或生活互動被推進。`
    : `日支${dayBranch}沒有明顯合局時，感情更需要靠主動認識、穩定相處與生活場景累積。`;
  const lifestyleWarning = level === "桃花較旺"
    ? "不過桃花旺只表示被注意與相遇的入口較多；若生活長期兩點一線、沒有社交或新場景，實際感受仍可能不明顯。"
    : "桃花慢熱不等於沒有姻緣，比較像需要用穩定曝光、朋友介紹或共同興趣慢慢打開入口。";
  return `${level}。${signals.length ? `四柱訊號：${signals.join("；")}。` : "四柱未見明顯桃花入柱。"}${relationText}${lifestyleWarning}`;
}

function baziTopicSupplement(topicKey, chart) {
  const profile = baziDayMasterProfile(chart);
  const counts = tenGodCounts(chart);
  const missing = ELEMENTS.filter((element) => !(chart.elementCounts?.[element] || 0));
  if (topicKey === "property") {
    const wealth = (counts["正財"] || 0) + (counts["偏財"] || 0);
    const earth = chart.elementCounts?.["土"] || 0;
    const propertyTone = wealth + earth >= 4
      ? "財星與土氣承接較明顯，較適合把收入、現金流與長期資產配置連成一套。"
      : wealth + earth >= 2
        ? "有資產累積條件，但買房或投資前更需要先看現金流、負債比與持有成本。"
        : "房產與資產節奏偏慢熱，宜先累積信用、頭期與穩定收入，避免因焦慮或人情而過早承擔。";
    return `房產與資產：${propertyTone} 正財${counts["正財"] || 0}、偏財${counts["偏財"] || 0}、土${earth}，可用來看穩定收入、外部機會與不動產承接的平衡。`;
  }
  if (topicKey === "career") {
    const careers = baziCareerRecommendations(chart);
    return `最有機會的五種職業：${careers.join("、")}。這是依日主${profile.dayElement}、喜用${profile.favorable.join("、")}與十神配置推估；實際仍要以技能、經驗與市場條件校正。`;
  }
  if (topicKey === "marriage") {
    return `八字桃花：${baziPeachBlossomAnalysis(chart)} ${baziRelationshipSignal(chart).relationshipText}`;
  }
  if (topicKey === "children") {
    const output = (counts["食神"] || 0) + (counts["傷官"] || 0);
    const print = (counts["正印"] || 0) + (counts["偏印"] || 0);
    return `子女與作品：食傷${output}、印星${print}。食傷偏看子女緣、作品與創造力；印星偏看照顧、教育與修復資源。兩者能流通時，較能把照顧與自我發展兼顧。`;
  }
  const weakText = missing.length ? `偏弱或未見的五行為${missing.join("、")}，` : "五行沒有明顯缺行，";
  return `健康保養：${weakText}日主${profile.strength}。木偏筋骨與壓力伸展、火偏睡眠與發炎、土偏脾胃代謝、金偏呼吸皮膚與肩頸、水偏內分泌與循環；這是保養提醒，不是疾病診斷。`;
}

function relationLabel(values) {
  return values.join("、");
}

function baziRelationAnalysis(pillars) {
  const stems = pillars.map((pillar) => splitPillar(pillar).stem).filter(Boolean);
  const branches = pillars.map((pillar) => splitPillar(pillar).branch).filter(Boolean);
  const monthElement = ZHI_ELEMENT[branches[1]] || "";
  const hasBoth = (values, first, second) => values.includes(first) && values.includes(second);
  const stemCombines = STEM_COMBINATION_RULES
    .filter(([first, second]) => hasBoth(stems, first, second))
    .map(([first, second, element]) => `${first}${second}合${element}`);
  const stemTransformations = STEM_COMBINATION_RULES
    .filter(([first, second]) => hasBoth(stems, first, second))
    .map(([first, second, element]) => {
      const supported = monthElement === element || ELEMENT_GENERATES[monthElement] === element;
      return `${first}${second}合${element}${supported ? "，得月令聲援、合化條件較足" : "，月令未助、先論合絆不直接論化"}`;
    });
  const stemClashes = STEM_CLASH_RULES
    .filter(([first, second]) => hasBoth(stems, first, second))
    .map(([first, second]) => `${first}${second}沖`);
  const branchCombines = BRANCH_COMBINATION_RULES
    .filter(([first, second]) => hasBoth(branches, first, second))
    .map(([first, second, element]) => `${first}${second}合${element}`);
  const branchClashes = BRANCH_CLASH_RULES
    .filter(([first, second]) => hasBoth(branches, first, second))
    .map(([first, second]) => `${first}${second}沖`);
  const branchHarms = BRANCH_HARM_RULES
    .filter(([first, second]) => hasBoth(branches, first, second))
    .map(([first, second]) => `${first}${second}害`);
  const branchBreaks = BRANCH_BREAK_RULES
    .filter(([first, second]) => hasBoth(branches, first, second))
    .map(([first, second]) => `${first}${second}破`);
  const branchPunishments = BRANCH_PUNISHMENT_RULES
    .filter((rule) => {
      if (rule.length === 2 && rule[0] === rule[1]) {
        return branches.filter((branch) => branch === rule[0]).length >= 2;
      }
      return rule.length === 2
        ? hasBoth(branches, rule[0], rule[1])
        : rule.every((branch) => branches.includes(branch));
    })
    .map((rule) => `${relationLabel(rule)}刑`);
  const triads = BRANCH_TRIAD_RULES
    .map(([first, second, third, element]) => {
      const hits = [first, second, third].filter((branch) => branches.includes(branch));
      if (hits.length < 2) return "";
      return hits.length === 3 ? `${first}${second}${third}三合${element}局` : `${hits.join("")}半合${element}勢`;
    })
    .filter(Boolean);
  const meetings = BRANCH_MEETING_RULES
    .map(([first, second, third, element]) => {
      const hits = [first, second, third].filter((branch) => branches.includes(branch));
      if (hits.length < 2) return "";
      return hits.length === 3 ? `${first}${second}${third}三會${element}局` : `${hits.join("")}會${element}勢`;
    })
    .filter(Boolean);
  const tombs = branches
    .map((branch, index) => ["辰", "戌", "丑", "未"].includes(branch) ? `${PILLAR_NAMES[index]}${branch}墓庫` : "")
    .filter(Boolean);
  const tombClashes = BRANCH_CLASH_RULES
    .filter(([first, second]) => ["辰", "戌", "丑", "未"].includes(first) && hasBoth(branches, first, second))
    .map(([first, second]) => `${first}${second}沖庫`);
  const supports = uniqueItems([...stemCombines, ...branchCombines, ...triads, ...meetings]);
  const tensions = uniqueItems([...stemClashes, ...branchClashes, ...branchHarms, ...branchBreaks, ...branchPunishments]);
  const specials = uniqueItems([...stemTransformations, ...tombs, ...tombClashes]);

  return {
    supports,
    tensions,
    specials,
    stemTransformations,
    meetings,
    branchBreaks,
    tombs,
    tombClashes,
    text: `${supports.length ? `合會與流通訊號：${supports.join("、")}。` : "合會訊號不集中，需靠十神與行運引動。"}${tensions.length ? `結構張力：${tensions.join("、")}，代表人生主題容易出現拉扯、移動、意見衝突或關係調整。` : "四柱未見明顯沖害刑破，原局節奏較能穩定承接。"}${specials.length ? `特殊結構：${specials.join("；")}。` : "未見明顯墓庫開合或天干合化條件。"}`,
  };
}

function stepStemBranch(pillar, direction, steps) {
  const { stem, branch } = splitPillar(pillar);
  const stemIndex = HEAVENLY_STEMS.indexOf(stem);
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0) return "";
  const wrap = (index, length) => ((index % length) + length) % length;
  return `${HEAVENLY_STEMS[wrap(stemIndex + direction * steps, HEAVENLY_STEMS.length)]}${EARTHLY_BRANCHES[wrap(branchIndex + direction * steps, EARTHLY_BRANCHES.length)]}`;
}

function getBaziYun(chart) {
  const gender = chart.formValues.gender === "男" ? 1 : 0;
  const eightChar = chart.eightChar || chart.lunar?.getEightChar?.();
  if (!eightChar?.getYun) return null;
  if (eightChar.setSect) eightChar.setSect(chart.formValues.dayBoundaryRule === "midnight" ? 2 : 1);
  return eightChar.getYun(gender);
}

function baziLuckMeta(chart) {
  try {
    const yun = getBaziYun(chart);
    if (!yun) throw new Error("Yun unavailable");
    const startSolar = yun.getStartSolar?.();
    const startDate = startSolar?.toYmdHms?.() || startSolar?.toYmd?.() || "未取得";
    const startYear = Number(yun.getStartYear?.()) || 0;
    const startMonth = Number(yun.getStartMonth?.()) || 0;
    const startDay = Number(yun.getStartDay?.()) || 0;
    const startHour = Number(yun.getStartHour?.()) || 0;
    const durationParts = [
      startYear ? `${startYear}年` : "",
      startMonth ? `${startMonth}月` : "",
      startDay ? `${startDay}天` : "",
      startHour ? `${startHour}小時` : "",
    ].filter(Boolean).join("") || "出生後不久";
    return {
      direction: yun.isForward?.() ? "順行" : "逆行",
      startDate: String(startDate).replace(/:00$/, ""),
      durationText: durationParts,
      text: `大運採${yun.isForward?.() ? "順行" : "逆行"}，約出生後${durationParts}起運，交運時間為${String(startDate).replace(/:00$/, "")}。交運前後數月常是節奏切換期，應合原局與實際事件觀察。`,
    };
  } catch (error) {
    return {
      direction: "依年干陰陽與性別推定",
      startDate: "資料不足",
      durationText: "資料不足",
      text: "目前函式庫未提供精確交運日期，先以大運順逆與十年區間判讀。",
    };
  }
}

function getBaziLuckCycles(chart) {
  try {
    const yun = getBaziYun(chart);
    const cycles = yun?.getDaYun?.(10) || [];
    const records = cycles
      .map((cycle, index) => {
        const pillar = String(cycle?.getGanZhi?.() || "");
        const validPillar = splitPillar(pillar).stem && splitPillar(pillar).branch;
        const startAge = Number(cycle?.getStartAge?.());
        const endAge = Number(cycle?.getEndAge?.());
        const startYear = Number(cycle?.getStartYear?.());
        const endYear = Number(cycle?.getEndYear?.());
        return {
          index,
          pillar,
          startAge: Number.isFinite(startAge) ? startAge : null,
          endAge: Number.isFinite(endAge) ? endAge : null,
          startYear: Number.isFinite(startYear) ? startYear : null,
          endYear: Number.isFinite(endYear) ? endYear : null,
          xunKong: validPillar ? toTraditional(cycle?.getXunKong?.() || "") : "",
          source: "lunar",
        };
      })
      .filter((item) => splitPillar(item.pillar).stem && splitPillar(item.pillar).branch);
    if (records.length) return records;
  } catch (error) {
    // Fallback below keeps the interface usable if a library version omits Da Yun helpers.
  }

  const yearStem = splitPillar(chart.pillars?.[0]).stem;
  const yearIsYang = STEM_YINYANG[yearStem] === "陽";
  const forward = (chart.formValues.gender === "男" && yearIsYang)
    || (chart.formValues.gender === "女" && !yearIsYang);
  const direction = forward ? 1 : -1;
  const monthPillar = chart.pillars?.[1] || "";
  return Array.from({ length: 8 }, (_, index) => ({
    index,
    pillar: stepStemBranch(monthPillar, direction, index + 1),
    startAge: null,
    endAge: null,
    startYear: null,
    endYear: null,
    xunKong: "",
    source: "fallback",
  }));
}

function renderBaziDecadalOptions(chart) {
  if (!baziDecadalSelect) return;
  const previous = baziDecadalSelect.value;
  const cycles = getBaziLuckCycles(chart);
  const dayStem = splitPillar(chart.pillars?.[2]).stem;
  baziDecadalSelect.innerHTML = cycles
    .map((cycle, index) => {
      const ageText = Number.isFinite(cycle.startAge) && Number.isFinite(cycle.endAge)
        ? `${cycle.startAge}-${cycle.endAge}歲`
        : `第${index + 1}運`;
      const yearText = Number.isFinite(cycle.startYear) && Number.isFinite(cycle.endYear)
        ? ` ${cycle.startYear}-${cycle.endYear}`
        : "";
      const cycleGod = getTenGod(dayStem, splitPillar(cycle.pillar).stem);
      const voidText = cycle.xunKong ? ` 空${cycle.xunKong}` : "";
      return `<option value="${index}">${escapeHtml(`${ageText}${yearText} ${cycle.pillar} ${cycleGod}${voidText}`)}</option>`;
    })
    .join("");
  if ([...baziDecadalSelect.options].some((option) => option.value === previous)) {
    baziDecadalSelect.value = previous;
  }
}

function getBaziLuckTimeline(chart) {
  try {
    const yun = getBaziYun(chart);
    const dayStem = splitPillar(chart.pillars?.[2]).stem;
    return (yun?.getDaYun?.(10) || [])
      .filter((cycle) => splitPillar(cycle?.getGanZhi?.() || "").stem)
      .map((cycle) => {
        const pillar = String(cycle.getGanZhi());
        const years = (cycle.getLiuNian?.(10) || []).map((year) => {
          const yearPillar = String(year.getGanZhi?.() || "");
          return {
            year: Number(year.getYear?.()),
            age: Number(year.getAge?.()),
            pillar: yearPillar,
            god: getTenGod(dayStem, splitPillar(yearPillar).stem),
            xunKong: toTraditional(year.getXunKong?.() || ""),
            source: year,
          };
        });
        return {
          pillar,
          god: getTenGod(dayStem, splitPillar(pillar).stem),
          startAge: Number(cycle.getStartAge?.()),
          endAge: Number(cycle.getEndAge?.()),
          startYear: Number(cycle.getStartYear?.()),
          endYear: Number(cycle.getEndYear?.()),
          xunKong: toTraditional(cycle.getXunKong?.() || ""),
          years,
        };
      });
  } catch (error) {
    return getBaziLuckCycles(chart).map((cycle) => ({ ...cycle, god: "", years: [] }));
  }
}

function baziMonthsForYear(chart, year) {
  const timeline = getBaziLuckTimeline(chart);
  const yearRecord = timeline.flatMap((cycle) => cycle.years).find((record) => record.year === year);
  const dayStem = splitPillar(chart.pillars?.[2]).stem;
  if (yearRecord?.source?.getLiuYue) {
    return yearRecord.source.getLiuYue().map((month) => {
      const pillar = String(month.getGanZhi?.() || "");
      return {
        label: `${toTraditional(month.getMonthInChinese?.() || "")}月`,
        pillar,
        god: getTenGod(dayStem, splitPillar(pillar).stem),
        xunKong: toTraditional(month.getXunKong?.() || ""),
      };
    });
  }
  return Array.from({ length: 12 }, (_, index) => {
    const pillar = getBaziMonthPillar(year, index + 1);
    return {
      label: `${index + 1}月`,
      pillar,
      god: getTenGod(dayStem, splitPillar(pillar).stem),
      xunKong: "",
    };
  });
}

function renderBaziLuckTable(chart) {
  if (!baziLuckTableOutput) return;
  const targetYear = getSafeNumber(baziTargetYearInput, new Date().getFullYear(), 1900, 2100);
  const timeline = getBaziLuckTimeline(chart);
  const cycleHtml = timeline.map((cycle) => {
    const active = targetYear >= cycle.startYear && targetYear <= cycle.endYear;
    return `
      <details class="luck-cycle" ${active ? "open" : ""}>
        <summary>
          <strong>${escapeHtml(`${cycle.pillar} ${cycle.god || ""}`)}</strong>
          <span>${escapeHtml(`${cycle.startAge}-${cycle.endAge}歲 · ${cycle.startYear}-${cycle.endYear}${cycle.xunKong ? ` · 旬空${cycle.xunKong}` : ""}`)}</span>
        </summary>
        <div class="luck-year-grid">
          ${cycle.years.length ? cycle.years.map((year) => `
            <div class="luck-time-item ${year.year === targetYear ? "is-current" : ""}">
              <b>${escapeHtml(String(year.year))}</b>
              <strong>${escapeHtml(`${year.pillar} ${year.god || ""}`)}</strong>
              <small>${escapeHtml(`${year.age}歲${year.xunKong ? ` · 空${year.xunKong}` : ""}`)}</small>
            </div>
          `).join("") : `<p class="calibration-empty">此大運未取得逐年資料。</p>`}
        </div>
      </details>
    `;
  }).join("");
  const monthHtml = baziMonthsForYear(chart, targetYear).map((month) => `
    <div class="luck-time-item">
      <b>${escapeHtml(month.label)}</b>
      <strong>${escapeHtml(`${month.pillar} ${month.god || ""}`)}</strong>
      <small>${escapeHtml(month.xunKong ? `旬空${month.xunKong}` : "節氣月")}</small>
    </div>
  `).join("");

  baziLuckTableOutput.innerHTML = `
    <div class="luck-cycle-list">${cycleHtml}</div>
    <h3 class="calibration-heading">${escapeHtml(String(targetYear))} 流月</h3>
    <div class="luck-month-grid">${monthHtml}</div>
  `;
}

function getBaziYearPillar(year) {
  try {
    return Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar().getEightChar().getYear() || "";
  } catch (error) {
    return "";
  }
}

function getBaziMonthPillar(year, month) {
  try {
    return Solar.fromYmdHms(year, month, 15, 12, 0, 0).getLunar().getEightChar().getMonth() || "";
  } catch (error) {
    return "";
  }
}

function baziLuckCycleForYear(chart, year) {
  return getBaziLuckCycles(chart).find((cycle) => Number.isFinite(cycle.startYear)
    && Number.isFinite(cycle.endYear)
    && year >= cycle.startYear
    && year <= cycle.endYear) || null;
}

function buildBaziPeriodContext(chart) {
  const scope = BAZI_SCOPE_LABELS[baziScopeSelect?.value] ? baziScopeSelect.value : "natal";
  const targetYear = getSafeNumber(baziTargetYearInput, new Date().getFullYear(), 1900, 2100);
  const targetMonth = getSafeNumber(baziTargetMonthInput, new Date().getMonth() + 1, 1, 12);
  if (scope === "natal") {
    return { scope, periodName: BAZI_SCOPE_LABELS.natal, pillar: "", targetYear, targetMonth, layers: [] };
  }
  const cycles = getBaziLuckCycles(chart);
  const selectedIndex = getSafeNumber(baziDecadalSelect, 0, 0, Math.max(0, cycles.length - 1));
  const cycle = scope === "decadal"
    ? cycles[selectedIndex] || {}
    : baziLuckCycleForYear(chart, targetYear);
  const layers = [];
  if (cycle?.pillar) layers.push({ label: "大運", pillar: cycle.pillar, cycle });

  if (scope === "yearly" || scope === "monthly") {
    const yearlyPillar = getBaziYearPillar(targetYear);
    if (yearlyPillar) layers.push({ label: "流年", pillar: yearlyPillar });
  }
  if (scope === "monthly") {
    const monthlyPillar = getBaziMonthPillar(targetYear, targetMonth);
    if (monthlyPillar) layers.push({ label: "流月", pillar: monthlyPillar });
  }

  if (scope === "yearly") {
    const pillar = layers.find((layer) => layer.label === "流年")?.pillar || "";
    return { scope, periodName: `${targetYear} 流年`, pillar, targetYear, targetMonth, cycle, layers };
  }
  if (scope === "monthly") {
    const pillar = layers.find((layer) => layer.label === "流月")?.pillar || "";
    return { scope, periodName: `${targetYear}年${targetMonth}月 流月`, pillar, targetYear, targetMonth, cycle, layers };
  }

  const index = selectedIndex;
  const ageText = Number.isFinite(cycle.startAge) && Number.isFinite(cycle.endAge)
    ? `${cycle.startAge}-${cycle.endAge}歲`
    : `第${index + 1}運`;
  return {
    scope,
    periodName: `${ageText} 大運`,
    pillar: cycle.pillar || "",
    targetYear,
    targetMonth,
    cycle,
    layers,
  };
}

function baziPairInteractions(natalPillar, flowPillar) {
  const natal = splitPillar(natalPillar);
  const flow = splitPillar(flowPillar);
  const interactions = [];
  STEM_COMBINATION_RULES.forEach(([first, second, element]) => {
    if ([natal.stem, flow.stem].includes(first) && [natal.stem, flow.stem].includes(second)) interactions.push(`${flow.stem}${natal.stem}天干合${element}`);
  });
  STEM_CLASH_RULES.forEach(([first, second]) => {
    if ([natal.stem, flow.stem].includes(first) && [natal.stem, flow.stem].includes(second)) interactions.push(`${flow.stem}${natal.stem}天干沖`);
  });
  BRANCH_COMBINATION_RULES.forEach(([first, second, element]) => {
    if ([natal.branch, flow.branch].includes(first) && [natal.branch, flow.branch].includes(second)) interactions.push(`${flow.branch}${natal.branch}六合${element}`);
  });
  BRANCH_CLASH_RULES.forEach(([first, second]) => {
    if ([natal.branch, flow.branch].includes(first) && [natal.branch, flow.branch].includes(second)) interactions.push(`${flow.branch}${natal.branch}沖`);
  });
  BRANCH_HARM_RULES.forEach(([first, second]) => {
    if ([natal.branch, flow.branch].includes(first) && [natal.branch, flow.branch].includes(second)) interactions.push(`${flow.branch}${natal.branch}害`);
  });
  BRANCH_BREAK_RULES.forEach(([first, second]) => {
    if ([natal.branch, flow.branch].includes(first) && [natal.branch, flow.branch].includes(second)) interactions.push(`${flow.branch}${natal.branch}破`);
  });
  BRANCH_PUNISHMENT_RULES.filter((rule) => rule.length === 2).forEach(([first, second]) => {
    if (first === second) {
      if (natal.branch === first && flow.branch === first) interactions.push(`${flow.branch}${natal.branch}自刑`);
    } else if ([natal.branch, flow.branch].includes(first) && [natal.branch, flow.branch].includes(second)) {
      interactions.push(`${flow.branch}${natal.branch}刑`);
    }
  });
  return uniqueItems(interactions);
}

function baziPeriodInteractionAnalysis(chart, period) {
  const layers = period?.layers || [];
  const records = layers.flatMap((layer) => chart.pillars.flatMap((pillar, index) => baziPairInteractions(pillar, layer.pillar)
    .map((interaction) => ({
      layer: layer.label,
      flowPillar: layer.pillar,
      natalPillar: PILLAR_NAMES[index],
      area: PILLAR_LIFE_AREAS[index],
      interaction,
    }))));
  const fullRelations = layers.map((layer) => ({
    label: layer.label,
    pillar: layer.pillar,
    relations: baziRelationAnalysis([...(chart.pillars || []), layer.pillar]),
  }));
  const recordText = records.length
    ? records.map((record) => `${record.layer}${record.flowPillar}與${record.natalPillar}形成${record.interaction}，牽動${record.area}`).join("；")
    : "目前行運與四柱沒有形成直接六合、沖、刑、害或破，事件較多從十神增減與五行強弱表現。";
  const tripleText = uniqueItems(fullRelations.flatMap((item) => [
    ...item.relations.meetings,
    ...item.relations.stemTransformations,
    ...item.relations.tombClashes,
  ])).join("；");
  return {
    records,
    text: `${recordText}${tripleText ? `；行運加入後另見${tripleText}` : ""}。`,
  };
}

function baziPeriodReading(chart, period) {
  if (!period.pillar) return "原局先看日主、月令、十神與四柱干支關係；行運尚未疊加。";
  const dayStem = splitPillar(chart.pillars?.[2]).stem;
  const layerText = (period.layers || [{ label: period.periodName, pillar: period.pillar }]).map((layer) => {
    const { stem, branch } = splitPillar(layer.pillar);
    const stemGod = getTenGod(dayStem, stem);
    const hiddenGods = getHiddenStemGods(dayStem, branch).map((item) => `${item.stem}${item.god}`);
    return `${layer.label}${layer.pillar}：天干${stemGod || "五行作用"}，地支藏${hiddenGods.join("、") || "干"}`;
  }).join("；");
  const interaction = baziPeriodInteractionAnalysis(chart, period);
  return `${period.periodName}疊加：${layerText}。${interaction.text}${period.scope === "monthly" ? "流月干支以該月十五日所處節氣月代表；節氣交接日前後需再用具體日期細校。" : ""}`;
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
  const maxDay = new Date(targetYear, targetMonth, 0).getDate();
  const targetDay = getSafeNumber(targetDayInput, new Date().getDate(), 1, maxDay);
  const targetHour = getSafeNumber(targetHourInput, new Date().getHours(), 0, 23);
  let targetDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")} ${String(targetHour).padStart(2, "0")}:00`;
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
    horoscope = getHoroscopeSafe(chart.astrolabe, `${targetYear}-07-01 12:00`);
    periodIndex = horoscope?.yearly?.index ?? null;
    periodName = `${targetYear} ${SCOPE_LABELS[scope]}`;
  }

  if (["age", "monthly", "daily", "hourly"].includes(scope)) {
    horoscope = getHoroscopeSafe(chart.astrolabe, targetDate);
    const period = horoscope?.[scope];
    periodIndex = period?.index ?? null;
    periodName = scope === "age"
      ? `${targetYear} 小限（虛歲${period?.nominalAge || "未定"}）`
      : scope === "monthly"
        ? `${targetYear}年${targetMonth}月 流月`
        : scope === "daily"
          ? `${targetYear}年${targetMonth}月${targetDay}日 流日`
          : `${targetYear}年${targetMonth}月${targetDay}日${targetHour}時 流時`;
  }

  return {
    scope,
    targetYear,
    targetMonth,
    targetDay,
    targetHour,
    targetDate,
    horoscope,
    periodIndex,
    periodName,
    periodPalace: Number.isInteger(periodIndex) ? chart.astrolabe.palaces[periodIndex] : null,
  };
}

function periodLayerKeys(scope) {
  const layers = [];
  if (["decadal", "age", "yearly", "monthly", "daily", "hourly"].includes(scope)) layers.push("decadal");
  if (["age", "yearly", "monthly", "daily", "hourly"].includes(scope)) layers.push("yearly");
  if (["monthly", "daily", "hourly"].includes(scope)) layers.push("monthly");
  if (["daily", "hourly"].includes(scope)) layers.push("daily");
  if (scope === "hourly") layers.push("hourly");
  return layers;
}

function periodStarsAt(context, index) {
  if (!context.horoscope || !Number.isInteger(index)) return [];
  const layers = periodLayerKeys(context.scope);
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
    health: "健康分析以疾厄宮看身體弱點，命宮看體質基調，福德宮看睡眠、精神與壓力修復；命理結果只能作保養提醒，不取代醫師診斷。",
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
    health: ["疾厄宮", "命宮", "福德宮", "父母宮", "田宅宮", "遷移宮"],
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

function baziPeriodTopicAdvice(topicKey, chart, period) {
  if (!period?.pillar) return "原局重點在先把日主、月令與十神是否流通看清楚，再決定行動節奏。";
  const dayStem = splitPillar(chart.pillars?.[2]).stem;
  const layerPillars = period.layers?.length ? period.layers : [{ label: period.periodName, pillar: period.pillar }];
  const periodGods = uniqueItems(layerPillars.flatMap((layer) => {
    const { stem, branch } = splitPillar(layer.pillar);
    return [getTenGod(dayStem, stem), ...getHiddenStemGods(dayStem, branch).map((item) => item.god)].filter(Boolean);
  }));
  const hasAny = (gods) => periodGods.some((god) => gods.includes(god));
  const focus = {
    property: hasAny(["正財", "偏財"])
      ? "財星被行運帶動，適合把收入、現金流、投資研究與資產規劃拆成可執行的紀律。"
      : hasAny(["食神", "傷官"])
        ? "食傷被帶動，較適合靠技能輸出、內容、業務或副業探索創造現金流。"
        : "財星未被直接帶動，宜先整理預算、信用、風險與長期累積，不宜急著放大槓桿。",
    career: hasAny(["正官", "七殺"])
      ? "官殺被帶動，責任、考核、職位競爭或轉換壓力會變明顯，適合以專業與規則承接。"
      : hasAny(["正印", "偏印"])
        ? "印星被帶動，適合進修、考證照、尋找師長或把專業底盤打穩。"
        : "此期更適合讓食傷與財星轉為成果，主動呈現作品、談合作或整理履歷。",
    marriage: hasAny(["正官", "七殺", "正財", "偏財"])
      ? "伴侶星被行運帶動，容易出現較具現實感的認識、確認關係或討論責任分工的機會。"
      : "伴侶星不屬於直接引動，關係更仰賴社交場域、溝通品質與生活節奏是否願意騰出空間。",
    children: hasAny(["食神", "傷官"])
      ? "食傷被帶動，子女、作品、創造力與照顧議題較容易浮現，適合把時間與資源安排得更具彈性。"
      : "食傷不直接突出，宜先把身心與生活節奏調整好，讓創造與照顧能有穩定承接。",
    health: hasAny(["七殺", "傷官"])
      ? "壓力與耗能訊號較明顯，工作節奏、睡眠與情緒反應要優先管理；這是保養提醒，不是疾病診斷。"
      : hasAny(["正印", "偏印"])
        ? "印星被帶動，較適合建立修復節奏、健檢、休養與規律保養。"
        : "五行平衡與作息仍是本期健康重點；不適應以醫師與正式檢查為準。",
  }[topicKey] || "行運需配合原局與實際選擇判讀。";

  return `${period.periodName}疊加${layerPillars.map((layer) => `${layer.label}${layer.pillar}`).join("、")}，十神重點為${periodGods.join("、") || "未取得"}。${focus}`;
}

function baziTopicAnalysis(topicKey, chart, topic, period = null) {
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
    health: `八字健康看五行偏盛偏枯、印星修復力、食傷消耗與官殺壓力；本盤${godCountText(counts, ["正印", "偏印", "食神", "傷官", "正官", "七殺"])}。印星較能看恢復、休養與照護資源，食傷過旺時要留意過度輸出與作息消耗，官殺重時壓力與緊繃感要優先管理。${element.text}`,
  };

  return {
    text: `${map[topicKey] || element.text}${period ? baziPeriodTopicAdvice(topicKey, chart, period) : ""}`,
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
  const health = topicKey === "health" ? healthCareText(chart, context) : "";

  return [
    `紫微斗數以${topic.label}主宮為起點，但不單看一宮；本次同時納入${palaceListText(network.networkPalaces)}，並以${primary ? normalizePalaceName(primary.palace.name) : "主宮"}的三方四正${palaceListText(squarePalaces)}確認成局。`,
    primary ? describePalaceEvaluation(primary) + "。" : "",
    primaryStory,
    support,
    pressure,
    flower,
    property,
    career,
    health,
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

function nativePeachBlossomAnalysis(chart, network, options = {}) {
  const includeBazi = options.includeBazi !== false;
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
  const baziSignals = includeBazi ? baziPeachBlossomSignals(chart) : [];
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
  const baziText = includeBazi
    ? (baziSignals.length
      ? `八字桃花訊號為${baziSignals.join("；")}。`
      : "八字年支、日支桃花未明顯入四柱，桃花較不屬於自動被追求型。")
    : "";
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
  const startYear = new Date().getFullYear();
  return Array.from({ length: span }, (_, offset) => {
    const year = startYear + offset;
    const context = buildYearContext(chart, year);
    const network = evaluateTopicNetwork(topicKey, chart, context);
    const starNames = uniqueItems(network.evaluations.flatMap((item) => item.stars.flatMap((star) => [
      starPlainName(star),
      starReadingDisplayName(star),
    ])));
    return {
      year,
      age: year - chart.formValues.year + 1,
      context,
      network,
      starNames,
      score: network.score,
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
  let note = "時間軸以未來十二年流年宮位、主題宮位三方四正、來因宮與星曜結構推估。";

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
  } else if (topicKey === "health") {
    const checkup = pick((record) => record.score
      + (periodHits(record, ["疾厄宮", "命宮", "父母宮"]) ? 2.4 : 0)
      + starHits(record, ["天梁", "天魁", "天鉞", "化科", "左輔", "右弼"]) * 0.75);
    const repair = pick((record) => record.score
      + (periodHits(record, ["福德宮", "田宅宮", "命宮"]) ? 2 : 0)
      + starHits(record, ["太陰", "天同", "天府", "祿存", "化祿"]) * 0.65
      - record.network.pressureStars.length * 0.2);
    const pressure = pick((record) => -record.score
      + record.network.pressureStars.length * 1.25
      + (periodHits(record, ["疾厄宮", "官祿宮", "遷移宮"]) ? 1.8 : 0)
      + starHits(record, ["擎羊", "陀羅", "火星", "鈴星", "化忌", "病符", "白虎"]) * 0.75);
    items.push(
      timelineEntry("適合健檢與調理", checkup, "疾厄、命宮或父母宮被啟動，適合做健康檢查、追蹤舊問題與建立保養計畫。"),
      timelineEntry("修復作息窗口", repair, "福德、田宅與命宮承接較好，適合調整睡眠、飲食、運動與居家生活節奏。"),
      timelineEntry("壓力需保守", pressure, "疾厄、官祿或遷移壓力較明顯，工作奔波、睡眠不足或身體警訊要提早處理。"),
    );
    note = "健康時間軸為命理保養提醒，不是疾病診斷；若有症狀、疼痛或檢查異常，請以醫師與正式檢查為準。";
  } else {
    const windfall = pick((record) => record.score
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
      timelineEntry("外部財機會", windfall, "財帛、遷移、官祿與祿馬財星牽動較明顯，適合嘗試副業、業務、投資研究或外部機會。"),
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

function healthCareText(chart, context) {
  const illnessPalace = findPalaceByName(chart.astrolabe, "疾厄宮");
  const lifePalace = getLifePalace(chart.astrolabe);
  const fortunePalace = findPalaceByName(chart.astrolabe, "福德宮");
  if (!illnessPalace) return "健康提醒：目前未取得疾厄宮資料，健康主題只能用八字五行作概略提醒。";

  const illnessEvaluation = evaluatePalace(illnessPalace, periodStarsAt(context, illnessPalace.index));
  const lifeEvaluation = lifePalace ? evaluatePalace(lifePalace, periodStarsAt(context, lifePalace.index)) : null;
  const fortuneEvaluation = fortunePalace ? evaluatePalace(fortunePalace, periodStarsAt(context, fortunePalace.index)) : null;
  const branchElement = ZHI_ELEMENT[illnessPalace.earthlyBranch] || "";
  const elementFocus = {
    "木": "木象偏筋骨、肝膽、眼睛、神經緊繃與伸展循環，重點是規律運動、放鬆與不要長期憋壓。",
    "火": "火象偏心火、血壓、發炎、睡眠品質與急躁耗能，重點是降火、早睡與避免長期高刺激。",
    "土": "土象偏脾胃、消化、代謝、肌肉承載與濕氣，重點是飲食節制、穩定作息與少冰甜油膩。",
    "金": "金象偏呼吸道、皮膚、過敏、肩頸與規律性，重點是空氣品質、伸展與不要過度緊繃。",
    "水": "水象偏腎氣、泌尿、內分泌、循環與寒濕，重點是保暖、補水、睡眠與避免透支。",
  }[branchElement] || "五行象意不集中，重點放在作息、飲食、壓力與年度健檢。";
  const pressureStars = cleanReadingStarNames(illnessEvaluation.challenges, 5);
  const supportStars = cleanReadingStarNames([
    ...illnessEvaluation.helpful,
    ...(lifeEvaluation?.helpful || []),
    ...(fortuneEvaluation?.helpful || []),
  ], 5);
  const pressure = pressureStars.length
    ? `疾厄宮壓力星見${pressureStars.join("、")}，壓力容易從身體警訊、睡眠、發炎或慢性不適表現出來。`
    : "疾厄宮煞忌壓力不重，較適合用穩定作息與運動保養維持。";
  const support = supportStars.length
    ? `修復助力見${supportStars.join("、")}，代表照護資源、恢復意識或遇到好醫師/好方法的機會較容易接上。`
    : "修復助力星不算集中，更需要靠固定習慣與紀律保養。";

  return `健康提醒：疾厄宮為${palaceLabel(illnessPalace)}，${elementFocus}${pressure}${support}命理只能提示保養方向，任何症狀仍應以醫師檢查為準。`;
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
  const scored = new Map();
  const addCareers = (careers, score) => {
    careers.forEach((career, index) => {
      scored.set(career, (scored.get(career) || 0) + score - index * 0.06);
    });
  };
  PARTNER_CAREER_RULES.forEach(([keywords, options]) => {
    const hits = keywords.filter((keyword) => starNames.some((name) => name.includes(keyword))).length;
    if (hits) addCareers(options, 1.35 + hits * 0.35);
  });

  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "";
  const fallback = {
    "木": ["產品企劃", "教育培訓師", "成長顧問"],
    "火": ["品牌行銷師", "內容創作者", "活動企劃"],
    "土": ["不動產顧問", "營運經理", "專案經理"],
    "金": ["金融分析師", "法遵專員", "工程師"],
    "水": ["研究員", "心理諮詢師", "國際貿易專員"],
  }[branchElement] || ["專案經理", "顧問", "專業技術人員"];
  addCareers(fallback, 0.55);

  return [...scored.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], "zh-Hant"))
    .slice(0, 5)
    .map(([career]) => career);
}

function numberFromSeed(seed, min, max) {
  const span = max - min + 1;
  return min + (Math.abs(seed) % span);
}

function pickBySeed(items, seed) {
  return items[Math.abs(seed) % items.length];
}

function partnerPresentationKind(targetGender) {
  if (/女性|陰柔/.test(targetGender)) return "feminine";
  return "masculine";
}

function inferPartnerGenderProfile(starNames, spousePalace) {
  const branch = toTraditional(spousePalace?.earthlyBranch || "");
  const branchElement = ZHI_ELEMENT[branch] || "";
  let masculine = BRANCH_YINYANG[branch] === "陽" ? 1.2 : 0;
  let feminine = BRANCH_YINYANG[branch] === "陰" ? 1.2 : 0;

  masculine += namesIncludeAny(starNames, ["太陽", "武曲", "七殺", "破軍", "天梁", "紫微", "化權"]) ? 1.6 : 0;
  masculine += namesIncludeAny(starNames, ["擎羊", "火星", "鈴星"]) ? 0.8 : 0;
  feminine += namesIncludeAny(starNames, ["太陰", "天同", "天姚", "紅鸞", "天喜", "咸池", "文曲"]) ? 1.6 : 0;
  feminine += namesIncludeAny(starNames, ["天鉞", "右弼"]) ? 0.6 : 0;

  if (branchElement === "火" || branchElement === "金") masculine += 0.35;
  if (branchElement === "水" || branchElement === "木") feminine += 0.35;

  if (feminine > masculine) {
    return {
      label: "女性氣質",
      imageGender: "feminine-presenting adult woman",
      kind: "feminine",
      reason: "夫妻宮與三方四正陰柔、桃花、審美或照護星較明顯，對象外在呈現偏女性氣質。",
    };
  }

  return {
    label: "男性氣質",
    imageGender: "masculine-presenting adult man",
    kind: "masculine",
    reason: "夫妻宮與三方四正陽剛、執行、承擔或開創星較明顯，對象外在呈現偏男性氣質。",
  };
}

function partnerBodyMetrics(targetGender, branchElement, starNames, seed) {
  const kind = partnerPresentationKind(targetGender);
  const femaleRanges = {
    "木": [164, 171, 48, 56],
    "火": [160, 168, 45, 54],
    "土": [158, 165, 52, 62],
    "金": [162, 170, 48, 57],
    "水": [158, 166, 46, 55],
  };
  const maleRanges = {
    "木": [176, 184, 64, 76],
    "火": [173, 181, 63, 75],
    "土": [171, 179, 70, 84],
    "金": [174, 182, 65, 78],
    "水": [170, 178, 60, 72],
  };
  const rangeMap = kind === "feminine" ? femaleRanges : maleRanges;
  const [minHeight, maxHeight, minWeight, maxWeight] = rangeMap[branchElement] || [162, 172, 50, 64];
  const height = numberFromSeed(seed, minHeight, maxHeight);
  const weight = numberFromSeed(seed * 7, minWeight, maxWeight);
  const isSoft = namesIncludeAny(starNames, ["太陰", "天同", "紅鸞", "天喜", "天姚", "咸池"]);
  const isSharp = namesIncludeAny(starNames, ["武曲", "七殺", "破軍", "擎羊", "陀羅"]);

  if (kind === "feminine") {
    const cupOptions = branchElement === "土" || branchElement === "水"
      ? ["C-D", "D", "C", "D-E"]
      : branchElement === "火"
        ? ["B-C", "C", "C-D"]
        : ["B-C", "C", "B", "C-D"];
    const cup = isSoft
      ? pickBySeed(["C", "C-D", "D"], seed + 11)
      : isSharp
        ? pickBySeed(["B", "B-C", "C"], seed + 13)
        : pickBySeed(cupOptions, seed + 17);
    return {
      height: `${height} cm`,
      weight: `${weight} kg`,
      bodyRatio: `上圍約${cup}罩杯，腰臀比例偏${isSoft ? "柔和有曲線" : isSharp ? "俐落緊實" : "協調耐看"}`,
    };
  }

  return {
    height: `${height} cm`,
    weight: `${weight} kg`,
    bodyRatio: isSharp
      ? "肩線清楚、胸背較緊實，給人乾淨俐落的壓迫感"
      : isSoft
        ? "肩頸線條柔和，身形不誇張但有親近感"
        : "肩寬與腰線比例均衡，整體體態穩定耐看",
  };
}

function partnerHairAndStyle(targetGender, branchElement, starNames, seed) {
  const kind = partnerPresentationKind(targetGender);
  const hairColors = {
    "木": ["深棕色", "自然黑帶棕光", "栗棕色"],
    "火": ["暖棕色", "焦糖棕", "深咖啡色"],
    "土": ["自然黑", "霧棕色", "深茶色"],
    "金": ["冷黑色", "亞麻棕", "霧感深棕"],
    "水": ["烏黑色", "藍黑色", "柔霧黑茶色"],
  }[branchElement] || ["自然黑"];
  const femaleHair = {
    "木": ["鎖骨長髮或微層次長髮", "自然微捲長髮", "帶空氣感的中長髮"],
    "火": ["俐落中長髮", "大波浪捲髮", "高層次短中髮"],
    "土": ["柔順中長髮", "低層次長髮", "自然內彎髮型"],
    "金": ["俐落直髮", "耳下短髮或鎖骨髮", "乾淨線條感中長髮"],
    "水": ["柔霧長髮", "微捲長髮", "低調帶瀏海的中長髮"],
  }[branchElement] || ["自然中長髮"];
  const maleHair = {
    "木": ["自然蓬鬆短髮", "清爽旁分", "帶層次的中短髮"],
    "火": ["俐落短髮", "微濕感短髮", "有造型感的上梳短髮"],
    "土": ["穩重短髮", "低調旁分", "乾淨寸短或商務短髮"],
    "金": ["線條感短髮", "乾淨旁分", "俐落油頭感短髮"],
    "水": ["柔順短中髮", "自然瀏海短髮", "鬆弛感旁分"],
  }[branchElement] || ["自然短髮"];
  const outfitBase = {
    "木": kind === "feminine" ? "喜歡襯衫、針織、長裙或有垂墜感的單品" : "偏好襯衫、薄外套、乾淨休閒與有層次的穿法",
    "火": kind === "feminine" ? "喜歡亮色點綴、合身上衣、短版外套或有存在感的配件" : "偏好合身剪裁、運動休閒、皮革或亮色細節",
    "土": kind === "feminine" ? "喜歡大地色、柔軟材質、長版外套與穩重質感" : "偏好大地色、工裝、針織與穩重耐看的單品",
    "金": kind === "feminine" ? "喜歡西裝外套、單色洋裝、金屬飾品與乾淨線條" : "偏好襯衫、西裝外套、單色系與俐落剪裁",
    "水": kind === "feminine" ? "喜歡柔霧色、絲質或雪紡、寬鬆但修飾身形的穿搭" : "偏好深色、柔軟材質、簡潔但有細節的穿法",
  }[branchElement] || "穿搭偏乾淨耐看";
  const stylingNotes = [];

  if (namesIncludeAny(starNames, ["紅鸞", "天喜", "天姚", "咸池"])) stylingNotes.push("桃花星讓穿搭更重視香氣、飾品與第一眼氛圍。");
  if (namesIncludeAny(starNames, ["天機", "文昌", "文曲"])) stylingNotes.push("文機星讓整體更像聰明型審美，衣服乾淨但會有小巧思。");
  if (namesIncludeAny(starNames, ["武曲", "七殺", "破軍"])) stylingNotes.push("武殺破讓造型偏冷、偏帥，少廢話但很有辨識度。");

  return {
    hairColor: pickBySeed(hairColors, seed + 3),
    hairStyle: pickBySeed(kind === "feminine" ? femaleHair : maleHair, seed + 5),
    outfit: outfitBase,
    stylingNotes,
  };
}

function inferPartnerAppearance(starNames, spousePalace, targetGender = "成人") {
  const branchElement = ZHI_ELEMENT[spousePalace?.earthlyBranch] || "木";
  const seed = hashText(`${targetGender}${branchElement}${starNames.join("")}${spousePalace?.name || ""}`);
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
  const metrics = partnerBodyMetrics(targetGender, branchElement, starNames, seed);
  const style = partnerHairAndStyle(targetGender, branchElement, starNames, seed);

  if (namesIncludeAny(starNames, ["天機"])) notes.push("天機使外型更顯機靈、敏捷，眼神與肢體反應快。");
  if (namesIncludeAny(starNames, ["巨門"])) notes.push("巨門強化口條與嘴部表情，聲音、說話方式容易成為辨識點。");
  if (namesIncludeAny(starNames, ["太陽"])) notes.push("太陽使氣場較明朗，五官或笑容比較外放。");
  if (namesIncludeAny(starNames, ["太陰"])) notes.push("太陰使外貌偏柔和、乾淨，氣質較安靜細緻。");
  if (namesIncludeAny(starNames, ["武曲", "七殺", "破軍"])) notes.push("武殺破系會讓身形更俐落，骨架或肌肉感較明顯。");
  if (namesIncludeAny(starNames, ["紅鸞", "天喜", "天姚", "咸池"])) notes.push("桃花星使打扮、親和力或吸引力更容易被注意。");
  if (namesIncludeAny(starNames, ["擎羊", "陀羅", "火星", "鈴星"])) notes.push("煞星入參考時，外型可能帶銳利、冷感或高壓工作的痕跡。");

  const story = [
    `整體像是${metrics.height}、${metrics.weight}左右的${targetGender}，${metrics.bodyRatio}。`,
    `髮色偏${style.hairColor}，髮型多半是${style.hairStyle}。`,
    `穿著偏好：${style.outfit}。`,
  ].join("");

  return {
    ...base,
    element: branchElement,
    details: {
      ...metrics,
      ...style,
      story,
    },
    notes: [...notes, ...style.stylingNotes],
  };
}

function partnerTargetGender(chart) {
  return chart.partnerProfile?.genderProfile?.label || "命盤所示對象氣質";
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
  const genderProfile = inferPartnerGenderProfile(supportStars, spousePalace);
  const appearance = inferPartnerAppearance(supportStars, spousePalace, genderProfile.label);
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
    genderProfile,
    appearance,
    spouseEvaluation,
    spouseMain,
    meeting,
  };
}

function inferBaziPartnerGenderProfile(chart, relationship) {
  const dayBranchYinYang = BRANCH_YINYANG[relationship.dayBranch] || "";
  if (dayBranchYinYang === "陰") {
    return {
      label: "女性氣質",
      imageGender: "feminine-presenting adult woman",
      kind: "feminine",
      reason: "日支陰性與關係星的細膩、承接特質較明顯，對象外在呈現偏女性氣質。",
    };
  }
  return {
    label: "男性氣質",
    imageGender: "masculine-presenting adult man",
    kind: "masculine",
    reason: "日支陽性與關係星的行動、承擔特質較明顯，對象外在呈現偏男性氣質。",
  };
}

function baziPartnerCareers(chart, relationship) {
  const scores = new Map();
  const add = (roles, score) => roles.forEach((role, index) => {
    scores.set(role, (scores.get(role) || 0) + score - index * 0.07);
  });
  const elementRoles = {
    "木": ["教育顧問", "產品經理", "策略企劃", "心理諮詢師"],
    "火": ["品牌行銷師", "公關顧問", "內容創作者", "活動企劃"],
    "土": ["不動產顧問", "營運經理", "專案經理", "資產管理師"],
    "金": ["金融分析師", "工程師", "法遵專員", "品質管理師"],
    "水": ["研究員", "資料分析師", "國際貿易專員", "旅運規劃師"],
  };
  add(elementRoles[relationship.partnerElement] || [], 1.2);
  if (relationship.leadingGods.some((god) => ["正官", "七殺"].includes(god))) {
    add(["專案經理", "法遵專員", "風險管理師", "組織管理職"], 0.95);
  }
  if (relationship.leadingGods.some((god) => ["正財", "偏財"].includes(god))) {
    add(["金融分析師", "商務開發", "不動產顧問", "營運經理"], 0.95);
  }
  add(baziCareerRecommendations(chart, 5), 0.3);
  return [...scores.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], "zh-Hant"))
    .slice(0, 5)
    .map(([role]) => role);
}

function buildBaziPartnerProfile(chart) {
  const relationship = baziRelationshipSignal(chart);
  const genderProfile = inferBaziPartnerGenderProfile(chart, relationship);
  const pseudoPalace = { name: "日支", earthlyBranch: relationship.dayBranch };
  const supportStars = uniqueItems([
    ...relationship.leadingGods,
    `日支${relationship.dayBranch}`,
    `關係五行${relationship.partnerElement}`,
  ]);
  const appearance = inferPartnerAppearance(supportStars, pseudoPalace, genderProfile.label);
  const relations = baziRelationAnalysis(chart.pillars || []);
  const careers = baziPartnerCareers(chart, relationship);
  const peach = baziPeachBlossomAnalysis(chart);
  const dayMaster = baziDayMasterProfile(chart);
  const meeting = [
    `日支${relationship.dayBranch}是八字關係與相處模式的重要位置；以${relationship.partnerElement}五行作為對象氣質、外型與職業調性的底色。`,
    relationship.relationshipText,
    relations.text,
    `桃花訊號：${peach}`,
    `日主${dayMaster.dayStem}${dayMaster.dayElement}呈${dayMaster.strength}，會影響命主在關係裡需要安全感、互動空間或承諾節奏的方式。`,
  ];

  return {
    source: "bazi",
    sourceLabel: "八字四柱",
    relationship,
    genderProfile,
    appearance,
    careers,
    supportStars,
    meeting,
    focusText: `日主${dayMaster.dayStem}${dayMaster.dayElement}、日支${relationship.dayBranch}、關係星${relationship.leadingGods.join("、") || "不集中"}、四柱合沖`,
    imageContext: {
      spouse: `日支${relationship.dayBranch}／關係五行${relationship.partnerElement}`,
      spouseSquare: relations.supports.join("、") || "四柱合局不集中",
      life: `日主${dayMaster.dayStem}${dayMaster.dayElement} ${dayMaster.strength}`,
      travel: "以流年與外部社交場景引動",
      fortune: `喜用方向${dayMaster.favorable.join("、")}`,
      career: `關係星${relationship.leadingGods.join("、") || "不集中"}`,
      wealth: `正財${relationship.counts["正財"] || 0}／偏財${relationship.counts["偏財"] || 0}`,
      cause: "八字不設來因宮，以日支與關係星為關係入口",
    },
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
  const targetGender = profile.genderProfile?.label || partnerTargetGender(chart);
  const presentationKind = partnerPresentationKind(targetGender);
  const avatar = profile.appearance.avatarClass;
  const faceWidth = avatar === "tall" ? 88 : avatar === "sharp" ? 94 : avatar === "solid" ? 118 : 106;
  const shoulderWidth = avatar === "solid" ? 224 : avatar === "athletic" ? 210 : avatar === "tall" ? 168 : 190;
  const faceShape = avatar === "sharp" ? "M153 109 C158 66 202 60 217 109 C229 153 207 187 185 191 C162 187 140 153 153 109Z" : "M150 110 C150 72 220 72 220 110 C220 160 204 190 185 190 C166 190 150 160 150 110Z";
  const mouth = namesIncludeAny(profile.supportStars, ["太陽", "紅鸞", "天喜", "天姚"]) ? "M174 161 Q185 169 196 161" : "M176 163 Q185 166 194 163";
  const eyeY = namesIncludeAny(profile.supportStars, ["天機", "巨門"]) ? 126 : 130;
  const hairPath = presentationKind === "masculine"
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
  const context = profile.imageContext || {
    spouse: palaceLabel(profile.spousePalace),
    spouseSquare: palaceListText(profile.spouseSquarePalaces),
    travel: palaceLabel(profile.travelPalace),
    fortune: palaceLabel(profile.fortunePalace),
    life: palaceLabel(profile.lifePalace),
    career: palaceLabel(profile.careerPalace),
    wealth: palaceLabel(profile.wealthPalace),
    cause: palaceLabel(profile.causePalace),
  };
  return {
    method: profile.source === "bazi" ? "BaZi / Four Pillars" : "Zi Wei Dou Shu",
    targetGender: profile.genderProfile?.label || partnerTargetGender(chart),
    imageGender: profile.genderProfile?.imageGender || "adult person with refined presentation",
    genderReason: profile.genderProfile?.reason || "",
    school: profile.sourceLabel || ASTRO_SCHOOL_LABEL,
    careers: profile.careers.slice(0, 5),
    appearance: {
      face: profile.appearance.face,
      build: profile.appearance.build,
      element: profile.appearance.element,
      details: profile.appearance.details,
      notes: profile.appearance.notes.slice(0, 6),
    },
    palaces: context,
    stars: profile.supportStars.slice(0, 16),
    reasons: profile.meeting.slice(0, 7),
  };
}

function partnerImageStateFor(source = "ziwei") {
  return source === "bazi" ? baziPartnerImageState : partnerImageState;
}

function renderPartnerImageStatus(state) {
  if (!state.message) return "";
  const statusClass = ["loading", "ready", "error"].includes(state.status)
    ? state.status
    : "idle";
  return `<p class="ai-image-status ${statusClass}">${escapeHtml(state.message)}</p>`;
}

function renderPartnerVisual(chart, profile, source = "ziwei") {
  const state = partnerImageStateFor(source);
  const hasAiImage = Boolean(state.imageUrl);
  const isLoading = state.status === "loading";
  const visual = hasAiImage
    ? `<img class="partner-ai-image" src="${escapeHtml(state.imageUrl)}" alt="AI 生成的正緣輪廓圖片" loading="lazy" />`
    : buildPartnerPortraitSvg(chart, profile);
  const caption = hasAiImage
    ? `由${state.provider || "AI 圖像模型"}生成，${source === "bazi" ? "依日主、日支、關係星、十神與干支合沖摘要製作。" : "依夫妻宮三方四正、命宮、遷移、福德、官祿、財帛與來因宮摘要製作。"}`
    : partnerImageEndpointAvailable()
      ? "按下生成後會由後端呼叫 AI 圖像模型，頁面不會顯示提示詞。"
      : "目前是本機 file 預覽，先顯示概念圖；部署到 Cloudflare 並啟用 Workers AI 後即可生成 AI 圖片。";
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
      ${renderPartnerImageStatus(state)}
      <div class="portrait-actions">
        <button type="button" ${source === "bazi" ? "data-generate-bazi-partner" : "data-generate-ai-partner"} ${isLoading ? "disabled" : ""}>${escapeHtml(generateLabel)}</button>
      </div>
    </div>
  `;
}

function renderPartnerProfile(chart) {
  const profile = buildPartnerProfile(chart);
  chart.partnerProfile = profile;
  const detail = profile.appearance.details || {};
  const careerText = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中，需以實際互動與工作背景校正";
  const starText = profile.supportStars.slice(0, 8).join("、") || "未見明顯星曜";
  const focusText = palaceListText(profile.focusPalaces, 10);
  const reasons = [
    `以夫妻宮為主，夫妻宮為${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}，但不單看夫妻宮。`,
    `正緣輪廓同時參考${focusText}；本盤參考星曜包含${starText}。`,
    `正緣呈現不以命主性別硬切，而是依夫妻宮與三方四正推估為${profile.genderProfile?.label || "命盤所示對象氣質"}；${profile.genderProfile?.reason || ""}`,
    "提醒：此輪廓只推估伴侶的外在氣質與互動傾向，不能判定命主或正緣的性傾向、性別認同或生理性別；感情偏好應以當事人的感受與選擇為準。",
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
          <div class="partner-cell"><span>性別氣質</span><strong>${escapeHtml(profile.genderProfile?.label || "依命盤呈現")}</strong></div>
          <div class="partner-cell"><span>身高體重</span><strong>${escapeHtml(`${detail.height || "待推估"} / ${detail.weight || "待推估"}`)}</strong></div>
          <div class="partner-cell"><span>身材輪廓</span><strong>${escapeHtml(profile.appearance.build)}</strong></div>
          <div class="partner-cell"><span>體態比例</span><strong>${escapeHtml(detail.bodyRatio || "比例訊號待校正")}</strong></div>
          <div class="partner-cell"><span>髮色髮型</span><strong>${escapeHtml(`${detail.hairColor || "自然髮色"}，${detail.hairStyle || "乾淨髮型"}`)}</strong></div>
          <div class="partner-cell"><span>喜歡穿著</span><strong>${escapeHtml(detail.outfit || "穿搭偏乾淨耐看")}</strong></div>
          <div class="partner-cell"><span>參考宮位</span><strong>${escapeHtml(focusText)}</strong></div>
        </div>
        <ul class="partner-list">
          ${detail.story ? `<li>${escapeHtml(detail.story)}</li>` : ""}
          ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          ${profile.appearance.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function renderBaziPartnerProfile(chart) {
  if (!baziPartnerOutput) return;
  const profile = buildBaziPartnerProfile(chart);
  chart.baziPartnerProfile = profile;
  const detail = profile.appearance.details || {};
  const careerText = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中，需以實際互動與工作背景校正";
  const relationshipStars = profile.relationship.leadingGods.length
    ? profile.relationship.leadingGods.map((god) => `${god}${profile.relationship.counts[god]}`).join("、")
    : "關係星不集中";
  const reasons = [
    `八字正緣以日支${profile.relationship.dayBranch}、關係星與四柱干支結構為主；本盤關係星為${relationshipStars}。`,
    `關係五行以${profile.relationship.partnerElement}為主，作為外型、職業調性與相處節奏的底色。`,
    `正緣呈現不以命主性別硬切，而是依日支陰陽與關係星推估為${profile.genderProfile.label}；${profile.genderProfile.reason}`,
    "提醒：此輪廓只推估伴侶的外在氣質與互動傾向，不能判定命主或正緣的性傾向、性別認同或生理性別；感情偏好應以當事人的感受與選擇為準。",
    ...profile.meeting,
  ];

  baziPartnerOutput.innerHTML = `
    <div class="partner-main">
      <div class="partner-visual">
        ${renderPartnerVisual(chart, profile, "bazi")}
      </div>
      <div class="partner-copy">
        <div>
          <p class="eyebrow">八字正緣模擬</p>
          <h3>${escapeHtml(profile.appearance.face)}</h3>
        </div>
        <div class="partner-grid">
          <div class="partner-cell"><span>最有機會職業</span><strong>${escapeHtml(careerText)}</strong></div>
          <div class="partner-cell"><span>性別氣質</span><strong>${escapeHtml(profile.genderProfile.label)}</strong></div>
          <div class="partner-cell"><span>身高體重</span><strong>${escapeHtml(`${detail.height || "待推估"} / ${detail.weight || "待推估"}`)}</strong></div>
          <div class="partner-cell"><span>身材輪廓</span><strong>${escapeHtml(profile.appearance.build)}</strong></div>
          <div class="partner-cell"><span>體態比例</span><strong>${escapeHtml(detail.bodyRatio || "比例訊號待校正")}</strong></div>
          <div class="partner-cell"><span>髮色髮型</span><strong>${escapeHtml(`${detail.hairColor || "自然髮色"}，${detail.hairStyle || "乾淨髮型"}`)}</strong></div>
          <div class="partner-cell"><span>喜歡穿著</span><strong>${escapeHtml(detail.outfit || "穿搭偏乾淨耐看")}</strong></div>
          <div class="partner-cell"><span>判讀依據</span><strong>${escapeHtml(profile.focusText)}</strong></div>
        </div>
        <ul class="partner-list">
          ${detail.story ? `<li>${escapeHtml(detail.story)}</li>` : ""}
          ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          ${profile.appearance.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
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
  if (/健康|身體|疾病|疾厄|病|睡眠|壓力|作息|體質|保養|醫/.test(q)) return "health";
  if (/事業|工作|職涯|升遷|公司|官祿/.test(q)) return "career";
  if (/財富|財|錢|收入|資產|房|田宅|投資|房地產|不動產/.test(q)) return "property";
  return null;
}

function chatTopicAnswer(topicKey) {
  const topic = TOPIC_CONFIG[topicKey];
  if (activeReadingMethod === "bazi") {
    const period = buildBaziPeriodContext(currentChart);
    const profile = baziDayMasterProfile(currentChart);
    const analysis = baziTopicAnalysis(topicKey, currentChart, topic, period);
    const supplement = baziTopicSupplement(topicKey, currentChart);
    return [
      `我先從八字幫你抓${topic.label}的重點：${analysis.text}`,
      `原局來看，${profile.text}`,
      `再補一層生活面向：${supplement}`,
      `目前選的是${period.periodName}，${baziPeriodReading(currentChart, period)}`,
    ].join(" ");
  }

  const context = buildPeriodContext(currentChart);
  const network = evaluateTopicNetwork(topicKey, currentChart, context);
  const ziweiText = ziweiTopicAnalysis(topicKey, currentChart, context, network);
  const peachText = topicKey === "marriage"
    ? nativePeachBlossomAnalysis(currentChart, network, { includeBazi: false }).text
    : "";

  return [
    `我先從紫微的${topic.label}主宮與三方四正開始看：${ziweiText}`,
    peachText,
    `時間節奏方面：${timelinePlainText(topicKey, currentChart)}`,
  ].filter(Boolean).join(" ");
}

function chatPartnerAnswer() {
  const profile = currentChart.partnerProfile || buildPartnerProfile(currentChart);
  const detail = profile.appearance.details || {};
  const careers = profile.careers.length ? profile.careers.join("、") : "職業訊號不集中";
  const appearance = [
    `${profile.appearance.build}，${profile.appearance.face}`,
    detail.height && detail.weight ? `身高體重約${detail.height} / ${detail.weight}` : "",
    detail.bodyRatio ? `體態比例：${detail.bodyRatio}` : "",
    detail.hairColor || detail.hairStyle ? `髮色髮型：${detail.hairColor || "自然髮色"}，${detail.hairStyle || "乾淨髮型"}` : "",
    detail.outfit ? `喜歡穿著：${detail.outfit}` : "",
  ].filter(Boolean).join("。");
  const notes = profile.appearance.notes.length ? `外貌修正：${profile.appearance.notes.join(" ")}` : "";

  return [
    `我先把紫微盤裡的關係線索整理成一個具體輪廓。夫妻宮是${palaceLabel(profile.spousePalace)}，主星為${profile.spouseMain}，並合看${palaceListText(profile.focusPalaces, 10)}。`,
    `對象呈現偏${profile.genderProfile?.label || "命盤所示氣質"}，${profile.genderProfile?.reason || "不以命主性別硬性限制對象外在呈現。"}`,
    "提醒：這是伴侶外在氣質與互動傾向的推估，不能判定命主或正緣的性傾向、性別認同或生理性別；感情偏好應以當事人的感受與選擇為準。",
    `最有機會的五種職業是：${careers}。`,
    `外型與身形輪廓則是：${appearance}。`,
    profile.causePalace ? `來因宮落在${palaceLabel(profile.causePalace)}，所以關係事件常會先從${palaceKey(profile.causePalace.name)}議題切進來。` : "",
    "把這些當成你容易遇到、容易被吸引的對象特質，比把它當成某一個人的精準預告更合適。",
    notes,
  ].filter(Boolean).join(" ");
}

function chatBaziPartnerAnswer() {
  const profile = currentChart.baziPartnerProfile || buildBaziPartnerProfile(currentChart);
  const detail = profile.appearance.details || {};
  const appearance = [
    `${profile.appearance.build}，${profile.appearance.face}`,
    detail.height && detail.weight ? `身高體重約${detail.height} / ${detail.weight}` : "",
    detail.bodyRatio ? `體態比例：${detail.bodyRatio}` : "",
    detail.hairColor || detail.hairStyle ? `髮色髮型：${detail.hairColor || "自然髮色"}，${detail.hairStyle || "乾淨髮型"}` : "",
  ].filter(Boolean).join("。 ");
  const stars = profile.relationship.leadingGods.length
    ? profile.relationship.leadingGods.map((god) => `${god}${profile.relationship.counts[god]}`).join("、")
    : "關係星不集中";
  return [
    `我先用八字把關係線索整理給你：日支是${profile.relationship.dayBranch}，關係星為${stars}，關係五行偏${profile.relationship.partnerElement}。`,
    profile.relationship.relationshipText,
    `對象氣質偏${profile.genderProfile.label}，${profile.genderProfile.reason}`,
    "提醒：這是伴侶外在氣質與互動傾向的推估，不能判定命主或正緣的性傾向、性別認同或生理性別。",
    `最有機會的五種職業是：${profile.careers.join("、")}。`,
    `外型與身形輪廓則是：${appearance}。`,
    "這張八字比較適合用來理解你在關係裡容易被哪種特質吸引，以及什麼互動節奏比較走得久。",
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
    return activeReadingMethod === "bazi" ? chatBaziPartnerAnswer() : chatPartnerAnswer();
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
    if (activeReadingMethod === "bazi") {
      const baziPeriod = buildBaziPeriodContext(currentChart);
      return `目前八字選的是${baziPeriod.periodName}。${baziPeriodReading(currentChart, baziPeriod)}`;
    }
    return `${context.periodName}目前${context.periodPalace ? `落在${palaceLabel(context.periodPalace)}，` : ""}我會把這個宮位視為當期事件焦點，再疊加你問的主題宮位。`;
  }

  const palaceAnswer = chatPalaceAnswer(q);
  if (palaceAnswer) return palaceAnswer;

  const topicKey = topicFromQuestion(q);
  if (topicKey) return chatTopicAnswer(topicKey);

  return activeReadingMethod === "bazi"
    ? "目前是八字論盤模式，可以問日主強弱、十神、喜用方向、合沖刑害、大運、流年、財富、事業、姻緣、子女或健康。"
    : "目前是紫微斗數論盤模式，可以問十二宮、三方四正、正緣長相、房產緣、身宮、來因宮、大限或流年。";
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
  addChatMessage("命盤已載入。切換到八字可問日主、十神、喜用與大運；切換到紫微可問十二宮、正緣、來因宮與流年。");
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
      message: "本機 file 預覽無法呼叫 AI 後端；部署到 Cloudflare 並啟用 Workers AI 後即可生成。",
    };
    renderPartnerProfile(currentChart);
    addChatMessage("目前是本機檔案預覽，所以不能直接呼叫 AI 生圖。部署到 Cloudflare 並啟用 Workers AI 後，這顆按鈕就會直接產生圖片。");
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
      throw new Error(detail || `AI 圖片生成失敗，Cloudflare 回傳 HTTP ${response.status}。`);
    }
    if (!result.imageUrl) {
      throw new Error("AI 圖片服務沒有回傳圖片。");
    }

    partnerImageState = {
      status: "ready",
      imageUrl: result.imageUrl,
      provider: result.provider || "AI 圖像模型",
      message: "AI 圖片已生成，可以重新生成。",
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

async function generateBaziPartnerAiImage() {
  if (!currentChart) return;

  if (!partnerImageEndpointAvailable()) {
    baziPartnerImageState = {
      status: "error",
      imageUrl: "",
      provider: "",
      message: "本機 file 預覽無法呼叫 AI 後端；部署到 Cloudflare 並啟用 Workers AI 後即可生成。",
    };
    renderBaziPartnerProfile(currentChart);
    addChatMessage("八字正緣輪廓已先顯示概念圖；部署版本啟用圖片服務後，才可以生成 AI 圖片。", "bot");
    return;
  }

  const profile = currentChart.baziPartnerProfile || buildBaziPartnerProfile(currentChart);
  baziPartnerImageState = {
    ...baziPartnerImageState,
    status: "loading",
    message: "八字正緣圖片生成中，通常需要 10 到 30 秒。",
  };
  renderBaziPartnerProfile(currentChart);

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
      throw new Error(detail || `AI 圖片生成失敗，Cloudflare 回傳 HTTP ${response.status}。`);
    }
    if (!result.imageUrl) throw new Error("AI 圖片服務沒有回傳圖片。");

    baziPartnerImageState = {
      status: "ready",
      imageUrl: result.imageUrl,
      provider: result.provider || "AI 圖像模型",
      message: "八字正緣圖片已生成，可以重新生成。",
    };
    renderBaziPartnerProfile(currentChart);
    addChatMessage("我已依日主、日支、關係星與干支結構生成八字正緣圖片。這是象徵式輪廓，不是對真實對象的保證。", "bot");
  } catch (error) {
    baziPartnerImageState = {
      ...baziPartnerImageState,
      status: "error",
      message: error.message || "AI 圖片生成失敗。",
    };
    renderBaziPartnerProfile(currentChart);
    addChatMessage(`八字正緣圖片暫時沒有生成成功：${baziPartnerImageState.message}`, "bot");
  }
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

function renderBaziInsights(chart) {
  if (!baziInsightOutput) return;
  const profile = baziDayMasterProfile(chart);
  const structure = baziStructureProfile(chart);
  const usefulGod = baziUsefulGodProfile(chart);
  const hidden = profile.hiddenProfile;
  const stages = baziTwelveStageProfile(chart);
  const auxiliary = baziAuxiliaryPalaceProfile(chart);
  const shenSha = baziShenShaProfile(chart);
  const luck = baziLuckMeta(chart);
  const groups = baziTenGodGroupSummary(chart);
  const relations = baziRelationAnalysis(chart.pillars || []);
  const monthText = profile.monthMainStem
    ? `月令${profile.monthBranch}的主氣藏干為${profile.monthMainStem}，對日主形成${profile.monthGod || "五行作用"}。`
    : `月令為${profile.monthBranch}，以${profile.monthElement}氣為主要季節背景。`;

  baziInsightOutput.innerHTML = `
    <div class="bazi-insight-grid">
      <article class="bazi-insight-card">
        <span>日主與月令</span>
        <strong>${escapeHtml(`${profile.dayStem}${profile.dayElement}日主 · ${profile.strength}`)}</strong>
        <p>${escapeHtml(monthText)} ${escapeHtml(profile.text)}</p>
      </article>
      <article class="bazi-insight-card">
        <span>格局判定</span>
        <strong>${escapeHtml(`${structure.name} · ${structure.status}`)}</strong>
        <p>${escapeHtml(structure.text)}</p>
      </article>
      <article class="bazi-insight-card">
        <span>喜用與調候</span>
        <strong>${escapeHtml(`扶抑${usefulGod.primary || "流通"} · 調候${usefulGod.regulating}${usefulGod.bridge ? ` · 通關${usefulGod.bridge}` : ""}`)}</strong>
        <p>${escapeHtml(usefulGod.text)}</p>
      </article>
      <article class="bazi-insight-card">
        <span>精準起運</span>
        <strong>${escapeHtml(`${luck.direction} · ${luck.startDate}`)}</strong>
        <p>${escapeHtml(luck.text)}</p>
      </article>
      <article class="bazi-insight-card is-wide">
        <span>藏干、透干與通根</span>
        <strong>${escapeHtml(hidden.roots.length ? `通根 ${hidden.roots.length} 處` : "日主同氣根較少")}</strong>
        <p>${escapeHtml(hidden.text)}</p>
      </article>
      <article class="bazi-insight-card is-wide">
        <span>十二長生與旬空</span>
        <strong>${escapeHtml(stages.records.map((record) => `${record.name}${record.stage}`).join(" · "))}</strong>
        <p>${escapeHtml(stages.text)}</p>
      </article>
      <article class="bazi-insight-card is-wide">
        <span>胎元、胎息、命宮與身宮</span>
        <strong>${escapeHtml(auxiliary.records.map((record) => `${record.label}${record.value}`).join(" · "))}</strong>
        <p>${escapeHtml(auxiliary.text)}</p>
      </article>
      <article class="bazi-insight-card is-wide">
        <span>輔助神煞</span>
        <strong>${escapeHtml(shenSha.records.map((record) => record.name).join("、") || "未見集中")}</strong>
        <p>${escapeHtml(shenSha.text)}</p>
      </article>
      <article class="bazi-insight-card bazi-ten-god-card">
        <span>十神配置</span>
        <div class="bazi-ten-god-grid">
          ${groups.map((group) => `
            <div>
              <b>${escapeHtml(group.label)} ${escapeHtml(String(group.count))}</b>
              <small>${escapeHtml(group.detail)}</small>
            </div>
          `).join("")}
        </div>
        <p class="bazi-ten-god-reading">${escapeHtml(baziTenGodInterpretation(chart))}</p>
      </article>
      <article class="bazi-insight-card is-wide">
        <span>合沖刑害破、三合三會與墓庫</span>
        <strong>${escapeHtml(relations.supports.length ? "有流通訊號" : "以原局平衡為先")}</strong>
        <p>${escapeHtml(relations.text)}</p>
      </article>
    </div>
  `;
}

function buildBaziReading(chart) {
  const topicKey = baziTopicSelect?.value || "property";
  const topic = TOPIC_CONFIG[topicKey];
  const profile = baziDayMasterProfile(chart);
  const structure = baziStructureProfile(chart);
  const usefulGod = baziUsefulGodProfile(chart);
  const luck = baziLuckMeta(chart);
  const counts = tenGodCounts(chart);
  const groups = baziTenGodGroupSummary(chart);
  const relations = baziRelationAnalysis(chart.pillars || []);
  const period = buildBaziPeriodContext(chart);
  const analysis = baziTopicAnalysis(topicKey, chart, topic, period);
  const supplement = baziTopicSupplement(topicKey, chart);
  const tone = scoreTone(analysis.element.score + profile.score * 0.45);
  const periodText = baziPeriodReading(chart, period);
  const why = [
    `日主為${profile.dayStem}${profile.dayElement}，月令${profile.monthBranch}屬${profile.season}季${profile.monthElement}氣；藏干加權後生扶約${Math.round(profile.supportRatio * 100)}%，日主判為${profile.strength}。`,
    `格局以月令主氣立${structure.name}，目前為${structure.status}。${structure.pressures.length ? `混雜點：${structure.pressures.join("、")}。` : "未見明顯破格衝突。"}`,
    `十神結構：${godCountText(counts, ["比肩", "劫財", "食神", "傷官", "正財", "偏財", "正官", "七殺", "正印", "偏印"])}。`,
    `扶抑用神取${usefulGod.primary || "流通"}${usefulGod.secondary ? `、${usefulGod.secondary}` : ""}，調候重${usefulGod.regulating}${usefulGod.bridge ? `，通關取${usefulGod.bridge}` : ""}。`,
    luck.text,
    relations.text,
    periodText,
  ];
  const tags = [
    `${profile.dayStem}${profile.dayElement}日主`,
    `身強弱：${profile.strength}`,
    `月令：${profile.monthBranch}${profile.monthGod || ""}`,
    `格局：${structure.name}`,
    `用神：${usefulGod.primary || "流通"}`,
    ...groups.filter((group) => group.count).map((group) => `${group.label}${group.count}`),
    period.periodName,
  ];

  return `
    <div class="reading-main bazi-reading-main">
      <div class="reading-copy">
        <div class="reading-status">${escapeHtml(period.periodName)} · ${escapeHtml(topic.label)}</div>
        <h3>${escapeHtml(topic.label)}：${escapeHtml(tone)}</h3>
        <section class="reading-block">
          <h4>原局骨架</h4>
          <p>${escapeHtml(profile.text)}</p>
        </section>
        <section class="reading-block">
          <h4>格局、喜用與調候</h4>
          <p>${escapeHtml(`${structure.text} ${usefulGod.text}`)}</p>
        </section>
        <section class="reading-block">
          <h4>${escapeHtml(topic.label)}八字解讀</h4>
          <p>${escapeHtml(analysis.text)}</p>
        </section>
        <section class="reading-block">
          <h4>${escapeHtml(topic.label)}延伸重點</h4>
          <p>${escapeHtml(supplement)}</p>
        </section>
        <section class="reading-block">
          <h4>${escapeHtml(period.periodName)}交互作用</h4>
          <p>${escapeHtml(periodText)}</p>
        </section>
        <section class="reading-block">
          <h4>十神怎麼用在行動上</h4>
          <p>${escapeHtml(baziTenGodInterpretation(chart))}</p>
        </section>
        <div class="reading-tags">
          ${tags.map((tag) => `<span class="reading-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <aside class="reading-side">
        <h4>八字為何這樣判</h4>
        <ul class="why-list">
          ${why.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </aside>
    </div>
  `;
}

function renderCombinedCheck(chart) {
  if (!combinedCheckOutput || !chart) return;
  const baziPeriod = buildBaziPeriodContext(chart);
  const ziweiContext = buildPeriodContext(chart);
  const profile = baziDayMasterProfile(chart);
  const topicKeys = ["property", "career", "marriage", "children", "health"];
  const direction = (score) => score >= 1 ? "support" : score <= -1 ? "pressure" : "mixed";
  const cards = topicKeys.map((topicKey) => {
    const topic = TOPIC_CONFIG[topicKey];
    const bazi = baziTopicAnalysis(topicKey, chart, topic, baziPeriod);
    const network = evaluateTopicNetwork(topicKey, chart, ziweiContext);
    const baziScore = bazi.element.score + profile.score * 0.45;
    const baziDirection = direction(baziScore);
    const ziweiDirection = direction(network.score);
    const aligned = baziDirection === ziweiDirection;
    const status = aligned
      ? baziDirection === "support" ? "雙盤同向有支撐" : baziDirection === "pressure" ? "雙盤同向需保守" : "雙盤皆屬混合訊號"
      : "雙盤訊號分歧，需分層判讀";
    const baziSignals = bazi.tags.slice(0, 4).join("、");
    const ziweiSignals = [
      `主宮${palaceListText(network.basePalaces, 4)}`,
      network.supportStars.length ? `助力${network.supportStars.slice(0, 3).join("、")}` : "助力不集中",
      network.pressureStars.length ? `壓力${network.pressureStars.slice(0, 3).join("、")}` : "煞忌不重",
    ].join("；");
    const note = aligned
      ? "兩套系統方向一致時，可提高該主題的優先關注度，但仍不是事件保證。"
      : "八字偏能量與時間節奏，紫微偏宮位與事件場景；分歧時應保留兩種條件，不強行合成吉凶。";
    return `
      <article class="combined-check-item" data-status="${baziDirection === ziweiDirection ? baziDirection : "split"}">
        <header><strong>${escapeHtml(topic.label)}</strong><span>${escapeHtml(status)}</span></header>
        <p><b>八字</b>${escapeHtml(baziSignals)}；${escapeHtml(baziPeriod.periodName)}</p>
        <p><b>紫微</b>${escapeHtml(ziweiSignals)}；${escapeHtml(ziweiContext.periodName)}</p>
        <small>${escapeHtml(note)}</small>
      </article>
    `;
  }).join("");
  combinedCheckOutput.innerHTML = `<div class="combined-check-grid">${cards}</div>`;
}

function updateBaziReading() {
  if (!currentChart) return;
  if (baziDecadalControl) baziDecadalControl.hidden = baziScopeSelect?.value !== "decadal";
  if (baziYearControl) baziYearControl.hidden = !["yearly", "monthly"].includes(baziScopeSelect?.value);
  if (baziMonthControl) baziMonthControl.hidden = baziScopeSelect?.value !== "monthly";
  if (baziReadingOutput) baziReadingOutput.innerHTML = buildBaziReading(currentChart);
  renderBaziLuckTable(currentChart);
  renderBaziPartnerProfile(currentChart);
  renderBaziCalibration();
  renderCombinedCheck(currentChart);
}

function buildBaziTimeCandidate(chart, hourOffset) {
  const values = chart.formValues;
  const date = new Date(Date.UTC(values.year, values.month - 1, values.day, values.hour + hourOffset, values.minute));
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(values.dayBoundaryRule === "midnight" ? 2 : 1);
  const pillars = [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()];
  return {
    formValues: {
      ...values,
      year,
      month,
      day,
      hour,
      minute,
      birthDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      birthTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    },
    lunar,
    eightChar,
    pillars,
    naYin: [eightChar.getYearNaYin(), eightChar.getMonthNaYin(), eightChar.getDayNaYin(), eightChar.getTimeNaYin()],
    elementCounts: countElements(pillars),
  };
}

function calibrationEventScore(candidate, event) {
  const config = CALIBRATION_EVENT_TYPES[event.type] || CALIBRATION_EVENT_TYPES.career;
  const yearPillar = getBaziYearPillar(event.year);
  const cycle = baziLuckCycleForYear(candidate, event.year);
  const layers = [
    cycle?.pillar ? { label: "大運", pillar: cycle.pillar } : null,
    yearPillar ? { label: "流年", pillar: yearPillar } : null,
  ].filter(Boolean);
  const dayStem = splitPillar(candidate.pillars[2]).stem;
  let score = 0;
  const reasons = [];

  layers.forEach((layer) => {
    const { stem, branch } = splitPillar(layer.pillar);
    const gods = [getTenGod(dayStem, stem), ...getHiddenStemGods(dayStem, branch).map((item) => item.god)].filter(Boolean);
    const matchedGods = uniqueItems(gods.filter((god) => config.gods.includes(god)));
    if (matchedGods.length) {
      score += matchedGods.length * 1.15;
      reasons.push(`${layer.label}${layer.pillar}帶動${matchedGods.join("、")}`);
    }
    candidate.pillars.forEach((pillar, index) => {
      const interactions = baziPairInteractions(pillar, layer.pillar);
      if (!interactions.length) return;
      const weight = config.pillars.includes(index) ? 1.5 : 0.55;
      score += interactions.length * weight;
      reasons.push(`${layer.label}與${PILLAR_NAMES[index]}見${interactions.join("、")}`);
    });
  });

  const natalCounts = tenGodCounts(candidate);
  const natalSupport = config.gods.reduce((sum, god) => sum + (natalCounts[god] || 0), 0);
  score += Math.min(1.6, natalSupport * 0.18);
  if (!reasons.length) reasons.push("大運與流年未直接碰到關鍵柱，事件需從生活選擇與較細月份再校正");
  return { score, reasons: uniqueItems(reasons).slice(0, 4), yearPillar, cycle };
}

function calibrationCandidates(chart) {
  const offsets = [
    { offset: -2, label: "前一時辰" },
    { offset: 0, label: "目前時辰" },
    { offset: 2, label: "後一時辰" },
  ];
  return offsets.map((item) => {
    const candidate = buildBaziTimeCandidate(chart, item.offset);
    const eventResults = baziCalibrationEvents.map((event) => ({
      event,
      ...calibrationEventScore(candidate, event),
    }));
    return {
      ...item,
      candidate,
      score: eventResults.reduce((sum, result) => sum + result.score, 0),
      eventResults,
    };
  }).sort((first, second) => second.score - first.score || Math.abs(first.offset) - Math.abs(second.offset));
}

function renderBaziCalibration() {
  if (!baziCalibrationOutput) return;
  if (!currentChart) {
    baziCalibrationOutput.innerHTML = `<p class="calibration-empty">排盤後可加入過往事件。</p>`;
    return;
  }
  if (!baziCalibrationEvents.length) {
    baziCalibrationOutput.innerHTML = `<p class="calibration-empty">加入至少兩筆具體年份的事件，系統會比較相鄰三個時辰的大運、流年與四柱作用。</p>`;
    return;
  }

  const candidates = calibrationCandidates(currentChart);
  const eventHtml = baziCalibrationEvents.map((event) => {
    const config = CALIBRATION_EVENT_TYPES[event.type] || CALIBRATION_EVENT_TYPES.career;
    return `
      <article class="calibration-event">
        <span>${escapeHtml(String(event.year))}</span>
        <div>
          <strong>${escapeHtml(config.label)}</strong>
          <small>${escapeHtml(event.note || "未填事件摘要")}</small>
        </div>
        <button class="calibration-remove" type="button" data-remove-calibration="${escapeHtml(String(event.id))}" aria-label="移除此事件" title="移除此事件">×</button>
      </article>
    `;
  }).join("");
  const candidateHtml = candidates.map((result, index) => {
    const timeIndex = getTimeIndex(result.candidate.formValues.hour);
    const reasons = uniqueItems(result.eventResults.flatMap((item) => item.reasons)).slice(0, 4);
    return `
      <article class="calibration-candidate ${index === 0 ? "is-leading" : ""}">
        <span>${index === 0 ? "較集中" : "對照"}</span>
        <div>
          <strong>${escapeHtml(`${result.label} · ${HOUR_BRANCHES[timeIndex]}時 ${getTimeRange(timeIndex)} · ${result.candidate.pillars.join(" ")}`)}</strong>
          <small>${escapeHtml(reasons.join("；"))}</small>
        </div>
        <b>${result.score.toFixed(1)}分</b>
      </article>
    `;
  }).join("");
  const confidence = baziCalibrationEvents.length >= 3
    ? "已有三筆以上事件，可把最高分時辰視為優先核對候選。"
    : "事件仍少，分數只能作初步對照；建議至少加入三筆不同類型事件。";

  baziCalibrationOutput.innerHTML = `
    <div class="calibration-events">${eventHtml}</div>
    <h3 class="calibration-heading">相鄰時辰比較</h3>
    <div class="calibration-candidates">${candidateHtml}</div>
    <p class="calibration-empty">${escapeHtml(confidence)} 時辰校準是命理回溯，不是科學驗證，不會自動更改目前命盤。</p>
  `;
}

function setActiveReadingMethod(method) {
  const nextMethod = method === "ziwei" ? "ziwei" : "bazi";
  activeReadingMethod = nextMethod;
  methodTabs.forEach((tab) => {
    const active = tab.dataset.readingMethod === nextMethod;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  methodViews.forEach((view) => {
    view.hidden = view.dataset.methodView !== nextMethod;
  });
}

function buildReading(chart) {
  const topicKey = topicSelect.value;
  const topic = TOPIC_CONFIG[topicKey];
  const context = buildPeriodContext(chart);
  const causePalace = getCausePalace(chart.astrolabe);
  const yearStem = chart.astrolabe.rawDates?.chineseDate?.yearly?.[0] || "";
  const network = evaluateTopicNetwork(topicKey, chart, context);
  const primary = network.baseEvaluations[0] || network.evaluations[0];
  const finalScore = network.score;
  const tone = scoreTone(finalScore);
  const causeText = causePalace
    ? `來因宮以生年天干${yearStem}對照宮干定位，本盤落在${palaceLabel(causePalace)}；解盤會把它視為原局動機與事件入口。`
    : "來因宮未能從生年天干與宮干定位取得。";
  const topicPalacesText = topicPalaceLabels(topicKey, chart).join("、") || topic.palaces.join("、");
  const ziweiText = ziweiTopicAnalysis(topicKey, chart, context, network);
  const peach = topicKey === "marriage" ? nativePeachBlossomAnalysis(chart, network, { includeBazi: false }) : null;
  const why = [
    `${ASTRO_SCHOOL_LABEL}：星曜安置與神煞顯示使用 iztro 的 zhongzhou 演算法設定。`,
    `${topic.label}主題先取${topicPalacesText}，再加入三方四正、對宮、來因宮、身宮與當期流運宮位，避免單宮斷事。`,
    primary ? describePalaceEvaluation(primary) : "找不到主宮資料，因此以輔助宮位與當期流運補看。",
    peach ? peach.text : "",
    causeText,
  ].filter(Boolean);
  const tags = [
    context.periodName,
    causePalace ? `來因：${palaceLabel(causePalace)}` : "",
    ...topicPalaceLabels(topicKey, chart),
    network.supportStars.length ? `助力：${network.supportStars.slice(0, 3).join("、")}` : "",
    network.pressureStars.length ? `壓力：${network.pressureStars.slice(0, 3).join("、")}` : "",
    network.flowerStars.length ? `桃花：${network.flowerStars.join("、")}` : "",
    ...(peach?.tags || []),
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
        ${peach ? `
          <section class="reading-block">
            <h4>命主桃花分析</h4>
            <p>${escapeHtml(peach.text)}</p>
          </section>
        ` : ""}
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
  yearControl.hidden = !["age", "yearly", "monthly", "daily", "hourly"].includes(scopeSelect.value);
  monthControl.hidden = !["monthly", "daily", "hourly"].includes(scopeSelect.value);
  dayControl.hidden = !["daily", "hourly"].includes(scopeSelect.value);
  hourControl.hidden = scopeSelect.value !== "hourly";
  if (palaceOverviewOutput) palaceOverviewOutput.innerHTML = renderPalaceOverview(currentChart.astrolabe);
  readingOutput.innerHTML = buildReading(currentChart);
  renderPartnerProfile(currentChart);
  renderAstrolabe(currentChart.astrolabe, context);
  renderZiweiImage(currentChart.astrolabe, context);
  updateBaziReading();
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
  const correction = Math.round((formValues.correctionMinutes || 0) * 10) / 10;
  const solarCorrection = Math.round(((formValues.longitudeCorrection || 0) + (formValues.equationCorrection || 0)) * 10) / 10;
  const correctionDetail = [
    `出生地：${formValues.placeName}`,
    `時區：UTC${formValues.timezoneOffset >= 0 ? "+" : ""}${formValues.timezoneOffset}`,
    formValues.useTrueSolarTime ? `真太陽時校正${solarCorrection >= 0 ? "+" : ""}${solarCorrection}分鐘` : "未啟用真太陽時",
    formValues.daylightSaving ? "已扣除日光節約時間60分鐘" : "未套用日光節約時間",
    `總校正${correction >= 0 ? "+" : ""}${correction}分鐘`,
    formValues.dayBoundaryRule === "zi" ? "23:00子初換日" : "00:00午夜換日",
  ].join("；");
  const summary = [
    { label: "輸入時間", value: `${formValues.inputBirthDate} ${formValues.inputBirthTime}` },
    { label: "排盤時間", value: `${formValues.birthDate} ${formValues.birthTime}`, tooltip: correctionDetail },
    { label: "農曆", value: toTraditional(lunarDate) },
    { label: "時辰", value: `${HOUR_BRANCHES[timeIndex]}時 ${getTimeRange(timeIndex)}` },
    { label: "性別", value: formValues.gender },
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

function renderPillars(chart) {
  const pillars = chart.pillars || [];
  const dayStem = splitPillar(pillars[2] || "").stem;
  const stages = baziTwelveStageProfile(chart).records;
  pillarGrid.innerHTML = pillars
    .map((pillar, index) => {
      const { stem, branch } = splitPillar(pillar);
      const stemElement = GAN_ELEMENT[stem] || "-";
      const branchElement = ZHI_ELEMENT[branch] || "-";
      const stemGod = index === 2 ? "日主" : getTenGod(dayStem, stem);
      const hiddenGods = hiddenStemRecords(dayStem, branch);
      const stemGodLabel = stemGod || "-";
      const stemGodTooltip = tenGodTooltip(stemGodLabel);
      const hiddenGodHtml = hiddenGods.length
        ? hiddenGods
            .map(({ stem: hiddenStem, god, weight, role }) => {
              const percentage = Math.round(weight * 100);
              const tooltip = `${hiddenStem}${god}：地支「${branch}」的${role}藏干，比例權重約${percentage}%，對日主形成${god}。${TEN_GOD_MEANINGS[god] || ""}`;
              return `<span class="pillar-hidden-god has-tooltip" tabindex="0" aria-label="${tooltipAttribute(tooltip)}" data-tooltip="${tooltipAttribute(tooltip)}">${escapeHtml(hiddenStem)}${escapeHtml(god)} ${percentage}%</span>`;
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
            <span>長生 ${escapeHtml(stages[index]?.stage || "-")}</span>
            <span>旬空 ${escapeHtml(stages[index]?.void || "-")}</span>
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

function buildFourTransformationLayers(astrolabe, context = null) {
  const layers = [];
  const addLayer = ({ key, label, short, stem, sourceIndex = null }) => {
    const normalizedStem = toTraditional(stem || "");
    const table = FLYING_MUTAGEN_TABLE[normalizedStem];
    if (!table) return;
    const sourcePalace = Number.isInteger(sourceIndex) ? astrolabe.palaces[sourceIndex] : null;
    const transformations = Object.entries(table).map(([mutagen, star]) => {
      const targetPalace = findPalaceByStarName(astrolabe, star);
      return {
        mutagen,
        star,
        targetPalace,
        isSelf: Boolean(sourcePalace && targetPalace && sourcePalace.index === targetPalace.index),
      };
    });
    layers.push({
      key,
      label,
      short,
      stem: normalizedStem,
      sourcePalace,
      transformations,
    });
  };

  addLayer({
    key: "natal",
    label: "本命",
    short: "本",
    stem: astrolabe.rawDates?.chineseDate?.yearly?.[0],
  });

  const horoscope = context?.horoscope;
  const visiblePeriodLayers = {
    decadal: ["decadal"],
    age: ["decadal", "yearly", "age"],
    yearly: ["decadal", "yearly"],
    monthly: ["decadal", "yearly", "monthly"],
    daily: ["decadal", "yearly", "monthly", "daily"],
    hourly: ["decadal", "yearly", "monthly", "daily", "hourly"],
  }[context?.scope] || [];
  const layerMeta = {
    decadal: { label: "大限", short: "限" },
    age: { label: "小限", short: "小" },
    yearly: { label: "流年", short: "年" },
    monthly: { label: "流月", short: "月" },
    daily: { label: "流日", short: "日" },
    hourly: { label: "流時", short: "時" },
  };

  visiblePeriodLayers.forEach((key) => {
    const period = horoscope?.[key];
    if (!period) return;
    addLayer({
      key,
      label: layerMeta[key].label,
      short: layerMeta[key].short,
      stem: period.heavenlyStem,
      sourceIndex: period.index,
    });
  });

  return layers;
}

function fourTransformationSourceText(layer) {
  const palace = layer.sourcePalace;
  return palace
    ? `${layer.label}${layer.stem}・${normalizePalaceName(palace.name)}`
    : `${layer.label}${layer.stem}年干`;
}

function palaceFourTransformationText(palace, transformationLayers = []) {
  const incoming = transformationLayers.flatMap((layer) => layer.transformations
    .filter((item) => item.targetPalace?.index === palace.index)
    .map((item) => {
      const selfText = item.isSelf ? "・自化" : "";
      return `${layer.short}${item.mutagen}${item.star}←${fourTransformationSourceText(layer)}${selfText}`;
    }));
  return incoming.length
    ? uniqueItems(incoming).slice(0, 5).join("；")
    : "目前層級未見四化飛入";
}

function palaceImageContent(palace, astrolabe, imageType, transformationLayers = []) {
  if (imageType === "flying") return palaceFlyingText(palace, astrolabe);
  if (imageType === "sanhe") return palaceSanheText(palace, astrolabe);
  if (imageType === "sihua") return palaceFourTransformationText(palace, transformationLayers);
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

function fourTransformationArrowDefs() {
  return Object.entries(FOUR_TRANSFORMATION_META).map(([mutagen, meta]) => `
    <marker id="${meta.markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${meta.color}" />
    </marker>
  `).join("");
}

function palaceInnerAnchor(palace) {
  const grid = BRANCH_GRID[palace?.earthlyBranch] || [1, 1];
  const cell = 330;
  const margin = 40;
  const x = margin + (grid[1] - 1) * cell;
  const y = margin + (grid[0] - 1) * cell;
  if (grid[0] === 1) return { x: x + cell / 2, y: y + cell };
  if (grid[0] === 4) return { x: x + cell / 2, y };
  if (grid[1] === 1) return { x: x + cell, y: y + cell / 2 };
  return { x, y: y + cell / 2 };
}

function fourTransformationFlightSvg(transformationLayers) {
  const activeLayer = transformationLayers[transformationLayers.length - 1];
  if (!activeLayer) return "";
  const source = activeLayer.sourcePalace
    ? palaceInnerAnchor(activeLayer.sourcePalace)
    : { x: 700, y: 700 };
  const dash = {
    natal: "",
    decadal: "14 8",
    age: "10 6 2 6",
    yearly: "5 7",
    monthly: "16 6 4 6",
    daily: "4 5",
    hourly: "2 4",
  }[activeLayer.key] || "";

  return activeLayer.transformations.map((item, index) => {
    if (!item.targetPalace) return "";
    const target = palaceInnerAnchor(item.targetPalace);
    const meta = FOUR_TRANSFORMATION_META[item.mutagen];
    if (!meta) return "";
    let path;
    let labelX;
    let labelY;

    if (item.isSelf) {
      const vx = 700 - source.x;
      const vy = 700 - source.y;
      const length = Math.hypot(vx, vy) || 1;
      const nx = vx / length;
      const ny = vy / length;
      const px = -ny;
      const py = nx;
      const first = { x: source.x + nx * 100 + px * 58, y: source.y + ny * 100 + py * 58 };
      const second = { x: source.x + nx * 100 - px * 58, y: source.y + ny * 100 - py * 58 };
      path = `M ${source.x} ${source.y} C ${first.x} ${first.y}, ${second.x} ${second.y}, ${source.x} ${source.y}`;
      labelX = source.x + nx * 112;
      labelY = source.y + ny * 112;
    } else {
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.hypot(dx, dy) || 1;
      const offset = (index - 1.5) * 28;
      const controlX = midX - (dy / length) * offset;
      const controlY = midY + (dx / length) * offset;
      path = `M ${source.x} ${source.y} Q ${controlX} ${controlY}, ${target.x} ${target.y}`;
      labelX = source.x * 0.25 + controlX * 0.5 + target.x * 0.25;
      labelY = source.y * 0.25 + controlY * 0.5 + target.y * 0.25;
    }

    const label = `${activeLayer.short}${item.mutagen}${item.isSelf ? "自" : ""}`;
    return `
      <path d="${path}" fill="none" stroke="#ffffff" stroke-width="9" opacity="0.88" />
      <path d="${path}" fill="none" stroke="${meta.color}" stroke-width="4.5" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#${meta.markerId})" opacity="0.9" />
      <rect x="${labelX - 25}" y="${labelY - 14}" width="50" height="27" rx="4" fill="#ffffff" stroke="${meta.color}" stroke-width="1.5" />
      <text x="${labelX}" y="${labelY + 6}" fill="${meta.color}" font-size="15" font-weight="950" text-anchor="middle">${svgEscape(label)}</text>
    `;
  }).join("");
}

function fourTransformationPanelSvg(transformationLayers, x, y) {
  if (!transformationLayers.length) {
    return `<text x="${x}" y="${y + 24}" fill="#66716c" font-size="17" font-weight="760">目前未取得四化飛星資料</text>`;
  }
  const rowHeight = transformationLayers.length > 4 ? 48 : 62;
  return transformationLayers.map((layer, rowIndex) => {
    const rowY = y + rowIndex * rowHeight;
    const boxHeight = rowHeight - 10;
    const sourcePalaceKey = layer.sourcePalace ? palaceKey(layer.sourcePalace.name) : "";
    const sourceLabel = `${layer.short}${layer.stem}${sourcePalaceKey}`;
    return `
      <rect x="${x}" y="${rowY}" width="584" height="${rowHeight - 6}" rx="4" fill="#ffffff" stroke="#cbd5e6" />
      <text x="${x + 10}" y="${rowY + rowHeight / 2 + 5}" fill="#343840" font-size="${rowHeight < 60 ? 13 : 15}" font-weight="950">${svgEscape(sourceLabel)}</text>
      ${layer.transformations.map((item, index) => {
        const meta = FOUR_TRANSFORMATION_META[item.mutagen];
        const boxX = x + 76 + index * 126;
        const targetName = item.targetPalace ? palaceKey(item.targetPalace.name) : "未定";
        const label = `${item.mutagen}${item.star}→${targetName}${item.isSelf ? "自" : ""}`;
        return `
          <rect x="${boxX}" y="${rowY + 4}" width="118" height="${boxHeight}" rx="4" fill="#fdfefe" stroke="${meta.color}" stroke-width="1.6" />
          <text x="${boxX + 59}" y="${rowY + rowHeight / 2 + 5}" fill="${meta.color}" font-size="${rowHeight < 60 ? 12 : 13}" font-weight="900" text-anchor="middle">${svgEscape(label)}</text>
        `;
      }).join("")}
    `;
  }).join("");
}

function renderPalaceImageBlock(palace, astrolabe, imageType, periodIndex = null, causeIndex = null, transformationLayers = []) {
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
      ${svgTextBlock(palaceImageContent(palace, astrolabe, imageType, transformationLayers), x + 12, y + 284, { maxChars: 17, maxLines: 2, size: 14, lineHeight: 19, fill: modeColor, weight: 780 })}
      <text x="${x + 12}" y="${y + cell - 8}" fill="#66716c" font-size="15" font-weight="760">${svgEscape(toTraditional(palace.changsheng12 || ""))}</text>
      <text x="${x + cell - 52}" y="${y + cell - 8}" fill="#66716c" font-size="15" font-weight="760" text-anchor="end">${svgEscape(stage)}</text>
      <text x="${x + cell - 14}" y="${y + cell - 8}" fill="#111827" font-size="30" font-weight="950" text-anchor="end">${svgEscape(toTraditional(palace.earthlyBranch || ""))}</text>
    </g>
  `;
}

function centerModeNote(imageType) {
  if (imageType === "flying") return "飛星圖以各宮宮干起飛，顯示祿、權、科、忌分別飛入的目標宮位。";
  if (imageType === "sanhe") return "三合圖顯示各宮位的三合、對宮與三方四正，用來看事件互相牽動的結構。";
  if (imageType === "sihua") return "四化飛星圖分層顯示本命、大限、小限、流年、流月、流日與流時；四色箭頭呈現目前最細層級的祿、權、科、忌飛向。";
  return "飛星、三合、四化圖皆保留命宮、身宮、來因宮與流運標記。";
}

function buildZiweiChartSvg(astrolabe, context = null, imageType = "sanhe") {
  const causePalace = getCausePalace(astrolabe);
  const lifePalace = getLifePalace(astrolabe);
  const bodyPalace = getBodyPalace(astrolabe);
  const periodIndex = context?.periodIndex ?? null;
  const transformationLayers = imageType === "sihua"
    ? buildFourTransformationLayers(astrolabe, context)
    : [];
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
      <defs>${fourTransformationArrowDefs()}</defs>
      <rect width="1400" height="1400" fill="#eef1f6" />
      <rect x="40" y="40" width="1320" height="1320" fill="#ffffff" stroke="#343840" stroke-width="2" />
      ${astrolabe.palaces.map((palace) => renderPalaceImageBlock(palace, astrolabe, imageType, periodIndex, causePalace?.index ?? null, transformationLayers)).join("")}
      <rect x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" fill="#ffffff" stroke="#343840" stroke-width="2" />
      <rect x="${centerX + 20}" y="${centerY + 20}" width="${centerSize - 40}" height="${centerSize - 40}" fill="#f8f9fc" stroke="#d4dbea" stroke-width="1.4" />
      <line x1="${centerX + 42}" y1="${centerY + 42}" x2="${centerX + centerSize - 42}" y2="${centerY + centerSize - 42}" stroke="#dfe5f1" stroke-width="1.2" stroke-dasharray="8 10" />
      <line x1="${centerX + centerSize - 42}" y1="${centerY + 42}" x2="${centerX + 42}" y2="${centerY + centerSize - 42}" stroke="#dfe5f1" stroke-width="1.2" stroke-dasharray="8 10" />
      ${imageType === "sihua" ? fourTransformationFlightSvg(transformationLayers) : ""}
      <text x="${centerMid}" y="${centerY + 58}" fill="#b23a2e" font-size="22" font-weight="900" text-anchor="middle">${svgEscape(ASTRO_SCHOOL_LABEL)}</text>
      <text x="${centerMid}" y="${centerY + 110}" fill="#1f2523" font-size="42" font-weight="950" text-anchor="middle">${svgEscape(imageMeta.title)}</text>
      <text x="${centerMid}" y="${centerY + 150}" fill="#66716c" font-size="22" font-weight="800" text-anchor="middle">${svgEscape(toTraditional(astrolabe.chineseDate))}</text>
      ${centerModeTabsSvg(imageType, centerX + 156, centerY + 178)}
      ${imageType === "sihua"
        ? fourTransformationPanelSvg(transformationLayers, centerX + 38, centerY + 250)
        : centerFacts.map((fact, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = centerX + 58 + col * 304;
        const y = centerY + 278 + row * 72;
        return `
          <rect x="${x}" y="${y - 33}" width="258" height="52" rx="4" fill="#ffffff" stroke="#cbd5e6" />
          ${svgTextBlock(fact, x + 14, y + 1, { maxChars: 15, maxLines: 1, size: 17, lineHeight: 22, weight: 850 })}
        `;
      }).join("")}
      <text x="${centerMid}" y="${centerY + 555}" fill="#66716c" font-size="18" font-weight="760" text-anchor="middle">${imageType === "sihua" ? "祿綠・權橘・科藍・忌紫；箭頭顯示目前最細層級。" : "命宮、身宮、來因宮與流運皆以色框標示。"}</text>
      ${svgTextBlock(centerModeNote(imageType), centerX + 70, centerY + 602, { maxChars: 31, maxLines: 2, size: 17, lineHeight: 24, fill: "#66716c", weight: 760 })}
    </svg>
  `;
}

function renderZiweiImage(astrolabe, context = null) {
  if (!ziweiImageOutput) return;
  const imageMeta = ZIWEI_IMAGE_TYPES[ziweiImageType] || ZIWEI_IMAGE_TYPES.sanhe;
  const transformationLayers = ziweiImageType === "sihua"
    ? buildFourTransformationLayers(astrolabe, context)
    : [];
  const layerText = transformationLayers.length
    ? `目前四化層：${transformationLayers.map(fourTransformationSourceText).join("、")}。`
    : "";
  ziweiImageOutput.innerHTML = `
    <div class="ziwei-image-card">
      <div class="ziwei-image-preview">
        ${buildZiweiChartSvg(astrolabe, context, ziweiImageType)}
      </div>
      <div class="ziwei-image-actions">
        <div class="ziwei-image-tabs" role="tablist" aria-label="命盤圖片類型">
          ${Object.entries(ZIWEI_IMAGE_TYPES).map(([key, item]) => `
            <button type="button" class="${key === ziweiImageType ? "is-active" : ""}" data-ziwei-image-type="${escapeHtml(key)}">${escapeHtml(item.label)}</button>
          `).join("")}
        </div>
        <p>目前顯示「${escapeHtml(imageMeta.label)}」命盤圖，可切換宮干飛星、三合與四化飛星查看不同的判讀結構。${escapeHtml(layerText)}</p>
      </div>
    </div>
  `;
}

function renderPeriodStarGroups(context, palaceIndex) {
  if (!context?.horoscope) return "";
  const labels = { decadal: "大限", yearly: "流年", monthly: "流月", daily: "流日", hourly: "流時" };
  return periodLayerKeys(context.scope).map((key) => {
    const stars = context.horoscope?.[key]?.stars?.[palaceIndex] || [];
    if (!stars.length) return "";
    return `
      <div class="flow-star-group">
        <b>${labels[key]}</b>
        ${renderStarChips(stars, "flow", 8)}
      </div>
    `;
  }).join("");
}

function renderPalace(palace, context = null, causeIndex = null) {
  const periodIndex = context?.periodIndex ?? null;
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
  const periodStars = renderPeriodStarGroups(context, palace.index);
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
        ${periodStars}
        ${empty}
      </div>
      <footer class="palace-foot">
        <span>${escapeHtml(toTraditional(palace.changsheng12 || ""))}</span>
        <span>${stage ? `大限 ${stage}` : ""}</span>
      </footer>
    </article>
  `;
}

function renderAstrolabe(astrolabe, context = null) {
  const causeIndex = getCausePalace(astrolabe)?.index ?? null;
  astrolabeGrid.innerHTML = [
    renderCenterPlate(astrolabe),
    ...astrolabe.palaces.map((palace) => renderPalace(palace, context, causeIndex)),
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

  const formValues = normalizeBirthMoment(getFormValues());
  const nextCalibrationSignature = `${formValues.inputBirthDate}|${formValues.inputBirthTime}|${formValues.birthDate}|${formValues.birthTime}|${formValues.dayBoundaryRule}`;
  if (calibrationChartSignature && calibrationChartSignature !== nextCalibrationSignature) {
    baziCalibrationEvents = [];
  }
  calibrationChartSignature = nextCalibrationSignature;
  const solar = Solar.fromYmdHms(
    formValues.year,
    formValues.month,
    formValues.day,
    formValues.hour,
    formValues.minute,
    0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(formValues.dayBoundaryRule === "midnight" ? 2 : 1);
  const timeIndex = getTimeIndex(formValues.hour);
  // iztro accepts English gender identifiers; the form keeps Chinese labels for the UI.
  const iztroGender = formValues.gender === "男" ? "male" : "female";
  iztro.astro.config(ASTRO_CONFIG);
  const astrolabe = iztro.astro.bySolar(
    `${formValues.year}-${formValues.month}-${formValues.day}`,
    timeIndex,
    iztroGender,
    true,
    "zh-TW",
  );
  const pillars = [eightChar.getYear(), eightChar.getMonth(), eightChar.getDay(), eightChar.getTime()];
  const naYin = [eightChar.getYearNaYin(), eightChar.getMonthNaYin(), eightChar.getDayNaYin(), eightChar.getTimeNaYin()];
  const elementCounts = countElements(pillars);

  currentChart = {
    astrolabe,
    elementCounts,
    formValues,
    eightChar,
    lunar,
    naYin,
    pillars,
    timeIndex,
  };
  partnerImageState = {
    status: "idle",
    imageUrl: "",
    provider: "",
    message: "",
  };
  baziPartnerImageState = {
    status: "idle",
    imageUrl: "",
    provider: "",
    message: "",
  };

  if (!targetYearInput.value) targetYearInput.value = String(new Date().getFullYear());
  if (!targetMonthInput.value) targetMonthInput.value = String(new Date().getMonth() + 1);
  if (!targetDayInput.value) targetDayInput.value = String(new Date().getDate());
  if (!targetHourInput.value) targetHourInput.value = String(new Date().getHours());
  if (baziTargetYearInput && !baziTargetYearInput.value) {
    baziTargetYearInput.value = String(new Date().getFullYear());
  }
  if (baziTargetMonthInput && !baziTargetMonthInput.value) {
    baziTargetMonthInput.value = String(new Date().getMonth() + 1);
  }
  if (calibrationYearInput && !calibrationYearInput.value) {
    calibrationYearInput.value = String(Math.max(formValues.year, new Date().getFullYear() - 1));
  }

  renderSummary(astrolabe, lunar, formValues, timeIndex);
  renderPillars(currentChart);
  renderElementBars(elementCounts);
  renderNaYin(naYin);
  renderBaziInsights(currentChart);
  renderBaziDecadalOptions(currentChart);
  renderDecadalOptions(astrolabe, formValues);
  setActiveReadingMethod(activeReadingMethod);
  updateReading();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    calculate();
  } catch (error) {
    showError(error);
  }
});

form.querySelectorAll('input[name="gender"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!currentChart || !birthYearSelect.value || !birthMonthSelect.value || !birthDaySelect.value || !timeInput.value) return;
    try {
      calculate();
    } catch (error) {
      showError(error);
    }
  });
});

[birthYearSelect, birthMonthSelect].forEach((select) => {
  select.addEventListener("change", updateBirthDayOptions);
});
[
  scopeSelect,
  decadalSelect,
  targetYearInput,
  targetMonthInput,
  targetDayInput,
  targetHourInput,
  topicSelect,
].forEach((control) => {
  control.addEventListener("change", updateReading);
  control.addEventListener("input", updateReading);
});

[
  baziScopeSelect,
  baziDecadalSelect,
  baziTargetYearInput,
  baziTargetMonthInput,
  baziTopicSelect,
].filter(Boolean).forEach((control) => {
  control.addEventListener("change", updateBaziReading);
  control.addEventListener("input", updateBaziReading);
});

methodTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveReadingMethod(tab.dataset.readingMethod));
});

addCalibrationEventButton?.addEventListener("click", () => {
  if (!currentChart) {
    showError(new Error("請先完成排盤，再加入過往事件。"));
    return;
  }
  const year = Number(calibrationYearInput?.value);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < currentChart.formValues.year || year > currentYear) {
    showError(new Error(`事件年份需介於出生年${currentChart.formValues.year}與${currentYear}之間。`));
    return;
  }
  clearError();
  baziCalibrationEvents.push({
    id: `${Date.now()}-${baziCalibrationEvents.length}`,
    year,
    type: CALIBRATION_EVENT_TYPES[calibrationTypeSelect?.value] ? calibrationTypeSelect.value : "career",
    note: calibrationNoteInput?.value.trim() || "",
  });
  if (calibrationNoteInput) calibrationNoteInput.value = "";
  renderBaziCalibration();
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
  const removeCalibrationButton = event.target.closest("[data-remove-calibration]");
  if (removeCalibrationButton) {
    const id = removeCalibrationButton.dataset.removeCalibration;
    baziCalibrationEvents = baziCalibrationEvents.filter((item) => String(item.id) !== String(id));
    renderBaziCalibration();
    return;
  }
  const imageTypeButton = event.target.closest("[data-ziwei-image-type]");
  if (imageTypeButton) {
    ziweiImageType = imageTypeButton.dataset.ziweiImageType || "sanhe";
    if (currentChart) {
      const context = buildPeriodContext(currentChart);
      renderZiweiImage(currentChart.astrolabe, context);
    }
  }
  if (event.target.matches("[data-regenerate-partner]")) {
    regeneratePartnerPortrait();
  }
  if (event.target.matches("[data-generate-ai-partner]")) {
    generatePartnerAiImage();
  }
  if (event.target.matches("[data-generate-bazi-partner]")) {
    generateBaziPartnerAiImage();
  }
});

initializeBirthDateTime();
seedChat();
