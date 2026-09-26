using ResolveDesk.Common;
using ResolveDesk.Dtos;

namespace ResolveDesk.Services;

public interface ITicketCommentService
{
    Task AddTicketCommentAsync(int userId, int ticketId, CreateTicketCommentDto request, CurrentUser caller, CancellationToken cancellationToken);

    Task<List<TicketCommentResponseDto>> GetTicketCommentsAsync(int ticketId, CurrentUser caller, CancellationToken cancellationToken);

    Task<TicketCommentResponseDto?> GetCommentByIdAsync(int ticketId, int commentId, CurrentUser caller, CancellationToken cancellationToken);
}
