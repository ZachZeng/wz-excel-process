import * as XLSX from "xlsx";

const ACCOUNTS = ["现金", "亮睛", "维宇"];

// 现金流量表 rows 4-24 in order
const CASHFLOW_CATS = [
  { cat: "收货款", section: "现金流入" },
  { cat: "其它应付款", section: null },
  { cat: "营业外收入", section: null },
  { cat: "付货款", section: "现金流出" },
  { cat: "促销费", section: null },
  { cat: "差旅费", section: null },
  { cat: "房租水电", section: null },
  { cat: "通讯费", section: null },
  { cat: "工资奖金", section: null },
  { cat: "运保费", section: null },
  { cat: "社保费", section: null },
  { cat: "福利费", section: null },
  { cat: "交通费", section: null },
  { cat: "财务费用", section: null },
  { cat: "办公费", section: null },
  { cat: "招待费", section: null },
  { cat: "宣传资料", section: null },
  { cat: "培训费", section: null },
  { cat: "税金", section: null },
  { cat: "备用金", section: null },
  { cat: "其它应收款", section: null },
];

// 费用表 expense columns C through O (13 cols)
const FEE_EXPENSE_COLS = [
  "差旅费", "房租水电", "通讯费", "工资奖金", "运保费", "社保费",
  "福利费", "交通费", "财务费用", "办公费", "招待费", "宣传资料", "培训费",
];

function parseMonthNum(s) {
  return s ? parseInt(s.replace("月", "")) || 0 : 0;
}

function parseYearNum(s) {
  return s ? parseInt(s.replace("年", "")) || 0 : 0;
}

function r2(v) {
  return Math.round((v || 0) * 100) / 100;
}

// Parse all three account sheets into monthly per-category totals
function parseAccounts(wb) {
  const allData = {}; // { acc: { "year|month": { 项目: { 借, 贷 } } } }
  const allYM = new Set();

  for (const acc of ACCOUNTS) {
    const ws = wb.Sheets[acc];
    if (!ws) { allData[acc] = {}; continue; }

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const monthly = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const 年份 = row[0], 月份 = row[1], 项目 = row[3];
      const 借 = row[5], 贷 = row[6];

      if (!年份 || !月份 || !项目) continue;

      const key = `${年份}|${月份}`;
      allYM.add(key);

      if (!monthly[key]) monthly[key] = {};
      if (!monthly[key][项目]) monthly[key][项目] = { 借: 0, 贷: 0 };

      if (typeof 借 === "number") monthly[key][项目]["借"] += 借;
      if (typeof 贷 === "number") monthly[key][项目]["贷"] += 贷;
    }

    allData[acc] = monthly;
  }

  return { allData, allYM: [...allYM] };
}

// Find the latest year and month across all accounts
function detectTarget(allYM) {
  const parsed = allYM.map((ym) => {
    const [y, m] = ym.split("|");
    return { year: parseYearNum(y), month: parseMonthNum(m), yearStr: y, monthStr: m };
  });
  parsed.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  const latest = parsed[parsed.length - 1];
  return { targetYear: latest.yearStr, targetMonth: latest.monthStr };
}

// Get the last 余 value before the first row of targetYear+targetMonth in each account
function getPrevBalance(wb, targetYear, targetMonth) {
  const prevBal = {};

  for (const acc of ACCOUNTS) {
    const ws = wb.Sheets[acc];
    if (!ws) { prevBal[acc] = 0; continue; }

    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    let lastBal = 0;
    let foundTarget = false;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const 年份 = row[0], 月份 = row[1], 余 = row[7];

      if (年份 === targetYear && 月份 === targetMonth && !foundTarget) {
        foundTarget = true;
        break;
      }

      if (typeof 余 === "number") {
        lastBal = 余;
      }
    }

    prevBal[acc] = r2(lastBal);
  }

  return prevBal;
}

function getAccVal(allData, acc, year, month, cat, type) {
  return allData[acc]?.[`${year}|${month}`]?.[cat]?.[type] || 0;
}

