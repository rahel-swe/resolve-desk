using SupportPilotAI.Dtos;

namespace SupportPilotAI.Services;

public class TicketAIService : ITicketAIService
{
    public Task<TicketAIResponseSuggestionDto> SuggestResponseAsync(string title, string description, string? category)
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

        return Task.FromResult(new TicketAIResponseSuggestionDto
        {
            SuggestedReply = suggestedReply,
            SuggestedSteps = suggestedSteps,
            EscalationRecommendation = escalationRecommendation
        });
    }

    public Task<TicketCategorizationDto> CategorizeAsync(string title, string description, string category)
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
            tags = new List<string> { "billing", "invoice", "refund" };
        }
        else if (combined.Contains("outage") || combined.Contains("down") || combined.Contains("server"))
        {
            department = "IT Support";
            issueType = "Service Disruption";
            tags = new List<string> { "outage", "infrastructure", "incident" };
        }

        return Task.FromResult(new TicketCategorizationDto
        {
            Department = department,
            IssueType = issueType,
            Tags = tags
        });

    }
}
