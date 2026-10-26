using System.ComponentModel.DataAnnotations;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class UpdateTicketStatusDto
{
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }
}
