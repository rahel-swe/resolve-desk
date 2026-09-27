using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class TicketAISuggestionDto
{
    public TicketPriority SuggestedPriority { get; set; }
    public string Rationale { get; set; } = string.Empty;
}
