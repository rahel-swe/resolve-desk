using SupportPilotAI.Dtos;

namespace SupportPilotAI.Services;

public interface ITicketAIService
{
    Task<TicketAISuggestionDto> SuggestPriorityAsync(string title, string description, string? category);
}
