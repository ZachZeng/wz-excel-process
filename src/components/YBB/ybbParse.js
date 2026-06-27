import * as XLSX from "xlsx";

// Excel serial date for the 1st of a given year/month
function getD2Serial(year, month) {
  const d = new Date(year, month - 1, 1);
  const epoch = new Date(1899, 11, 30);
  return Math.round((d - epoch) / (1000 * 60 * 60 * 24));
}

// "YYYY/MM/26-YYYY/MM/25" report period string
function getReportDateStr(year, month) {
  const startYear = month === 1 ? year - 1 : year;
  const startMonth = month === 1 ? 12 : month - 1;
  const p = (n) => String(n).padStart(2, "0");
  return `${startYear}/${p(startMonth)}/26-${year}/${p(month)}/25`;
}

function r4(n) {
  return Math.round(n * 10000) / 10000;
}

// ─── parse 基础数据.xlsx ───────────────────────────────────────────────────────
function parse基础数据(wb) {
  const aoa = (sheetName) =>
    XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null });

  // Brand map: 系统品牌 → 报表品牌
  const brandMapRows = aoa("品牌").slice(1);
  const brandMap = {};
  brandMapRows.forEach((row) => {
    if (row[0] && row[1]) brandMap[String(row[0]).trim()] = String(row[1]).trim();
  });

  // 销售汇总表: compute brand revenue/cost and 允真+OEM filtered subset
  const salesRows = aoa("销售汇总表").slice(1);
  const brandRevenue = {};
  const brandCost = {};
  let yzOEMRevenue = 0;
  let yzOEMCost = 0;

  salesRows.forEach((row) => {
    if (!row || row.length < 12) return;
    let 报表品牌 = row[0];
    const 原始品牌 = row[5] != null ? String(row[5]).trim() : "";
    const 销售员 = row[4] != null ? String(row[4]).trim() : "";
    const cost = typeof row[10] === "number" ? row[10] : 0;
    const revenue = typeof row[11] === "number" ? row[11] : 0;

    // Fall back to manual lookup if A column has a formula string
    if (typeof 报表品牌 !== "string" || 报表品牌.startsWith("=")) {
      报表品牌 = brandMap[原始品牌] || 原始品牌;
    }
    if (!报表品牌) return;
    报表品牌 = String(报表品牌).trim();

    brandRevenue[报表品牌] = (brandRevenue[报表品牌] || 0) + revenue;
    brandCost[报表品牌] = (brandCost[报表品牌] || 0) + cost;

    // 允真+OEM excluding 谢伟/谢毅 salespeople
    if (
      ["OEM", "允真"].includes(原始品牌) &&
      !["谢伟", "谢毅"].includes(销售员)
    ) {
      yzOEMRevenue += revenue;
      yzOEMCost += cost;
    }
  });

  // 费用表 (row index 1 = data row)
  const feeRows = aoa("费用表");
  const fd = feeRows[1] || [];
  const feeValues = {
    year: fd[0] || 0,
    month: fd[1] || 0,
    促销费: fd[2] || 0,
    差旅费: fd[3] || 0,
    房租水电: fd[4] || 0,
    通讯费: fd[5] || 0,
    工资奖金: fd[6] || 0,
    运费: fd[7] || 0, // 商品运保费
    社保费: fd[8] || 0,
    福利费: fd[9] || 0,
    交通费: fd[10] || 0,
    财务费用: fd[11] || 0,
    办公费: fd[12] || 0,
    招待费: fd[13] || 0,
    宣传资料: fd[14] || 0,
    培训费: fd[15] || 0,
    其它: fd[16] || 0,
    税金: fd[17] || 0,
  };
  // total = cols C:Q = 促销费 through 其它 (15 items)
  feeValues.total =
    feeValues.促销费 + feeValues.差旅费 + feeValues.房租水电 +
    feeValues.通讯费 + feeValues.工资奖金 + feeValues.运费 +
    feeValues.社保费 + feeValues.福利费 + feeValues.交通费 +
    feeValues.财务费用 + feeValues.办公费 + feeValues.招待费 +
    feeValues.宣传资料 + feeValues.培训费 + feeValues.其它;

  // 铺底
  const 铺底Rows = aoa("铺底").slice(1);
  const 铺底Data = 铺底Rows
    .filter((r) => r[2] && r[4])
    .map((r) => ({
      customer: String(r[2]).trim(),
      brand: String(r[4]).trim(),
      amount: typeof r[5] === "number" ? r[5] : 0,
    }));

  // 成本调整
  const 成本调整Rows = aoa("成本调整").slice(1);
  const 成本调整Data = 成本调整Rows
    .filter((r) => r[0] != null && r[1])
    .map((r) => ({
      serial: typeof r[0] === "number" ? r[0] : null, // Excel date serial
      brand: String(r[1]).trim(),
      item: String(r[2] || "").trim(),
      desc: String(r[3] || "").trim(),
      amount: typeof r[4] === "number" ? r[4] : 0,
    }));

  const D2 = getD2Serial(feeValues.year, feeValues.month);

  return {
    brandRevenue,
    brandCost,
    yzOEMRevenue,
    yzOEMCost,
    feeValues,
    铺底Data,
    成本调整Data,
    D2,
  };
}

