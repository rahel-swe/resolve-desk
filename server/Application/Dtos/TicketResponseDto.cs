using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class TicketResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedByFullName { get; set; } = string.Empty;
    public int? AssignedStaffId { get; set; }
    public string? AssignedStaffFullName { get; set; }

    public TicketAllowedActions AllowedActions { get; set; } = new(false, false, []);

}


public sealed record TicketAllowedActions(bool CanAssignSelf, bool CanUpdateStatus, TicketStatus[] AllowedStatuses);