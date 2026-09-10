using SupportPilotAI.Dtos;

namespace SupportPilotAI.Services;

public interface ITicketAIService
{
    Task<TicketAIResponseSuggestionDto> SuggestResponseAsync(string title, string description, string? category);

    Task<TicketCategorizationDto> CategorizeAsync(string title, string description, string category);
}
