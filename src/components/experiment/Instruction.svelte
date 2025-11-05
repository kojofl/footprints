<script lang="ts">
	interface Props {
		cb: () => Promise<void>;
	}

	const { cb }: Props = $props();

	let step = $state(0);

	async function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case "Enter": {
				if (step == 3) {
					// start exp
					await cb();
				} else {
					step++;
				}
				break;
			}
			case "Backspace": {
				step = Math.max(0, --step);
				break;
			}
		}
	}
</script>

<div class="flex flex-col m-auto max-w-4xl text-lg justify-between">
	<h1 class="h1 mb-10 mt-10">Anleitung</h1>
	{#if step === 0}
		<b>Willkommen zu unserem Experiment</b>

		<p class="mt-2">
			In diesem Experiment möchten wir biomechanische Parameter
			aufzeichnen, um Ihren Gang zu beschreiben. Zu diesem Zweck bitten
			wir Sie, den markierten Flur auf und ab zu gehen.
		</p>

		<p class="mt-4">Jede Runde entspricht einem Durchgang.</p>

		<p class="mt-4">
			Zu Beginn gibt es eine kurze Vorbereitungsphase, in der Sie ein
			Fixationskreuz auf dem Bildschirm betrachten sollen. Darauf folgt
			die Präsentation eines Bildes (5 Sekunden), gefolgt von einem
			Startsignal, das anzeigt, dass Sie mit dem Gehen beginnen sollen.
		</p>
		<p class="mt-4">
			Wenn Sie das Ende des Weges erreichen, werden Sie gebeten, das Bild
			danach zu bewerten, wie es auf Sie gewirkt hat.
		</p>
	{:else if step === 1}
		<h2 class="h2">Valenz / Positivität</h2>

		<p class="mt-4">
			Bilder kommunizieren. Sie zeigen Menschen, Gegenstände und Szenen.
			In dieser Studie interessiert uns, wie verschiedene Bilder Menschen
			fühlen lassen.
		</p>
		<p class="mt-4">
			Bitte denken Sie beim Beantworten daran: Es gibt keine richtigen
			oder falschen Antworten. Wir sind an Ihrer individuellen Meinung
			interessiert. Bitte verweilen Sie nicht zu lange bei einem Bild.
			Ihre erste Antwort ist genauso gut wie jede andere.
		</p>

		<p class="mt-4">
			Wir werden Sie bitten, eine Reihe von Bildern danach zu bewerten,
			wie positiv oder negativ sie sind. Wenn das Bild etwas Gutes oder
			Positives darstellt, verwenden Sie bitte die rechte Seite der Skala,
			um Ihre Antwort zu markieren. Positive Bilder sind solche, die Dinge
			darstellen, die uns glücklich, zufrieden, kompetent, stolz, erfüllt,
			erfreut usw. machen. Es spielt keine Rolle, worum es in dem
			speziellen Bild geht, solange es etwas Positives oder Gutes
			darstellt.
		</p>

		<p class="mt-4">
			Wenn das Bild etwas Schlechtes oder Negatives darstellt, verwenden
			Sie bitte die linke Seite der Skala, um Ihre Antwort zu markieren.
			Negative Bilder sind solche, die Dinge darstellen, die uns
			unglücklich, verärgert, irritiert, wütend, traurig, deprimiert usw.
			machen. Es spielt keine Rolle, worum es in dem speziellen Bild geht,
			solange es etwas Negatives oder Schlechtes darstellt.
		</p>

		<p class="mt-4">
			Verwenden Sie die Mitte der Skala, um anzugeben, dass das Bild Sie
			neutral fühlen lässt, also weder positiv noch negativ. Bitte nutzen
			Sie den gesamten Bereich der Skala für Ihre Antworten, anstatt sich
			nur auf wenige Punkte zu beschränken.
		</p>
	{:else if step === 2}
		<h2 class="h2">Arousal / Erregung</h2>

		<p class="mt-4">
			Wir werden Sie bitten, eine Reihe von Bildern danach zu bewerten,
			wie stark die Emotionen sind, die sie hervorrufen. Anders gesagt,
			wir möchten wissen, wie intensiv das Bild Emotionen erzeugt; es
			spielt keine Rolle, ob das Bild etwas Gutes oder Schlechtes
			darstellt. Uns interessiert nur das Ausmaß an Erregung, Energie oder
			Intensität des Gefühls, das es repräsentiert.
		</p>

		<p class="mt-4">
			Verwenden Sie die rechte Seite der Skala, wenn das Bild etwas
			darstellt, das stark emotional ist. Wörter, die den emotionalen
			Zustand beschreiben, den das Bild erzeugt, könnten z. B. „erregt“,
			„aufmerksam“, „aktiviert“, „geladen“ oder „energetisiert“ sein.
		</p>
		<p class="mt-4">
			Verwenden Sie die linke Seite der Skala, wenn das Bild etwas
			darstellt, das nicht stark emotional ist. Wörter, die den
			emotionalen Zustand beschreiben, könnten z. B. „nicht erregt“,
			„langsam“, „ruhig“, „energielos“, „entspannt“ oder „friedlich“ sein.
			Verwenden Sie die Mitte der Skala, um ein Bild zu kennzeichnen, das
			mäßig erregend ist oder zwischen den beiden Extremen liegt.
		</p>

		<p class="mt-4">
			Bitte nutzen Sie den gesamten Bereich der Skala für Ihre Antworten,
			anstatt sich nur auf wenige Punkte zu beschränken. Beim Bewerten
			sollen Sie vergessen, ob das Bild etwas Positives oder Negatives,
			Gutes oder Schlechtes darstellt. Bewerten Sie das Bild
			ausschließlich nach der Intensität der Emotionen, die es auslöst.
		</p>

		<p class="mt-4">
			Beispiel: Sie haben zwei Bilder – eines zeigt einen Athleten, der
			eine Goldmedaille gewinnt (etwas Gutes), und ein anderes zeigt einen
			Athleten, der verletzt wird und das Rennen verliert (etwas
			Schlechtes). Sie können beiden Bildern die gleiche Bewertung geben,
			weil sie eine ähnliche emotionale Intensität erzeugen, auch wenn die
			Gefühle unterschiedlich sind. Ihre Antworten sollen sich
			ausschließlich danach richten, wie stark die Emotionen sind, die das
			Bild hervorruft.
		</p>
	{:else if step === 3}
		<b>Bereit? Drücke Enter um das Experiment zu starten.</b>
	{/if}
</div>

<svelte:window on:keydown|preventDefault={onKeyDown} />
