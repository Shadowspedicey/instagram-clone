import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { db } from "../../firebase";
import { collectionGroup, getDocs, query, where } from "@firebase/firestore";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import PostWindow from "./PostWindow";
import "./post-page.css";

const PostPage = () =>
{
	const { postID } = useParams();
	const dispatch = useDispatch();
	const [postExists, setPostExists] = useState(false);
	const checkIfPostExists = async () =>
	{
		try
		{
			dispatch(startLoading());
			const q = query(collectionGroup(db, "user_posts"), where("id", "==", postID));
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.docs[0]) throw Error("Post doesn't exist");
			else setPostExists(true);
		} catch (err)
		{
			console.error(err);
			if (err.message === "Post doesn't exist")
				setPostExists(false);
		}
		dispatch(stopLoading());
	};

	useEffect(() =>
	{
		checkIfPostExists();
	}, [postID]);

	if (!postExists) return null;
	else return(
		<div className="post-page">
			<PostWindow postID={postID}/>
		</div>
	);
};

export default PostPage;
