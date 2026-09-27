using System.ComponentModel.DataAnnotations;
using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class UpdateTicketStatusDto
{
    [Required]
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }
}
