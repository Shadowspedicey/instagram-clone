import { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { collection, doc, getDocs, setDoc, query, where, serverTimestamp } from "@firebase/firestore";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import { setUser } from "../../state/actions/currentUser";
import ErrorMsg from "./ErrorMsg";
import nameLogo from "../../assets/namelogo.png";
import emailVerificationIcon from "../../assets/misc/email-verification.png";

const SignUpPage = () =>
{
	const emailRef = useRef();
	const realNameRef = useRef();
	const usernameRef = useRef();
	const passwordRef = useRef();

	const history = useHistory();
	const dispatch = useDispatch();

	const [isInfoValid, setInfoValid] = useState(false);
	const [emailVerificationTime, setEmailVerificationTime] = useState(false);
	const [verificationInterval, setVerificationInterval] = useState();
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => document.title = "Sign Up • Instadicey", []);
	useEffect(() => () => clearInterval(verificationInterval));

	const checkEmail = () =>
	{
		const emailValue = emailRef.current.value.trim();
		if (emailValue === "") return false;
		// eslint-disable-next-line no-control-regex
		else if (!emailValue.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
			return false;
		else return true;
	};

	const checkPassword = () => passwordRef.current.value.length < 6 ? false : true;

	const checkUsername = () => usernameRef.current.value.length > 20 || usernameRef.current.value.length === 0 || !usernameRef.current.value.match(/^[A-Za-z0-9]*$/) ? false : true;

	const checkForm = () =>
	{
		if (checkEmail() && checkPassword() && checkUsername()) setInfoValid(true);
		else setInfoValid(false);
	};

	const checkFormWithDB = (_username) =>
	{
		return new Promise(async resolve =>
		{
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("username", "==", _username));
			const querySnapshot = await getDocs(q);
			console.log(querySnapshot.docs.length);
			if (querySnapshot.docs.length !== 0)
			{
				setErrorMsg("Username already taken");
				resolve(false);
			} else resolve(true);
		});
	};

	const handleSubmit = async  e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;
		
		const email = emailRef.current.value;
		const realName = realNameRef.current.value;
		const username = usernameRef.current.value;
		const password = passwordRef.current.value;
		
		try
		{
			dispatch(startLoading());

			const checkWithDB = await checkFormWithDB(username);
			if (!checkWithDB) return dispatch(stopLoading());

			const { user } = await createUserWithEmailAndPassword(auth, email, password);
			const info =
			{
				email,
				realName,
				username,
				profilePic: "https://firebasestorage.googleapis.com/v0/b/instadicey.appspot.com/o/default%2FprofilePic.jpg?alt=media&token=3ac835a3-016e-470a-b7b3-f898d82cdbde",
				defaultProfilePic: true,
				bio: "",
				followers: [],
				following: [],
				saved: [],
				uid: auth.currentUser.uid,
				timestamp: serverTimestamp(),
			};
			const userDocRef = doc(db, "users", auth.currentUser.uid);
			await setDoc(userDocRef, info);
			setErrorMsg(null);
			
			await sendEmailVerification(user);
			setEmailVerificationTime(true);
			runEmailVerification(info);

			dispatch(stopLoading());
		} catch (err)
		{
			const errorCode = err.code;
			console.error("Error with signup", err);
			if (errorCode === "auth/email-already-in-use")
				setErrorMsg("Email already in use");
			dispatch(stopLoading());
		}
	};

	// Runs after checking user info on sign up
	const runEmailVerification = (info) =>
	{
		setVerificationInterval(setInterval(async () =>
		{
			await auth.currentUser.reload();
			if (auth.currentUser.emailVerified)
			{
				dispatch(setUser({user: auth.currentUser, info}));
				history.push("");
			};
		}, 5000));
	};
	useEffect(() => signOut(auth), []);

	if (!emailVerificationTime)
		return(
			<div id="signup-page">
				<div id="signup-window" className="outlined">
					<div className="logo"><img src={nameLogo} alt="Instadicey logo"></img></div>
					{ 
						errorMsg 
							? <ErrorMsg text={errorMsg}/>
							: <span style={{fontWeight: "bold", color: "rgba(50, 50, 50, 0.5)"}}>Sign up now!</span> 
					}
					<form className="info" onSubmit={handleSubmit}>
						<input type="text" placeholder="Email" id="email" ref={emailRef} onChange={checkForm}></input>
						<input type="text" placeholder="Full Name" id="name" ref={realNameRef}></input>
						<input type="text" placeholder="Username" id="username" ref={usernameRef} onChange={checkForm}></input>
						<input type="password" placeholder="Password" id="password" ref={passwordRef} onChange={checkForm}></input>
						<button id="signup" className={`${isInfoValid ? null : "disabled"}`}>Sign Up</button>
					</form>
				</div>
				<div className="extra outlined"><span>Have an account? <Link to="/" className="button">Log In</Link></span></div>
			</div>
		);
	else
		return(
			<div id="email-verification-window" className="outlined">
				<div className="icon"><img src={emailVerificationIcon} alt="email verification icon"></img></div>
				<p className="header">A verification link has been sent to your email</p>
				<p>Please click on the link sent to your email address and come back here to continue.</p>
			</div>
		);
};

export default SignUpPage;
