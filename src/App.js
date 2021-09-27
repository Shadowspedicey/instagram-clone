import { useEffect } from "react";
import { Route, Switch } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "@firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { Snackbar, Slide, Alert } from "@mui/material";
import Navbar from "./components/Navbar";
import LoadingPage from "./components/LoadingPage";

import { stopLoading } from "./state/actions/isLoading";
import { setUser } from "./state/actions/currentUser";
import { closeSnackbar } from "./state/actions/snackbar";

import SignUpPage from "./components/AccountAuth/SignUpPage";
import PasswordReset from "./components/AccountAuth/PasswordReset";
import LoginPage from "./components/AccountAuth/LoginPage";
import AccountVerification from "./components/AccountAuth/AccountVerification";

import Logged from "./components/Logged";
import UserProfile from "./components/UserProfile";

import AccountEdit from "./components/AccountEdit/AccountEdit";
import "./styles/App.css";

const App = () =>
{
	const dispatch = useDispatch();
	const isLoggedIn = useSelector(state => state.currentUser);
	const isLoading = useSelector(state => state.loading);
	const snackbar = useSelector(state => state.snackbar);
	snackbar.handleClose = () => dispatch(closeSnackbar());

	const checkIfLoggedIn = () =>
	{
		onAuthStateChanged(auth, async user =>
		{
			if (user && user.emailVerified)
			{
				const info = await getDoc(doc(db, "users", user.uid)).then(doc => doc.data());
				dispatch(setUser({user, info}));
				dispatch(stopLoading());
			}
			else
			{
				dispatch(setUser(null));
				dispatch(stopLoading());
			}
		});
	};
	useEffect(checkIfLoggedIn, [dispatch]);
	//useEffect(() => signOut(auth), []);

	return (
		<div className="App" style={isLoggedIn ? { paddingTop: "75px" } : null}>
			{ isLoggedIn ? <Navbar/> : null }
			{
				isLoading
					? <Route path="/" component={LoadingPage}></Route>
					: null
			}
			<Switch>
				<Route exact path="/">
					{
						isLoggedIn
							? <Logged/>
							: <LoginPage/>
					}
				</Route>
				<Route exact path="/accounts/email-signup" component={SignUpPage}></Route>
				<Route exact path="/accounts/password-reset" component={PasswordReset}></Route>
				<Route path="/accounts/verify" component={AccountVerification}></Route>
				<Route path="/accounts/edit" component={AccountEdit}></Route>

				<Route exact path="/:username" component={UserProfile}></Route>
			</Switch>
			<Snackbar
				open={snackbar.open}
				message={snackbar.message}
				autoHideDuration={5000}
				onClose={snackbar.handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				TransitionComponent={Slide}
				className="snackbar"
			>
				<Alert onClose={snackbar.handleClose} severity={snackbar.severity} icon={false}>{snackbar.message}</Alert>
			</Snackbar>
		</div>
	);
};

export default App;
