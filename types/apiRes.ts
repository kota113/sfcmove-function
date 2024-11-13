import { Station } from './gbfs';

export interface StationItem extends Station {
	name: string;
}

export interface ApiResponse {
	stations: {
		sfc: StationItem[];
		shonandai_west: StationItem[];
		shonandai_east: StationItem[];
	};
	lastUpdatedAt: number;
	ttl: number;
}
