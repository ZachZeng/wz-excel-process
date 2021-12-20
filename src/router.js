import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import styled from "styled-components";

import { PDDropzone, DZProcess, RecycleDropzone } from "./components";
import { Tab } from "./elements/StyledElements";

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
    <Router>
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
        </NavUnlisted>

        <Routes>
          <Route exact path="/" element={<PDDropzone />} />
          <Route path="/dz" element={<DZProcess />} />
          <Route path="/recycle" element={<RecycleDropzone />} />
        </Routes>
      </div>
    </Router>
  );
}
