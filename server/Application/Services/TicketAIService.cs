using ResolveDesk.Api.Common;
using ResolveDesk.Application.Dtos;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Services;

public class TicketAIService : ITicketAIService
{
    public async Task<ServiceResult<TicketAISuggestionDto>> SuggestPriorityAsync(string title, string description, string? category)
    {
        var combined = $"{title} {description} {category}".ToLowerInvariant();

        var suggestedPriority = TicketPriority.Medium;
        var rationale = "Standard priority based on ticket content.";

        if (combined.Contains("urgent") || combined.Contains("critical") || combined.Contains("outage") || combined.Contains("down") || combined.Contains("blocked"))
        {
            suggestedPriority = TicketPriority.Critical;
            rationale = "Urgent language or business-impact keywords were detected.";
        }
        else if (combined.Contains("error") ||
                 combined.Contains("cannot login") ||
                 combined.Contains("not working") ||
                 combined.Contains("issue") ||
                 combined.Contains("failed"))
        {
            suggestedPriority = TicketPriority.High;
            rationale = "The ticket describes a significant issue that likely needs fast attention.";
        }
        else if (combined.Contains("question") || combined.Contains("help") || combined.Contains("how to"))
        {
            suggestedPriority = TicketPriority.Low;
            rationale = "The request appears informational or low-risk.";
        }

        var responseDto = new TicketAISuggestionDto
        {
            SuggestedPriority = suggestedPriority,
            Rationale = rationale
        };

        return new ServiceResult<TicketAISuggestionDto>(responseDto);
    }

    public async Task<ServiceResult<TicketAIResponseSuggestionDto>> SuggestResponseAsync(string title, string description, string? category)
    {
        var combined = $"{title} {description} {category}".ToLowerInvariant();

        var suggestedReply = "Thanks for reporting this. We are reviewing it and will update you shortly.";
        var suggestedSteps = new[] { "Collect more details if needed.", "Verify the issue is reproducible.", "Share next steps with the customer." };
        var escalationRecommendation = "No escalation needed yet; continue normal triage.";

        if (combined.Contains("login") || combined.Contains("cannot login"))
        {
            suggestedReply = "Thanks for reporting the login issue. Please verify your credentials and retry. If the issue persists, we will help you troubleshoot further.";

            suggestedSteps =
            [
                "Confirm the account is active.",
                "Clear browser cache or retry in a different browser.",
                "Check whether the issue affects one user or multiple users."
            ];

            escalationRecommendation = "Escalate to the identity or authentication team if multiple users are impacted.";
        }
        else if (combined.Contains("outage") || combined.Contains("down"))
        {
            suggestedReply = "We are aware of the outage and are actively investigating. Please share any impact details to help us confirm scope.";
            suggestedSteps =
            [
                "Confirm the affected systems and users.",
                "Collect timestamps and error messages.",
                "Monitor for any related incidents."
            ];
            escalationRecommendation = "Escalate to the incident response team immediately.";
        }

        var resposeDto = new TicketAIResponseSuggestionDto
        {
            SuggestedReply = suggestedReply,
            SuggestedSteps = suggestedSteps,
            EscalationRecommendation = escalationRecommendation
        };

        return new ServiceResult<TicketAIResponseSuggestionDto>(resposeDto);
    }

    public async Task<ServiceResult<TicketCategorizationDto>> CategorizeAsync(string title, string description, string? category)
    {
        var combined = $"{title} {description} {category}".ToLowerInvariant();

        var department = "General";
        var issueType = "General Inquiry";
        var tags = new List<string>();

        if (combined.Contains("login") || combined.Contains("password") || combined.Contains("access"))
        {
            department = "IT Support";
            issueType = "Authentication Issue";
            tags = ["login", "access", "credentials"];
        }
        else if (combined.Contains("invoice") || combined.Contains("billing") || combined.Contains("refund"))
        {
            department = "Finance";
            issueType = "Billing Request";
            tags = ["billing", "invoice", "refund"];
        }
        else if (combined.Contains("outage") || combined.Contains("down") || combined.Contains("server"))
        {
            department = "IT Support";
            issueType = "Service Disruption";
            tags = ["outage", "infrastructure", "incident"];
        }

        var categorizeDto = new TicketCategorizationDto
        {
            Department = department,
            IssueType = issueType,
            Tags = tags
        };

        return new ServiceResult<TicketCategorizationDto>(categorizeDto);
    }
}
