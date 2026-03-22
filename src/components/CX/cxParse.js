import * as XLSX from "xlsx";

// 寻找包含特定关键字的列索引和数据起始行
function getColIndex(aoa, keyword, exact = false) {
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
    const row = aoa[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const cellStr = String(row[j] || '').trim();
      if (exact) {
        if (cellStr === keyword) return { row: i, col: j };
      } else {
        if (cellStr.includes(keyword)) return { row: i, col: j };
      }
    }
  }
  return null;
}

export function cxReconcile(excludeSheet, arSheet, promoSheet) {
  const excludeAoa = XLSX.utils.sheet_to_json(excludeSheet, { header: 1, defval: '' });
  const arAoa = XLSX.utils.sheet_to_json(arSheet, { header: 1, defval: '' });
  const promoAoa = XLSX.utils.sheet_to_json(promoSheet, { header: 1, defval: '' });

  // 1. 解析排除名单
  const excludeSet = new Set();
  let excludeName = getColIndex(excludeAoa, '客户名', true) || getColIndex(excludeAoa, '客户名称', true);
  if (excludeName) {
    const excludeStartRow = excludeName.row + 1;
    for (let i = excludeStartRow; i < excludeAoa.length; i++) {
      const name = String(excludeAoa[i][excludeName.col] || '').trim();
      if (name) excludeSet.add(name);
    }
  }

  // 2. 解析应收账款月报
  const arByName = {};
  let arName = getColIndex(arAoa, '客户名称', true);
  let arType = getColIndex(arAoa, '账户类型', true);
  let arAmount = getColIndex(arAoa, '应收货款', true) || getColIndex(arAoa, '应收账款', true);
  
  // 如果没有精确匹配到应收金额，尝试在客户名称同一行模糊匹配“应收”
  if (!arAmount && arName) {
    const row = arAoa[arName.row];
    for (let j = 0; j < row.length; j++) {
      if (String(row[j]).includes('应收')) {
        arAmount = { row: arName.row, col: j };
        break;
      }
    }
  }

  if (!arName || !arType || !arAmount) {
    throw new Error("应收账款月报表头缺少必要列（客户名称、账户类型、应收账款/应收货款）");
  }

  const arStartRow = Math.max(arName.row, arType.row, arAmount.row) + 1;

  for (let i = arStartRow; i < arAoa.length; i++) {
    const row = arAoa[i];
    if (!row || !row.length) continue;
    const name = String(row[arName.col] || '').trim();
    const type = String(row[arType.col] || '').trim();
    const amountRaw = row[arAmount.col];
    
    if (!name || excludeSet.has(name)) continue;
    if (type.includes('预付款')) {
      const amount = parseFloat(amountRaw) || 0;
      arByName[name] = (arByName[name] || 0) + amount;
    }
  }

  // 3. 解析促销活动余额
  const promoByShort = {};
  let promoName = getColIndex(promoAoa, '客户简称', true);
  let promoAmount = getColIndex(promoAoa, '可用金额', true);

  if (!promoName || !promoAmount) {
    throw new Error("促销活动余额表头缺少必要列（客户简称、可用金额）");
  }

  const promoStartRow = Math.max(promoName.row, promoAmount.row) + 1;

  for (let i = promoStartRow; i < promoAoa.length; i++) {
    const row = promoAoa[i];
    if (!row || !row.length) continue;
    const name = String(row[promoName.col] || '').trim();
    const amountRaw = row[promoAmount.col];
    
    if (!name || excludeSet.has(name)) continue;
    const amount = parseFloat(amountRaw) || 0;
    if (amount >= 0) {
      promoByShort[name] = (promoByShort[name] || 0) + amount;
    }
  }

  // 4. 合并对比
  const allNames = new Set([...Object.keys(arByName), ...Object.keys(promoByShort)]);
  const resultNames = [];

  for (const name of allNames) {
    const arAmount = arByName[name] || 0;
    const promoAmount = promoByShort[name] || 0;
    const sum = arAmount + promoAmount;

    // 差额不为0才保留
    if (Math.abs(sum) > 1e-6) {
      resultNames.push(name);
    }
  }

  return resultNames;
}
