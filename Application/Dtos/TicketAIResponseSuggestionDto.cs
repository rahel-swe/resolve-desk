namespace ResolveDesk.Dtos;

public class TicketAIResponseSuggestionDto
{
    public string SuggestedReply { get; set; } = string.Empty;
    public string[] SuggestedSteps { get; set; } = [];
    public string EscalationRecommendation { get; set; } = string.Empty;
}
