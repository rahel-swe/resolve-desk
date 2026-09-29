using ResolveDesk.Api.Common;
using ResolveDesk.Application.Dtos;

namespace ResolveDesk.Application.Services;

public interface ITicketAIService
{
    Task<ServiceResult<TicketAISuggestionDto>> SuggestPriorityAsync(string title, string description, string? category);

    Task<ServiceResult<TicketAIResponseSuggestionDto>> SuggestResponseAsync(string title, string description, string? category);

    Task<ServiceResult<TicketCategorizationDto>> CategorizeAsync(string title, string description, string? category);
}
