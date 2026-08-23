import type { INodeProperties } from 'n8n-workflow';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a single customer by customer number',
				action: 'Get a customer',
			},
		],
		default: 'get',
	},
];

export const customerFields: INodeProperties[] = [
	// ----------------------------------
	//        customer: get
	// ----------------------------------
	{
		displayName: 'Customer Number',
		name: 'customerNumber',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get'],
			},
		},
		description: 'The customer number to retrieve, e.g. the CustomerNumber field on an invoice',
	},
];
