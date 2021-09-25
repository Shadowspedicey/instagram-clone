import { combineReducers } from "redux";
import isLoadingReducer from "./isLoading";
import currentUserReducer from "./currentUser";
import snackbarReducer from "./snackbar";

const root = combineReducers(
	{
		loading: isLoadingReducer,
		currentUser: currentUserReducer,
		snackbar: snackbarReducer,
	}
);

export default root;
