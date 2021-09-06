import { useEffect } from "react";
import { Route, Switch } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { stopLoading } from "./state/actions/isLoading";
import { setUser } from "./state/actions/currentUser";
import Navbar from "./components/Navbar";
import LoadingPage from "./components/LoadingPage";
import SignUpPage from "./components/AccountAuth/SignUpPage";
import LoginPage from "./components/AccountAuth/LoginPage";
import AccountVerification from "./components/AccountAuth/AccountVerification";
import Logged from "./components/Logged";
import "./styles/App.css";
import PasswordReset from "./components/AccountAuth/PasswordReset";

const App = () =>
{
	const isLoggedIn = useSelector(state => state.currentUser);
	const isLoading = useSelector(state => state.loading);
	const dispatch = useDispatch();

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
		<div className="App">
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
			</Switch>
		</div>
	);
};

export default App;
