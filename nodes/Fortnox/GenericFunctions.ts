import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

const BASE_URL = 'https://api.fortnox.se/3';

export async function fortnoxApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'fortnoxOAuth2Api', options);
}

// Fortnox's print endpoints (e.g. /invoices/{DocumentNumber}/print) return a
// raw PDF instead of JSON when the request specifies Accept: application/pdf.
export async function fortnoxApiRequestBinary(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<Buffer> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${BASE_URL}${endpoint}`,
		headers: {
			Accept: 'application/pdf',
		},
		encoding: 'arraybuffer',
	};

	return this.helpers.httpRequestWithAuthentication.call(
		this,
		'fortnoxOAuth2Api',
		options,
	) as unknown as Promise<Buffer>;
}

// Fortnox paginates list endpoints with a "page" query parameter and returns
// pagination details in the "MetaInformation" object of the response
// (e.g. "@TotalPages"). This walks every page and concatenates the given
// collection key (e.g. "Invoices").
export async function fortnoxApiRequestAllItems(
	this: IExecuteFunctions,
	collection: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	let page = 1;
	let totalPages = 1;

	do {
		const responseData = await fortnoxApiRequest.call(this, method, endpoint, body, {
			...qs,
			page,
		});

		const items = (responseData[collection] as IDataObject[]) ?? [];
		returnData.push(...items);

		const meta = responseData.MetaInformation as IDataObject | undefined;
		totalPages = (meta?.['@TotalPages'] as number) ?? 1;
		page += 1;
	} while (page <= totalPages);

	return returnData;
}
