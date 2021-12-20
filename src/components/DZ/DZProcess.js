import React, { useState } from "react";
import { DZDropzone, ReplaceDropzone } from "../index";
import { DZFileProcess } from "./DZFileProcess";

export const DZProcess = () => {
  const [sumData, setSumData] = useState();
  const [detailData, setDetailData] = useState();
  const [replaceData, setReplaceData] = useState();

  const handleDZDrop = (dropSumData, dropDetailData) => {
    setSumData(dropSumData);
    setDetailData(dropDetailData);
  };

  const handleReplaceDrop = data => {
    setReplaceData(data);
  };

  console.log("sumData", sumData);
  console.log("replaceData", replaceData);

  return (
    <div>
      <h1>对账整合</h1>
      <DZDropzone onDropFile={handleDZDrop} />
      <ReplaceDropzone onDropFile={handleReplaceDrop} />
      {replaceData === undefined ? (
        <div>
          <p></p>
        </div>
      ) : (
        <DZFileProcess
          sumData={sumData}
          detailData={detailData}
          replaceData={replaceData}
        />
      )}
    </div>
  );
};
