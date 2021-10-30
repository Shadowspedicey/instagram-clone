import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "@firebase/firestore";
import { setSnackbar } from "../../state/actions/snackbar";

const Save = ({size = 25, target}) =>
{
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [isSaved, setIsSaved] = useState(false);
	useEffect(() =>
	{
		const checkIfSaved = async () =>
		{
			if (!currentUser) return;
			const currentUserSaved = await getDoc(doc(db, "users", currentUser.user.uid)).then(doc => doc.data().saved);
			if (currentUserSaved.includes(target.id)) setIsSaved(true);
			else setIsSaved(false);
		};
		checkIfSaved();
	}, [currentUser, target]);

	const save = async () =>
	{
		try
		{
			if (!currentUser) throw new Error("User not signed in");
			await updateDoc(doc(db, "users", currentUser.user.uid),
				{
					saved: arrayUnion(target.id),
				});
			setIsSaved(true);
		} catch (err)
		{
			console.error(err);
			if (err.message === "User not signed in")
				return dispatch(setSnackbar("Please sign in first!", "error"));
			else dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	const unsave = async () =>
	{
		try
		{
			await updateDoc(doc(db, "users", currentUser.user.uid),
				{
					saved: arrayRemove(target.id),
				});
			setIsSaved(false);
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	 if (isSaved) return(
		<button className="save saved icon" onClick={unsave}>
			<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"><path d="M18 24l-6-5.269-6 5.269v-24h12v24z"/></svg>
		</button>
	);
	else return(
		<button className="save icon" onClick={save}>
			<svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M5 0v24l7-6 7 6v-24h-14zm1 1h12v20.827l-6-5.144-6 5.144v-20.827z"></path></svg>
		</button>
	);
};

export default Save;
