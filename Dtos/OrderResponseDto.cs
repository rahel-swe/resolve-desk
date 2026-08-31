using ContosoPizza.Enums;

namespace ContosoPizza.Dtos;

public class OrderResponseDto
{
    public int Id { get; set; }

    public string? CustomerName { get; set; }

    public decimal TotalPrice { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<OrderItemResponseDto> Items { get; set; } = [];

    public OrderStatus Status { get; set; }
}