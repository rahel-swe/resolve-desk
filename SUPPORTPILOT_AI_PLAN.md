# SupportPilot AI Project Plan

## 1. Project Vision

Build an AI Knowledge Desk / AI Support Portal that helps teams manage support requests, automate triage, generate suggested responses, and turn resolved tickets into a reusable knowledge base.

This project is designed to showcase:
- backend API development
- authentication and authorization
- layered architecture
- database design
- AI-assisted workflows
- automation and workflow thinking

---

## 2. Why This Project Fits Your Career Goal

This project aligns with:
- full-stack development
- backend architecture
- AI product thinking
- automation workflows
- enterprise software design

It is more realistic and portfolio-friendly than a pizza API because it demonstrates a real business use case:
- support ticket management
- AI classification
- AI response drafting
- agent resolution workflow
- knowledge reuse

---

## 3. Target Business Domain

### Core idea
Employees or customers submit issues. The system uses AI to:
- detect the issue category
- predict priority
- suggest a response draft
- route the ticket to the right team or agent

A support agent reviews the AI suggestion, resolves the issue, and closes the ticket. Solved issues become knowledge articles that are reusable later.

---

## 4. Main Roles

- Admin
  - manage users and roles
  - configure automation rules
  - review analytics
- SupportAgent
  - view assigned tickets
  - resolve issues
  - update ticket status
- KnowledgeManager
  - create and update knowledge articles
  - curate content quality
- User
  - submit tickets
  - view ticket history
  - read articles

---

## 5. Core Modules

### A. Authentication and Authorization
- login
- registration
- JWT auth
- refresh tokens
- role-based authorization
- policies for admin and support work

### B. Ticketing System
- create ticket
- assign ticket
- update status
- add comments
- close or resolve ticket
- track history

### C. AI Triage Engine
- categorize ticket by department or issue type
- assign priority
- estimate severity
- generate draft reply
- generate suggested solution steps

### D. Knowledge Base
- create article from resolved ticket
- tag article by category
- search and filter by keyword
- article rating or feedback

### E. Automation Layer
- auto-assign ticket to team or agent
- SLA alerting
- escalation rules
- workflow reminders
- knowledge article suggestions

### F. Analytics Dashboard
- active tickets
- resolved count
- average response time
- common issue types
- SLA violations

---

## 6. High-Value Features to Build

### Must-have Features
- user authentication
- role-based access
- ticket creation and update
- AI priority suggestion
- AI response suggestion
- support-agent resolution workflow
- knowledge article creation from resolved tickets
- ticket assignment and status tracking

### Nice-to-have Features
- file attachments
- dashboard metrics
- email notifications
- AI knowledge search
- escalation actions
- audit logs

---

## 7. AI Features to Prioritize

### Feature 1: AI Priority Suggestion
Input:
- ticket title
- ticket description
- customer urgency

Output:
- Low / Medium / High / Critical
- rationale summary

### Feature 2: AI Response Draft
Input:
- ticket content
- category
- customer metadata

Output:
- suggested first reply
- short workaround steps
- escalation recommendation

### Feature 3: AI Ticket Categorization
Input:
- ticket text

Output:
- department
- issue type
- tags

### Feature 4: Knowledge Recommendation
Input:
- new ticket

Output:
- suggested relevant articles
- suggested known issues

---

## 8. Automation Ideas

### Ticket automation
- if priority is Critical, auto-assign to senior support
- if category is IT, route to tech support team
- if complaint contains urgent language, escalate to manager

### Resolution automation
- if a similar ticket has a known solution, suggest an article
- if issue is repetitive, create an automated standard response

### Knowledge automation
- when a ticket is resolved, create a summary article automatically
- suggest article updates based on recurring tickets

---

## 9. Project Architecture

Use the same layered structure we already practiced:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Suggested layers
- Controllers: `TicketController`, `KnowledgeArticleController`, `DashboardController`
- Services: `ITicketService`, `TicketService`, `ITicketAIService`, `TicketAIService`
- Repositories: `ITicketRepository`, `IKnowledgeArticleRepository`
- Data: `AppDbContext`
- Models: `User`, `Ticket`, `TicketComment`, `KnowledgeArticle`

---

## 10. Initial Domain Model Ideas

### User
- Id
- FullName
- Email
- PasswordHash
- Role

### Ticket
- Id
- Title
- Description
- Category
- Priority
- Status
- CreatedAt
- UpdatedAt
- UserId
- AssignedAgentId

### TicketComment
- Id
- Message
- CreatedAt
- TicketId
- UserId

### KnowledgeArticle
- Id
- Title
- Content
- Category
- Tags
- CreatedAt
- UpdatedAt
- CreatedByUserId

### AIRecommendation
- Id
- TicketId
- SuggestedPriority
- SuggestedCategory
- SuggestedResponse
- ConfidenceScore
- CreatedAt

---

## 11. Sprint-Based Roadmap

### Sprint 1: Foundation
- auth and role system
- user model
- ticket model and CRUD
- ticket status and assignment
- ticket comments

### Sprint 2: AI Triage
- AI suggestion service
- priority prediction
- category detection
- response draft generation
- endpoint for AI suggestions

### Sprint 3: Knowledge Base
- article model
- article CRUD
- article search
- article recommendation from ticket

### Sprint 4: Automation
- SLA logic
- escalation rules
- auto assignment
- notification reminders

### Sprint 5: Dashboard and Polish
- analytics dashboard
- document file support
- better validation
- audit logging
- production-ready exception handling

---

## 12. Suggested API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Tickets
- `GET /api/tickets`
- `GET /api/tickets/{id}`
- `POST /api/tickets`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/comments`
- `POST /api/tickets/{id}/ai-triage`
- `PATCH /api/tickets/{id}/resolve`

### Knowledge Base
- `GET /api/knowledge`
- `GET /api/knowledge/{id}`
- `POST /api/knowledge`
- `PUT /api/knowledge/{id}`

### Dashboard
- `GET /api/dashboard/summary`

---

## 13. Minimal Success Criteria

By the end of this project, you should be able to say:

- I built a real layered .NET API
- I implemented JWT auth and role-based access
- I used a production-style domain model
- I added AI features that assist business workflow
- I implemented automation logic for support operations
- I created a project that feels like a real product

---

## 14. Recommended Project Name

- InsightDesk
- SupportAI
- InsightFlow
- HelpdeskAI

My recommendation: `InsightDesk`

---

## 15. Final Recommendation

Start with this exact first milestone:

### Milestone 1: Support Ticket System with AI Triage

Focus on:
- user auth
- ticket CRUD
- ticket assignment
- AI priority suggestion
- AI response suggestion
- support-agent resolution

Once that works, add:
- knowledge base
- automation rules
- analytics dashboard

This is the best route for your long-term plan because it combines:
- software engineering
- automation
- AI
- real product thinking
