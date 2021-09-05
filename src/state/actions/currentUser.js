export const setUser = user =>
{
	return {
		type: "SET_CURRENT_USER",
		payload: user,
	};
};

export const signOut = () =>
{
	return {
		type: "SIGN_OUT",
	};
};
