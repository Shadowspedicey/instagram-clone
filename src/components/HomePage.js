import { collectionGroup, doc, getDoc, getDocs, query, where } from "@firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { db } from "../firebase";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import PostWindow from "./Posts/PostWindow";

const HomePage = () =>
{
	const postsRef = useRef();
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser.info);
	const [maxDate, setMaxDate] = useState(null);
	const [scroll, setScroll] = useState(0);
	const [olderPosts, setOlderPosts] = useState(null);
	const [postsToDisplay, setPostsToDisplay] = useState(null);
	const [left, setLeft] = useState(null);
	const setNewLeft = () => postsRef.current ? setLeft(parseInt(window.getComputedStyle(postsRef.current).marginLeft) + parseInt(window.getComputedStyle(postsRef.current).width)) : null;
	const smallScreenQuery = useMediaQuery({query: "(max-width: 1024px)"});

	const handleScroll = () =>
	{
		const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  	setScroll(winScroll / height * 100);
	};
	useEffect(handleScroll, []);

	useEffect(() => document.title = "Instadicey", []);
	useEffect(() =>
	{
		const getPosts = async () =>
		{
			if (!currentUser) return;
			dispatch(startLoading());
			const currentUserFollowing = await getDoc(doc(db, "users", currentUser.uid, "user_follows", "following"))
				.then(doc => doc.data())
				.then(data => data ? data.following : []);
			if (currentUserFollowing.length > 0)
			{
				const maximumDate = new Date(new Date().getTime() - (3 * 24 * 60 * 60 * 1000));
				setMaxDate(maximumDate);
				const q = query(collectionGroup(db, "user_posts"), where("user", "in", currentUserFollowing), where("timestamp", ">=", maximumDate));
				let posts = await getDocs(q).then(querySnapshot => querySnapshot.docs.map(doc => doc.data()));
				posts = posts.sort((a, b) => a.timestamp.seconds < b.timestamp.seconds ? 1 : -1);
				setPostsToDisplay(posts);
			} else setPostsToDisplay([]);
			dispatch(stopLoading());
		};
		getPosts();
	}, [currentUser, dispatch]);

	useEffect(() =>
	{
		if (scroll < 75 || !maxDate || olderPosts) return;

		const getOlderPosts = async () =>
		{
			const currentUserFollowing = await getDoc(doc(db, "users", currentUser.uid, "user_follows", "following")).then(doc => doc.data().following);
			console.log(currentUserFollowing.length > 0);
			if (currentUserFollowing.length > 0)
			{
				const q = query(collectionGroup(db, "user_posts"), where("user", "in", currentUserFollowing), where("timestamp", "<=", maxDate));
				let posts = await getDocs(q).then(querySnapshot => querySnapshot.docs.map(doc => doc.data()));
				posts = posts.sort((a, b) => a.timestamp.seconds < b.timestamp.seconds ? 1 : -1);
				setOlderPosts(posts);
			} else setOlderPosts([]);
		};
		getOlderPosts();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scroll, currentUser, maxDate]);

	useEffect(() =>
	{
		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", setNewLeft);
		return () =>
		{
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", setNewLeft);
		};
	}, [postsRef]);

	if (!postsToDisplay) return null;
	return(
		<div className="home-page">
			{/* { (left && !smallScreenQuery) &&
				<div className="sidebar" style={{left}}>
					<div style={{display: "flex", alignItems: "center"}}>
						<Link to={`/${currentUser.username}`}><div className="profile-pic" style={{width: 50, height: 50}}><img src={currentUser.profilePic} alt={`${currentUser.username}'s profile pic`}></img></div></Link>
						<Link to={`/${currentUser.username}`} className="username">{currentUser.username}</Link>
					</div>
				</div> */
			}
			{
				postsToDisplay &&
				<div className="posts" ref={postsRef} onLoad={setNewLeft}>
					{
						postsToDisplay.map(post =>
							<PostWindow postID={post.id} isVertical key={post.id}/>)
					}
				</div>
			}
			{ olderPosts &&
					<div className="older-posts posts" ref={postsRef} onLoad={setNewLeft}>
						<h2>Showing posts older than 3 days</h2>
						{
							olderPosts.map(post =>
								<PostWindow postID={post.id} isVertical key={post.id}/>)
						}
					</div>
			}
		</div>
	);
};

export default HomePage;