function build现金流量表(allData, prevBal, targetYear, targetMonth) {
  const aoa = [];

  // Row 1: section headers (A=年, B=月, D=现金, G=亮睛, J=维宇, M=合计)
  aoa.push(["年", "月", null, "现金", null, null, "亮睛", null, null, "维宇", null, null, "合计", null, null]);

  // Row 2: year/month + flow labels
  aoa.push([targetYear, targetMonth, "流入", "流出", "余", "流入", "流出", "余", "流入", "流出", "余", "流入", "流出", "余"]);

  // Row 3: 前期余额
  const E3 = prevBal["现金"] || 0;
  const H3 = prevBal["亮睛"] || 0;
  const K3 = prevBal["维宇"] || 0;
  const N3 = r2(E3 + H3 + K3);
  aoa.push(["前期余额", null, null, null, E3, null, null, H3, null, null, K3, null, null, N3]);

  let prevE = E3, prevH = H3, prevK = K3, prevN = N3;
  let sumC = 0, sumD = 0, sumF = 0, sumG = 0, sumI = 0, sumJ = 0;

  for (const { cat, section } of CASHFLOW_CATS) {
    const C = r2(getAccVal(allData, "现金", targetYear, targetMonth, cat, "借"));
    const D = r2(getAccVal(allData, "现金", targetYear, targetMonth, cat, "贷"));
    const F = r2(getAccVal(allData, "亮睛", targetYear, targetMonth, cat, "借"));
    const G = r2(getAccVal(allData, "亮睛", targetYear, targetMonth, cat, "贷"));
    const I = r2(getAccVal(allData, "维宇", targetYear, targetMonth, cat, "借"));
    const J = r2(getAccVal(allData, "维宇", targetYear, targetMonth, cat, "贷"));

    const E = r2(prevE + C - D);
    const H = r2(prevH + F - G);
    const K = r2(prevK + I - J);
    const L = r2(C + F + I);
    const M = r2(D + G + J);
    const N = r2(prevN + L - M);

    aoa.push([
      section || null, cat,
      C || null, D || null, E,
      F || null, G || null, H,
      I || null, J || null, K,
      L || null, M || null, N,
    ]);

    prevE = E; prevH = H; prevK = K; prevN = N;
    sumC += C; sumD += D; sumF += F; sumG += G; sumI += I; sumJ += J;
  }

  // 本期合计
  aoa.push([
    "本期合计", null,
    r2(sumC) || null, r2(sumD) || null, prevE,
    r2(sumF) || null, r2(sumG) || null, prevH,
    r2(sumI) || null, r2(sumJ) || null, prevK,
    r2(sumC + sumF + sumI) || null, r2(sumD + sumG + sumJ) || null, prevN,
  ]);

  return aoa;
}

function build费用表(allData, allYM, targetYear) {
  const aoa = [];

  // Header
  aoa.push(["年度", "月份", ...FEE_EXPENSE_COLS, "其它", "合计", "税金"]);

  for (let m = 1; m <= 12; m++) {
    const monthStr = `${m}月`;
    const key = `${targetYear}|${monthStr}`;
    const hasData = allYM.includes(key);

    if (!hasData) {
      aoa.push([targetYear, monthStr, ...Array(13).fill(null), null, null, null]);
      continue;
    }

    const fees = FEE_EXPENSE_COLS.map((cat) =>
      r2(
        (allData["现金"]?.[key]?.[cat]?.["贷"] || 0) +
        (allData["亮睛"]?.[key]?.[cat]?.["贷"] || 0) +
        (allData["维宇"]?.[key]?.[cat]?.["贷"] || 0)
      ) || null
    );

    const tax =
      r2(
        (allData["现金"]?.[key]?.["税金"]?.["贷"] || 0) +
        (allData["亮睛"]?.[key]?.["税金"]?.["贷"] || 0) +
        (allData["维宇"]?.[key]?.["税金"]?.["贷"] || 0)
      ) || null;

    // P = 其它 = 0 (not mapped to any 日记账 category)
    const other = null;

    const sum = r2(fees.reduce((acc, v) => acc + (v || 0), 0)) || null;

    aoa.push([targetYear, monthStr, ...fees, other, sum, tax]);
  }

  // 合计 row
  const totals = FEE_EXPENSE_COLS.map((cat) =>
    r2(
      [...Array(12)].reduce((acc, _, mi) => {
        const key = `${targetYear}|${mi + 1}月`;
        return acc +
          (allData["现金"]?.[key]?.[cat]?.["贷"] || 0) +
          (allData["亮睛"]?.[key]?.[cat]?.["贷"] || 0) +
          (allData["维宇"]?.[key]?.[cat]?.["贷"] || 0);
      }, 0)
    ) || null
  );

  const totalTax =
    r2(
      [...Array(12)].reduce((acc, _, mi) => {
        const key = `${targetYear}|${mi + 1}月`;
        return acc +
          (allData["现金"]?.[key]?.["税金"]?.["贷"] || 0) +
          (allData["亮睛"]?.[key]?.["税金"]?.["贷"] || 0) +
          (allData["维宇"]?.[key]?.["税金"]?.["贷"] || 0);
      }, 0)
    ) || null;

  const totalSum = r2(totals.reduce((a, b) => a + (b || 0), 0)) || null;

  aoa.push(["合计", null, ...totals, null, totalSum, totalTax]);

  return aoa;
}

export function fybParse(wb) {
  const { allData, allYM } = parseAccounts(wb);
  const { targetYear, targetMonth } = detectTarget(allYM);
  const prevBal = getPrevBalance(wb, targetYear, targetMonth);

  return {
    现金流量表: build现金流量表(allData, prevBal, targetYear, targetMonth),
    费用表: build费用表(allData, allYM, targetYear),
    meta: { targetYear, targetMonth },
  };
}
