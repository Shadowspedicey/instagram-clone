import { collection, collectionGroup, getDocs, query, where } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import Loading from "../../assets/misc/loading.jpg";

const PostCard = ({postID}) =>
{
	const [isHovered, setIsHovered] = useState(false);
	const [postData, setPostData] = useState(null);
	const [comments, setComments] = useState(null);
	const getPostData = async () =>
	{
		const post = await getDocs(query(collectionGroup(db, "user_posts"), where("id", "==", postID)))
			.then(querySnapshot => querySnapshot.docs[0]);
		setPostData(post.data());
		return post.ref.path;
	};
	const getPostComments = async path =>
	{
		const commentsData = await getDocs(collection(db, `${path}/comments`))
			.then(querySnapshot => querySnapshot.docs.map(doc => doc.data()));
		setComments(commentsData);
	};
	useEffect(() =>
	{
		const getData = async () =>
		{
			const path = await getPostData();
			await getPostComments(path);
		};
		getData();
	}, []);


	if (!postData || !comments) return <div className="post-card loading outlined"><div className="container"><img src={Loading} alt="loading" style={{height: "25%", position: "absolute", inset: 0, margin: "auto"}}></img></div></div>;
	else return(
		<div className="post-card" onMouseOver={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
			<div className="container">
				<Link to={`/p/${postData.id}`}>
					{ isHovered &&
						<div className="hovered">
							<span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"></path></svg> {postData.likes.length}</span>
							<span><svg xmlns="http://www.w3.org/2000/svg" className="comment-bubble" width="20" height="20" viewBox="0 0 24 24"><path d="M.054 23c.971-1.912 2.048-4.538 1.993-6.368-1.308-1.562-2.047-3.575-2.047-5.625 0-5.781 5.662-10.007 12-10.007 6.299 0 12 4.195 12 10.007 0 6.052-6.732 11.705-15.968 9.458-1.678 1.027-5.377 2.065-7.978 2.535z"/></svg> {comments.length}</span>
						</div>
					}
					<img src={postData.photo} alt={postData.caption}></img>
				</Link>
			</div>
		</div>
	);
};

export default PostCard;