// ─── parse 上月/上年 报表.xls ──────────────────────────────────────────────────
function parse历史报表(wb) {
  const aoa = (sheetName) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });
  };

  const num = (v) => (typeof v === "number" ? v : 0);

  // 总表: B col (index 1) and E col (index 4), rows 4-48 (0-indexed 3-47)
  const 总表AOA = aoa("总表");
  const 总表B = [];
  const 总表E = [];
  for (let i = 3; i <= 47; i++) {
    const row = 总表AOA[i] || [];
    总表B.push(num(row[1]));
    总表E.push(num(row[4]));
  }

  // 费用明细: B-Q cols (indices 1-16) from row 3 (0-indexed 2) and row 8 (0-indexed 7)
  const 费用明细AOA = aoa("费用明细");
  const fee3 = 费用明细AOA[2] || [];
  const fee8 = 费用明细AOA[7] || [];
  const 费用明细B3 = Array.from({ length: 16 }, (_, i) => num(fee3[i + 1]));
  const 费用明细B8 = Array.from({ length: 16 }, (_, i) => num(fee8[i + 1]));

  // 允真: B col (index 1) and E col (index 4), rows 4-12 (0-indexed 3-11)
  const 允真AOA = aoa("允真");
  const 允真B = [];
  const 允真E = [];
  for (let i = 3; i <= 11; i++) {
    const row = 允真AOA[i] || [];
    允真B.push(num(row[1]));
    允真E.push(num(row[4]));
  }

  return { 总表B, 总表E, 费用明细B3, 费用明细B8, 允真B, 允真E };
}

// ─── calculate 铺底 pivot ──────────────────────────────────────────────────────
// returns { [customer]: { [brand]: amount } }
function calc铺底Pivot(铺底Data) {
  const pivot = {};
  铺底Data.forEach(({ customer, brand, amount }) => {
    if (!pivot[customer]) pivot[customer] = {};
    pivot[customer][brand] = (pivot[customer][brand] || 0) + amount;
  });
  return pivot;
}

