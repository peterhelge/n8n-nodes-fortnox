import type { INodeProperties } from 'n8n-workflow';

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single invoice by document number',
				action: 'Get an invoice',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many invoices',
				action: 'Get many invoices',
			},
		],
		default: 'get',
	},
];

export const invoiceFields: INodeProperties[] = [
	// ----------------------------------
	//        invoice: get
	// ----------------------------------
	{
		displayName: 'Document Number',
		name: 'documentNumber',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['get'],
			},
		},
		description: 'The document number of the invoice to retrieve',
	},

	// ----------------------------------
	//        invoice: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'options',
				default: '',
				description: 'Fortnox predefined invoice filter',
				options: [
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Fully Paid', value: 'fullypaid' },
					{ name: 'None', value: '' },
					{ name: 'Unbooked', value: 'unbooked' },
					{ name: 'Unpaid', value: 'unpaid' },
					{ name: 'Unpaid and Overdue', value: 'unpaidoverdue' },
				],
			},
			{
				displayName: 'Customer Number',
				name: 'customernumber',
				type: 'string',
				default: '',
				description: 'Only return invoices for this customer number',
			},
			{
				displayName: 'From Date',
				name: 'fromdate',
				type: 'dateTime',
				default: '',
				description: 'Only return invoices with an invoice date on or after this date',
			},
			{
				displayName: 'To Date',
				name: 'todate',
				type: 'dateTime',
				default: '',
				description: 'Only return invoices with an invoice date on or before this date',
			},
		],
	},
];
