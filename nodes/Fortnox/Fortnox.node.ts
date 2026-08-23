import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { customerFields, customerOperations } from './descriptions/CustomerDescription';
import { invoiceFields, invoiceOperations } from './descriptions/InvoiceDescription';
import { fortnoxApiRequest, fortnoxApiRequestAllItems } from './GenericFunctions';

export class Fortnox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fortnox',
		name: 'fortnox',
		icon: { light: 'file:fortnox.svg', dark: 'file:fortnox.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Fortnox accounting/invoicing API',
		defaults: {
			name: 'Fortnox',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'fortnoxOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Invoice',
						value: 'invoice',
					},
				],
				default: 'invoice',
			},
			...customerOperations,
			...customerFields,
			...invoiceOperations,
			...invoiceFields,
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] = {};

				if (resource === 'customer') {
					if (operation === 'get') {
						const customerNumber = this.getNodeParameter('customerNumber', i) as string;

						const response = await fortnoxApiRequest.call(
							this,
							'GET',
							`/customers/${encodeURIComponent(customerNumber)}`,
						);
						responseData = response.Customer as IDataObject;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for resource "customer"`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'invoice') {
					if (operation === 'get') {
						const documentNumber = this.getNodeParameter('documentNumber', i) as string;

						const response = await fortnoxApiRequest.call(
							this,
							'GET',
							`/invoices/${encodeURIComponent(documentNumber)}`,
						);
						responseData = response.Invoice as IDataObject;
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const qs: IDataObject = {};
						if (filters.filter) {
							qs.filter = filters.filter;
						}
						if (filters.customernumber) {
							qs.customernumber = filters.customernumber;
						}
						if (filters.fromdate) {
							qs.fromdate = (filters.fromdate as string).split('T')[0];
						}
						if (filters.todate) {
							qs.todate = (filters.todate as string).split('T')[0];
						}

						if (returnAll) {
							responseData = await fortnoxApiRequestAllItems.call(
								this,
								'Invoices',
								'GET',
								'/invoices',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;

							const response = await fortnoxApiRequest.call(this, 'GET', '/invoices', {}, qs);
							responseData = ((response.Invoices as IDataObject[]) ?? []).slice(0, limit);
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for resource "invoice"`,
							{ itemIndex: i },
						);
					}
				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
