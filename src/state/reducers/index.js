import { combineReducers } from "redux";
import isLoadingReducer from "./isLoading";
import currentUserReducer from "./currentUser";
import snackbarReducer from "./snackbar";
import newPostReducer from "./newPost";

const root = combineReducers(
	{
		loading: isLoadingReducer,
		currentUser: currentUserReducer,
		snackbar: snackbarReducer,
		newPost: newPostReducer,
	}
);

export default root;
