import React, { useEffect, useState } from "react";
import { ResultsHeader, ResultsTable } from "../elements/StyledElements";

export const Results = ({ filteredData, client, sale }) => {
  const [cleanData, setCleanData] = useState([]);
  console.log(filteredData);

  useEffect(() => {
    if (typeof filteredData !== "undefined") {
      let brandlist = [];
      filteredData.map(item => {
        if (
          !brandlist.some(
            e => e["品种"] === item["品种"] && e["单价"] === item["单价"]
          )
        ) {
          let temp = {
            品牌: item["品牌"],
            品种: item["品种"],
            单价: item["单价"],
            数量: item["数量"],
            金额: item["金额"]
          };
          brandlist.push(temp);
        } else {
          let i = brandlist.findIndex(
            e => e["品种"] === item["品种"] && e["单价"] === item["单价"]
          );
          let temp = brandlist[i];
          temp["数量"] += item["数量"];
          temp["金额"] += item["金额"];
          brandlist[i] = temp;
        }
      });
      console.log(brandlist);
      brandlist.sort((a, b) => {
        if (a["品牌"].localeCompare(b["品牌"], "zh") == 1) {
          return 1;
        } else if (a["品牌"].localeCompare(b["品牌"], "zh") == -1) {
          return -1;
        }

        return a["品种"].localeCompare(b["品种"], "zh");
      });
      setCleanData(brandlist);
    }
  }, [filteredData]);

  return (
    <div>
      {(() => {
        if (
          client === undefined ||
          sale === undefined ||
          filteredData === undefined
        ) {
          return;
        }
        if (filteredData.length === 0) {
          return <p>无数据</p>;
        }
        return (
          <>
            <ResultsHeader>
              <h2>结果</h2>
              <h3>
                <span>业务员：{sale}</span>
                <span>客户：{client}</span>
              </h3>
            </ResultsHeader>
            <ResultsTable>
              <tr>
                <th>品牌</th>
                <th>品种</th>
                <th>单价</th>
                <th>数量</th>
                <th>金额</th>
              </tr>
              {cleanData.map(item => (
                <tr>
                  <td>{item["品牌"]}</td>
                  <td>{item["品种"]}</td>
                  <td>{item["单价"]}</td>
                  <td>{item["数量"]}</td>
                  <td>{item["金额"].toFixed(2)}</td>
                </tr>
              ))}
            </ResultsTable>
          </>
        );
      })()}
    </div>
  );
};
