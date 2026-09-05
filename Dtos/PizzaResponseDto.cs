namespace ContosoPizza.Dtos;

public class PizzaResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public bool IsGlutenFree { get; set; }

    public decimal Price { get; set; }
}
