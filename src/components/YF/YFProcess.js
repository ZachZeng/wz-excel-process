import React, { useState, useEffect } from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { ExportButton } from "../../elements/StyledElements";
import { yfParse } from "./yfParse";

export const YFProcess = ({ ruleSheet, freightSheet }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const res = yfParse(ruleSheet, freightSheet);
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  }, [ruleSheet, freightSheet]);

  const exportToExcel = () => {
    if (!results || results.length === 0) {
      alert("无数据可导出");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(results);
    const wb = {
      Sheets: { 不符合规则客户: ws },
      SheetNames: ["不符合规则客户"],
    };

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    FileSaver.saveAs(data, "运费核对结果.xlsx");
  };

  if (error) {
    return (
      <div style={{ marginTop: "20px", color: "red" }}>
        <h3>处理出错：</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!results) {
    return <div style={{ marginTop: "20px" }}>处理中...</div>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>处理成功！</h3>
      <p>
        发现 <strong>{results.length}</strong> 个不符合免运费规则的客户。
      </p>
      <ExportButton onClick={exportToExcel}>导出结果</ExportButton>
    </div>
  );
};
