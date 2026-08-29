using System.ComponentModel.DataAnnotations;

namespace ContosoPizza.Dtos;

public class CreateOrderItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Pizza id must be greater than zero.")]
    public int PizzaId { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than zero.")]
    public int Quantity { get; set; }
}