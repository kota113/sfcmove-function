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
import { GbfsApiResponse, Station } from '../types/gbfs';


async function handleHelloCycling(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
	const res = await fetch('https://api-public.odpt.org/api/v4/gbfs/hellocycling/station_status.json', {
		method: 'GET'
	});
	const data = await res.json() as GbfsApiResponse;
	const stations = data.data.stations;
	const filteredStations = stations.reduce((acc, station) => {
		if (['5143', '7395', '11403', '5609', '12189', '11908'].includes(station.station_id)) {
			acc[station.station_id] = station;
		}
		return acc;
	}, {} as Record<string, Station>);
	const filteredData = {
		'sfc': [filteredStations['5143']],
		'shonandai_west': [filteredStations['7395'], filteredStations['11403'], filteredStations['5609']],
		'shonandai_east': [filteredStations['12189'], filteredStations['11908']]
	};
	return Response.json({ 'stations': filteredData, 'lastUpdatedAt': data.last_updated });
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
