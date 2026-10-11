# Client service verification

Verified on October 11, 2026 against the local client on port 3000 and API on port 5051.

## Results

- Client contract and component suite: 54 tests across 8 files passed.
- Live client service suite: 14 tests passed against the restarted API.
- TypeScript `tsc --noEmit`: passed.
- ESLint on the changed client code and added tests: passed.
- Seed initial successful run: 6 accounts and 72 tickets added.
- Seed repeat: 0 accounts and 0 tickets added; existing data preserved.
- Browser checks: seeded customer and agent workflows, administrator article publishing, and sign-out/sign-in passed.

No server test suite or production frontend build was run. The server was compiled by the seed command; its only changes are the explicit seed entry point and the approved article author relationship fix. Existing test dependencies were reused.

## Coverage

| Client service or behavior    | Contract/component checks                                                                                                  | Live checks                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Login and profile             | Supported roles, DTO mapping, numeric user ID                                                                              | All 6 seed accounts and their roles                                                            |
| Registration                  | Registration response without refresh token obtains a sign-in session                                                      | New Customer, renewable session, profile                                                       |
| Logout                        | Server success/error clears local session; no-token local logout                                                           | Refresh token revoked after logout                                                             |
| API transport                 | Envelopes, raw responses, empty 204, failed 200, ProblemDetails, text failures, headers, network failures                  | Real service responses and permission errors                                                   |
| Refresh                       | Concurrent expired requests share one refresh, bounded retry, sign-out/account-switch races, 403 preserves session         | Invalid access token refreshes, rotates refresh token, retries profile                         |
| Stored identity/provider      | Corrupt storage recovers; token rotation preserves resolved user ID; stale profile cannot restore sign-out                 | Agent self-assignment uses resolved profile                                                    |
| Ticket list                   | 123 tickets over 3 backend pages; later-page failure rejects partial data; cancellation; empty queue                       | All 72 marked seed records, unique IDs, sorted dates                                           |
| Visible pagination            | All 8 pages of 72 records, final 2, boundaries, previous; search/scope/status reset page; clear filters and empty state    | Browser customer queue pages 1–4, final 10 and disabled next                                   |
| Ticket read/create            | Method, path, auth headers, request/response DTO                                                                           | Create/read owned request; unrelated customer cannot read                                      |
| Comment read/create           | Empty POST response then reload; trim, draft clear on success, draft retained on failure, minimum and max 1,000 characters | Post/read exactly once; invalid/unauthorized posts fail; browser comment survives reload       |
| Assignment                    | PATCH payload and response                                                                                                 | Agent self-assigns, unassigned/other-agent updates rejected, Admin assigns                     |
| Status/history                | PATCH payload, history DTO                                                                                                 | Open → In Progress → Resolved, actors and history persisted; browser history shows transition  |
| Priority/response suggestions | Both POST contracts and returned fields                                                                                    | Real suggestions; browser applies and posts response draft                                     |
| Knowledge list/create         | GET/POST payload, tags and DTO                                                                                             | Admin creates/reads; agent write forbidden without logout; browser reader shows correct author |

## Fixes discovered by verification

1. Parallel expired requests rotated the same refresh token independently. Requests now share one refresh and reuse a rotation completed before a slower 401 arrives. In-flight refresh results cannot restore a signed-out session or replace a newly signed-in account.
2. Registration returned an access token with an empty refresh token. The client now completes sign-in to obtain a renewable session.
3. Session synchronization reset a known profile ID to zero after refresh, disabling agent self-assignment. It now retains the resolved ID for the same identity; late profile responses are ignored after sign-out.
4. Stored identity JSON could crash session restoration. Malformed identities are discarded safely.
5. Comment input did not enforce the backend's 1,000-character maximum. The input and submit validation now match the DTO.
6. Article creation set `CreatedByUserId` but left the required `User` relationship unset, causing HTTP 500. The approved repository fix loads the existing author before saving. Publishing now succeeds without a migration.
7. Manually imported IDs left the knowledge identity sequence behind existing rows. The explicit seed advances relevant identity sequences under write locks before inserting samples, preserving rows and sequence progress.

## Browser evidence

The browser created ticket #93 (`[ResolveDesk browser smoke] Login assistance`), assigned it to the seed agent, changed it to In Progress, displayed history, and posted the suggested response. It also posted a customer comment to seed ticket #53 and verified it after reload. The administrator published `[ResolveDesk browser smoke] Guide`; the reader displayed `seed.admin@example.test` as author.

Screenshots are saved outside the repository in the task's visualization folder:

- `client-smoke-pagination.jpg`
- `client-smoke-comment.jpg`
- `client-smoke-agent.jpg`
- `client-smoke-knowledge.jpg`

## Limits

Pagination currently downloads the permitted queue in backend batches of 50, then shows 10 items per UI page. The tests validate that contract; they do not establish performance for very large queues or a consistent snapshot while another writer changes page ordering.

Live checks add marked development records and never delete existing content. The seed refuses migrations and identity collisions; its row writes are transactional, but identity sequence progress is not rolled back. API/backend permissions were exercised through the client; this is not a comprehensive backend security audit. Placeholder product screens remain outside the service coverage above.
