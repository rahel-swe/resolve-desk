using SupportPilotAI.Dtos;

namespace SupportPilotAI.Services;

public interface ITicketAIService
{
    Task<TicketAISuggestionDto> SuggestPriorityAsync(string title, string description, string? category);

    Task<TicketAIResponseSuggestionDto> SuggestResponseAsync(string title, string description, string? category);

    Task<TicketCategorizationDto> CategorizeAsync(string title, string description, string? category);
}
