using ContosoPizza.Models;
using ContosoPizza.Repositories;

namespace ContosoPizza.Services;

public class PizzaService(IPizzaRepository pizzaRepository) : IPizzaService
{


    private readonly IPizzaRepository _pizzaRepository = pizzaRepository;

    public async Task<List<Pizza>> GetAll() => await _pizzaRepository.GetAll();

    public async Task<Pizza?> Get(int id) => await _pizzaRepository.Get(id);

    public async Task Add(Pizza pizza)
    {

        await _pizzaRepository.Add(pizza);
    }



    public async Task Update(Pizza pizza)
    {
        var existing = await _pizzaRepository.Get(pizza.Id);

        if (existing is null) return;

        await _pizzaRepository.Update(pizza);
    }

    public async Task Delete(int id)
    {
        var pizza = await _pizzaRepository.Get(id);

        if (pizza is null) return;

        await _pizzaRepository.Delete(pizza);
    }

}