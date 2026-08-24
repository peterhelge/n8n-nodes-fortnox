# n8n-nodes-fortnox

This is an n8n community node for [Fortnox](https://www.fortnox.se), the Swedish accounting and invoicing platform. It lets you use n8n to automate work against the Fortnox REST API.

n8n is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Usage](#usage) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In short, in your n8n instance go to **Settings > Community Nodes**, select **Install**, and enter `@peterhelge/n8n-nodes-fortnox`.

## Credentials

This node authenticates using **Fortnox OAuth2 API** credentials, implemented on top of n8n's generic OAuth2 credential type.

You need a Fortnox Developer account and an app registered in the [Fortnox Developer Portal](https://www.fortnox.se/developer):

1. Log in to the [Fortnox Developer Portal](https://www.fortnox.se/developer) and create a new app.
2. Set the app's **Redirect URI** to the callback URL n8n shows you when creating the credential (typically `https://<your-n8n-host>/rest/oauth2-credential/callback`).
3. Note the app's **Client ID** and **Client Secret**.
4. In n8n, create a new credential of type **Fortnox OAuth2 API** and enter the Client ID and Client Secret.
5. Click **Connect my account** and complete the Fortnox login/consent flow.

Notes on how the credential is wired up, in case you need to troubleshoot:

- Fortnox uses the standard OAuth2 **Authorization Code** flow. The authorization URL and token URL are pre-filled and hidden in the credential (`https://apps.fortnox.se/oauth-v1/auth` and `https://apps.fortnox.se/oauth-v1/token`).
- The scope is fixed to `invoice companyinformation customer`. Each one must be enabled as a permission ("Faktura", "Företagsinformation" and "Kund" under "Behörigheter") on your app in the Fortnox Developer Portal, or the OAuth flow fails with `invalid_scope`. If you extend this node to cover more resources, you'll need to add both the scope here and the matching permission on the app (and re-authorize the credential).
- The credential sends `access_type=offline` on the authorization request, which is required by Fortnox to issue a refresh token.
- Fortnox's access tokens are valid for 1 hour, and refresh tokens for 45 days. Refresh tokens are **rotated on every use** — n8n's OAuth2 credential handles this automatically, but if you ever request a token manually outside n8n with the same credential, you can invalidate n8n's stored refresh token.

## Operations

### Customer

- **Get** — Retrieve a single customer by customer number (e.g. the `CustomerNumber` field on an invoice), including contact details such as address, email and phone.

### Invoice

- **Get** — Retrieve a single invoice by its Fortnox document number.
- **Get Many** — List invoices, with optional filters:
  - **Filter**: one of Fortnox's predefined filters (`unpaid`, `unpaidoverdue`, `fullypaid`, `cancelled`, `unbooked`).
  - **Customer Number**, **From Date**, **To Date**.
  - **Return All** or a **Limit** on the number of results.
- **Get PDF** — Download an invoice as a PDF file (binary output), using Fortnox's print endpoint.

## Usage

A minimal workflow:

1. Add a **Fortnox** node.
2. Select credentials of type **Fortnox OAuth2 API**.
3. Resource: **Invoice**, Operation: **Get Many**, Filter: **Unpaid**.
4. Run the node to list all unpaid invoices.

To fetch one specific invoice, set Operation to **Get** and enter its **Document Number** (the value in Fortnox's `DocumentNumber` field, e.g. `204`).

To get the customer's contact details for an invoice, take the invoice's `CustomerNumber` field and feed it into a second **Fortnox** node with Resource: **Customer**, Operation: **Get**.

To download an invoice as a PDF (e.g. to attach to an email), set Operation to **Get PDF** and enter its **Document Number**. The output item carries the PDF as binary data under the `data` key.

If you're new to n8n, see the [Try it out](https://docs.n8n.io/try-it-out/) guide to get a workflow running end to end.

## Compatibility

Built and tested against n8n's current community node API (`n8nNodesApiVersion: 1`). Requires Node.js 20+ (matching current n8n runtime requirements).

## Known limitations / things to verify

This is a first (v1) release, scoped deliberately small. A few things depend on details of the live Fortnox API that should be double-checked against your own Fortnox account before relying on this in production:

- **Pagination** assumes Fortnox's list responses include a `MetaInformation.@TotalPages` field. This matches Fortnox's documented pagination pattern, but hasn't been verified against a live response with more than one page of invoices.
- **Scopes**: the credential requests `invoice companyinformation customer`. Each must be enabled as a permission ("Faktura", "Företagsinformation" and "Kund" under "Behörigheter") on your app in the Fortnox Developer Portal, or authorization will fail with `invalid_scope`.
- Only the fields documented by Fortnox as stable filters are exposed (`filter`, `customernumber`, `fromdate`, `todate`). Fortnox's API has more query parameters (e.g. account range, cost center) that could be added later.
- **Get PDF** assumes Fortnox's `/invoices/{DocumentNumber}/print` endpoint returns a raw PDF when the request sends `Accept: application/pdf` (Fortnox's documented convention for print endpoints across resources). This hasn't been confirmed against a live response — verify the downloaded file actually opens as a valid PDF before relying on it.

## Roadmap (not in this release)

Ideas for a v2, intentionally left out to keep v1 small and finished:

- **Polling trigger** for new/updated invoices (using Fortnox's `lastmodified` filter or a webhook where available).
- More resources: **Payments**, **Vouchers/Articles**.
- Get Many / Create / Update operations for Customers (this release is read-only, single-record).
- Create/Update operations for Invoices (this release is read-only).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Fortnox Developer Portal](https://www.fortnox.se/developer)
- [Fortnox API reference](https://apps.fortnox.se/apidocs)

## License

[MIT](LICENSE.md)
