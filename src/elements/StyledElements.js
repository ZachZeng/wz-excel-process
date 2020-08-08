import styled from "styled-components";

export const LayoutWrapper = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;400;700&display=swap");
  height: 100vh;
  padding: 5rem 10rem;
  font-family: "Noto Sans SC", sans-serif;
`;

export const DropzoneWrapper = styled.div`
  input {
    width: 100%;
    height: 100%;
  }
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  cursor: pointer;
  transition: border 0.24s ease-in-out;
`;

const getColor = props => {
  if (props.isDragAccept) {
    return "#00e676";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#2196f3";
  }
  return "#eeeeee";
};

export const FileProcessWrapper = styled.div`
  padding: 3rem 0;
`;

export const FilenameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 2.5rem;
  padding: 2rem;
  background: #fafafa;
  align-items: center;
  svg {
    height: 100%;
    width: 4rem;
  }
  p {
    font-weight: bold;
    font-size: 2rem;
    color: #2e7d32;
  }
`;

export const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background: #eef4ee;
  height: 30rem;
  justify-content: start;
  color: #575757;
  padding: 2rem 3rem;

  h2 {
    padding: 0;
    margin: 0.5rem 0rem;
  }
`;

export const FilterTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-right: 5rem;
  width: 20rem;
`;

export const FilterDateWrapper = styled.div`
  width: 25rem;
`;

export const ResultWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #dff2df;
  justify-content: start;
  color: #575757;
  padding: 3rem 3rem;

  h2 {
    padding: 0;
    margin: 0.5rem 0rem;
  }
`;

export const CalcButton = styled.button`
  padding: 0.6rem 1.5rem;
  width: max-content;
  background: #61988e;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #3e746a;
    color: #fff;
  }
`;

export const ExportButton = styled.button`
  padding: 0.6rem 1.2rem;
  width: max-content;
  background: #61988e;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: #3e746a;
    color: #fff;
  }
  margin-top: 1rem;
`;

export const ErrorMessage = styled.div`
  padding: 2rem 0rem;
  font-weight: bolder;
  color: #ed5757;
`;
