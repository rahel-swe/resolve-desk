using System.ComponentModel.DataAnnotations;

namespace ContosoPizza.Dtos;

public class UpdatePizzaDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    [RegularExpression(@".*\S.*", ErrorMessage = "Name must contain at least one non-whitespace character")]

    public string Name { get; set; } = string.Empty;
    public bool IsGlutenFree { get; set; }

    [Range(typeof(decimal), "0.01", "1000")]
    public decimal Price { get; set; }
}
