import { arrayRemove, arrayUnion, doc, updateDoc } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase";
import { setSnackbar } from "../../state/actions/snackbar";

const Like = ({size = 25, target, postPath, isComment}) =>
{
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [isLiked, setIsLiked] = useState(false);
	useEffect(() =>
	{
		const checkIfLiked = async () =>
		{
			if (!currentUser) return;
			if (target.likes.includes(currentUser.user.uid)) setIsLiked(true);
			else setIsLiked(false);
		};
		checkIfLiked();
	}, [currentUser, target]);

	const like = async () =>
	{
		if (!currentUser) return alert("sign in");
		try
		{
			if (isComment)
			{
				await updateDoc(doc(db, postPath, "comments", `${target.id}`),
					{
						likes: arrayUnion(currentUser.user.uid),
					});
			} else
			{
				await updateDoc(doc(db, postPath),
					{
						likes: arrayUnion(currentUser.user.uid),
					});
			}
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
		setIsLiked(true);
	};
	
	const unlike = async () =>
	{
		try
		{
			if (isComment)
			{
				await updateDoc(doc(db, postPath, "comments", `${target.id}`),
					{
						likes: arrayRemove(currentUser.user.uid),
					});
			} else
			{
				await updateDoc(doc(db, postPath),
					{
						likes: arrayRemove(currentUser.user.uid),
					});
			}
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
		setIsLiked(false);
	};

	if (isLiked)
		return(
			<button className="like liked icon" onClick={unlike}>
				<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"><path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"/></svg>
			</button>
		);
	else return(
		<button className="like icon" onClick={like}>
			<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181"/></svg>
		</button>
	);
};

export default Like;
