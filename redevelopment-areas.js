"use strict";
// Navigation anchors are approximate, not boundary geometry or cadastral points.
const shilinSource='https://slhr.gov.taipei/cp.aspx?n=F4948E9000529613';
const xindianSource='https://www-ws.land.ntpc.gov.tw/Download.ashx?icon=..pdf&n=5paw5bqX5biC5Y2A5Li76KaB5o236YGL56uZ5ZGo6YGt5Zyw5q616IiH5a6J5rCR5Y%2BK5a6J5b6355Sf5rS75ZyI6LO85bGL57Wx6KiI5YiG5p6QLnBkZg%3D%3D&u=LzAwMS9VcGxvYWQvMS9yZWxmaWxlLzk2NzcvNjM3MDk3LzcxNTBmYTZjLWRlMzctNGVlYy1iYzQ2LTYyM2Y4NTg2OTMwOC5wZGY%3D';
const RedevelopmentAreas = [
  {id:'xinzhuang-center',city:'新北市',districts:['新莊區'],name:'新莊副都心',kind:'市地重劃／區段徵收',lat:25.060,lon:121.449,source:'https://www.xinzhuang.land.ntpc.gov.tw/cp.aspx?n=11484'},
  {id:'touqian',city:'新北市',districts:['新莊區'],name:'頭前重劃區',kind:'市地重劃',lat:25.056,lon:121.464,source:'https://www.xinzhuang.land.ntpc.gov.tw/cp.aspx?n=11484'},
  {id:'jiangcui',city:'新北市',districts:['板橋區'],name:'江翠北側',kind:'市地重劃',lat:25.034,lon:121.479,source:'https://www.banqiao.land.ntpc.gov.tw/cp.aspx?n=12800'},
  {id:'erchong',city:'新北市',districts:['三重區'],name:'二重疏洪道兩側',kind:'市地重劃',lat:25.058,lon:121.481,source:'https://eng.land.ntpc.gov.tw/cp.aspx?n=9095'},
  {id:'zhonglu',city:'桃園市',districts:['桃園區'],name:'中路',kind:'區段徵收',lat:24.998,lon:121.285,source:'https://www.taoyuan-land.tycg.gov.tw/News_Content.aspx?n=13934&s=1218841'},
  {id:'jingguo',city:'桃園市',districts:['桃園區'],name:'經國重劃區',kind:'市地重劃',lat:25.031,lon:121.303,source:'https://land.tycg.gov.tw/News_Content.aspx?n=4087&s=674448'},
  {id:'qingpu',city:'桃園市',districts:['中壢區','大園區'],name:'青埔高鐵特定區',kind:'高鐵特定區',lat:25.013,lon:121.215,source:'https://urdb.tycg.gov.tw/News_Content.aspx?n=10681&s=1867851'},
  {id:'beitou-shilin',city:'臺北市',districts:['北投區'],relatedDistricts:['士林區'],name:'北士科（北投士林科技園區）',kind:'區段徵收',lat:25.104,lon:121.505,source:'https://bstp.gov.taipei/parkIntroduce',note:'本入口指雙溪以北的區段徵收開發區，在北投區收錄，士林提供鄰近關聯入口。較廣的都市計畫另含雙溪南側地區，不能與本區徵範圍混用；兩區入口共用同一筆資料，不重複計數。'},
  {id:'qidu-phase7',city:'基隆市',districts:['七堵區'],name:'第七期（七堵）重劃區',kind:'已辦竣市地重劃',lat:25.098,lon:121.714,source:'https://www.klcg.gov.tw/tw/klland/2320-111094.html'}
  ,{id:'dapinglin-station',city:'新北市',districts:['新店區'],name:'大坪林站生活圈',type:'established',kind:'既有捷運生活圈',lat:24.983,lon:121.541,source:xindianSource,note:'以大坪林站與北新路沿線作為導航參考；不是大坪林市地重劃案的法定範圍。來源為110年地政分析，僅採區域分類，不沿用當年的房價。'}
  ,{id:'dapinglin-readjustment',city:'新北市',districts:['新店區'],name:'大坪林市地重劃區',kind:'已完成市地重劃（民國69年）',lat:24.971,lon:121.536,source:'https://www.land.ntpc.gov.tw/cp.aspx?n=8810',note:'約2.99公頃，中正國小周邊；三民路51巷至75巷、中正路263巷至三民路。不要與大坪林站生活圈混為一談。'}
  ,{id:'qizhang',city:'新北市',districts:['新店區'],name:'七張站生活圈',type:'established',kind:'既有捷運生活圈',lat:24.975,lon:121.543,source:xindianSource,note:'北新路沿線既有生活圈；歷年來源僅作分類參考，不表示最新行情。'}
  ,{id:'xindian-office',city:'新北市',districts:['新店區'],name:'新店區公所站生活圈',type:'established',kind:'既有捷運生活圈',lat:24.968,lon:121.542,source:xindianSource}
  ,{id:'xindian-station',city:'新北市',districts:['新店區'],name:'新店站生活圈',type:'established',kind:'既有捷運生活圈',lat:24.958,lon:121.537,source:xindianSource}
  ,{id:'anmin-ande',city:'新北市',districts:['新店區'],name:'安民／安德生活圈',type:'established',kind:'既有生活圈',lat:24.966,lon:121.514,source:xindianSource,note:'來源以安民街、安德街、安康路二段一帶描述；不是安坑全區邊界。'}
  ,{id:'yangbei',city:'新北市',districts:['新店區'],name:'央北（中央新村北側）',kind:'區段徵收',lat:24.975,lon:121.528,source:'https://www.land.ntpc.gov.tw/cp.aspx?n=3727'}
  ,{id:'shisizhang',city:'新北市',districts:['新店區'],name:'十四張 B 單元',type:'planned',kind:'區段徵收開發案',lat:24.982,lon:121.529,source:'https://www.land.ntpc.gov.tw/cp.aspx?Create=1&n=13655',note:'與已完成的央北分列。開發案不等於已有建商預售案，也不代表已完工。'}
  ,{id:'shilin-yangming',city:'臺北市',districts:['士林區'],name:'陽明山次分區',type:'established',kind:'官方次分區',lat:25.135,lon:121.550,source:shilinSource}
  ,{id:'shilin-tianmu',city:'臺北市',districts:['士林區'],name:'天母次分區',type:'established',kind:'官方次分區',lat:25.118,lon:121.533,source:shilinSource}
  ,{id:'shilin-zhishanyan',city:'臺北市',districts:['士林區'],name:'芝山岩次分區',type:'established',kind:'官方次分區',lat:25.103,lon:121.535,source:shilinSource}
  ,{id:'shilin-lanya',city:'臺北市',districts:['士林區'],name:'蘭雅次分區',type:'established',kind:'官方次分區',lat:25.108,lon:121.527,source:shilinSource}
  ,{id:'shilin-oldtown',city:'臺北市',districts:['士林區'],name:'街上（舊士林）次分區',type:'established',kind:'官方次分區',lat:25.093,lon:121.526,source:shilinSource}
  ,{id:'shilin-hougang',city:'臺北市',districts:['士林區'],name:'後港次分區',type:'established',kind:'官方次分區',lat:25.086,lon:121.518,source:shilinSource}
  ,{id:'shilin-shezi',city:'臺北市',districts:['士林區'],name:'社子次分區',type:'established',kind:'官方次分區',lat:25.092,lon:121.505,source:shilinSource,note:'官方次分區與社子島開發計畫不是同一範圍；分開收錄。'}
  ,{id:'shilin-residence-north',city:'臺北市',districts:['士林區'],name:'士林官邸北側',kind:'區段徵收',lat:25.096,lon:121.535,source:'https://data.taipei/dataset/detail?id=167d87fd-77d2-4aa5-9fcb-66288a3765c3'}
  ,{id:'shezidao-plan',city:'臺北市',districts:['士林區'],name:'社子島開發計畫',type:'planned',kind:'區段徵收計畫',lat:25.109,lon:121.485,source:'https://www.moi.gov.tw/News_Content.aspx?n=4&s=340344&sms=9009',note:'計畫與審議資訊不等於已完成重劃，更不是待開賣預售建案清單。'}
  ,{id:'neihu-phase5',city:'臺北市',districts:['內湖區'],name:'內湖五期',kind:'市地重劃',lat:25.062,lon:121.585,source:'https://lda.land.gov.taipei/News_Content.aspx?n=AF81A1B92BBB31EF&s=6D4CAB1F676D5771&sms=A4EABC47EE97A6D7'}
  ,{id:'nangang-trade',city:'臺北市',districts:['南港區'],name:'南港經貿園區',kind:'經貿開發區',lat:25.059,lon:121.614,source:'https://land.dof.gov.taipei/cp.aspx?n=317D07AACEBB87A0'}
  ,{id:'linkou',city:'新北市',districts:['林口區','泰山區'],name:'林口第三期（三、四區）',kind:'市地重劃',lat:25.074,lon:121.374,source:'https://www.land.ntpc.gov.tw/cp.aspx?n=8819',note:'官方開發案跨林口、泰山部分地區；導航位置不是兩區各自的範圍中心。'}
  ,{id:'danhai',city:'新北市',districts:['淡水區'],name:'淡海新市鎮',kind:'新市鎮開發區',lat:25.190,lon:121.432,source:'https://www.tamsui.land.ntpc.gov.tw/cp.aspx?n=5822'}
  ,{id:'beida',city:'新北市',districts:['三峽區','樹林區'],name:'北大特區',kind:'區段徵收',lat:24.945,lon:121.377,source:'https://www.land.ntpc.gov.tw/cp.aspx?n=3701',note:'跨三峽、樹林，使用同一區域識別，避免重複計數。'}
  ,{id:'fengming',city:'新北市',districts:['鶯歌區'],name:'鳳鳴重劃區',kind:'市地重劃',lat:24.973,lon:121.333,source:'https://www.contcg.ntpc.gov.tw/page/case/show.aspx?kind=11&num=1243&page=1&type=%E5%85%AC%E5%9C%92'}
  ,{id:'zhouziyang',city:'新北市',districts:['五股區'],name:'洲子洋',kind:'市地重劃',lat:25.088,lon:121.445,source:'https://www.xinzhuang.land.ntpc.gov.tw/cp.aspx?n=11484'}
  ,{id:'wenzizun',city:'新北市',districts:['新莊區','泰山區'],name:'塭仔圳（新莊／泰山）',kind:'市地重劃開發區',lat:25.047,lon:121.427,source:'https://www.planning.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=cf6d9acbd315d65e51a96f18a59377af&id=21',note:'亦稱新泰塭仔圳。跨行政區開發範圍含排除重劃的既有聚落，不能整片視為重劃土地。'}
  ,{id:'tucheng-deferred',city:'新北市',districts:['土城區'],name:'土城暫緩發展區（區徵案）',type:'planned',kind:'區段徵收計畫',lat:24.968,lon:121.446,source:'https://www.ntpc.gov.tw/ch/home.jsp?dataserno=202604170038&id=28',note:'14.67公頃區段徵收案，與相鄰已重劃地區分開；不表示計畫已完工。'}
  ,{id:'tucheng-judicial',city:'新北市',districts:['土城區'],name:'土城司法園區',type:'planned',kind:'整體開發計畫',lat:24.960,lon:121.445,source:'https://www.moi.gov.tw/News_Content.aspx?n=4&s=324574',note:'來源為開發工程說明，工程最新進度須另核對；不以預定完工年當成已完工。'}
  ,{id:'xiaokuixi',city:'桃園市',districts:['桃園區'],name:'小檜溪暨埔子',kind:'自辦市地重劃',lat:25.003,lon:121.316,source:'https://ws.tycg.gov.tw/001/Upload/62/relfile/9911/723/96.pdf',note:'與早年公辦小檜溪重劃案區分，以自辦案名稱收錄。'}
  ,{id:'bade-expansion',city:'桃園市',districts:['八德區'],name:'八德擴大都市計畫區',kind:'區段徵收',lat:24.930,lon:121.291,source:'https://www.bade-land.tycg.gov.tw/cp.aspx?n=14620'}
  ,{id:'dazhu',city:'桃園市',districts:['蘆竹區'],name:'大竹（一、二期）',kind:'市地重劃',lat:25.025,lon:121.259,source:'https://land.tycg.gov.tw/News_Content.aspx?n=4087&s=674448'}
  ,{id:'caoluo',city:'桃園市',districts:['觀音區'],name:'草漯重劃各單元',kind:'市地重劃',lat:25.046,lon:121.142,source:'https://land.tycg.gov.tw/News_Content.aspx?n=4087&s=674448',note:'此入口整合草漯各單元，並非單一法定重劃案；各期範圍尚未分繪。'}
  ,{id:'a10-shanbi',city:'桃園市',districts:['蘆竹區'],name:'A10 山鼻站區',kind:'區段徵收',lat:25.080,lon:121.284,source:'https://www.luzhu-hro.tycg.gov.tw/News_Content.aspx?n=13156&s=1086732'}
  ,{id:'a20-xingnan',city:'桃園市',districts:['中壢區'],name:'A20 興南站區',kind:'區段徵收',lat:24.980,lon:121.215,source:'https://land.tycg.gov.tw/cp.aspx?n=4069'}
  ,{id:'a21-huanbei',city:'桃園市',districts:['中壢區'],name:'A21 環北站區',kind:'區段徵收',lat:24.968,lon:121.221,source:'https://land.tycg.gov.tw/News_Content.aspx?n=3926&s=1867557&sms=10036'}
  ,{id:'keelung-phase1',city:'基隆市',districts:['七堵區'],name:'第一期（五堵北）',kind:'已辦竣市地重劃',lat:25.081,lon:121.687,source:'https://www.klepb.klcg.gov.tw/tw/klepb1/2320-111089.html'}
  ,{id:'keelung-phase2',city:'基隆市',districts:['暖暖區'],name:'第二期（暖暖）',kind:'已辦竣市地重劃',lat:25.098,lon:121.738,source:'https://www.klepb.klcg.gov.tw/tw/klepb1/2320-111090.html'}
  ,{id:'keelung-phase4',city:'基隆市',districts:['安樂區'],name:'第四期（大武崙）',kind:'已辦竣市地重劃',lat:25.140,lon:121.711,source:'https://www.klepb.klcg.gov.tw/tw/klepb1/2320-111092.html'}
  ,{id:'keelung-phase5',city:'基隆市',districts:['信義區'],name:'第五期（深澳坑）',kind:'已辦竣市地重劃',lat:25.128,lon:121.782,source:'https://www.klepb.klcg.gov.tw/tw/klepb1/2320-111093.html'}
  ,{id:'keelung-wuling',city:'基隆市',districts:['安樂區'],name:'武嶺段大武崙自辦重劃',kind:'已辦竣自辦市地重劃',lat:25.142,lon:121.709,source:'https://www.klepb.klcg.gov.tw/tw/klepb1/2320-111095.html',note:'與第四期公辦重劃分列；未以同名地區替代個別範圍。'}
].map(area=>({type:'development',...area,checkedAt:'2026-10-26',positionAccuracy:'approximate-navigation'}));
