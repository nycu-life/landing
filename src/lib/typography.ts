/** Real spaces for generated Chinese labels, including Intl date/time output. */
export function spaceChineseNumbers(text: string): string {
	return text
		.replace(/(\p{Script=Han})([0-9])/gu, '$1 $2')
		.replace(/([0-9])(\p{Script=Han})/gu, '$1 $2');
}

/** Keep Intl's locale, calendar and punctuation; only space Chinese numeric boundaries. */
export function formatDateTime(
	date: Date,
	locale: string,
	options: Intl.DateTimeFormatOptions
): string {
	const formatted = new Intl.DateTimeFormat(locale, options).format(date);
	return locale.toLowerCase().startsWith('zh') ? spaceChineseNumbers(formatted) : formatted;
}
