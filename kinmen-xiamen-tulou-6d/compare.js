const crossBrandGroups=[
  {id:'candy',tab:'🍬 豬腳貢糖',name:'金門豬腳貢糖｜跨四品牌',spec:'全素、麥芽糖外皮＋花生餡、每包 12 入。這是「相同品類」而不是完全相同配方或等級；已知淨重才用每 100g 比價。',currency:'NT$',unit:'g',input:true,qualify:'同品類比較：都是全素 12 入的豬腳貢糖；花生比例、麥芽糖外皮厚度、口感和品牌定位仍可能不同。若比較總價，以 12 入為基準；若比較份量，以每 100g 為基準。',items:[
    {n:'金名祖 12入豬腳貢糖',price:100,gram:null,note:'12 入／全素；總重待查',state:'可比：同類12入',url:'https://www.kmgn.com.tw/?product_id=1269&route=product%2Fproduct'},
    {n:'金瑞成 豬腳貢糖',price:120,gram:220,note:'12 入／全素／220g±10g',state:'可換算重量',url:'https://www.kmgn.com.tw/?product_id=223&route=product%2Fproduct'},
    {n:'天工 招牌豬腳貢糖',price:130,gram:null,note:'12 入／純素；總重待查',state:'可比：同類12入',url:'https://www.tico135.com.tw/product/detail/2273934'},
    {n:'聖祖 招牌豬腳貢糖',price:170,gram:240,note:'12 入／全素／240g±3%',state:'可換算重量',url:'https://mall.iopenmall.tw/002745/index.php?action=product_detail&prod_no=P0274500153909'}
  ],same:'同品牌同款另查：聖祖 240g 12 入官方會員價 NT$170；iOPEN 官方旗艦店另見 NT$180，不含個別運費。不同品牌的比較仍須看單包總重。',sameUrl:'https://www.shengzu.com.tw/products_11.htm',excludes:'「香酥／鹹酥／海蘭酥／采玉酥」不是豬腳貢糖；14 入團購包不能直接拿 12 入包價比。'},
  {id:'jerky',tab:'🥩 原味牛肉乾',name:'金門原味牛肉乾｜跨三品牌',spec:'一般原味「片狀牛肉乾」，不混入牛肉角、辣味／黑胡椒、戰地限定或不同肉品。以每 100g 比價。',currency:'NT$',unit:'g',input:true,qualify:'同一大類：一般原味牛肉乾、非牛肉角，已知重量；但牛肉來源、厚薄、含糖量與調味配方仍不同，因此只比較價格密度，不視為同級品質保證。',items:[
   {n:'良金 原味牛肉乾',price:170,gram:165,note:'165g／零售特價；非 180g 品牌訂購包',state:'可換算重量',url:'https://www.kmgn.com.tw/?product_id=123&route=product%2Fproduct'},
   {n:'喬安 原味牛肉乾',price:180,gram:180,note:'180g／一般原味款；不是「戰地／限定版」',state:'可換算重量',url:'https://mall.iopenmall.tw/018333/index.php?action=product_detail&prod_no=P1833301928799'},
   {n:'高坑 原味牛肉乾',price:180,gram:160,note:'160g±3g／官方售價',state:'可換算重量',url:'https://kow-kun.com.tw/zh-TW/products/beef-jerky-original'}
  ],same:'同品牌不同通路：喬安一般原味 180g，有特產商行 NT$170 與 iOPEN Mall NT$180；良金 180g 官方訂購單 NT$200，但它是不同重量包裝，不應與 165g 直接比「每包價」。',sameUrl:'https://www.kmgn.com.tw/?path=5_8_18&route=product%2Fcategory',excludes:'牛肉角是不同口感與切型；喬安金門限定版部分為 130g／較高售價，不能混入 180g 一般款。'},
  {id:'noodles',tab:'🍜 金門麵線',name:'金門原味麵線｜同款跨通路＋條件式跨牌',spec:'原味、手工／日曬、重量 360–400g；跨品牌仍需確認是否真正手工日曬與是否添加其他原料。',currency:'NT$',unit:'g',input:false,qualify:'馬家 360g 原味產品可確實做同款跨通路；上古厝 400g 商品與馬家為不同品牌，待確定是同類手工日曬製程才能同級比。',items:[
    {n:'馬家 原味麵線｜板農',price:230,gram:360,note:'8 束／360g／純手工原味',state:'同款基準',url:'https://eshop.pcfarm.jil.tw/product?id=10884'},
    {n:'馬家 原味麵線｜iOPEN Mall',price:210,gram:360,note:'8 束／360g；同品牌同規格、不同通路',state:'同款可直比',url:'https://mall.iopenmall.tw/018333/index.php?action=product_detail&prod_no=P1833301927718'},
    {n:'上古厝 原味麵線｜賣場',price:130,gram:400,note:'標示 10 束／400g；手工與日曬條件待核實',state:'跨品牌：條件式',url:'https://mall.iopenmall.tw/046530/'}
  ],same:'已確認馬家原味 360g：板農 NT$230、iOPEN 商家 NT$210，完全同款通路價差 NT$20（運費另計）。',sameUrl:'https://mall.iopenmall.tw/018333/index.php?action=product_detail&prod_no=P1833301927718',excludes:'高粱／山藥等添加口味、粗細不同、非手工乾燥製程，不能與手工原味直接比。'},
  {id:'latex',tab:'🛏️ 乳膠床墊',name:'天然乳膠床墊｜5尺雙人 × 4種厚度',spec:'依乳膠床芯厚度 5、7.5、10、15cm 分組；台灣公開價不等於同品牌同款。完整選購清單及 RMB 換算，請切換「依購物站查 → 11/23 乳膠寢具」。',currency:'NT$',unit:'none',input:false,qualify:'先比同厚度和同尺寸，再確認整塊天然乳膠、密度及軟硬度、製程、布套、認證與售後保固。這些商品可視為相近類別，但未證實品質完全相同。',items:[
 {n:'班尼斯 5尺 5cm',price:3900,gram:null,note:'約150×186cm・馬來天然乳膠・網眼布套',state:'5cm同類',url:'https://www.bennis.com.tw/product_detail.php?id=486'},
 {n:'森好眠 5尺 5cm',price:7505,gram:null,note:'約150×188cm・冰絲涼感系列・通路售價',state:'5cm不同布套',url:'https://24h.pchome.com.tw/store/DEBR2S'},
 {n:'班尼斯 5尺 7.5cm',price:6900,gram:null,note:'約150×186cm・馬來天然乳膠・網眼布套',state:'7.5cm同類',url:'https://www.bennis.com.tw/product_detail.php?id=490'},
 {n:'森好眠 5尺 7.5cm',price:10925,gram:null,note:'約150×188cm・冰絲涼感系列・通路售價',state:'7.5cm不同布套',url:'https://24h.pchome.com.tw/store/DEBR2S'},
 {n:'班尼斯 5尺 10cm',price:8500,gram:null,note:'約150×186cm・馬來天然乳膠・網眼布套',state:'10cm同類',url:'https://www.bennis.com.tw/product_detail.php?id=494'},
 {n:'森好眠 5尺 10cm',price:12635,gram:null,note:'約150×188cm・冰絲涼感系列・通路售價',state:'10cm不同布套',url:'https://24h.pchome.com.tw/store/DEBR2S'},
 {n:'班尼斯 5尺 15cm',price:16800,gram:null,note:'官網不同版位價格約16000至16800，以下單結帳為準',state:'15cm待核價',url:'https://www.bennis.com.tw/products.php?mid=1&sid=40'},
 {n:'森好眠 5尺 15cm',price:19760,gram:null,note:'約150×188cm・冰絲涼感系列・通路售價',state:'15cm不同布套',url:'https://24h.pchome.com.tw/store/DEBR2S'}
 ],same:'台灣同厚度的公開價能建立市場區間，但沒有拿到自貿區現場的精確尺寸、密度、完整型號，就不能斷言旅行社商品溢價多少。',sameUrl:'https://www.bennis.com.tw/product_detail.php?id=494',excludes:'5尺與6尺不能混比；整塊乳膠與泡棉／彈簧加薄乳膠不能混比；5cm加墊不可比15cm厚墊；床墊加枕頭棉被的套組也不可直接與單床墊比價。'},
  {id:'silk',tab:'🧵 桑蠶絲被',name:'桑蠶絲被｜先比填充淨重',spec:'真正能對照的是同被子尺寸、桑蠶絲填充淨重（1kg vs 2kg）、長絲比例、布套材質與保固。下列是台灣規格相近但不同品牌的市場售價。',currency:'NT$',unit:'none',input:false,qualify:'1kg 長纖桑蠶絲被兩品牌 NT$7,000／9,450，屬同規格級距，仍須核對標示是否真是填充淨重；2kg 另外列。不可把夏被、子母被、床單／真絲被套混比。',items:[
 {n:'碧多妮 桑蠶絲被・1kg',price:7000,gram:null,note:'雙人6×7尺、長纖桑蠶絲・台灣品牌公開零售',state:'1kg相近類',url:'https://bmori.cyberbiz.co/products/m03442060'},
 {n:'下營農會 100%桑蠶絲被・1kg',price:9450,gram:null,note:'雙人6×7尺，標示1kg純蠶絲',state:'1kg不同品牌',url:'https://www.shiaying.com.tw/ec/product_info.php?info=p79_100--------------1------.html'},
 {n:'下營農會 100%桑蠶絲被・2kg',price:13050,gram:null,note:'雙人6×7尺，填充量不同不可與1kg直比',state:'2kg另比較',url:'https://www.shiaying.com.tw/ec/product_info.php?info=p86_100--------------2------.html'}
 ],same:'正確比較：「桑蠶絲」含量、長絲／短絲、蠶絲填充淨重與被尺寸。中國產品若只寫「4斤」要分清楚是蠶絲淨重還是整床重量；1市斤=500g。',sameUrl:'https://std.samr.gov.cn/gb/search/gbDetailed?id=95A47695C5794F2CE05397BE0A0AB3E0',excludes:'100%天絲／萊賽爾床單不是100%桑蠶絲；蠶絲被芯與真絲被套不是同一商品；1kg不可以和2kg或2+4斤子母被直接比。'},
  {id:'scarf',tab:'🧣 真絲絲巾',name:'真絲絲巾｜90×90cm 100%桑蠶絲',spec:'單看「絲滑」「天絲」不足以比較；要看標示100%桑蠶絲／silk、尺幅、面料厚度（姆米mm）、印花及做工。',currency:'NT$',unit:'none',input:false,qualify:'同為標示100%桑蠶絲的90×90cm方巾，但不同通路、圖案、厚度和品牌。市場價 NT$1,668至3,800是參考區間，不是完全同級。',items:[
 {n:'100%桑蠶絲方巾・90×90',price:1668,gram:null,note:'東森台灣跨境通路頁面，面料與設計細節待確認',state:'厚度及品質待核對',url:'https://www.etmall.com.tw/i/6863164'},
 {n:'Mico 桑蠶絲方巾・90×90',price:3800,gram:null,note:'商家台灣零售，設計與厚度和前者不一定相同',state:'不同品牌及設計',url:'https://h85453743.shopstore.tw/item/PD69af9a608cf57'}
 ],same:'現場若有小絲巾，先看完整材質標示與尺幅，不買「真絲」二字無產地、無品牌、無材質標籤的商品；台灣價格只能提示量級。',sameUrl:'https://www.etmall.com.tw/i/6863164',excludes:'聚酯仿真絲／天絲／萊賽爾與桑蠶絲本質不同；53×53cm小方巾不應與90×90cm方巾直接比價。'},
  {id:'tea',tab:'🍵 茶葉',name:'茶葉｜先選茶種，再確認重量及批次',spec:'大紅袍、鐵觀音與普洱並列為「不同類產品」，每100g僅供換算。標示不同產區、山場、焙火、採收年份、茶級和批次時不能直接判定同級價差。',currency:'RMB',unit:'g',input:false,qualify:'中茶海堤AT103/AT103A是同廠不同型號的大紅袍；八馬賽珍珠1000是另一茶種鐵觀音；大益7542是生普洱。必須同茶種、完整型號、克重及批次相同才可直接比價。',items:[
 {n:'中茶海堤 AT103 大紅袍',price:89.9,gram:125,note:'125g／每100g約RMB71.9／一般茶款',state:'大紅袍型號AT103',url:'https://www.chawo.com/shop_view-6-31-4-1-0.html'},
 {n:'中茶海堤 AT103A 大紅袍',price:148,gram:125,note:'125g／每100g約RMB118.4／型號不同',state:'大紅袍型號AT103A',url:'https://www.chawo.com/shop_view-6-31-4-1-0.html'},
 {n:'八馬 賽珍珠1000 鐵觀音',price:360,gram:150,note:'150g／每100g RMB240／清香或濃香依版本核對',state:'另一茶種鐵觀音',url:'https://detail.youzan.com/show/goods?alias=3nfbzv54qalumpa&from_source=gbox_seo'},
 {n:'大益 7542 生普洱・2401批',price:110,gram:357,note:'2024年2401批／357g／每100g約RMB30.8',state:'普洱生茶另一類',url:'https://www.chawo.com/item-113023.html'}
 ],same:'其他團大紅袍RMB800／盒與普洱RMB2,000／餅都沒有可核對的完整型號、年份、淨重；目前只能列為「待核實的高價風險」，不應硬算貴幾倍。',sameUrl:'https://www.chawo.com/shop_view-6-31-4-1-0.html',excludes:'母樹大紅袍宣稱須高度警覺；普洱新老、生熟、儲存狀況不同；鐵觀音與大紅袍不可相互當成同級樣本。'},
  {id:'knives',tab:'🔪 鋼刀',name:'金門鋼刀｜先分單刀與雙刀組',spec:'只比較相同用途、相近刀型與刀刃材質；剁刀與切菜刀、鋼柄與電木柄不能只看價格。',currency:'NT$',unit:'none',input:false,qualify:'金永利 B1 雙刀與金合利 F1 雙刀都是兩支裝，但刀型、材質、尺寸與鍛造工藝資料不足，不視為完全同級，只供雙刀組預算參考。',items:[
   {n:'金永利 B1 雙刀禮盒',price:2749,gram:null,note:'剁刀＋切刀；網路商品價',state:'雙刀組：待核對鋼材',url:'https://pxbox.es.pxmart.com.tw/product/236082'},
   {n:'金合利 F1 雙刀禮盒',price:3800,gram:null,note:'新式鋼柄雙刀禮盒；品牌官網',state:'雙刀組：待核對鋼材',url:'https://www.maestrowu.com.tw/product-detail.php?id=24'},
   {n:'金永利 B1-1 單支剁刀',price:1480,gram:null,note:'鋼柄剁刀，不可與切菜刀相比',state:'剁刀：另一組',url:'https://www.olina888.com/products/product-sgAeeKP3qJBKeaQbkbyCui'},
   {n:'金合利 D4 單支切菜刀',price:1900,gram:null,note:'電木柄切菜刀，不可與剁刀相比',state:'切刀：另一組',url:'https://maestrowu.com.tw/product-detail.php?id=14'}
  ],same:'你拍到的現場報價：B1 NT$2,900 對網路 NT$2,749；F1 NT$3,600 對官網 NT$3,800。**此為各自同款跨通路價差**，比拿 B1 和 F1 直接判斷高低更可靠。',sameUrl:'https://www.maestrowu.com.tw/product-detail.php?id=24',excludes:'店家宣稱炮彈鋼、特殊鍛造，仍需確認實際用鋼、刀型、工藝與保固。不同刀種不以「同是菜刀」當作同級。'},
  {id:'skincare',tab:'🧴 珍珠霜',name:'片仔癀珍珠霜｜先辨商品系列',spec:'普通25g／煥顏32g是不同化妝品。',currency:'RMB',unit:'none',input:false,qualify:'珍珠霜25g可以同款比價；32g是不同系列。',items:[
 {n:'片仔癀 皇后牌普通珍珠霜25g',price:23.8,gram:null,note:'25g／片仔癀官方標示零售價，非醫藥品',state:'普通款基準',url:'https://www.pzhchina.com/pzhhzp/product/info_476.aspx?itemid=8491'},
 {n:'片仔癀 皇后牌煥顏珍珠霜32g',price:105,gram:null,note:'32g／高階系列，不能用普通25g價格直接比',state:'不同系列',url:'https://www.pzhchina.com/pzhhzp/product/info_476.aspx?itemid=8476'},
 ],same:'官方25g珍珠霜RMB23.8可作同品名零售比較；不同容量與系列不能比較每瓶價。',sameUrl:'https://www.pzhchina.com/pzhhzp/product/info_476.aspx?itemid=8491',excludes:'外盒顏色不能取代正式品名及容量。'}
];
