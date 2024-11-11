export interface StationInformation {
	last_updated: number;
	ttl: number;
	version: string;
	data: {
		stations: StationInfo[];
	};
}

export interface StationInfo {
	station_id: string;
	name: string;
	short_name?: string;
	lat: number;
	lon: number;
	address?: string;
	cross_street?: string;
	region_id?: string;
	post_code?: string;
	rental_methods?: string[];
	is_virtual_station?: boolean;
	station_area?: GeoJSONMultiPolygon;
	parking_type?: ParkingType;
	parking_hoop?: boolean;
	contact_phone?: string;
	capacity?: number;
	vehicle_capacity?: Record<string, number>;
	vehicle_type_capacity?: Record<string, number>;
	is_valet_station?: boolean;
	is_charging_station?: boolean;
	rental_uris?: RentalUris;
}

type ParkingType = "parking_lot" | "street_parking" | "underground_parking" | "sidewalk_parking" | "other";

interface GeoJSONMultiPolygon {
	type: "MultiPolygon";
	coordinates: number[][][][];
}

interface RentalUris {
	android?: string;
	ios?: string;
	web?: string;
}


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

export interface StationStatus {
	last_updated: number;
	ttl: number;
	version: string;
	data: {
		stations: Station[];
	};
}
