/* 原創線條幾何插圖：日期列 40×30、品牌 251×66
 * 線色 currentColor、線寬 1.75、斜接角；每張最多一個重點填色（f-a1 景點／f-a2 餐飲／f-a3 住宿／f-a4 交通／f-br 黃銅）
 */
(function () {
  const wrap = (body, label, vb = '0 0 40 30', sw = 1.75) =>
    `<svg viewBox="${vb}" class="illo" role="img" aria-label="${label}"><title>${label}</title>` +
    `<g fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linejoin="miter" stroke-linecap="square">${body}</g></svg>`;

  const planeBody =
    '<path class="f-a4" d="M5 15 L29 15 L35 13.5 L36.5 15.5 L33 17.5 L7 17.5 Z"/>' +
    '<path d="M15 15 L21 8 L24 8 L21.5 15"/><path d="M17 17.5 L22 22.5 L25 22.5 L23 17.5"/>' +
    '<path d="M7 15 L4 10.5 L7 10.5 L10.5 15"/>';

  const ICONS = {
    planeRail: {
      label: '飛機與新幹線',
      body: `<g transform="translate(5 -4) scale(.8)">${planeBody}</g>` +
        '<path d="M2 27 H24 Q33 27 37 23 L31 20.5 H2"/><path class="f-br" d="M2 23.5 H32 L33.5 24.5 H2 Z" stroke="none"/>'
    },
    plane: {
      label: '起飛的飛機',
      body: `<g transform="rotate(-14 20 15)">${planeBody}</g><path class="brass-s" d="M3 27 H12 M17 27 H24 M29 27 H33"/>`
    },
    tower: {
      label: '海邊的高塔',
      body: '<circle class="f-a1" cx="31" cy="21" r="4.5"/><path d="M17 27 L19 4 H21 L23 27"/>' +
        '<path d="M18.4 9 H21.6 V13 H18.4 Z"/><path d="M20 4 V1"/><path d="M18.7 18 H21.3 M18.2 23 H21.8"/>' +
        '<path class="brass-s" d="M2 27 H38"/>'
    },
    torii: {
      label: '鳥居與梅枝',
      body: '<path class="f-a2" d="M4 7 Q20 3 36 7 L35 9.5 Q20 6 5 9.5 Z"/><path d="M8 13 H32"/>' +
        '<path d="M11 8.5 V28 M29 8.5 V28"/><path d="M20 8 V13"/>' +
        '<path d="M1 18 L5 21 L4 25"/><circle cx="5" cy="21" r="1"/><circle cx="2.5" cy="24.5" r="1"/>'
    },
    train: {
      label: '觀光列車',
      body: '<path class="f-a4" d="M3 10 H32 Q37 10 37 15 V23 H3 Z"/>' +
        '<path d="M6 13.5 H11 V17.5 H6 Z M14 13.5 H19 V17.5 H14 Z M22 13.5 H27 V17.5 H22 Z M30 13.5 H34"/>' +
        '<path class="brass-s" d="M4 20.5 H36"/><circle cx="10" cy="25.5" r="2"/><circle cx="29" cy="25.5" r="2"/><path d="M1 28.5 H39"/>'
    },
    lake: {
      label: '湖面與晨霧',
      body: '<path d="M2 18 L11 8 L17 13 L24 6 L38 18"/><path class="f-a3" d="M4 21 H36 L32 26.5 H8 Z"/>' +
        '<path class="brass-s" d="M5 13.5 H8 M11 13.5 H14 M23 11 H26 M29 11 H33" />'
    },
    hell: {
      label: '冒蒸氣的溫泉池',
      body: '<path class="f-a3" d="M4 23 Q20 17 36 23 Q20 29 4 23 Z"/><path d="M1 26 L5 22 M35 22 L39 26"/>' +
        '<path d="M13 17 Q11 14 13 11 Q15 8 13 5 M20 16 Q18 13 20 10 Q22 7 20 4 M27 17 Q25 14 27 11 Q29 8 27 5"/>'
    },
    ropeway: {
      label: '纜車與山稜',
      body: '<path d="M1 29 L10 22 L16 25 L26 16 L39 26"/><path d="M2 4 L38 16"/><path d="M20 10 V13"/>' +
        '<path class="f-a1" d="M15 13 H25 L24 21 H16 Z"/><path d="M17 16 H23"/>'
    },
    bridge: {
      label: '山谷吊橋',
      body: '<path d="M8 5 V24 M32 5 V24"/><path d="M2 9 L8 5 Q20 21 32 5 L38 9"/>' +
        '<path d="M14 9.5 V17 M20 12.5 V17 M26 9.5 V17"/><path class="f-a4" d="M2 17 H38 V19.5 H2 Z"/>' +
        '<path d="M2 28 L10 24 M30 24 L38 28"/>'
    },
    waterfall: {
      label: '簾幕瀑布',
      body: '<path d="M3 6 H37"/><path class="f-a3" d="M12 6 H28 V22 H12 Z"/><path d="M16 9 V20 M20 9 V20 M24 9 V20"/>' +
        '<path d="M6 26 H34"/><path d="M9 22.5 L11 24.5 M31 22.5 L29 24.5"/>'
    },
    volcano: {
      label: '火山口與草原',
      body: '<path class="f-a1" d="M6 24 L15 9 H25 L34 24 Z"/><path d="M15 9 L18 11 H22 L25 9"/>' +
        '<path d="M19 6.5 Q16 4 19 1.5 M23 6.5 Q26 4 24 1"/><path d="M1 27 H39"/><path d="M4 24.5 L5 22.5 M36 24.5 L35 22.5"/>'
    },
    gorge: {
      label: '峽谷裡的小船',
      body: '<path d="M2 2 V28 H10 L12 18 L9 10 L11 2"/><path d="M38 2 V28 H30 L28 18 L31 10 L29 2"/>' +
        '<path class="brass-s" d="M28.5 6 V9 M28.5 12 V15"/><path class="f-a1" d="M15 20 H25 L23 23 H17 Z"/><path d="M12 25.5 H17 M21 25.5 H28"/>'
    },
    castle: {
      label: '城郭天守與石牆',
      body: '<path d="M5 28 L9 19 H31 L35 28 Z"/><path d="M11 24 H29"/><path d="M10 19 V15 H30 V19"/>' +
        '<path class="f-br" d="M7 15 L12 12 H28 L33 15 Z"/><path d="M13 12 V8 H27 V12"/>' +
        '<path d="M11 8 L15 5.5 H25 L29 8 Z"/><path d="M17 5.5 V3 H23 V5.5"/><path d="M15 3 L20 1 L25 3"/>'
    },
    bag: {
      label: '購物袋',
      body: '<path class="f-a2" d="M9 11 H31 L33 28 H7 Z"/><path d="M14 11 V8 Q14 4 20 4 Q26 4 26 8 V11"/><path d="M16 17 H24"/>'
    },
    stay: {
      label: '住宿',
      body: '<path d="M4 14 L20 4 L36 14"/><path class="f-a3" d="M8 13 V27 H32 V13"/><path d="M17 27 V20 H23 V27"/>'
    }
  };

  // 依當天行程挑主圖：有航班的日子畫飛機，其餘照辨識度優先序
  const RULES = [
    ['ropeway', /纜車/], ['gorge', /峽|划船/], ['volcano', /火山|草千里/], ['castle', /熊本城|天守/],
    ['hell', /地獄/], ['bridge', /吊橋/], ['waterfall', /滝|瀑布/], ['torii', /天滿宮|鳥居/],
    ['train', /由布院之森|觀光列車/], ['lake', /湖/], ['tower', /福岡塔|塔/], ['bag', /採購|購物/]
  ];

  function pickIcon(day, items) {
    if (day.icon && ICONS[day.icon]) return day.icon;
    const flights = items.filter(i => i.mode === 'flight');
    if (flights.length) return flights[0].from && /熊本機場/.test(flights[0].from) ? 'plane' : 'planeRail';
    const text = items.map(i => i.name).join('｜');
    for (const [k, re] of RULES) if (re.test(text)) return k;
    return 'stay';
  }

  function brand() {
    return `<svg viewBox="0 0 251 66" class="illo brand-svg" role="img" aria-label="熊本城、阿蘇火山、列車與溫泉"><title>九州</title>
<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square">
<g transform="translate(4 22) scale(1.3)" stroke-width="1.6">${ICONS.castle.body}</g>
<path class="f-a1" d="M64 60 L88 22 H104 L128 60 Z"/><path d="M88 22 L94 26 H98 L104 22"/>
<path d="M95 18 Q90 13 95 9 Q100 5 98 2"/>
<path d="M134 61 H218"/>
<g id="brandTrain"><path class="f-a4" d="M140 34 H204 Q212 34 212 42 V54 H140 Z"/>
<path d="M146 39 H156 V46 H146 Z M162 39 H172 V46 H162 Z M178 39 H188 V46 H178 Z M194 39 H202"/>
<path class="brass-s" d="M141 50.5 H211"/><circle cx="152" cy="57" r="3"/><circle cx="172" cy="57" r="3"/><circle cx="196" cy="57" r="3"/></g>
<path class="f-a3" d="M220 61 Q233 55 247 61 Z"/>
<path d="M227 52 Q223 45 228 39 Q233 33 229 26 M239 52 Q235 45 240 39 Q245 33 241 26"/>
<path class="brass-s" d="M2 64 H249"/></g></svg>`;
  }

  window.ILLO = {
    ICONS,
    pickIcon,
    svg: key => wrap(ICONS[key].body, ICONS[key].label),
    label: key => ICONS[key].label,
    brand
  };
})();
