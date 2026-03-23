import * as XLSX from "xlsx";

export function ddParse(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const groups = {};
  
  data.forEach(row => {
    const customer = String(row['客户名称'] || '').trim();
    const product = String(row['计价品种'] || '').trim();
    const account = String(row['账户'] || '').trim();
    const orderType = String(row['订单类型'] || '').trim();
    const brand = String(row['计价品牌'] || '').trim();
    const subtotal = row['小计'];
    const qty = row['数量'];
    
    // 过滤空值
    if (!customer || !product || !account || subtotal === undefined || subtotal === '' || !qty || qty == 0) {
      return;
    }

    // 过滤规则：订单类型为“暗”以及计价品牌为“加工费”的数据不在统计之列
    if (orderType === '暗' || brand === '加工费') {
      return;
    }
    
    const key = `${customer}|${product}`;
    if (!groups[key]) {
      groups[key] = { accounts: new Set(), prices: new Set() };
    }
    
    groups[key].accounts.add(account);
    
    // 计算单价，保留一定精度避免浮点误差
    const unitPrice = Number((subtotal / qty).toFixed(6));
    groups[key].prices.add(unitPrice);
  });
  
  const rule1Errors = new Set();
  const rule2Errors = [];
  
  for (const [key, val] of Object.entries(groups)) {
    const [customer, product] = key.split('|');
    
    if (val.accounts.size > 1) {
      rule1Errors.add(customer);
    }
    if (val.prices.size > 1) {
      rule2Errors.push({ "客户名称": customer, "计价品种": product });
    }
  }
  
  return {
    rule1Errors: Array.from(rule1Errors).map(c => ({ "客户名称": c })),
    rule2Errors
  };
}
