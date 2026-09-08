using System.ComponentModel.DataAnnotations;
using SupportPilotAI.Enums;

namespace SupportPilotAI.Dtos;

public class UpdateTicketStatusDto
{
    [Required]
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }
}
