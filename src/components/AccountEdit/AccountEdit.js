import { useEffect } from "react";
import { Route, Switch, useHistory } from "react-router";
import { NavLink } from "react-router-dom";
import "./acc-edit.css";
import EditProfile from "./EditProfile";

const AccountEdit = () =>
{
	const history = useHistory();

	useEffect(() =>
	{
		if (history.location.pathname === "/accounts/edit")
			document.title = "Edit Profile • Instadicey";
		else if (history.location.pathname === "/accounts/edit/a")
			document.title = "Ass";
	}, [history.location.pathname]);

	return(
		<div className="profile-edit outlined">
			<ul className="sidebar">
				<li><NavLink exact to="/accounts/edit" activeClassName="selected">Edit Profile</NavLink></li>
				<li><NavLink to="/accounts/edit/a" activeClassName="selected">ass</NavLink></li>
			</ul>
			<div className="main">
				<Switch>
					<Route exact path="/accounts/edit" component={EditProfile}></Route>
				</Switch>
			</div>
		</div>
	);
};

export default AccountEdit;