// ─── calculate 总表 B column (45 values for rows 4-48) ────────────────────────
function calc总表B(brandRevenue, brandCost, feeValues, manualInputs, 成本调整Data, D2) {
  const rev = (k) => brandRevenue[k] || 0;
  const cst = (k) => brandCost[k] || 0;

  // Current-month cost adjustments (date == D2)
  const adjMap = {};
  成本调整Data.forEach(({ serial, brand, amount }) => {
    if (serial === D2) {
      adjMap[brand] = (adjMap[brand] || 0) + amount;
    }
  });
  const adj = (k) => adjMap[k] || 0;

  // Revenue (rows 4-16)
  const B6 = rev("依视路");
  const B7 = rev("星趣控");
  const B8 = rev("碧碧及亚");
  const B9 = rev("允真");
  const B10 = rev("OEM");
  const B11 = rev("其他镜片");
  const B5 = B6 + B7 + B8 + B9 + B10 + B11;
  const B12 = rev("镜架");
  const B14 = rev("康复仪");
  const B15 = rev("加工费");
  const B16 = rev("其它");
  const B13 = B14 + B15 + B16;
  const B4 = B5 + B12 + B13;

  // Cost (rows 17-29)
  const B19 = cst("依视路") + adj("依视路");
  const B20 = cst("星趣控") + adj("星趣控");
  const B21 = cst("碧碧及亚") + adj("碧碧及亚");
  const B22 = cst("允真") + adj("允真");
  const B23 = cst("OEM") + adj("OEM");
  const B24 = cst("其他镜片") + adj("其他镜片");
  const B18 = B19 + B20 + B21 + B22 + B23 + B24;
  const B25 = cst("镜架") + adj("镜架");
  const B27 = cst("康复仪") + adj("康复仪");
  const B28 = cst("加工费") + adj("加工费"); // 代加工
  const B29 = cst("其它") + adj("其它");
  const B26 = B27 + B28 + B29;
  const B17 = B18 + B25 + B26;

  // Profit (rows 30-42)
  const B32 = B6 - B19;
  const B33 = B7 - B20;
  const B34 = B8 - B21;
  const B35 = B9 - B22;
  const B36 = B10 - B23;
  const B37 = B11 - B24;
  const B31 = B32 + B33 + B34 + B35 + B36 + B37;
  const B38 = B12 - B25;
  const B40 = B14 - B27;
  const B41 = B15 - B28;
  const B42 = B16 - B29;
  const B39 = B40 + B41 + B42;
  const B30 = B31 + B38 + B39;

  // Expenses + profit (rows 43-48)
  const B43 = feeValues.total;
  const B44 = feeValues.税金;
  const B45 = B30 - B43 - B44;

  // 营业外 from manual inputs (rows 46-47)
  const 营外 = manualInputs.营业外 || [];
  const B46 = 营外.reduce((s, item) => s + (item.收入 || 0), 0);
  const B47 = 营外.reduce((s, item) => s + (item.支出 || 0), 0);
  const B48 = B45 + B46 - B47;

  // 45 values, indices 0-44 → Excel rows 4-48
  return [
    B4,  B5,  B6,  B7,  B8,  B9,  B10, B11, B12, B13, B14, B15, B16,
    B17, B18, B19, B20, B21, B22, B23, B24, B25, B26, B27, B28, B29,
    B30, B31, B32, B33, B34, B35, B36, B37, B38, B39, B40, B41, B42,
    B43, B44, B45, B46, B47, B48,
  ];
}

// ─── calculate 允真 B column + fee sub-table ───────────────────────────────────
function calc允真(yzOEMRevenue, yzOEMCost, feeValues, manualInputs, 总表B) {
  const totalRevenue = 总表B[0]; // 总表 B4
  const B34 = totalRevenue !== 0 ? r4(yzOEMRevenue / totalRevenue) : 0;

  // Fee sub-table (rows 36-50 in 允真 sheet, 15 expense types)
  const 促销B = manualInputs.yzOEM促销费 || 0;
  const 工资B = manualInputs.yzOEM工资奖金 || 0;
  const 社保B = 642.46;

  const feeRows = [
    { name: "促销费",   B: 促销B,  C: 0,                               },
    { name: "差旅费",   B: 0,      C: feeValues.差旅费,                 },
    { name: "水电物管", B: 0,      C: feeValues.房租水电,               },
    { name: "通讯费",   B: 0,      C: feeValues.通讯费,                 },
    { name: "工资奖金", B: 工资B,  C: feeValues.工资奖金 - 工资B,      },
    { name: "商品运保费", B: 0,    C: feeValues.运费,                   },
    { name: "社保费",   B: 社保B,  C: feeValues.社保费 - 社保B,        },
    { name: "福利费",   B: 0,      C: feeValues.福利费,                 },
    { name: "交通费",   B: 0,      C: feeValues.交通费,                 },
    { name: "财务费用", B: 0,      C: feeValues.财务费用,               },
    { name: "办公费",   B: 0,      C: feeValues.办公费,                 },
    { name: "招待费",   B: 0,      C: feeValues.招待费,                 },
    { name: "宣传资料", B: 0,      C: feeValues.宣传资料,               },
    { name: "培训费",   B: 0,      C: feeValues.培训费,                 },
    { name: "其它",     B: 0,      C: feeValues.其它,                   },
  ];
  feeRows.forEach((row) => {
    row.D = row.B + row.C * B34;
  });
  const feeTotalB = feeRows.reduce((s, r) => s + r.B, 0);
  const feeTotalC = feeRows.reduce((s, r) => s + r.C, 0);
  const feeTotalD = feeRows.reduce((s, r) => s + r.D, 0);

  // P&L (rows 4-12)
  const B44_总表 = 总表B[39]; // 总表 B44 (税金)
  const B46_总表 = 总表B[41]; // 总表 B46 (营业外收入)
  const B47_总表 = 总表B[42]; // 总表 B47 (营业外支出)

  const YZ4 = yzOEMRevenue;
  const YZ5 = yzOEMCost;
  const YZ6 = YZ4 - YZ5;
  const YZ7 = feeTotalD;
  const YZ8 = B44_总表 * B34;
  const YZ9 = YZ6 - YZ7 - YZ8;
  const YZ10 = B46_总表 * B34;
  const YZ11 = B47_总表 * B34;
  const YZ12 = YZ9 + YZ10 - YZ11;

  return {
    B: [YZ4, YZ5, YZ6, YZ7, YZ8, YZ9, YZ10, YZ11, YZ12], // 9 values for rows 4-12
    B34,
    feeRows,
    feeTotalB,
    feeTotalC,
    feeTotalD,
  };
}

