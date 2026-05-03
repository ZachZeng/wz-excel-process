import * as XLSX from "xlsx";

export function smdParse(basePriceSheet, smdSalesSheet, orderDetailSheet) {
  // 1. 读取数据
  // 对于苏明达销售明细，我们需要保留原始表头和顺序
  // 使用 header: 1 可以获取二维数组，方便原样输出
  const smdAoa = XLSX.utils.sheet_to_json(smdSalesSheet, { header: 1, defval: '' });
  
  // 基础单价和订单明细可以使用对象数组方便处理
  const basePriceData = XLSX.utils.sheet_to_json(basePriceSheet, { defval: '' });
  const orderDetailData = XLSX.utils.sheet_to_json(orderDetailSheet, { defval: '' });

  // 2. 构建订单明细成本映射
  // 规则：
  // 1) 订单明细表格中“订单编号”列的后九位作为 key
  // 2) 累加“成本”列
  // 3) 过滤掉“计价品牌”列中“加工费”数据
  const orderCostMap = {};
  orderDetailData.forEach(row => {
    const orderNo = String(row['订单编号'] || '').trim().toLowerCase();
    const brand = String(row['计价品牌'] || '').trim();
    const cost = Number(row['成本']) || 0;
    
    if (!orderNo || brand === '加工费') return;
    
    // 提取后 9 位
    const orderNoSuffix = orderNo.slice(-9);
    
    if (!orderCostMap[orderNoSuffix]) {
      orderCostMap[orderNoSuffix] = 0;
    }
    orderCostMap[orderNoSuffix] += cost;
  });

  // 3. 构建基础单价映射
  // 规则：
  // 1) 基础单价表格中“鏡種名稱R”列作为 key
  // 2) 值为“结算单价”
  const basePriceMap = {};
  basePriceData.forEach(row => {
    const name = String(row['鏡種名稱R'] || '').trim();
    const price = Number(row['结算单价']);
    if (name && !isNaN(price)) {
      basePriceMap[name] = price;
    }
  });

  // 4. 遍历苏明达销售明细，追加两列
  // 找到表头行
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(smdAoa.length, 10); i++) {
    const rowStr = smdAoa[i].join('');
    if (rowStr.includes('客戶訂單號') && rowStr.includes('鏡種名稱R')) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error("无法在苏明达销售明细中找到表头（需包含'客戶訂單號'和'鏡種名稱R'）");
  }

  const headerRow = smdAoa[headerRowIdx];
  const customerOrderNoIdx = headerRow.indexOf('客戶訂單號');
  const mirrorNameIdx = headerRow.indexOf('鏡種名稱R');
  const totalQtyIdx = headerRow.indexOf('總數量');

  if (customerOrderNoIdx === -1 || mirrorNameIdx === -1 || totalQtyIdx === -1) {
    throw new Error("苏明达销售明细表头缺少必要列（客戶訂單號、鏡種名稱R、總數量）");
  }

  // 追加新表头
  headerRow.push('订单明细成本价', '基础单价取价');

  // 处理数据行
  for (let i = headerRowIdx + 1; i < smdAoa.length; i++) {
    const row = smdAoa[i];
    if (!row || row.length === 0 || row.join('').trim() === '') continue;

    // 补齐数组长度，防止越界
    while (row.length < headerRow.length - 2) {
      row.push('');
    }

    const customerOrderNo = String(row[customerOrderNoIdx] || '').trim().toLowerCase();
    const mirrorName = String(row[mirrorNameIdx] || '').trim();
    const totalQty = Number(row[totalQtyIdx]) || 0;

    // 计算订单明细成本价
    // 兼容可能本身就不够9位的情况，直接用 customerOrderNo 匹配
    let matchedCost = undefined;
    if (customerOrderNo) {
      const suffixToMatch = customerOrderNo.slice(-9);
      matchedCost = orderCostMap[suffixToMatch];
    }
    
    const costVal = matchedCost !== undefined ? matchedCost : '检查';
    row.push(costVal);

    // 计算基础单价取价
    const basePrice = basePriceMap[mirrorName];
    const priceVal = basePrice !== undefined ? totalQty * basePrice : '检查';
    row.push(priceVal);
  }

  return smdAoa;
}
