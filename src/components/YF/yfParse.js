import * as XLSX from "xlsx";

export function yfParse(ruleSheet, freightSheet) {
  const rules = XLSX.utils.sheet_to_json(ruleSheet, { defval: "" });
  const data = XLSX.utils.sheet_to_json(freightSheet, { defval: "" });

  // 1. 提取免运费规则
  const freeCustomers = new Set();
  const keywordRules = [];

  rules.forEach((row) => {
    const condition = String(row["条件"] || "").trim();
    const customer = String(row["客户名称"] || "").trim();
    
    if (!condition || !customer) return;

    if (condition === "所有情况下") {
      freeCustomers.add(customer);
    } else if (condition.includes("备注")) {
      const keywords = [];
      // 提取引号内的关键词，支持多个“XX”或者“XX”
      const regex = /["“]([^"”]+)["”]/g;
      let match;
      while ((match = regex.exec(condition)) !== null) {
        const kw = match[1];
        if (kw !== '备注') {
          keywords.push(kw);
        }
      }
      
      // 如果没有用引号包裹，尝试通过“或者”分割来提取
      if (keywords.length === 0) {
        // 去除“当”和“时”等修饰词
        let cleanCondition = condition.replace(/当|时|列中有/g, '').replace(/“备注”/g, '').replace(/"备注"/g, '');
        const parts = cleanCondition.split('或者');
        parts.forEach(part => {
          const kw = part.trim();
          if (kw) keywords.push(kw);
        });
      }
      
      if (keywords.length > 0) {
        keywordRules.push({
          customer: customer === '所有客户' ? 'ALL' : customer,
          keywords: keywords
        });
      }
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
      let isError = false;

      // 违反指定客户规则：客户在免运费名单中
      if (freeCustomers.has(customer)) {
        isError = true;
      }

      // 违反关键词规则：备注包含指定关键词
      if (!isError) {
        for (const rule of keywordRules) {
          if (rule.customer === 'ALL' || rule.customer === customer) {
            const hasKeyword = rule.keywords.some(kw => remark.includes(kw));
            if (hasKeyword) {
              isError = true;
              break;
            }
          }
        }
      }

      if (isError) {
        errorCustomers.add(customer);
      }
    }
  });

  // 3. 返回结果
  const result = Array.from(errorCustomers)
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map(c => ({ "客户名称": c }));

  return result;
}
