using ResolveDesk.Application.Common;
using ResolveDesk.Domain.Enums;
using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Tickets;

public class TicketRules
{
    public bool CanReadTicket(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin || caller.IsStaff)
            return true;

        return caller.IsCustomer && ticket.UserId == caller.Id;
    }

    public bool CanUpdateStatus(Ticket ticket, CurrentUser caller)
    {
        if (caller.IsAdmin)
            return true;

        return caller.IsStaff &&
               ticket.AssignedStaffId == caller.Id;
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

    public bool CanAssignTicket(Ticket ticket, CurrentUser caller, int staffId)
    {
        var isActive = ticket.Status is TicketStatus.Open or TicketStatus.InProgress or TicketStatus.WaitingForCustomer;

        if (!isActive) return false;

        if (caller.IsAdmin) return true;

        return caller.IsStaff && ticket.AssignedStaffId is null && staffId == caller.Id;
    }

    public bool CanAssignSelf(Ticket ticket, CurrentUser caller)
    {
        return ticket.AssignedStaffId != caller.Id && CanAssignTicket(ticket, caller, caller.Id);
    }

    public TicketStatus[] GetAllowedStatuses(Ticket ticket, CurrentUser caller)
    {
        if (!CanReadTicket(ticket, caller) || !CanUpdateStatus(ticket, caller)) return [];

        return Enum.GetValues<TicketStatus>().Where(next => IsValidStatusTransition(ticket.Status, next)).ToArray();

    }
}
