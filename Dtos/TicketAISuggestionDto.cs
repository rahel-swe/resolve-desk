using SupportPilotAI.Enums;

namespace SupportPilotAI.Dtos;

public class TicketAISuggestionDto
{
    public TicketPriority SuggestedPriority { get; set; }
    public string Rationale { get; set; } = string.Empty;
}
