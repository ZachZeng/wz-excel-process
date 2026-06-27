import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { ExportButton, ErrorMessage } from "../../elements/StyledElements";
import { fybParse } from "./fybParse";

export const FYBProcess = ({ wb }) => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setError("");
      setResult(fybParse(wb));
    } catch (err) {
      setError("计算出错：" + err.message);
      console.error(err);
    }
  }, [wb]);

  const handleDownload = () => {
    if (!result) return;

    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(result.现金流量表), "现金流量表");
    XLSX.utils.book_append_sheet(outWb, XLSX.utils.aoa_to_sheet(result.费用表), "费用表");

    const buffer = XLSX.write(outWb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const { targetYear, targetMonth } = result.meta;
    const yearNum = targetYear.replace("年", "");
    const monthNum = String(parseInt(targetMonth.replace("月", ""))).padStart(2, "0");
    FileSaver.saveAs(blob, `费用表_${yearNum}${monthNum}.xlsx`);
  };

  if (error) {
    return <ErrorMessage style={{ marginTop: "1.5rem" }}>{error}</ErrorMessage>;
  }

  if (!result) {
    return <div style={{ marginTop: "1.5rem", color: "#64748b" }}>计算中…</div>;
  }

  const { targetYear, targetMonth } = result.meta;

  return (
    <div style={{
      marginTop: "2rem", padding: "2rem", background: "#ffffff",
      borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      borderTop: "4px solid #61988e",
    }}>
      <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e293b" }}>报表生成成功</h3>
      <p style={{ margin: "0 0 1.5rem 0", color: "#64748b" }}>
        {targetYear} {targetMonth} 费用表已就绪，包含现金流量表和费用表共 2 个工作表。
      </p>
      <ExportButton onClick={handleDownload}>
        下载费用表_{targetYear.replace("年", "")}{String(parseInt(targetMonth.replace("月", ""))).padStart(2, "0")}.xlsx
      </ExportButton>
    </div>
  );
};
