import * as XLSX from "xlsx";

function round2(num) {
  return Math.round(num * 100) / 100;
}

export function moParse(wb) {
  const customers = new Set();
  const dataMap = {}; // { [customerName]: { 销售: 0, 退货: 0, ... } }

  function initCustomer(name) {
    if (!name) return;
    customers.add(name);
    if (!dataMap[name]) {
      dataMap[name] = {
        销售: 0,
        退货: 0,
        调账: 0,
        运费: 0,
        其它: 0,
        促销: 0,
        暗扣: 0,
        回款: 0,
        新增铺底: 0,
      };
    }
  }

  // 1. 处理销售明细表
  if (wb.Sheets["销售明细"]) {
    const salesData = XLSX.utils.sheet_to_json(wb.Sheets["销售明细"]);
    salesData.forEach((row) => {
      const name = String(row["客户名称"] || "").trim();
      if (!name) return;
      initCustomer(name);

      const type = String(row["订单类型"] || "").trim();
      const amount = Number(row["小计"]) || 0;

      if (type === "成都发货" || type === "直发") {
        dataMap[name].销售 += amount;
      } else if (type === "退货") {
        dataMap[name].退货 += amount;
      } else if (type === "调账") {
        dataMap[name].调账 += amount;
      }
    });
  }

  // 2. 处理其他简单表 (运费, 调账, 新增铺底, 回款, 其它)
  function processSimpleSheet(sheetName, field) {
    if (!wb.Sheets[sheetName]) return;
    const sheetData = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    sheetData.forEach((row) => {
      const name = String(row["客户名称"] || "").trim();
      if (!name) return;
      initCustomer(name);
      dataMap[name][field] += Number(row["小计"]) || 0;
    });
  }

  processSimpleSheet("运费", "运费");
  processSimpleSheet("调账", "调账"); // 叠加
  processSimpleSheet("新增铺底", "新增铺底");
  processSimpleSheet("回款", "回款");
  processSimpleSheet("其它", "其它");

  // 3. 处理促销表 (包含暗扣)
  if (wb.Sheets["促销"]) {
    const promoData = XLSX.utils.sheet_to_json(wb.Sheets["促销"]);
    promoData.forEach((row) => {
      const name = String(row["客户名称"] || "").trim();
      if (!name) return;
      initCustomer(name);

      const amount = Number(row["小计"]) || 0;
      dataMap[name].促销 += amount;

      if (String(row["是否暗扣"] || "").trim() === "是") {
        dataMap[name].暗扣 += amount;
      }
    });
  }

  // 4. 处理期初数 (仅收集客户名)
  if (wb.Sheets["期初数"]) {
    const initData = XLSX.utils.sheet_to_json(wb.Sheets["期初数"]);
    initData.forEach((row) => {
      const name = String(row["客户名称"] || "").trim();
      if (name) initCustomer(name);
    });
  }

  // 5. 排序并生成结果
  const sortedCustomers = Array.from(customers).sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );

  const result = sortedCustomers.map((name) => ({
    客户名称: name,
    销售: round2(dataMap[name].销售),
    退货: round2(dataMap[name].退货),
    调账: round2(dataMap[name].调账),
    运费: round2(dataMap[name].运费),
    其它: round2(dataMap[name].其它),
    促销: round2(dataMap[name].促销),
    暗扣: round2(dataMap[name].暗扣),
    回款: round2(dataMap[name].回款),
    新增铺底: round2(dataMap[name].新增铺底),
  }));

  return result;
}
