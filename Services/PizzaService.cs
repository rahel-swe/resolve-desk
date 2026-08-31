using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Repositories;

namespace ContosoPizza.Services;

public class PizzaService(IPizzaRepository pizzaRepository) : IPizzaService
{


    private readonly IPizzaRepository _pizzaRepository = pizzaRepository;

    public async Task<PageResultDto<Pizza>> GetAll(string? search, int page, int pageSize)
    {

        if (page < 1) page = 1;

        if (pageSize < 1) pageSize = 1;


        if (pageSize > 50) pageSize = 50;

        var (Items, TotalCount) = await _pizzaRepository.GetAll(search, page, pageSize);


        return new PageResultDto<Pizza>
        {
            Items = Items,
            Page = page,
            PageSize = pageSize,
            TotalCount = TotalCount,
            TotalPages = (int)Math.Ceiling(TotalCount / (double)pageSize)
        };

    }

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