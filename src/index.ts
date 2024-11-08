/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { HelloCyclingApiRes } from '../types/hello-cycling';


async function handleHelloCycling(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
	const latestRow = env.DB.prepare('SELECT * FROM hello_cycling_api_res ORDER BY fetched_at DESC LIMIT 1');
	const latest = await latestRow.all();
	// 2 minutes cache
	if (latest.results.length>0 && (latest.results[0]['fetched_at'] as number) > Date.now() - 2 * 60 * 1000) {
		return Response.json({"stations": JSON.parse(latest.results[0]['data'] as string)});
	} else {
		const res = await fetch('https://www.hellocycling.jp/app/top/port_json?data=data', {
			method: 'GET'
		});
		const data = await res.json() as Record<string, HelloCyclingApiRes>;
		const filteredData = {
			'sfc': [data['5143']],
			'shonandai_west': [data['7395'], data['11403'], data['5609']],
			'shonandai_east': [data['12189'], data['11908']]
		};
		// Save to database
		const insert = env.DB.prepare('INSERT INTO hello_cycling_api_res (fetched_at, data) VALUES (?, ?)').bind(
			Date.now(),
			JSON.stringify(filteredData)
		);
		await insert.run();
		return Response.json({ 'stations': filteredData, 'lastFetched': latest.results[0]['fetched_at'] });
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (pathname === '/api/hello-cycling') {
			return await handleHelloCycling(request, env, ctx);
		}
		return new Response('Not Found', { status: 404 });
	}
} satisfies ExportedHandler<Env>;
