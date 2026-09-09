
using System.ComponentModel.DataAnnotations;

namespace SupportPilotAI.Dtos;

public class CreateTicketCommentDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Message { get; set; } = string.Empty;
}