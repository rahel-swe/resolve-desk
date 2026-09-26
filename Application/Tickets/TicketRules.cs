using ResolveDesk.Common;
using ResolveDesk.Enums;
using ResolveDesk.Models;

namespace ResolveDesk.Rules;

public class TicketRules
{
    public bool CanReadTicket(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin || caller.IsSupportAgent)
            return true;

        return caller.IsCustomer && ticket.UserId == caller.Id;
    }

    public bool CanUpdateStatus(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin)
            return true;

        return caller.IsSupportAgent &&
               ticket.AssignedAgentId == caller.Id;
    }

    public bool IsValidStatusTransition(TicketStatus current, TicketStatus next)
    {
        return current switch
        {
            TicketStatus.Open => next == TicketStatus.InProgress,
            TicketStatus.InProgress => next == TicketStatus.WaitingForCustomer || next == TicketStatus.Resolved,
            TicketStatus.WaitingForCustomer => next == TicketStatus.InProgress,
            TicketStatus.Resolved => next == TicketStatus.Closed || next == TicketStatus.InProgress,
            TicketStatus.Closed => false,
            _ => false
        };
    }

    public bool CanAssignTicket(Ticket ticket, CurrentUser caller, int agentId)
    {
        if (caller.IsAdmin) return true;

        return caller.IsSupportAgent && ticket.AssignedAgentId is null && agentId == caller.Id;
    }
}
