using ResolveDesk.Enums;

namespace ResolveDesk.Entities;

public class TicketHistory
{
    public int Id { get; set; }

    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public int ActorUserId { get; set; }
    public User ActorUser { get; set; } = null!;

    public TicketStatus OldStatus { get; set; }
    public TicketStatus NewStatus { get; set; }

    public DateTime CreatedAt { get; set; }
}
