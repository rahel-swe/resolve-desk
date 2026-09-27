using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class TicketListQueryDto
{
    public TicketStatus? Status { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
