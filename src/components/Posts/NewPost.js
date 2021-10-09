import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { db, storage } from "../../firebase";
import { doc, serverTimestamp, setDoc, } from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import store from "../../state";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import { setNewPost } from "../../state/actions/newPost";
import { setSnackbar } from "../../state/actions/snackbar";
import { nanoid } from "nanoid";
import Cropper from "react-easy-crop";

const NewPost = () =>
{
	const currentUser = useSelector(state => state.currentUser);
	const photo = useSelector(state => state.newPost);
	const [photoUrl, setPhotoUrl] = useState("");
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => currentUser ? dispatch(stopLoading()) : dispatch(startLoading()), [photoUrl, currentUser]);
	useEffect(() =>
	{
		if (!photo) return;
		const reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onloadend = () => setPhotoUrl(reader.result);
	}, [photo]);

	const captionRef = useRef();
	const dispatch = useDispatch();
	const history = useHistory();
	useEffect(() =>
	{
		const photo = store.getState().newPost;
		if (!photo) return history.push("/");

		return () => dispatch(setNewPost(null));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const { getCroppedImg } = foo;

	const cancel = () => history.push("/");

	const share = async () =>
	{
		try
		{
			const postID = nanoid(32);
			const caption = captionRef.current.value;
			const croppedPhoto = await getCroppedImg(photoUrl, croppedAreaPixels, rotation);

			const postPhotoRef = ref(storage, `users/${currentUser.user.uid}/posts/${postID}.png`);
			await uploadBytes(postPhotoRef, croppedPhoto);
			const postUrl = await getDownloadURL(postPhotoRef);
			await setDoc(doc(db, "users", currentUser.user.uid, "user_posts", postID),
				{
					photo: postUrl,
					caption,
					user: currentUser.user.uid,
					likes: [],
					id: postID,
					timestamp: serverTimestamp(),
				});

			dispatch(setSnackbar("Post uploaded.", "success"));
			history.push(`/p/${postID}`);
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	if (!currentUser || !photoUrl) return null;
	return(
		<div className="new-post">
			<div className="header">
				<button className="cancel text" onClick={cancel}><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16"><path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/></svg></button>
				New Photo Post
				<button className="text" onClick={share}>Share</button>
			</div>
			<div className="cropper-container">
				<Cropper
					image={photoUrl}
					crop={crop}
					zoom={zoom}
					zoomSpeed={0.5}
					onCropChange={setCrop}
					onZoomChange={setZoom}
					onRotationChange={setRotation}
					onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
					aspect={1}
				/>
			</div>
			<div className="caption-container outlined">
				<div className="profile-pic outlined round"><img src={currentUser.info.profilePic} alt="profile pic"></img></div>
				<textarea className="caption" placeholder="Write a caption..." ref={captionRef}></textarea>
			</div>
		</div>
	);
};

const foo = (() =>
{
	const createImage = url =>
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", error => reject(error));
			image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
			image.src = url;
		});

	function getRadianAngle(degreeValue) {
		return (degreeValue * Math.PI) / 180;
	}

	/**
	 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
	 * @param {File} image - Image File url
	 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
	 * @param {number} rotation - optional rotation parameter
	 */
	const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const maxSize = Math.max(image.width, image.height);
		const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

		// set each dimensions to double largest dimension to allow for a safe area for the
		// image to rotate in without being clipped by canvas context
		canvas.width = safeArea;
		canvas.height = safeArea;

		// translate canvas context to a central location on image to allow rotating around the center.
		ctx.translate(safeArea / 2, safeArea / 2);
		ctx.rotate(getRadianAngle(rotation));
		ctx.translate(-safeArea / 2, -safeArea / 2);

		// draw rotated image and store data.
		ctx.drawImage(
			image,
			safeArea / 2 - image.width * 0.5,
			safeArea / 2 - image.height * 0.5
		);
		const data = ctx.getImageData(0, 0, safeArea, safeArea);

		// set canvas width to final desired crop size - this will clear existing context
		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		// paste generated rotate image with correct offsets for x,y crop values.
		ctx.putImageData(
			data,
			Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
			Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
		);

		// As Base64 string
		// return canvas.toDataURL("image/jpeg");

		// As a blob
		return new Promise(resolve => canvas.toBlob(file => resolve(file), "image/png"));
	};

	return { getCroppedImg };
})();

export default NewPost;
