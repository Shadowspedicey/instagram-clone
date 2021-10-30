/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../../firebase";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "@firebase/auth";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import Logo from "../../assets/logo.png";
import greenCheckmark from "../../assets/misc/green-checkmark.png";
import redX from "../../assets/misc/red-x.png";

const AccountVerification = () =>
{
	const dispatch = useDispatch();
	const [mode, setMode] = useState("");
	const [actionCode, setActionCode] = useState("");
	const [status, setStatus] = useState({});

	const passwordRef = useRef();
	const confirmPasswordRef = useRef();
	const [passwordResetDone, setPasswordResetDone] = useState(false);
	const [passwordResetEmail, setPasswordResetEmail] = useState("");
	const [isInfoValid, setIsInfoValid] = useState(false);

	useEffect(() => document.title = "Verification • Instadicey", []);

	const handleVerifyEmail = async () =>
	{
		try
		{
			await applyActionCode(auth, actionCode);
			setStatus({
				type: "email-verification",
				ok: true,
			});
		} catch (err)
		{
			console.error(err);
			setStatus({
				type: "email-verification",
				ok: false,
			});
		}
		dispatch(stopLoading());
	};

	const checkForm = () => checkPassword() && checkConfirmPassword() ? setIsInfoValid(true) : setIsInfoValid(false);
	const checkPassword = () => passwordRef.current.value.length < 6 ? false : true;
	const checkConfirmPassword = () => confirmPasswordRef.current.value === passwordRef.current.value ? true : false;
	const handleFormSubmitPassword = async e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;

		const newPassword = passwordRef.current.value;
		try
		{
			await confirmPasswordReset(auth, actionCode, newPassword);
			setPasswordResetDone(true);
			setStatus({
				type: "password-reset",
				ok: true,
			});
		} catch (err)
		{
			console.error("error with confirming password", err);
			setStatus({
				type: "password-reset",
				ok: false,
			});
		}
	};

	const handlePasswordReset = async () =>
	{
		try
		{
			const email = await verifyPasswordResetCode(auth, actionCode);
			setPasswordResetEmail(email);
		} catch (err)
		{
			console.error("Invalid code", err);
			setStatus({
				type: "password-reset",
				ok: false,
			});
		}
		dispatch(stopLoading());
	};

	const handleLink = () =>
	{
		switch (mode)
		{
			case "verifyEmail":
				handleVerifyEmail();
				break;

			case "resetPassword":
				handlePasswordReset();
				break;

			default:
				break;
		}
	};

	useEffect(() =>
	{
		dispatch(startLoading());
		setMode(getParameterByName("mode"));
		setActionCode(getParameterByName("oobCode"));
		handleLink();
	}, [mode]);

	const getParameterByName = name =>
	{
		name = name.replace(/[[]/,"\\[").replace(/[\]]/,"\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null)
			return "";
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	};


	if (mode === "resetPassword" && !passwordResetDone && status.ok !== false)
	{
		return(
			<div className="verification-window outlined password-reset">
				<div className="icon"><img src={Logo} alt="logo"></img></div>
				<div className="email-div">
					<h2>Your Email:</h2>
					<span>{passwordResetEmail}</span>
				</div>
				<form onSubmit={handleFormSubmitPassword}>
					<input type="password" id="password" placeholder="Password (at least 6 characters)" ref={passwordRef} onChange={checkForm}></input>
					<input type="password" id="confirm password" placeholder="Confirm Password" ref={confirmPasswordRef} onChange={checkForm}></input>
					<button className={`${isInfoValid ? null : "disabled"}`}>Reset Password</button>
				</form>
			</div>
		);
	} else if (status.ok)
	{
		return(
			<div className="verification-window success outlined">
				<div className="icon"><img src={greenCheckmark} alt="success"></img></div>
				{
					status.type === "email-verification"
						? 
						<div className="text-div">
							<h1>Your email address has been verified</h1>
							<p>Please go back to the sign up page to continue.</p>
						</div>
						: status.type === "password-reset"
							?
							<div className="text-div">
								<h1>Your password has been reset</h1>
								<p>You can now log in with the new password.</p>
							</div>
							: null
				}
			</div>
		);
	} else if (status.ok === false)
	{
		return(
			<div className="verification-window failed outlined">
				<div className="icon"><img src={redX} alt="failed"></img></div>
				{
					status.type === "email-verification"
						? 
						<div className="text-div">
							<h1>An error has occured</h1>
							<p>This email address is already verified or the link might have expired.</p>
						</div>
						: status.type === "password-reset"
							?
							<div className="text-div">
								<h1>An error has occured</h1>
								<p>Please try to reset the password again.</p>
							</div>
							: null
				}
			</div>
		);
	}
	else return null;
};

export default AccountVerification;
