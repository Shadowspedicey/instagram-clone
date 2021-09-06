/* eslint-disable react-hooks/exhaustive-deps */
import { applyActionCode } from "@firebase/auth";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { auth } from "../../firebase";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import greenCheckmark from "../../assets/misc/green-checkmark.png";
import redX from "../../assets/misc/red-x.png";

const AccountVerification = () =>
{
	const [mode, setMode] = useState("");
	const [actionCode, setActionCode] = useState("");
	const [status, setStatus] = useState({});
	const dispatch = useDispatch();

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
			console.log(err);
			setStatus({
				type: "email-verification",
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


	if (status.ok)
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
						: null
				}
			</div>
		);
	}
	else return null;
};

export default AccountVerification;
