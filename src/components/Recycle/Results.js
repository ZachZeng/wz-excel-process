import React, { useEffect, useState } from "react";
import {
  ResultsHeader,
  ResultsTable,
  FilterMonthSelector,
} from "../../elements/StyledElements";

export const Results = ({ printData, client, sale, month, recycleMonth }) => {
  return (
    <div>
      {(() => {
        if (
          client === undefined ||
          sale === undefined ||
          printData === undefined
        ) {
          return;
        }
        if (printData.length === 0) {
          return <p>无数据</p>;
        }
        return (
          <>
            <ResultsHeader>
              <h2>结果</h2>
              <h3>
                <span>业务员：{sale}</span>
                <span>客户：{client}</span>
                <span>
                  截止至: {month.getFullYear()}年{month.getMonth() + 1}月
                </span>
                {/* <span>未回收期数: {recycleMonth}月</span> */}
              </h3>
            </ResultsHeader>
            <ResultsTable>
              <tr>
                <th>业务员</th>
                <th>客户名称</th>
                <th>未回收期数</th>
              </tr>
              {printData.map((item) => {
                if (item["数量"] !== 0)
                  return (
                    <tr>
                      <td>{item["业务员"]}</td>
                      <td>{item["客户名称"]}</td>
                      <td>{item["未回收期数"]}</td>
                    </tr>
                  );
              })}
            </ResultsTable>
          </>
        );
      })()}
    </div>
  );
};
