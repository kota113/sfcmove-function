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
import { ApiResponse, StationItem } from '../types/apiRes';
import { HelloCyclingApiStationItem } from '../types/hello-cycling';

async function convertHelloCyclingToGBFS(data: HelloCyclingApiStationItem): Promise<StationItem> {
	return {
		name: data.name,
		station_id: data.id,
		num_bikes_available: data.num_bikes_now,
		num_docks_available: data.num_bikes_parkable,
		is_installed: data.isopen,
		is_renting: data.isopen,
		is_returning: data.isopen,
		last_reported: Date.now()/1000,
	};
}

async function handleHelloCycling(
	request: Request,
	_env: Env,
	_ctx: ExecutionContext
): Promise<Response> {
	const cache = caches.default;
	const cacheKey = request;
	const cachedResponse = await cache.match(cacheKey);

	if (cachedResponse) {
		return cachedResponse;
	}

	const res = await fetch('https://www.hellocycling.jp/app/top/port_json?data=data', {
		method: 'GET'
	});
	const data = await res.json() as Record<string, HelloCyclingApiStationItem>;
	const filteredData = {
		'sfc': await Promise.all([data['5143']].map(convertHelloCyclingToGBFS)),
		'shonandai_west': await Promise.all([data['7395'], data['11403'], data['5609']].map(convertHelloCyclingToGBFS)),
		'shonandai_east': await Promise.all([data['12189'], data['11908']].map(convertHelloCyclingToGBFS))
	};



	const lastUpdatedAt = Date.now()/1000;
	const ttl = 60;

	const responseData: ApiResponse = {
		stations: filteredData,
		lastUpdatedAt,
		ttl,
	};

	const response = new Response(JSON.stringify(responseData), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `max-age=${ttl}`,
		},
	});

	_ctx.waitUntil(cache.put(cacheKey, response.clone()));

	return response;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const { pathname } = new URL(request.url);
		if (pathname === '/api/hello-cycling') {
			return handleHelloCycling(request, env, ctx);
		}
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
