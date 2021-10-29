import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { db } from "../../firebase";
import { collection, collectionGroup, getDocs, limit, query, where } from "@firebase/firestore";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import PostWindow from "./PostWindow";
import "./post-page.css";
import PostCard from "./PostCard";

const PostPage = () =>
{
	const { postID } = useParams();
	const dispatch = useDispatch();
	const [postExists, setPostExists] = useState(false);
	const [morePosts, setMorePosts] = useState(null);
	const [isSmallScreen, setIsSmallScreen] = useState(false);
	const handleResize = () => window.innerWidth < 1024 ? setIsSmallScreen(true) : setIsSmallScreen(false);
	useEffect(() =>
	{
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const checkIfPostExists = async () =>
	{
		try
		{
			dispatch(startLoading());
			const q = query(collectionGroup(db, "user_posts"), where("id", "==", postID));
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.docs[0]) throw Error("Post doesn't exist");
			setPostExists(true);
			getMorePosts(querySnapshot.docs[0].data());
		} catch (err)
		{
			console.error(err);
			if (err.message === "Post doesn't exist")
				setPostExists(false);
		}
		dispatch(stopLoading());
	};

	const getMorePosts = async postData =>
	{
		const q = query(collection(db, `users/${postData.user}/user_posts`), where("id", "!=", postData.id), limit(6));
		const morePosts = await getDocs(q).then(querySnapshot => querySnapshot.docs.map(doc => doc.data()).sort((a, b) => a.timestamp.seconds < b.timestamp.seconds ? 1 : -1));
		console.error(morePosts);
		setMorePosts(morePosts);
	};

	useEffect(() =>
	{
		setPostExists(false);
		checkIfPostExists();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postID]);

	if (!postExists) return null;
	else return(
		<div className="post-page">
			{
				isSmallScreen
					? <PostWindow postID={postID} isVertical/>
					: <PostWindow postID={postID}/>
			}
			<div className="more-posts">
				<header>More posts from this user</header>
				{ morePosts &&
					<div className="post-cards-container">
						{ morePosts.map(post => <PostCard postID={post.id} key={post.id}/>) }
					</div>
				}
			</div>
		</div>
	);
};

export default PostPage;