// ─── build 总表 AOA ────────────────────────────────────────────────────────────
const 总表Labels = [
  "一、主营业务收入",
  "    1.镜片",
  "         依视路",
  "         星趣控",
  "         碧碧及亚",
  "         允真",
  "         OEM",
  "         其他镜片",
  "    2.镜架",
  "    3.其它项目",
  "        康复仪",
  "        加工费",
  "        其它",
  "　　减：主营业务成本",
  "    1.镜片",
  "         依视路",
  "         星趣控",
  "         碧碧及亚",
  "     允真",
  "         OEM",
  "         其他镜片",
  "    2.镜架",
  "    3.其它项目",
  "        康复仪",
  "        代加工",
  "        其它",
  "二、主营业务利润（亏损以\"-\"号填列）",
  "    1.镜片",
  "         依视路",
  "         星趣控",
  "         碧碧及亚",
  "     允真",
  "         OEM",
  "         其他镜片",
  "    2.镜架",
  "    3.其它项目",
  "        康复仪",
  "        代加工",
  "        其它",
  "　　减：  费用",
  "　　　　主营业务税金及附加　",
  "三、营业利润（亏损以\"-\"号填列）",
  "　　加: 营业外收入",
  "　　减：营业外支出",
  "四、利润总额（亏损总额以\"-\"号填列）",
];

function build总表AOA(B, C, D, E, 铺底Pivot, feeValues, manualInputs, D2, reportDateStr) {
  const rows = [];

  // Headers
  rows.push(["损益表", null, null, null, null, null, null]);
  rows.push(["编制单位: 四川新视域商贸有限公司", null, null, D2, "单位：元", null, null]);
  rows.push(["项　　目", "本月数", "上月数", "上年同期数", "本年累计数", null, null]);

  // P&L rows 4-48 (45 rows, index 0-44)
  for (let i = 0; i < 45; i++) {
    rows.push([总表Labels[i], B[i], C[i], D[i], E[i], null, null]);
  }

  // Notes section
  rows.push(["报表说明:", null, null, null, null, null, null]);
  rows.push(["1.报表日期:  " + reportDateStr, null, null, null, null, null, null]);
  rows.push(["2.退片已计入当期收入,促销计入费用.", null, null, null, null, null, null]);
  rows.push(["3.本月新增铺底已计入销售:", null, null, null, null, null, null]);

  // 铺底 header
  rows.push(["客户名称", "碧碧及亚", "依视路", "允真", "OEM", "镜架", "合计"]);

  // 铺底 data (up to 13 rows)
  const 铺底Brands = ["碧碧及亚", "依视路", "允真", "OEM", "镜架"];
  const customers = Object.keys(铺底Pivot);
  const 铺底DataRows = customers.map((cust) => {
    const amounts = 铺底Brands.map((b) => {
      const v = (铺底Pivot[cust] || {})[b];
      return v !== undefined ? v : null;
    });
    const total = amounts.reduce((s, v) => s + (v || 0), 0);
    return [cust, ...amounts, total];
  });
  while (铺底DataRows.length < 13) {
    铺底DataRows.push([null, null, null, null, null, null, 0]);
  }
  铺底DataRows.slice(0, 13).forEach((r) => rows.push(r));

  // 铺底 总计
  const 铺底总计 = 铺底Brands.map((b) =>
    customers.reduce((s, c) => s + ((铺底Pivot[c] || {})[b] || 0), 0)
  );
  const 铺底Grand = 铺底总计.reduce((s, v) => s + v, 0);
  rows.push(["合计", ...铺底总计, 铺底Grand]);

  // 营业外 section
  rows.push(["4.营业外收入:", null, null, null, null, null, null]);
  rows.push(["项目", "收入", "支出", "营业外利润", null, null, null]);

  const 营外 = manualInputs.营业外 || [];
  for (let i = 0; i < 4; i++) {
    const item = 营外[i] || {};
    const 收入 = item.收入 || null;
    const 支出 = item.支出 || null;
    const 利润 = (item.收入 || 0) - (item.支出 || 0);
    rows.push([item.项目 || null, 收入, 支出, 利润, null, null, null]);
  }
  const 营外总收入 = 营外.reduce((s, i) => s + (i.收入 || 0), 0);
  const 营外总支出 = 营外.reduce((s, i) => s + (i.支出 || 0), 0);
  rows.push(["合计", 营外总收入 || null, 营外总支出 || null, 营外总收入 - 营外总支出 || null, null, null, null]);
  rows.push([null]);

  return rows;
}

