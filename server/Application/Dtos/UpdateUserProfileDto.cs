using System.ComponentModel.DataAnnotations;

namespace ResolveDesk.Application.Dtos;

public class UpdateUserProfileDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(80, MinimumLength = 1, ErrorMessage = "Full name must be between 1 and 80 characters.")]
    public string FullName { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Bio cannot be longer than 500 characters.")]
    public string? Bio { get; set; }
}
