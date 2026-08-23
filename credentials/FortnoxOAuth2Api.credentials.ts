import type { ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

export class FortnoxOAuth2Api implements ICredentialType {
	name = 'fortnoxOAuth2Api';

	displayName = 'Fortnox OAuth2 API';

	icon: Icon = { light: 'file:fortnox.svg', dark: 'file:fortnox.dark.svg' };

	documentationUrl = 'https://www.fortnox.se/developer/authorization';

	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://apps.fortnox.se/oauth-v1/auth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://apps.fortnox.se/oauth-v1/token',
		},
		{
			// Fortnox requires the offline access type to issue a refresh token,
			// and needs the requested scopes as an auth query parameter, not just
			// on the token exchange body.
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'access_type=offline',
		},
		{
			// Fortnox scopes must match the "Behörigheter" enabled for the app in
			// the Fortnox Developer Portal ("Faktura", "Företagsinformation" and
			// "Kund"), or the token request fails with invalid_scope.
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'invoice companyinformation customer',
		},
		{
			// Fortnox expects Basic auth (base64 client_id:client_secret) on the
			// token endpoint, which is n8n's "header" option for this field.
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
