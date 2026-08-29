using System.ComponentModel.DataAnnotations;

namespace ContosoPizza.Dtos;

public class CreateOrderDto
{
    [Required]
    public string? CustomerName { get; set; }
    [MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<CreateOrderItemDto> Items { get; set; } = [];
}