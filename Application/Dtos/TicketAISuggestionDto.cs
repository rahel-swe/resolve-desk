using ResolveDesk.Enums;

namespace ResolveDesk.Dtos;

public class TicketAISuggestionDto
{
    public TicketPriority SuggestedPriority { get; set; }
    public string Rationale { get; set; } = string.Empty;
}
