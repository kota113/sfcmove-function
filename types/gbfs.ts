export interface Station {
	station_id: string;
	num_bikes_available: number;
	vehicle_types_available?: VehicleTypeAvailability[];
	num_bikes_disabled?: number;
	num_docks_available?: number;
	vehicle_docks_available?: VehicleDockAvailability[];
	num_docks_disabled?: number;
	is_installed: boolean;
	is_renting: boolean;
	is_returning: boolean;
	last_reported: number;
}

interface VehicleTypeAvailability {
	vehicle_type_id: string;
	count: number;
}

interface VehicleDockAvailability {
	vehicle_type_ids: string[];
	count: number;
}

export interface GbfsApiResponse {
	last_updated: number;
	ttl: number;
	version: string;
	data: {
		stations: Station[];
	};
}
