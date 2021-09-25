export const setSnackbar = (message, severity) =>
{
	return {
		type: "SET_SNACKBAR",
		payload:
		{
			message,
			severity,
		}
	};
};

export const closeSnackbar = () =>
{
	return {
		type: "CLOSE_SNACKBAR",
	};
};
