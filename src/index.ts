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
import { StationInfo, StationInformation, StationStatus } from '../types/gbfs';
import { StationItem } from '../types/apiRes';


async function handleHelloCycling(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
	const stationIds = ['5143', '7395', '11403', '5609', '12189', '11908'];
	const stationIdsSet = new Set(stationIds);

	// Fetch both resources in parallel
	const [stationInfoRes, stationStatusRes] = await Promise.all([
		fetch('https://api-public.odpt.org/api/v4/gbfs/hellocycling/station_information.json'),
		fetch('https://api-public.odpt.org/api/v4/gbfs/hellocycling/station_status.json')
	]);

	// Parse JSON responses in parallel
	// noinspection ES6MissingAwait
	const [stationInfoData, stationStatusData] = await Promise.all([
		stationInfoRes.json() as Promise<StationInformation>,
		stationStatusRes.json() as Promise<StationStatus>
	]);

	// Create a map of station_id to StationInfo
	const stationInfoMap = new Map<string, StationInfo>();
	for (const station of stationInfoData.data.stations) {
		if (stationIdsSet.has(station.station_id)) {
			stationInfoMap.set(station.station_id, station);
		}
	}

	// Create a map of station_id to StationStatus with name added
	const filteredStationStatus: Record<string, StationItem> = {};
	for (const station of stationStatusData.data.stations) {
		if (stationIdsSet.has(station.station_id)) {
			const stationInfo = stationInfoMap.get(station.station_id);
			if (stationInfo) {
				filteredStationStatus[station.station_id] = { ...station, name: stationInfo.name };
			}
		}
	}

	// Group stations into categories
	const filteredData = {
		'sfc': [filteredStationStatus['5143']],
		'shonandai_west': [
			filteredStationStatus['7395'],
			filteredStationStatus['11403'],
			filteredStationStatus['5609']
		],
		'shonandai_east': [
			filteredStationStatus['12189'],
			filteredStationStatus['11908']
		]
	};

	return Response.json({ 'stations': filteredData, 'lastUpdatedAt': stationStatusData.last_updated });
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
