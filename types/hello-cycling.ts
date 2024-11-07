interface Bike {
	basket: string;
	category: string;
	code: string;
	day_price: string | null;
	half_day_price: string;
	hatsunori_flg: string;
	hatsunori_price: string;
	hour_price: string | null;
	icon_path: string;
	key_type: string;
	size: string;
	unit_price: string;
	url: string;
}

export interface HelloCyclingApiRes {
	address: string;
	battery_flag: boolean | null;
	bike_list: Record<string, Bike> | [];  // Allows for an object of bikes or an empty array
	business_hour: string;
	category_icon: string | null;
	company: string;
	company_icon: string;
	description: string;
	description_title: string;
	external_url: string;
	icon: string;
	icon_posi_h: number;
	icon_posi_w: number;
	icon_size_h: number;
	icon_size_w: number;
	id: string;
	isopen: boolean;
	lat: string;
	lng: string;
	modal_type: number;
	name: string;
	num_bikes_limit: number;
	num_bikes_now: number;
	num_bikes_parkable: number;
	num_bikes_rentalable: number;
	port: string;
	port_admin_url: string;
	port_company_id: string;
	port_icon_path: string;
	port_name: string;
	port_photo_path: string;
	possible: string;
	site_url: string;
	tel: string;
	type: string;
}
