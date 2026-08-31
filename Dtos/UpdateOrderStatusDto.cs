using System.ComponentModel.DataAnnotations;
using ContosoPizza.Enums;

namespace ContosoPizza.Dtos;

public class UpdateOrderStatusDtos
{
    [Required]
    public OrderStatus Status { get; set; }
}