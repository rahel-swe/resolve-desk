using ResolveDesk.Common;
using ResolveDesk.Dtos;
using ResolveDesk.Models;

namespace ResolveDesk.Services;

public interface ITicketCommentService
{
    Task AddTicketCommentAsync(int userId, int ticketId, CreateTicketCommentDto request, CurrentUser caller);

    Task<List<TicketCommentResponseDto>> GetTicketCommentsAsync(int ticketId, CurrentUser caller);

    Task<TicketCommentResponseDto?> GetCommentByIdAsync(int ticketId, int commentId, CurrentUser caller);
}
