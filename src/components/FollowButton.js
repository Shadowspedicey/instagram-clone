import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, getDoc, runTransaction } from "@firebase/firestore";
import { db } from "../firebase";
import Loading from "../assets/misc/loading.jpg";
import { setSnackbar } from "../state/actions/snackbar";

const FollowButton = ({ target }) =>
{
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [isLoading, setIsLoading] = useState(null);
	const [isFollowing, setIsFollowing] = useState(false);
	useEffect(() =>
	{
		const checkIfFollowing = async () =>
		{
			if (!currentUser) return;
			const currentUserFollowing = await getDoc(doc(db, "users", currentUser.user.uid)).then(doc => doc.data().following);
			if (currentUserFollowing.includes(target.uid)) setIsFollowing(true);
		};
		checkIfFollowing();
	}, [currentUser, target]);

	const follow = async () =>
	{
		if (!currentUser) return alert("sign in");
		window.onbeforeunload = () => "";
		setIsLoading(true);
		await addToUsersFollowing();
		await addToTargetsFollowers();
		setIsFollowing(true);
		setIsLoading(false);
		window.onbeforeunload = null;
	};
	const unfollow = async () =>
	{
		window.onbeforeunload = () => "";
		setIsLoading(true);
		await removeFromUsersFollowing();
		await removeFromTargetsFollowers();
		setIsFollowing(false);
		setIsLoading(false);
		window.onbeforeunload = null;
	};

	const addToUsersFollowing = async () =>
	{
		const userRef = doc(db, "users", currentUser.info.uid);
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(userRef);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				if (sfDoc.data().following.includes(target.uid)) throw new Error("User already followed");
				const newFollowingArray = [...sfDoc.data().following, target.uid];
				t.update(userRef, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "User already followed") 
				return dispatch(setSnackbar("You already follow this person.", "error"));
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	const removeFromUsersFollowing = async () =>
	{
		const userRef = doc(db, "users", currentUser.info.uid);
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(userRef);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				if (!sfDoc.data().following.includes(target.uid)) throw new Error("User already not followed");
				const newFollowingArray = sfDoc.data().following.filter(user => user !== target.uid);
				t.update(userRef, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "User already not followed") 
				dispatch(setSnackbar("You already don't follow this person.", "error"));
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	const addToTargetsFollowers = async () =>
	{
		const targetRef = doc(db, "users", target.uid);
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(targetRef);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				const newFollowersArray = [...sfDoc.data().followers, currentUser.info.uid];
				t.update(targetRef, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	const removeFromTargetsFollowers = async () =>
	{
		const targetRef = doc(db, "users", target.uid);
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(targetRef);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				const newFollowersArray = sfDoc.data().following.filter(user => user !== currentUser.info.uid);
				t.update(targetRef, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	if (isLoading) return <button className="follow-btn loading"><div><img src={Loading} alt="loading"></img></div></button>;
	if (isFollowing)
		return <button className="follow-btn unfollow" onClick={unfollow}>Unfollow</button>;
	else
		return <button className="follow-btn follow" onClick={follow}>Follow</button>;
};

export default FollowButton;
