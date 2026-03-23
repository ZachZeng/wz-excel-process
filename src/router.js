import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import styled from "styled-components";

import {
  PDDropzone,
  DZProcess,
  RecycleDropzone,
} from "./components";
import { CXDropzone } from "./components/CX/CXDropzone";
import { DDDropzone } from "./components/DD/DDDropzone";

const NavUnlisted = styled.ul`
  display: flex;
  margin: 0;
  padding: 0;

  a {
    text-decoration: none;
  }

  li {
    color: #61988e;
    border: 2px solid #61988e;
    border-radius: 2px;
    padding: 0.5rem 1rem;
    margin: 0 -1px;
    font-size: 1rem;
    position: relative;
    list-style: none;
  }

  .active {
    li {
      background-color: #61988e;
      color: #fff;
    }
  }
`;

export default function NaviRouter() {
  return (
    <Router
      basename="/wz-excel-process"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div>
        <NavUnlisted>
          <NavLink to="/">
            <li>铺底统计</li>
          </NavLink>

          <NavLink to="/dz">
            <li>对账</li>
          </NavLink>

          <NavLink to="/recycle">
            <li>未回收账单</li>
          </NavLink>

          <NavLink to="/cx">
            <li>促销余额核对</li>
          </NavLink>

          <NavLink to="/dd">
            <li>订单核对</li>
          </NavLink>
        </NavUnlisted>

        <Routes>
          <Route path="/" element={<PDDropzone />} />
          <Route path="/dz" element={<DZProcess />} />
          <Route path="/recycle" element={<RecycleDropzone />} />
          <Route path="/cx" element={<CXDropzone />} />
          <Route path="/dd" element={<DDDropzone />} />
        </Routes>
      </div>
    </Router>
  );
}
