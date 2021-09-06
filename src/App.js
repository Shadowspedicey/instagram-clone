import { useEffect } from "react";
import { Route, Switch, withRouter } from "react-router";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { stopLoading } from "./state/actions/isLoading";
import { setUser } from "./state/actions/currentUser";
import LoadingPage from "./components/LoadingPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import AccountVerification from "./components/AccountVerification";
import Logged from "./components/Logged";
import "./styles/App.css";

const App = () =>
{
	const isLoggedIn = useSelector(state => state.currentUser);
	const isLoading = useSelector(state => state.loading);
	const dispatch = useDispatch();

	const checkIfLoggedIn = () =>
	{
		onAuthStateChanged(auth, user =>
		{
			if (user)
			{
				dispatch(setUser(user));
				dispatch(stopLoading());
			}
			else
			{
				dispatch(setUser(null));
				dispatch(stopLoading());
			}
		});
	};
	//useEffect(() => signOut(auth), []);
	useEffect(checkIfLoggedIn, [dispatch]);

	return (
		<div className="App">
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
				<Route path="/accounts/verify" component={AccountVerification}></Route>
			</Switch>
		</div>
	);
};

export default App;
