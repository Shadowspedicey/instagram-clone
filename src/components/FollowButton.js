import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, setDoc, getDoc, runTransaction } from "@firebase/firestore";
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
			setIsLoading(true);
			const currentUserFollowing = await getDoc(doc(db, "users", currentUser.user.uid, "user_follows", "following")).then(doc => doc.data()).then(data => data ? data.following : []);
			if (currentUserFollowing.includes(target.uid)) setIsFollowing(true);
			else setIsFollowing(false);
			setIsLoading(false);
		};
		checkIfFollowing();
	// eslint-disable-next-line react-hooks/exhaustive-deps
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
		const userRefFollowing = doc(db, "users", currentUser.user.uid, "user_follows", "following");
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(userRefFollowing);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				const newFollowingArray = [...sfDoc.data().following, target.uid];
				t.update(userRefFollowing, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "Document does not exist")
			{
				await setDoc(userRefFollowing,
					{
						following: [target.uid]
					}, {merge: true});
			}
			else dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	const removeFromUsersFollowing = async () =>
	{
		const userRefFollowing = doc(db, "users", currentUser.info.uid, "user_follows", "following");
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(userRefFollowing);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				if (!sfDoc.data().following.includes(target.uid)) throw new Error("User already not followed");
				const newFollowingArray = sfDoc.data().following.filter(user => user !== target.uid);
				t.update(userRefFollowing, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	const addToTargetsFollowers = async () =>
	{
		const targetRefFollowers = doc(db, "users", target.uid, "user_follows", "followers");
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(targetRefFollowers);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				if (sfDoc.data().followers.includes(currentUser.user.uid)) throw new Error("User already followed");
				const newFollowersArray = [...sfDoc.data().followers, currentUser.user.uid];
				t.update(targetRefFollowers, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "Document does not exist")
			{
				await setDoc(targetRefFollowers,
					{
						followers: [currentUser.user.uid]
					}, {merge: true});
			}
			else dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	const removeFromTargetsFollowers = async () =>
	{
		const targetRefFollowers = doc(db, "users", target.uid, "user_follows", "followers");
		try
		{
			await runTransaction(db, async t =>
			{
				const sfDoc = await t.get(targetRefFollowers);
				if (!sfDoc.exists()) throw new Error("Document does not exist");
				const newFollowersArray = sfDoc.data().followers.filter(user => user !== currentUser.user.uid);
				t.update(targetRefFollowers, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
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
