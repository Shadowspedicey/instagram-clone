import { combineReducers } from "redux";
import isLoadingReducer from "./isLoading";
import currentUser from "./currentUser";

const root = combineReducers(
	{
		loading: isLoadingReducer,
		currentUser,
	}
);

export default root;