// ─── build 费用明细 AOA ────────────────────────────────────────────────────────
// 16 values per row: 促销费…其它, 合计
function build费用明细AOA(feeValues, 上月B3, 上年B3, 上月B8) {
  const thisMonth = [
    feeValues.促销费, feeValues.差旅费, feeValues.房租水电, feeValues.通讯费,
    feeValues.工资奖金, feeValues.运费, feeValues.社保费, feeValues.福利费,
    feeValues.交通费, feeValues.财务费用, feeValues.办公费, feeValues.招待费,
    feeValues.宣传资料, feeValues.培训费, feeValues.其它, feeValues.total,
  ];

  const pct = (curr, prev) => (prev !== 0 ? (curr - prev) / Math.abs(prev) : null);

  const 同比上月 = thisMonth.map((v, i) => pct(v, 上月B3[i]));
  const 同比上年 = thisMonth.map((v, i) => pct(v, 上年B3[i]));
  const 累计 = thisMonth.map((v, i) => v + (上月B8[i] || 0));

  const headers = [
    null, "促销费", "差旅费", "房租水电", "通讯费", "工资奖金", "商品运保费",
    "社保费", "福利费", "交通费", "财务费用", "办公费", "招待费", "宣传资料",
    "培训费", "其它", "合计", null,
  ];

  const rows = [];
  rows.push(["费用明细", ...Array(17).fill(null)]);
  rows.push(headers);
  rows.push(["本月数", ...thisMonth, null]);
  rows.push(["上月数", ...上月B3, null]);
  rows.push(["上年同期数", ...上年B3, null]);
  rows.push(["同比上月增减(%)", ...同比上月, null]);
  rows.push(["同比上年增减(%)", ...同比上年, null]);
  rows.push(["本年累计数", ...累计, null]);
  // Blank rows to maintain original spacing
  for (let i = 0; i < 13; i++) rows.push(Array(18).fill(null));

  return rows;
}

// ─── build 允真 AOA ────────────────────────────────────────────────────────────
const 允真PLLabels = [
  "一、主营业务收入",
  "　　减：主营业务成本",
  "二、主营业务利润（亏损以\"-\"号填列）",
  "　　减：  费用",
  "　　　　主营业务税金及附加　",
  "三、营业利润（亏损以\"-\"号填列）",
  "　　加: 营业外收入",
  "　　减：营业外支出",
  "四、利润总额（亏损总额以\"-\"号填列）",
];

