import { doc, runTransaction } from "@firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../firebase";

const FollowButton = ({ target, setIsFollowing }) =>
{
	const currentUser = useSelector(state => state.currentUser);

	const follow = () =>
	{
		if (!currentUser) return alert("sign in");
		addToUsersFollowing();
		addToTargetsFollowers();
		setIsFollowing(true);
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
			alert("Oops, try again later.");
		}
	};

	return(
		<button className="follow-btn" onClick={follow}>Follow</button>
	);
};

export default FollowButton;
