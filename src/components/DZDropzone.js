import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileProcess } from ".";
import { DropzoneWrapper } from "../elements/StyledElements";
import * as XLSX from "xlsx";

export const DZDropzone = props => {
  const [sumData, setSumData] = useState();
  const [detailData, setDetailData] = useState();

  const onDrop = useCallback(acceptedFiles => {
    var f = acceptedFiles[0];
    if (!f) {
      return;
    }
    var name = f.name;
    const reader = new FileReader();
    reader.onload = evt => {
      // evt = on_file_select event
      /* Parse data */
      const bstr = evt.target.result;
      // var length = bstr.byteLength;
      // var binary = "";
      // for (var i = 0; i < length; i++) {
      //   binary += String.fromCharCode(bstr[i]);
      // }

      const wb = XLSX.read(bstr, {
        type: "binary",
        cellDates: true
      });

      /* Get worksheets */
      const wsnames = wb.SheetNames;

      /* Convert to json */
      const sumData = wb.Sheets[wsnames[0]];
      /* Update state */
      setSumData(sumData);

      const detailData = XLSX.utils.sheet_to_json(wb.Sheets[wsnames[1]], {
        dateNF: "mm/dd/yyyy;@"
      });

      setDetailData(detailData);
      props.onDropFile(sumData, detailData);
    };
    reader.readAsBinaryString(f);
  }, []);

  const {
    isDragActive,
    getRootProps,
    getInputProps,
    isDragReject,
    isDragAccepted,
    acceptedFiles,
    rejectedFiles
  } = useDropzone({
    onDrop,
    accept: ".xlsx, .xls"
  });

  return (
    <>
      <h3>对账单</h3>
      <DropzoneWrapper {...getRootProps()}>
        <input {...getInputProps()} />
        {!isDragActive && "点击这里或者拖拽文件至这里进行上传"}
        {isDragActive && "放下文件"}
      </DropzoneWrapper>
    </>
  );
};