function build允真AOA(yzData, C, D, E, 铺底Pivot, feeValues, D2, reportDateStr, totalRevenue) {
  const { B, B34, feeRows, feeTotalB, feeTotalC, feeTotalD } = yzData;
  const rows = [];

  // P&L section
  rows.push(["损益表(允真、OEM)", null, null, null, null]);
  rows.push(["编制单位: 四川新视域商贸公司", D2, "   单位：元", null, null]);
  rows.push(["项　　目", "本月数", "上月数", "上年同期数", "本年累计数"]);
  for (let i = 0; i < 9; i++) {
    rows.push([允真PLLabels[i], B[i], C[i], D[i], E[i]]);
  }

  // Notes
  rows.push(["报表说明:", null, null, null, null]);
  rows.push(["1.报表日期:  " + reportDateStr, null, null, null, null]);
  rows.push(["2.退片已计入当期收入,促销计入费用.", null, null, null, null]);
  rows.push(["3.本月新增铺底已计入销售:", null, null, null, null]);

  // 铺底 for 允真 + OEM
  rows.push(["客户名称", "允真", "OEM", "合计", null]);
  const yzCustomers = Object.keys(铺底Pivot).filter(
    (c) => (铺底Pivot[c]["允真"] || 0) !== 0 || (铺底Pivot[c]["OEM"] || 0) !== 0
  );
  const yz铺底Rows = yzCustomers.map((cust) => {
    const yzAmt = (铺底Pivot[cust]["允真"] || null);
    const oemAmt = (铺底Pivot[cust]["OEM"] || null);
    const total = (yzAmt || 0) + (oemAmt || 0);
    return [cust, yzAmt, oemAmt, total, null];
  });
  while (yz铺底Rows.length < 14) {
    yz铺底Rows.push([null, null, null, 0, null]);
  }
  yz铺底Rows.slice(0, 14).forEach((r) => rows.push(r));

  const yzTotal = yzCustomers.reduce((s, c) => s + ((铺底Pivot[c]["允真"] || 0)), 0);
  const oemTotal = yzCustomers.reduce((s, c) => s + ((铺底Pivot[c]["OEM"] || 0)), 0);
  rows.push(["合计", yzTotal || null, oemTotal || null, yzTotal + oemTotal, null]);

  // Fee allocation section
  rows.push(["4.费用（销售比例分摊除促销费.培训费.个人工资及个人社保外的其它办公杂费及税金.", null, null, null, null]);
  rows.push(["销售占比", B34, null, null, null]);
  rows.push(["项目", "允真/OEM", "分摊部分", "合计", null]);

  feeRows.forEach((r) => {
    rows.push([r.name, r.B || null, r.C || null, r.D || null, null]);
  });
  rows.push(["合计", feeTotalB || null, feeTotalC || null, feeTotalD || null, null]);

  rows.push([null]);
  rows.push(["备注：1.不含昆明亮度、贵阳百澳、亮睛维视、零售、周小麦、重庆区域等谢伟及谢毅客户。", null, null, null, null]);
  rows.push(["            2.朱百光的工资社保计入允真（含0EM)费用。", null, null, null, null]);

  return rows;
}

function excelSerialToDateStr(serial) {
  if (serial == null) return null;
  const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return `${d.getUTCFullYear()}/${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

// ─── build 调账 AOA ────────────────────────────────────────────────────────────
function build调账AOA(成本调整Data) {
  const rows = [];
  rows.push(["日期", "品牌", "项目", "摘要", "金额", null, null, null]);
  成本调整Data.forEach(({ serial, brand, item, desc, amount }) => {
    rows.push([excelSerialToDateStr(serial), brand, item, desc, amount, null, null, null]);
  });
  // Pad to 38 rows (original format)
  while (rows.length < 38) {
    rows.push(Array(8).fill(null));
  }
  const total = 成本调整Data.reduce((s, r) => s + r.amount, 0);
  rows.push(["合计", null, null, null, total, null, null, null]);
  return rows;
}

// ─── main export ──────────────────────────────────────────────────────────────
export function ybbParse(基础数据WB, 上月WB, 上年WB, manualInputs) {
  const 基础 = parse基础数据(基础数据WB);
  const 上月 = parse历史报表(上月WB);
  const 上年 = parse历史报表(上年WB);

  const { brandRevenue, brandCost, yzOEMRevenue, yzOEMCost, feeValues, 铺底Data, 成本调整Data, D2 } = 基础;

  const 铺底Pivot = calc铺底Pivot(铺底Data);
  const 总表B = calc总表B(brandRevenue, brandCost, feeValues, manualInputs, 成本调整Data, D2);
  const 总表C = 上月.总表B;
  const 总表D = 上年.总表B;
  const 总表E = 总表B.map((v, i) => v + (上月.总表E[i] || 0));

  const yzData = calc允真(yzOEMRevenue, yzOEMCost, feeValues, manualInputs, 总表B);
  const 允真C = 上月.允真B;
  const 允真D = 上年.允真B;
  const 允真E = yzData.B.map((v, i) => v + (上月.允真E[i] || 0));

  const reportDateStr = getReportDateStr(feeValues.year, feeValues.month);

  return {
    总表: build总表AOA(总表B, 总表C, 总表D, 总表E, 铺底Pivot, feeValues, manualInputs, D2, reportDateStr),
    费用明细: build费用明细AOA(feeValues, 上月.费用明细B3, 上年.费用明细B3, 上月.费用明细B8),
    允真: build允真AOA(yzData, 允真C, 允真D, 允真E, 铺底Pivot, feeValues, D2, reportDateStr, 总表B[0]),
    调账: build调账AOA(成本调整Data),
    meta: { year: feeValues.year, month: feeValues.month },
  };
}
