;(async () => {
	try {
		await import('@testing-library/jest-dom');
	} catch (e) {
		// optional dev dependency not installed — continue
	}
})();
