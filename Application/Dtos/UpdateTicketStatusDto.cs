using System.ComponentModel.DataAnnotations;
using ResolveDesk.Enums;

namespace ResolveDesk.Dtos;

public class UpdateTicketStatusDto
{
    [Required]
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }
}
