using ResolveDesk.Common;
using ResolveDesk.Dtos;

namespace ResolveDesk.Services;

public interface ITicketService
{
    Task<ServiceResult<TicketResponseDto>> CreateTicketAsync(CreateTicketDto request, int userId);
    Task<ServiceResult<PageResultDto<TicketResponseDto>>> GetAllTicketsAsync(TicketListQueryDto query, CurrentUser caller, CancellationToken cancellationToken);
    Task<ServiceResult<PageResultDto<TicketResponseDto>>> GetUserTicketsAsync(TicketListQueryDto query, int userId, CurrentUser caller, CancellationToken cancellationToken);
    Task<ServiceResult<TicketResponseDto?>> GetTicketByIdAsync(int id, CurrentUser caller, CancellationToken cancellationToken);
    Task<ServiceResult<TicketResponseDto?>> UpdateTicketStatusAsync(int id, UpdateTicketStatusDto request, CurrentUser caller, CancellationToken cancellationToken);

    Task<ServiceResult<List<TicketHistoryResponseDto>>> GetHistoryByTicketIdAsync(int ticketId, CurrentUser caller, CancellationToken cancellationToken);

    Task<ServiceResult<TicketResponseDto?>> AssignTicketAsync(int id, AssignTicketDto request, CurrentUser caller, CancellationToken cancellationToken);
}
