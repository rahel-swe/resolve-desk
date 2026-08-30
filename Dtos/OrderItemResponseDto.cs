namespace ContosoPizza.Dtos;

public class OrderItemResponseDto
{
    public int Id { get; set; }

    public int PizzaId { get; set; }

    public string? PizzaName { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }
}