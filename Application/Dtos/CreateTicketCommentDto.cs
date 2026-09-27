
using System.ComponentModel.DataAnnotations;

namespace ResolveDesk.Application.Dtos;

public class CreateTicketCommentDto
{
    [Required]
    [StringLength(1000, MinimumLength = 5)]
    public string Message { get; set; } = string.Empty;
}
