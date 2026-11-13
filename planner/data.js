/* 2027 九州家族行｜旅程資料
 * 這個檔案只放資料，網站外觀與功能在 app.js / style.css。
 * 時間一律為日本時間 (Asia/Tokyo)。
 * cat：spot 景點｜food 餐飲｜stay 住宿｜move 交通與航班
 * status：''｜'confirm' 待確認｜'optional' 可取消
 * cost：{ amt 金額(null=待填), cur 幣別, unit 'person' 每人｜'car' 每車｜'group' 全團, est 估算, paid 已付 }
 * move 專用：mode 主要交通方式、from、to、segs [[交通方式, 分鐘], ...]
 * 交通方式：flight 航班｜shinkansen 新幹線｜train 火車｜subway 地鐵｜tram 市電｜bus 公車｜walk 步行｜taxi 計程車｜car 自駕
 * 座標為估算，用於地圖示意。
 */
window.TRIP_DEFAULT = {
  version: 1,
  trip: {
    title: '2027 九州家族行',
    destination: '福岡 → 由布院 → 別府 → 黑川 → 阿蘇 → 高千穗 → 熊本',
    timezone: 'Asia/Tokyo',
    travelers: 4,
    localCurrency: 'JPY',
    settleCurrency: 'TWD',
    rate: null, // 1 JPY = ? TWD，請自行填寫
    notes: [
      '行程交通不考慮計程車；自駕走一般道路、不走高速。',
      '2/9～2/11 山區可能結冰，山路排在白天最暖的時段，租車需確認雪胎。',
      '阿蘇中岳火口：2026/9/1 噴火警戒等級 2，火口周邊約 1km 禁入，草千里可去。',
      '2026/7/28 熊本地震後，九州新幹線已恢復、熊本城已重新開放，出發前再確認各官網。'
    ]
  },
  days: [
    { date: '2027-02-02', label: '熊本 → 福岡', tag: '' },
    { date: '2027-02-03', label: '福岡', tag: '' },
    { date: '2027-02-04', label: '福岡／太宰府', tag: '' },
    { date: '2027-02-05', label: '福岡 → 由布院', tag: '除夕' },
    { date: '2027-02-06', label: '由布院', tag: '初一' },
    { date: '2027-02-07', label: '由布院 → 別府（鐵輪＋明礬）', tag: '初二', note: '別府排法討論中，待確認。' },
    { date: '2027-02-08', label: '別府（纜車＋柴石）', tag: '', note: '別府排法討論中，待確認；纜車停駛改走明礬或別府市區。' },
    { date: '2027-02-09', label: '別府 → 黑川', tag: '' },
    { date: '2027-02-10', label: '黑川 → 阿蘇（一宮）', tag: '' },
    { date: '2027-02-11', label: '阿蘇 → 高千穗', tag: '日本假日' },
    { date: '2027-02-12', label: '高千穗 → 熊本', tag: '' },
    { date: '2027-02-13', label: '熊本市區', tag: '' },
    { date: '2027-02-14', label: '熊本市區採購', tag: '' },
    { date: '2027-02-15', label: '熊本 → 回程', tag: '' }
  ],
  items: [
    // ── 2/2 ─────────────────────────────
    { id: 'd02-01', date: '2027-02-02', start: '09:45', dur: 125, cat: 'move', mode: 'flight', name: '台灣虎航 IT766 高雄小港 → 熊本', from: '高雄小港機場', to: '熊本機場', segs: [['flight', 125]], lat: 32.8373, lng: 130.8551, addr: '熊本空港', cost: { amt: null, cur: 'TWD', unit: 'person' }, locked: true, note: '台灣時間 08:45 起飛，06:45（台灣時間）小港機場集合；託運 20kg。' },
    { id: 'd02-02', date: '2027-02-02', start: '12:20', dur: 55, cat: 'move', mode: 'bus', name: '機場巴士 熊本機場 → 熊本站', from: '熊本機場', to: '熊本站', segs: [['bus', 55]], lat: 32.7898, lng: 130.6886, cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'confirm', note: '班次待確認' },
    { id: 'd02-03', date: '2027-02-02', start: '13:30', dur: 45, cat: 'move', mode: 'shinkansen', name: '九州新幹線 熊本 → 博多', from: '熊本站', to: '博多站', segs: [['shinkansen', 40], ['walk', 5]], lat: 33.5897, lng: 130.4207, cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'confirm' },
    { id: 'd02-04', date: '2027-02-02', start: '14:20', dur: 40, cat: 'food', name: '博多站周邊午餐（待選）', lat: 33.5897, lng: 130.4207, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd02-05', date: '2027-02-02', start: '15:00', dur: 60, cat: 'stay', name: 'KOKO HOTEL 博多站前 入住', addr: '福岡県福岡市博多区博多駅前3-22-19', lat: 33.5880, lng: 130.4178, cost: { amt: 76608, cur: 'JPY', unit: 'group', paid: true }, note: '2 間雙人房、3 晚（2/2～2/5），15:00 起入住。電話 092-476-9111。' },
    { id: 'd02-06', date: '2027-02-02', start: '18:00', dur: 90, cat: 'food', name: '水炊き 博多華味鳥 博多駅前店', lat: 33.5892, lng: 130.4187, cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'confirm', note: '暫訂' },
    { id: 'd02-07', date: '2027-02-02', start: '19:35', dur: 20, cat: 'move', mode: 'subway', name: '地鐵 博多 → 中洲川端', from: '博多站', to: '中洲川端站', segs: [['walk', 5], ['subway', 5], ['walk', 10]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd02-08', date: '2027-02-02', start: '20:00', dur: 90, cat: 'food', name: '中洲屋台 散步吃宵夜', lat: 33.5918, lng: 130.4063, cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/3 ─────────────────────────────
    { id: 'd03-01', date: '2027-02-03', start: '08:00', dur: 20, cat: 'move', mode: 'walk', name: '步行到柳橋連合市場', from: 'KOKO HOTEL', to: '柳橋連合市場', segs: [['walk', 20]] },
    { id: 'd03-02', date: '2027-02-03', start: '08:20', dur: 60, cat: 'food', name: '柳橋連合市場 早餐', lat: 33.5846, lng: 130.4043, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd03-03', date: '2027-02-03', start: '09:30', dur: 20, cat: 'move', mode: 'walk', name: '步行到櫛田神社', from: '柳橋連合市場', to: '櫛田神社', segs: [['walk', 20]] },
    { id: 'd03-04', date: '2027-02-03', start: '09:50', dur: 40, cat: 'spot', name: '櫛田神社', lat: 33.5930, lng: 130.4107 },
    { id: 'd03-05', date: '2027-02-03', start: '10:35', dur: 60, cat: 'spot', name: '川端通商店街', lat: 33.5948, lng: 130.4083 },
    { id: 'd03-06', date: '2027-02-03', start: '11:40', dur: 50, cat: 'spot', name: '博多老街（博多舊市街）', lat: 33.5960, lng: 130.4135 },
    { id: 'd03-07', date: '2027-02-03', start: '12:35', dur: 60, cat: 'food', name: '午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd03-08', date: '2027-02-03', start: '13:40', dur: 15, cat: 'move', mode: 'subway', name: '地鐵 中洲川端 → 天神', from: '中洲川端站', to: '天神站', segs: [['walk', 5], ['subway', 5], ['walk', 5]] },
    { id: 'd03-09', date: '2027-02-03', start: '14:00', dur: 150, cat: 'spot', name: '天神地下街／百貨', lat: 33.5903, lng: 130.3990 },
    { id: 'd03-10', date: '2027-02-03', start: '16:35', dur: 25, cat: 'move', mode: 'bus', name: '巴士 天神 → 福岡塔', from: '天神', to: '福岡塔', segs: [['bus', 20], ['walk', 5]], cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'optional' },
    { id: 'd03-11', date: '2027-02-03', start: '17:00', dur: 90, cat: 'spot', name: '福岡塔＋百道海濱看夕陽', lat: 33.5933, lng: 130.3515, cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'optional', note: '可取消' },
    { id: 'd03-12', date: '2027-02-03', start: '18:35', dur: 35, cat: 'move', mode: 'bus', name: '巴士 福岡塔 → 博多', from: '福岡塔', to: '博多站', segs: [['walk', 5], ['bus', 30]], status: 'optional' },
    { id: 'd03-13', date: '2027-02-03', start: '19:20', dur: 90, cat: 'food', name: '牛腸鍋 楽天地 博多駅前 2 丁目店', lat: 33.5893, lng: 130.4160, cost: { amt: null, cur: 'JPY', unit: 'person' }, note: '天神總本店為備用' },

    // ── 2/4 ─────────────────────────────
    { id: 'd04-01', date: '2027-02-04', start: '08:30', dur: 55, cat: 'move', mode: 'train', name: '地鐵＋西鐵 博多 → 太宰府', from: '博多站', to: '太宰府站', segs: [['subway', 5], ['walk', 10], ['train', 40]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd04-02', date: '2027-02-04', start: '09:30', dur: 180, cat: 'spot', name: '太宰府天滿宮', lat: 33.5215, lng: 130.5349, note: '半天' },
    { id: 'd04-03', date: '2027-02-04', start: '12:30', dur: 60, cat: 'food', name: '參道午餐', lat: 33.5197, lng: 130.5320, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd04-04', date: '2027-02-04', start: '13:40', dur: 55, cat: 'move', mode: 'train', name: '西鐵 太宰府 → 天神 → 博多運河城', from: '太宰府站', to: '博多運河城', segs: [['train', 40], ['walk', 15]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd04-05', date: '2027-02-04', start: '14:40', dur: 180, cat: 'spot', name: '博多運河城', lat: 33.5897, lng: 130.4110 },
    { id: 'd04-06', date: '2027-02-04', start: '17:45', dur: 15, cat: 'move', mode: 'walk', name: '步行回飯店', from: '博多運河城', to: 'KOKO HOTEL', segs: [['walk', 15]] },
    { id: 'd04-07', date: '2027-02-04', start: '19:00', dur: 90, cat: 'food', name: 'にく屋 肉いち 博多店（燒肉）', lat: 33.5905, lng: 130.4195, cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/5 除夕 ────────────────────────
    { id: 'd05-01', date: '2027-02-05', start: '08:45', dur: 15, cat: 'move', mode: 'walk', name: 'KOKO HOTEL 退房 → 博多站', from: 'KOKO HOTEL', to: '博多站', segs: [['walk', 15]] },
    { id: 'd05-02', date: '2027-02-05', start: '09:17', dur: 133, cat: 'move', mode: 'train', name: 'JR 由布院之森 博多 → 由布院', from: '博多站', to: '由布院站', segs: [['train', 133]], lat: 33.2650, lng: 131.3560, cost: { amt: null, cur: 'JPY', unit: 'person' }, locked: true, status: 'confirm', note: '班次待填，時刻為估算，以實際購票為準。春節需提早訂。' },
    { id: 'd05-03', date: '2027-02-05', start: '11:35', dur: 15, cat: 'move', mode: 'walk', name: '步行到湯之坪一帶', from: '由布院站', to: '湯之坪街道', segs: [['walk', 15]] },
    { id: 'd05-04', date: '2027-02-05', start: '12:00', dur: 60, cat: 'food', name: '由布院午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd05-05', date: '2027-02-05', start: '13:10', dur: 170, cat: 'spot', name: '由布院散策', lat: 33.2659, lng: 131.3620 },
    { id: 'd05-06', date: '2027-02-05', start: '16:00', dur: 60, cat: 'stay', name: 'ぷらたなす Yufuin Kinrin Lake Coffee Villa 入住', addr: '由布院 金鱗湖旁', lat: 33.2670, lng: 131.3688, cost: { amt: 55080, cur: 'JPY', unit: 'group' }, note: '2 晚（2/5～2/7），Booking.com；入住時間待確認。' },
    { id: 'd05-07', date: '2027-02-05', start: '18:30', dur: 90, cat: 'food', name: '除夕晚餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/6 初一 ────────────────────────
    { id: 'd06-01', date: '2027-02-06', start: '07:00', dur: 60, cat: 'spot', name: '金鱗湖晨霧', lat: 33.2665, lng: 131.3695, note: '清晨溫差大時最容易看到霧' },
    { id: 'd06-02', date: '2027-02-06', start: '08:15', dur: 60, cat: 'food', name: '早餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd06-03', date: '2027-02-06', start: '12:00', dur: 60, cat: 'food', name: '午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd06-04', date: '2027-02-06', start: '13:15', dur: 15, cat: 'move', mode: 'walk', name: '步行到湯之坪街道', from: '金鱗湖', to: '湯之坪街道', segs: [['walk', 15]] },
    { id: 'd06-05', date: '2027-02-06', start: '13:30', dur: 180, cat: 'spot', name: '湯之坪街道', lat: 33.2660, lng: 131.3640 },
    { id: 'd06-06', date: '2027-02-06', start: '18:30', dur: 90, cat: 'food', name: '晚餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/7 初二（討論中）───────────────
    { id: 'd07-01', date: '2027-02-07', start: '09:45', dur: 60, cat: 'move', mode: 'bus', name: '巴士 由布院 → 別府', from: '由布院站', to: '別府站', segs: [['bus', 60]], cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'confirm', note: '班次待確認' },
    { id: 'd07-02', date: '2027-02-07', start: '10:50', dur: 20, cat: 'stay', name: '別府 寄放行李', lat: 33.2790, lng: 131.5000, status: 'confirm' },
    { id: 'd07-03', date: '2027-02-07', start: '11:15', dur: 25, cat: 'move', mode: 'bus', name: '龜の井巴士 別府站 → 鐵輪', from: '別府站', to: '鐵輪', segs: [['bus', 25]], cost: { amt: null, cur: 'JPY', unit: 'person' }, note: '往 APU 方向' },
    { id: 'd07-04', date: '2027-02-07', start: '11:40', dur: 40, cat: 'food', name: '鐵輪地獄蒸午餐', lat: 33.3148, lng: 131.4820, cost: { amt: null, cur: 'JPY', unit: 'person' }, note: '只吃這一次，偏體驗性質' },
    { id: 'd07-05', date: '2027-02-07', start: '12:20', dur: 165, cat: 'spot', name: '鐵輪 5 個地獄', lat: 33.3170, lng: 131.4770, cost: { amt: 2400, cur: 'JPY', unit: 'person', est: true }, status: 'confirm', note: '海 → 鬼石坊主 → 竈 → 鬼山 → 白池。地獄共通券可用到 2/8，價格以官網為準。' },
    { id: 'd07-06', date: '2027-02-07', start: '15:10', dur: 10, cat: 'move', mode: 'bus', name: '巴士 鐵輪 → 明礬', from: '鐵輪', to: '明礬', segs: [['bus', 10]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd07-07', date: '2027-02-07', start: '15:25', dur: 75, cat: 'spot', name: '明礬 湯之花小屋＋岡本屋布丁', lat: 33.3250, lng: 131.4588, note: '湯之花小屋免費，開到 18:00' },
    { id: 'd07-08', date: '2027-02-07', start: '16:45', dur: 30, cat: 'move', mode: 'bus', name: '巴士 明礬 → 別府站', from: '明礬', to: '別府站', segs: [['bus', 30]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd07-09', date: '2027-02-07', start: '17:20', dur: 40, cat: 'stay', name: '別府住宿 入住（待訂）', lat: 33.2800, lng: 131.5010, cost: { amt: null, cur: 'JPY', unit: 'group' }, status: 'confirm', note: '2 晚（2/7～2/9）' },
    { id: 'd07-10', date: '2027-02-07', start: '18:30', dur: 90, cat: 'food', name: '別府晚餐、泡湯（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/8（討論中）────────────────────
    { id: 'd08-01', date: '2027-02-08', start: '08:35', dur: 25, cat: 'move', mode: 'bus', name: '36 系統巴士 別府站西口 → 纜車', from: '別府站', to: '別府纜車', segs: [['walk', 5], ['bus', 20]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd08-02', date: '2027-02-08', start: '09:00', dur: 120, cat: 'spot', name: '鶴見岳纜車', lat: 33.2905, lng: 131.4500, cost: { amt: 1800, cur: 'JPY', unit: 'person', est: true }, status: 'confirm', note: '首班 9:00，看天氣；票價官網 1,600 或 1,800 待確認' },
    { id: 'd08-03', date: '2027-02-08', start: '11:10', dur: 30, cat: 'move', mode: 'bus', name: '36 系統巴士 纜車 → 別府站', from: '別府纜車', to: '別府站', segs: [['bus', 30]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd08-04', date: '2027-02-08', start: '11:50', dur: 60, cat: 'food', name: '別府站周邊午餐（待選）', lat: 33.2790, lng: 131.5005, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd08-05', date: '2027-02-08', start: '13:05', dur: 25, cat: 'move', mode: 'train', name: 'JR 別府 → 亀川＋步行', from: '別府站', to: '柴石', segs: [['train', 8], ['walk', 15]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd08-06', date: '2027-02-08', start: '13:35', dur: 90, cat: 'spot', name: '柴石 血池地獄、龍卷地獄', lat: 33.3367, lng: 131.4957, note: '16:30 前進場；龍卷地獄間歇泉要等；共通券 2/7 買' },
    { id: 'd08-07', date: '2027-02-08', start: '15:15', dur: 30, cat: 'move', mode: 'train', name: '步行＋JR 亀川 → 別府', from: '柴石', to: '別府站', segs: [['walk', 15], ['train', 8]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd08-08', date: '2027-02-08', start: '16:00', dur: 30, cat: 'spot', name: '竹瓦溫泉 外觀拍照', lat: 33.2812, lng: 131.5053, note: '砂浴不排，可去可不去' },
    { id: 'd08-09', date: '2027-02-08', start: '18:30', dur: 90, cat: 'food', name: '晚餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/9 ─────────────────────────────
    { id: 'd09-01', date: '2027-02-09', start: '09:00', dur: 30, cat: 'move', mode: 'car', name: '別府 取車', from: '別府', to: '別府', segs: [['car', 30]], lat: 33.2790, lng: 131.5000, cost: { amt: null, cur: 'JPY', unit: 'car' }, status: 'confirm', note: '確認雪胎；別府取 → 熊本還的乘り捨て費待查' },
    { id: 'd09-02', date: '2027-02-09', start: '09:30', dur: 80, cat: 'move', mode: 'car', name: '自駕 別府 → 九重夢大吊橋', from: '別府', to: '九重夢大吊橋', segs: [['car', 80]] },
    { id: 'd09-03', date: '2027-02-09', start: '10:50', dur: 60, cat: 'spot', name: '九重夢大吊橋', lat: 33.1745, lng: 131.2525, cost: { amt: 500, cur: 'JPY', unit: 'person', est: true } },
    { id: 'd09-04', date: '2027-02-09', start: '12:00', dur: 60, cat: 'food', name: '九重午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd09-05', date: '2027-02-09', start: '13:10', dur: 50, cat: 'move', mode: 'car', name: '自駕 九重 → 黑川溫泉', from: '九重夢大吊橋', to: '黑川溫泉', segs: [['car', 50]] },
    { id: 'd09-06', date: '2027-02-09', start: '14:00', dur: 120, cat: 'spot', name: '黑川溫泉街、入湯手形、甜點', lat: 33.0810, lng: 131.1430, cost: { amt: 1500, cur: 'JPY', unit: 'person', est: true }, note: '入湯手形價格待確認' },
    { id: 'd09-07', date: '2027-02-09', start: '16:00', dur: 60, cat: 'stay', name: '旅館 やまの湯 入住', addr: '熊本県阿蘇郡南小国町満願寺6601-4', lat: 33.0795, lng: 131.1395, cost: { amt: 91800, cur: 'JPY', unit: 'group' }, locked: true, note: '川側和室 14 畳、1 泊 2 食；住宿 ¥91,200＋入湯稅 ¥600，現地付款。電話 0967-44-0017。停車、寄放行李待旅館回覆。' },
    { id: 'd09-08', date: '2027-02-09', start: '18:00', dur: 120, cat: 'food', name: '旅館懷石晚餐', lat: 33.0795, lng: 131.1395, note: '含在住宿；希望囲炉裏会席' },

    // ── 2/10 ────────────────────────────
    { id: 'd10-01', date: '2027-02-10', start: '07:00', dur: 60, cat: 'spot', name: '早晨泡湯', lat: 33.0795, lng: 131.1395 },
    { id: 'd10-02', date: '2027-02-10', start: '08:00', dur: 60, cat: 'food', name: '旅館早餐', note: '含在住宿' },
    { id: 'd10-03', date: '2027-02-10', start: '10:00', dur: 50, cat: 'spot', name: '退房 → 溫泉街散步', lat: 33.0810, lng: 131.1430 },
    { id: 'd10-04', date: '2027-02-10', start: '10:55', dur: 20, cat: 'move', mode: 'car', name: '自駕 黑川 → 鍋ヶ滝', from: '黑川溫泉', to: '鍋ヶ滝', segs: [['car', 20]] },
    { id: 'd10-05', date: '2027-02-10', start: '11:15', dur: 45, cat: 'spot', name: '鍋ヶ滝', lat: 33.1036, lng: 131.1340, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd10-06', date: '2027-02-10', start: '12:05', dur: 15, cat: 'move', mode: 'car', name: '自駕 鍋ヶ滝 → 小國', from: '鍋ヶ滝', to: '小國', segs: [['car', 15]] },
    { id: 'd10-07', date: '2027-02-10', start: '12:20', dur: 55, cat: 'food', name: '小國～阿蘇午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' }, note: '燒肉正週三公休' },
    { id: 'd10-08', date: '2027-02-10', start: '13:15', dur: 30, cat: 'move', mode: 'car', name: '自駕 → 大觀峰', from: '小國', to: '大觀峰', segs: [['car', 30]] },
    { id: 'd10-09', date: '2027-02-10', start: '13:45', dur: 40, cat: 'spot', name: '大觀峰', lat: 33.0076, lng: 131.0757, status: 'optional', note: '一天最暖的時段過最高點，看天氣可取消' },
    { id: 'd10-10', date: '2027-02-10', start: '14:30', dur: 30, cat: 'move', mode: 'car', name: '自駕 大觀峰 → 阿蘇神社', from: '大觀峰', to: '阿蘇神社', segs: [['car', 30]] },
    { id: 'd10-11', date: '2027-02-10', start: '15:00', dur: 55, cat: 'spot', name: '阿蘇神社＋門前町', lat: 32.9455, lng: 131.1170, note: '順便買晚餐、早餐' },
    { id: 'd10-12', date: '2027-02-10', start: '16:00', dur: 60, cat: 'stay', name: '奥阿蘇のあかまつ 入住', addr: '熊本県阿蘇市一宮町酒梨832-1', lat: 32.9560, lng: 131.1290, cost: { amt: null, cur: 'JPY', unit: 'group' }, locked: true, note: 'Airbnb，入住 16:00–18:00、退房 10:00；自助入住，需事先填旅人名單＋上傳護照。' },
    { id: 'd10-13', date: '2027-02-10', start: '18:30', dur: 90, cat: 'food', name: '住宿附近晚餐', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/11 日本假日 ───────────────────
    { id: 'd11-01', date: '2027-02-11', start: '10:00', dur: 40, cat: 'move', mode: 'car', name: '退房 → 自駕到草千里', from: '奥阿蘇のあかまつ', to: '草千里', segs: [['car', 40]] },
    { id: 'd11-02', date: '2027-02-11', start: '10:40', dur: 120, cat: 'spot', name: '草千里、阿蘇火山博物館', lat: 32.8848, lng: 131.0610, cost: { amt: 1100, cur: 'JPY', unit: 'person', est: true }, note: '中岳火口可取消（噴火警戒等級 2）' },
    { id: 'd11-03', date: '2027-02-11', start: '12:45', dur: 30, cat: 'move', mode: 'car', name: '自駕 → 南阿蘇～高森', from: '草千里', to: '高森', segs: [['car', 30]] },
    { id: 'd11-04', date: '2027-02-11', start: '13:15', dur: 60, cat: 'food', name: '南阿蘇～高森午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd11-05', date: '2027-02-11', start: '14:20', dur: 15, cat: 'move', mode: 'car', name: '自駕 → 上色見熊野座神社', from: '高森', to: '上色見熊野座神社', segs: [['car', 15]] },
    { id: 'd11-06', date: '2027-02-11', start: '14:35', dur: 50, cat: 'spot', name: '上色見熊野座神社', lat: 32.8167, lng: 131.1823 },
    { id: 'd11-07', date: '2027-02-11', start: '15:30', dur: 60, cat: 'move', mode: 'car', name: '自駕 國道 325 號高森峠 → 高千穗', from: '上色見', to: '高千穗', segs: [['car', 60]], note: '下午最暖時通過高森峠；16:30 前到' },
    { id: 'd11-08', date: '2027-02-11', start: '16:35', dur: 30, cat: 'spot', name: '高千穗神社', lat: 32.7108, lng: 131.3075 },
    { id: 'd11-09', date: '2027-02-11', start: '17:10', dur: 40, cat: 'stay', name: '高千穗住宿 入住（待訂）', lat: 32.7115, lng: 131.3090, cost: { amt: null, cur: 'JPY', unit: 'group' }, status: 'confirm', note: '要可免費取消、走路能到高千穗神社' },
    { id: 'd11-10', date: '2027-02-11', start: '18:00', dur: 80, cat: 'food', name: '晚餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd11-11', date: '2027-02-11', start: '20:00', dur: 60, cat: 'spot', name: '高千穗夜神樂', lat: 32.7108, lng: 131.3075, cost: { amt: null, cur: 'JPY', unit: 'person' }, locked: true },

    // ── 2/12 ────────────────────────────
    { id: 'd12-01', date: '2027-02-12', start: '08:40', dur: 10, cat: 'move', mode: 'car', name: '自駕 → 高千穗峽', from: '高千穗住宿', to: '高千穗峽', segs: [['car', 10]] },
    { id: 'd12-02', date: '2027-02-12', start: '09:00', dur: 90, cat: 'spot', name: '高千穗峽划船＋真名井瀑布', lat: 32.7020, lng: 131.3010, cost: { amt: null, cur: 'JPY', unit: 'group' }, locked: true, note: '1/29 台灣時間 08:00 開搶；船資以艘計' },
    { id: 'd12-03', date: '2027-02-12', start: '10:40', dur: 15, cat: 'move', mode: 'car', name: '自駕 → 天岩戶神社', from: '高千穗峽', to: '天岩戶神社', segs: [['car', 15]] },
    { id: 'd12-04', date: '2027-02-12', start: '10:55', dur: 60, cat: 'spot', name: '天岩戶神社、天安河原', lat: 32.7275, lng: 131.3290, status: 'optional', note: '可取消' },
    { id: 'd12-05', date: '2027-02-12', start: '12:00', dur: 55, cat: 'food', name: '高千穗午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd12-06', date: '2027-02-12', start: '13:00', dur: 165, cat: 'move', mode: 'car', name: '自駕 高千穗 → 熊本', from: '高千穗', to: '熊本市區', segs: [['car', 165]], note: '2.5～3 小時，白天開' },
    { id: 'd12-07', date: '2027-02-12', start: '15:50', dur: 25, cat: 'stay', name: '熊本住宿 放行李（待訂）', lat: 32.8012, lng: 130.7072, cost: { amt: null, cur: 'JPY', unit: 'group' }, status: 'confirm', note: '3 晚（2/12～2/15）' },
    { id: 'd12-08', date: '2027-02-12', start: '16:15', dur: 15, cat: 'move', mode: 'car', name: '自駕 → 還車', from: '熊本住宿', to: '租車公司', segs: [['car', 15]] },
    { id: 'd12-09', date: '2027-02-12', start: '16:30', dur: 15, cat: 'move', mode: 'car', name: '熊本 還車', from: '租車公司', to: '租車公司', segs: [['car', 15]], lat: 32.7900, lng: 130.6890, locked: true },
    { id: 'd12-10', date: '2027-02-12', start: '18:30', dur: 90, cat: 'food', name: '熊本晚餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/13 ────────────────────────────
    { id: 'd13-01', date: '2027-02-13', start: '09:30', dur: 15, cat: 'move', mode: 'tram', name: '市電 → 熊本城', from: '熊本住宿', to: '熊本城・市役所前', segs: [['tram', 10], ['walk', 5]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd13-02', date: '2027-02-13', start: '09:45', dur: 150, cat: 'spot', name: '熊本城', lat: 32.8063, lng: 130.7058, cost: { amt: 800, cur: 'JPY', unit: 'person', est: true }, note: '小天守入口附近有限制' },
    { id: 'd13-03', date: '2027-02-13', start: '12:15', dur: 15, cat: 'move', mode: 'walk', name: '步行到勝烈亭', from: '熊本城', to: '勝烈亭', segs: [['walk', 15]] },
    { id: 'd13-04', date: '2027-02-13', start: '12:30', dur: 75, cat: 'food', name: '勝烈亭 午餐', lat: 32.8010, lng: 130.7062, cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd13-05', date: '2027-02-13', start: '14:00', dur: 60, cat: 'spot', name: '櫻之馬場 城彩苑', lat: 32.8040, lng: 130.7037 },
    { id: 'd13-06', date: '2027-02-13', start: '15:10', dur: 20, cat: 'move', mode: 'tram', name: '市電 → 水前寺公園', from: '城彩苑', to: '水前寺公園', segs: [['walk', 5], ['tram', 15]], cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'optional' },
    { id: 'd13-07', date: '2027-02-13', start: '15:35', dur: 75, cat: 'spot', name: '水前寺成趣園', lat: 32.7905, lng: 130.7350, cost: { amt: 500, cur: 'JPY', unit: 'person', est: true }, status: 'optional', note: '可取消' },
    { id: 'd13-08', date: '2027-02-13', start: '17:00', dur: 25, cat: 'move', mode: 'tram', name: '市電 回市區', from: '水前寺公園', to: '熊本市區', segs: [['tram', 20], ['walk', 5]], cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd13-09', date: '2027-02-13', start: '18:30', dur: 60, cat: 'food', name: '黑亭拉麵', lat: 32.7905, lng: 130.6960, cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/14 ────────────────────────────
    { id: 'd14-01', date: '2027-02-14', start: '10:00', dur: 150, cat: 'spot', name: '上通／下通 採購', lat: 32.8030, lng: 130.7105 },
    { id: 'd14-02', date: '2027-02-14', start: '12:30', dur: 60, cat: 'food', name: '午餐（待選）', cost: { amt: null, cur: 'JPY', unit: 'person' } },
    { id: 'd14-03', date: '2027-02-14', start: '13:40', dur: 200, cat: 'spot', name: 'SAKURA MACHI Kumamoto 採購', lat: 32.8000, lng: 130.7040 },
    { id: 'd14-04', date: '2027-02-14', start: '18:30', dur: 120, cat: 'food', name: '馬肉酒場 三村', lat: 32.8022, lng: 130.7095, cost: { amt: null, cur: 'JPY', unit: 'person' } },

    // ── 2/15 ────────────────────────────
    { id: 'd15-01', date: '2027-02-15', start: '07:50', dur: 15, cat: 'stay', name: '熊本住宿 退房', lat: 32.8012, lng: 130.7072 },
    { id: 'd15-02', date: '2027-02-15', start: '08:10', dur: 60, cat: 'move', mode: 'bus', name: '機場巴士 熊本市區 → 熊本機場', from: '熊本市區', to: '熊本機場', segs: [['walk', 5], ['bus', 55]], cost: { amt: null, cur: 'JPY', unit: 'person' }, status: 'confirm' },
    { id: 'd15-03', date: '2027-02-15', start: '09:15', dur: 140, cat: 'spot', name: '熊本機場 報到、吃飯、買伴手禮', lat: 32.8373, lng: 130.8551, locked: true, note: '起飛前 2.5 小時到；安檢後先左轉國內線吃飯、買伴手禮' },
    { id: 'd15-04', date: '2027-02-15', start: '11:45', dur: 160, cat: 'move', mode: 'flight', name: '星宇 JX847 熊本 → 桃園', from: '熊本機場', to: '桃園機場', segs: [['flight', 160]], lat: 32.8373, lng: 130.8551, cost: { amt: null, cur: 'TWD', unit: 'person' }, locked: true, note: '台灣時間 13:25 抵達' }
  ],
  backups: [
    {
      name: '極端天氣・不自駕',
      when: '2/8 晚看預報：2/9～2/11 阿蘇、黑川一帶大雪或道路封閉才啟用。已取車才變天：不上山，走國道 57 號平地提早回熊本還車。',
      days: [
        { date: '2027-02-09', plan: '九州橫斷巴士 別府 → 黑川（需預約）；九重夢大吊橋取消；黑川溫泉街、入湯手形；住やまの湯（不變）' },
        { date: '2027-02-10', plan: '黑川早晨泡湯 → 九州橫斷巴士到阿蘇駅前 → JR 豐肥本線到宮地 → 阿蘇神社＋門前町 → 入住奥阿蘇のあかまつ；鍋ヶ滝、大觀峰取消' },
        { date: '2027-02-11', plan: '上午 JR 宮地 → 熊本（約 1 小時 15 分）；下午熊本城、櫻之馬場城彩苑、勝烈亭；草千里、上色見、高千穗取消；熊本多住一晚' },
        { date: '2027-02-12', plan: '水前寺成趣園、上通／下通（天氣好轉也不臨時租車上山）' },
        { date: '2027-02-13', plan: '彈性日，補 2/11 沒去完的' },
        { date: '2027-02-14', plan: '整天採購（不變）' }
      ],
      prepare: '高千穗旅館一定訂可免費取消；熊本 2/11 另訂一晚可免費取消的房；租車問清楚取消、提早還車規定。'
    }
  ],
  packing: [
    { id: 'p1', name: '證件與錢', items: [
      { id: 'p1a', name: '護照', qty: 4, note: '效期確認', done: false },
      { id: 'p1b', name: '台灣駕照＋日文譯本', qty: 1, note: '自駕必帶', done: false },
      { id: 'p1c', name: '日圓現金', qty: 1, note: '', done: false },
      { id: 'p1d', name: '信用卡', qty: 2, note: '', done: false },
      { id: 'p1e', name: '機票、住宿確認信', qty: 1, note: '手機離線存一份', done: false }
    ] },
    { id: 'p2', name: '冬季衣物', items: [
      { id: 'p2a', name: '羽絨外套', qty: 1, note: '阿蘇、高千穗山區很冷', done: false },
      { id: 'p2b', name: '發熱衣褲', qty: 3, note: '', done: false },
      { id: 'p2c', name: '手套、毛帽、圍巾', qty: 1, note: '', done: false },
      { id: 'p2d', name: '防滑好走的鞋', qty: 1, note: '', done: false }
    ] },
    { id: 'p3', name: '盥洗與溫泉', items: [
      { id: 'p3a', name: '盥洗包', qty: 1, note: '', done: false },
      { id: 'p3b', name: '溫泉小毛巾', qty: 2, note: '', done: false },
      { id: 'p3c', name: '保濕乳液', qty: 1, note: '泡湯後很乾', done: false }
    ] },
    { id: 'p4', name: '電子產品', items: [
      { id: 'p4a', name: '網卡／eSIM', qty: 1, note: '', done: false },
      { id: 'p4b', name: '行動電源', qty: 1, note: '只能手提', done: false },
      { id: 'p4c', name: '充電線、充電頭', qty: 1, note: '', done: false },
      { id: 'p4d', name: '車用手機架', qty: 1, note: '自駕導航用', done: false }
    ] },
    { id: 'p5', name: '藥品與保健', items: [
      { id: 'p5a', name: '個人常備藥', qty: 1, note: '', done: false },
      { id: 'p5b', name: '暖暖包', qty: 10, note: '', done: false },
      { id: 'p5c', name: '暈車藥', qty: 1, note: '山路彎道多', done: false }
    ] },
    { id: 'p6', name: '購物與其他', items: [
      { id: 'p6a', name: '折疊購物袋', qty: 2, note: '', done: false },
      { id: 'p6b', name: '行李秤', qty: 1, note: '虎航託運 20kg', done: false },
      { id: 'p6c', name: '零錢包', qty: 1, note: '市電、巴士用', done: false }
    ] }
  ]
};
