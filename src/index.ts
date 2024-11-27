// index.ts
import { ApiResponse, StationItem } from '../types/apiRes';
import { HelloCyclingApiStationItem } from '../types/hello-cycling';

function convertHelloCyclingToGBFS(
	data: HelloCyclingApiStationItem,
	lastUpdatedAt: number
): StationItem {
	return {
		name: data.name,
		station_id: data.id,
		num_bikes_available: data.num_bikes_now,
		num_docks_available: data.num_bikes_parkable,
		is_installed: data.isopen,
		is_renting: data.isopen,
		is_returning: data.isopen,
		last_reported: lastUpdatedAt,
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

	let data: Record<string, HelloCyclingApiStationItem>;

	try {
		const res = await fetch('https://www.hellocycling.jp/app/top/port_json?data=data');
		data = (await res.json()) as Record<string, HelloCyclingApiStationItem>;
	} catch (error) {
		return new Response('Failed to fetch data', { status: 500 });
	}

	const stationIds = {
		sfc: ['5143'],
		shonandai_west: ['7395', '11403', '5609'],
		shonandai_east: ['12189', '11908'],
	};

	const lastUpdatedAt = Math.floor(Date.now() / 1000);
	const ttl = 60;

	const filteredData = Object.fromEntries(
		Object.entries(stationIds).map(([key, ids]) => [
			key,
			ids.map((id) => convertHelloCyclingToGBFS(data[id], lastUpdatedAt)),
		])
	);

	const responseData: ApiResponse = {
		stations: filteredData as ApiResponse['stations'],
		lastUpdatedAt,
		ttl,
	};

	const response = new Response(JSON.stringify(responseData), {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `s-maxage=${ttl}`,
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
