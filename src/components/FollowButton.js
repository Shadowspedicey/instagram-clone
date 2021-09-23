import { useState } from "react";
import { useSelector } from "react-redux";
import { doc, runTransaction } from "@firebase/firestore";
import { db } from "../firebase";
import Loading from "../assets/misc/loading.jpg";

const FollowButton = ({ following, target, setIsFollowing }) =>
{
	const [isLoading, setIsLoading] = useState(null);
	const currentUser = useSelector(state => state.currentUser);

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
				if (sfDoc.data().following.includes(target.username)) throw new Error("User already followed");
				const newFollowingArray = [...sfDoc.data().following, target.username];
				t.update(userRef, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "User already followed") alert("You already follow this person.");
			else alert("Oops, try again later.");
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
				if (!sfDoc.data().following.includes(target.username)) throw new Error("User already not followed");
				const newFollowingArray = sfDoc.data().following.filter(user => user !== target.username);
				t.update(userRef, { following: newFollowingArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			if (err.message === "User already nor followed") alert("You already don't follow this person.");
			else alert("Oops, try again later.");
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
				const newFollowersArray = [...sfDoc.data().followers, currentUser.info.username];
				console.log(currentUser.info.username);
				console.log(newFollowersArray);
				t.update(targetRef, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			console.error(err);
			alert("Oops, try again later.");
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
				const newFollowersArray = sfDoc.data().following.filter(user => user !== currentUser.info.username);
				console.log(currentUser.info.username);
				console.log(newFollowersArray);
				t.update(targetRef, { followers: newFollowersArray }, { merge: true });
			});
		}
		catch (err)
		{
			alert("Oops, try again later.");
		}
	};

	if (isLoading) return <button className="follow-btn loading"><div><img src={Loading} alt="loading"></img></div></button>;
	if (following)
		return <button className="follow-btn unfollow" onClick={unfollow}>Unfollow</button>;
	else
		return <button className="follow-btn follow" onClick={follow}>Follow</button>;
};

export default FollowButton;
