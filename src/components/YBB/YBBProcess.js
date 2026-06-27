import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { ExportButton, ErrorMessage } from "../../elements/StyledElements";
import { ybbParse } from "./ybbParse";

export const YBBProcess = ({ 基础数据WB, 上月WB, 上年WB, manualInputs }) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      const parsed = ybbParse(基础数据WB, 上月WB, 上年WB, manualInputs);
      setResult(parsed);
    } catch (err) {
      setError("计算出错：" + err.message);
      console.error(err);
    }
  }, [基础数据WB, 上月WB, 上年WB, manualInputs]);

  const handleDownload = () => {
    if (!result) return;

    const wb = XLSX.utils.book_new();

    const makeSheet = (aoa) => {
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      // Mark date cells in 总表 row 1 col D and 允真 row 1 col B as date format
      return ws;
    };

    XLSX.utils.book_append_sheet(wb, makeSheet(result.总表), "总表");
    XLSX.utils.book_append_sheet(wb, makeSheet(result.费用明细), "费用明细");
    XLSX.utils.book_append_sheet(wb, makeSheet(result.允真), "允真");
    XLSX.utils.book_append_sheet(wb, makeSheet(result.调账), "调账");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const { year, month } = result.meta;
    const monthStr = String(month).padStart(2, "0");
    FileSaver.saveAs(blob, `最终报表_${year}${monthStr}.xlsx`);
  };

  if (error) {
    return <ErrorMessage style={{ marginTop: "1.5rem" }}>{error}</ErrorMessage>;
  }

  if (!result) {
    return <div style={{ marginTop: "1.5rem", color: "#64748b" }}>计算中…</div>;
  }

  const { year, month } = result.meta;

  return (
    <div style={{ marginTop: "2rem", padding: "2rem", background: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderTop: "4px solid #61988e" }}>
      <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>报表生成成功</h3>
      <p style={{ margin: "0 0 1.5rem 0", color: "#64748b" }}>
        {year} 年 {month} 月报表已就绪，包含总表、费用明细、允真、调账共 4 个工作表。
      </p>
      <ExportButton onClick={handleDownload}>
        下载最终报表_{year}{String(month).padStart(2, "0")}.xlsx
      </ExportButton>
    </div>
  );
};
