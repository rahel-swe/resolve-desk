using SupportPilotAI.Dtos;
using SupportPilotAI.Enums;

namespace SupportPilotAI.Services;

public class TicketAIService : ITicketAIService
{
    public Task<TicketAISuggestionDto> SuggestPriorityAsync(string title, string describtion, string? category)
    {
        var combinedText = $"{title} {describtion} {category}".ToLowerInvariant();

        var suggestedPriority = TicketPriority.Medium;
        var rationale = "Standard priority based on ticket content.";

        if (combinedText.Contains("urgent") || combinedText.Contains("down") || combinedText.Contains("outage") || combinedText.Contains("critical") || combinedText.Contains("blocked"))
        {
            suggestedPriority = TicketPriority.Critical;
            rationale = "Urgent language or business-impact keywords were detected.";
        }
        else if (combinedText.Contains("error") ||
                 combinedText.Contains("cannot login") ||
                 combinedText.Contains("not working") ||
                 combinedText.Contains("issue"))
        {
            suggestedPriority = TicketPriority.High;
            rationale = "The ticket describes a significant issue that likely needs fast attention.";

        }
        else if (combinedText.Contains("question") ||
                 combinedText.Contains("help") ||
                 combinedText.Contains("how to"))
        {
            suggestedPriority = TicketPriority.Low;
            rationale = "The request appears informational or low-risk.";
        }

        return Task.FromResult(new TicketAISuggestionDto
        {
            SuggestedPriority = suggestedPriority,
            Rationale = rationale
        });
    }
}
