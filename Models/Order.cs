using ContosoPizza.Enums;

namespace ContosoPizza.Models;

public class Order
{
    public int Id { get; set; }

    public string? CustomerName { get; set; }

    public List<OrderItem> Items { get; set; } = [];

    public decimal TotalPrice { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public DateTime CreatedAt { get; set; }
}