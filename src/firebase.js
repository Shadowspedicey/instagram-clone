import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig =
{
	apiKey: "AIzaSyAKrGd-3EdtXZUrsR9H3MOL-mTUS2XjDt8",
	authDomain: "instadicey.firebaseapp.com",
	projectId: "instadicey",
	storageBucket: "instadicey.appspot.com",
	messagingSenderId: "534824914170",
	appId: "1:534824914170:web:563f979c0b305ebbc54d43",
	measurementId: "G-VJDYJCZNQJ",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
