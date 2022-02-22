import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import Button from "../FormElements/Button";


import "./NavLinks.css";

function NavLinks(props) {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          All Users
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to={`/${auth.userId}/places`}>My Places</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">Add Place</NavLink>
        </li>
      )}

      {auth.isLoggedIn && (
        <li>
          <Button onClick={auth.logout}>Log out</Button>
        </li>
      )}



      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">Log In</NavLink>
        </li>
      )}
    </ul>
  );
}

export default NavLinks;
