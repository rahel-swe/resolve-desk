using ContosoPizza.Models;

namespace ContosoPizza.Services;

public class PizzaService : IPizzaService
{
    List<Pizza> Pizzas { get; }
    int nextId = 3;

    public PizzaService()
    {
        Pizzas = [
        new Pizza {Id = 1, Name = "Margherita", IsGlutenFree = false, Price = 8.99m },
        new Pizza {Id = 2, Name = "Hawaiian", IsGlutenFree = false, Price = 10.99m }
        ];
    }

    public List<Pizza> GetAll() => Pizzas;

    public Pizza? Get(int id) => Pizzas.FirstOrDefault(p => p.Id == id);

    public void Add(Pizza pizza)
    {

        pizza.Id = nextId++;
        Pizzas.Add(pizza);
    }

    public void Delete(int id)
    {
        var pizza = Get(id);

        if (pizza is null) return;

        Pizzas.Remove(pizza);
    }

    public void Update(Pizza pizza)
    {
        var index = Pizzas.FindIndex(p => p.Id == pizza.Id);

        if (index == -1) return;

        Pizzas[index] = pizza;
    }

}