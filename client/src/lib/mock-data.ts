export type TicketStatus = 'Open' | 'In Progress' | 'Waiting' | 'Resolved'
export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low'

export type Ticket = {
  id: string
  customer: string
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  owner: string
  updatedAt: string
  summary: string
  aiDraft: string
  tags: string[]
}

export type KnowledgeArticle = {
  id: string
  title: string
  category: string
  summary: string
  content: string
}

export const stats = [
  { label: 'Open', value: '18', note: '+4 today' },
  { label: 'Need review', value: '6', note: '2 critical' },
  { label: 'Resolved', value: '142', note: '92% SLA' },
  { label: 'AI drafts', value: '11', note: '7 accepted' },
]

export const tickets: Ticket[] = [
  {
    id: 'RD-1042',
    customer: 'Maya Lopez',
    subject: 'Billing mismatch on annual plan',
    category: 'Billing',
    priority: 'High',
    status: 'In Progress',
    owner: 'Ava',
    updatedAt: '2 hours ago',
    summary:
      'Customer was charged twice after upgrading to the Pro plan during renewal. They need a precise explanation and a refund confirmation.',
    aiDraft:
      'Review the billing audit trail, confirm the duplicate charge, and offer a prorated credit while documenting the customer impact.',
    tags: ['payment', 'renewal', 'refund'],
  },
  {
    id: 'RD-1089',
    customer: 'Jon Park',
    subject: 'Reset password loop after SSO change',
    category: 'Access',
    priority: 'Urgent',
    status: 'Open',
    owner: 'Unassigned',
    updatedAt: '12 minutes ago',
    summary:
      'The user is redirected to a password reset page despite successful SAML login. The issue started after the IdP attribute mapping changed.',
    aiDraft:
      'Verify the SSO callback mapping and confirm the IdP attribute for the email claim before restarting the login flow.',
    tags: ['sso', 'login', 'identity'],
  },
  {
    id: 'RD-1104',
    customer: 'Leah Chen',
    subject: 'CSV export missing line items',
    category: 'Reports',
    priority: 'Medium',
    status: 'Waiting',
    owner: 'Sam',
    updatedAt: '1 day ago',
    summary:
      'The exported file contains totals but omits freight and tax rows for multi-warehouse orders, which affects invoice reconciliation.',
    aiDraft:
      'Check the export transformation for grouped orders and include the missing columns in the CSV mapping before re-running the report.',
    tags: ['export', 'invoice', 'reporting'],
  },
  {
    id: 'RD-1121',
    customer: 'Omar Hassan',
    subject: 'Webhook retries creating duplicate tickets',
    category: 'Integrations',
    priority: 'High',
    status: 'Resolved',
    owner: 'Iris',
    updatedAt: '3 days ago',
    summary:
      'The integration posts duplicate events after a retry from a 500 response. The customer-facing workflow is creating duplicate records.',
    aiDraft:
      'Recommend idempotency checks and a retry policy with exponential backoff before sending duplicate notifications again.',
    tags: ['webhooks', 'api', 'sync'],
  },
  {
    id: 'RD-1140',
    customer: 'Nina Gomez',
    subject: 'Mobile app crashes after update',
    category: 'Mobile',
    priority: 'Urgent',
    status: 'Open',
    owner: 'Tara',
    updatedAt: '6 minutes ago',
    summary:
      'Users are experiencing a crash once the app loads the workspace dashboard after the latest release.',
    aiDraft:
      'Check the release regression around the dashboard initialization and confirm whether the crash is tied to a null response payload.',
    tags: ['mobile', 'crash', 'release'],
  },
]

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'KA-001',
    title: 'SSO configuration checklist',
    category: 'Access',
    summary: 'Validate claim mapping, role assignment, and redirect URIs before rollout.',
    content:
      'Before enabling a new SSO connection, confirm the callback URL, issuer, and the exact claim names used for email and role mapping. Test the login flow with a real user and ensure the redirect state is not lost after the identity provider returns.',
  },
  {
    id: 'KA-002',
    title: 'Refund policy for duplicate charges',
    category: 'Billing',
    summary: 'Use the billing audit trail and payment reversal flow to confirm account impact.',
    content:
      'Duplicate charges should be reviewed against the billing ledger before approval. If the customer has already received the product or service, apply the refund as a credit to the account and document the original charge ID and the resolution date.',
  },
  {
    id: 'KA-003',
    title: 'CSV export troubleshooting',
    category: 'Reports',
    summary: 'Compare raw rows against the group-by transform to catch fields dropped in serialization.',
    content:
      'When CSV exports are missing rows, confirm that the grouping transform is not dropping records with empty values. Always validate the output against the generated SQL result and compare column names before the file is sent to the customer.',
  },
]

export const recentActivity = [
  { author: 'Ava', action: 'Updated priority to High', time: '12 min ago' },
  { author: 'System', action: 'AI draft generated from ticket text', time: '24 min ago' },
  { author: 'Customer', action: 'Added follow-up: “I can share the invoice screenshot”', time: '1 hour ago' },
]

export function getTicketById(id: string) {
  return tickets.find((ticket) => ticket.id === id)
}
