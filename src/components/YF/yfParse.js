import * as XLSX from "xlsx";

export function yfParse(ruleSheet, freightSheet) {
  const rules = XLSX.utils.sheet_to_json(ruleSheet, { defval: "" });
  const data = XLSX.utils.sheet_to_json(freightSheet, { defval: "" });

  // 1. 提取免运费客户名单
  const freeCustomers = new Set();
  rules.forEach((row) => {
    const condition = String(row["条件"] || "").trim();
    const customer = String(row["客户名称"] || "").trim();
    if (condition === "所有情况下" && customer) {
      freeCustomers.add(customer);
    }
  });

  // 2. 校验运费数据
  const errorCustomers = new Set();

  data.forEach((row) => {
    const customer = String(row["客户名称"] || "").trim();
    const remark = String(row["备注"] || "").trim();
    const subtotal = Number(row["小计"]) || 0;

    if (!customer) return; // 忽略空客户

    // 检查小计是否不为 0 (考虑浮点误差)
    const isNotFree = Math.abs(subtotal) > 1e-6;

    if (isNotFree) {
      // 违反通用规则：备注包含发票或合同
      if (remark.includes("发票") || remark.includes("合同")) {
        errorCustomers.add(customer);
      }
      // 违反指定客户规则：客户在免运费名单中
      else if (freeCustomers.has(customer)) {
        errorCustomers.add(customer);
      }
    }
  });

  // 3. 返回结果
  const result = Array.from(errorCustomers)
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((c) => ({ 客户名称: c }));

  return result;
}
