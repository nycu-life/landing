import { expect, test } from '@playwright/test';

// Exercise the real cross-origin player protocol without depending on YouTube's network or UI.
const player = `<!doctype html><html><body>
<button id="pause">Pause</button><button id="play">Play</button>
<button id="mute">Toggle mute</button><button id="ready">Ready again</button>
<output id="state"></output><output id="commands"></output>
<script>
let paused = true, muted = true;
const commands = [];
const send = (event, info) => parent.postMessage(JSON.stringify({event, info}), '*');
const report = () => {
  document.querySelector('#state').textContent = JSON.stringify({paused, muted});
  send('onStateChange', paused ? 2 : 1);
  send('infoDelivery', {playerState: paused ? 2 : 1, muted});
};
document.querySelector('#pause').onclick = () => { paused = true; report(); };
document.querySelector('#play').onclick = () => { paused = false; report(); };
document.querySelector('#mute').onclick = () => { muted = !muted; report(); };
document.querySelector('#ready').onclick = () => send('onReady');
addEventListener('message', ({data}) => {
  let message;
  try { message = JSON.parse(data); } catch { return; }
  if (message.event === 'listening') return;
  if (message.event !== 'command') return;
  commands.push(message.func);
  document.querySelector('#commands').textContent = JSON.stringify(commands);
  if (message.func === 'playVideo') paused = false;
  else if (message.func === 'pauseVideo') paused = true;
  else if (message.func === 'unMute') muted = false;
  else if (message.func === 'mute') muted = true;
  else return;
  report();
});
document.querySelector('#state').textContent = JSON.stringify({paused, muted});
</script></body></html>`;

test('viewer pause and mute survive page input, startup retries and returning to the film', async ({
	page
}) => {
	await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
		route.fulfill({ contentType: 'text/html', body: player })
	);
	await page.goto('/?motion=on#about');
	const nativeGhost = (await page.locator('body.ghost-theme').count()) > 0;
	const story = page.locator('.prototype-story');
	const film = page.frameLocator('.team-film iframe');
	const state = film.locator('#state');
	await expect(state).toHaveText('{"paused":false,"muted":true}');
	await film.getByRole('button', { name: 'Toggle mute', exact: true }).click();
	await expect(state).toHaveText('{"paused":false,"muted":false}');
	await film.getByRole('button', { name: 'Toggle mute', exact: true }).click();
	await page.locator('.about-copy h2').click();
	await page.keyboard.press('Shift');
	await expect(state).toHaveText('{"paused":false,"muted":true}');
	await film.getByRole('button', { name: 'Pause', exact: true }).click();
	await expect(story).toHaveAttribute('data-about-film-retrying', 'false');

	await page.locator('.about-copy h2').click();
	await page.keyboard.press('Shift');
	await page.mouse.wheel(0, 5);
	await film.getByRole('button', { name: 'Ready again', exact: true }).click();
	// Cover even the last startup retry, rather than checking only the next animation frame.
	await page.waitForTimeout(5200);
	await expect(state).toHaveText('{"paused":true,"muted":true}');
	const commands = JSON.parse((await film.locator('#commands').textContent()) ?? '[]');
	expect(commands).not.toContain('unMute');
	expect(commands).not.toContain('setVolume');

	await page.evaluate(() => (location.hash = 'faq'));
	await expect(story).toHaveAttribute('data-about-film-should-play', 'false');
	await page.evaluate(() => (location.hash = 'about'));
	await expect(story).toHaveAttribute('data-about-film-should-play', 'true');
	await expect(story).toHaveAttribute('data-about-film-retrying', 'false');
	await expect(state).toHaveText('{"paused":true,"muted":true}');

	if (nativeGhost) {
		// Explicit audio permission changes only mute, even when the viewer has paused.
		await page.getByRole('button', { name: '開啟聲音', exact: true }).click();
		await expect(state).toHaveText('{"paused":true,"muted":false}');
	}
	// The player's own Play control still works after an intentional pause.
	await film.getByRole('button', { name: 'Play', exact: true }).click();
	await expect(state).toHaveText(`{"paused":false,"muted":${nativeGhost ? 'false' : 'true'}}`);
});
