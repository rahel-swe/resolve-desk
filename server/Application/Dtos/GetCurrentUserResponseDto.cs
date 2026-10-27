using ResolveDesk.Domain.Enums;

namespace ResolveDesk.Application.Dtos;

public class GetCurrentUserResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Bio { get; set; } = string.Empty;

}
