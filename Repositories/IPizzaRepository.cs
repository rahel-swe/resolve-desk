using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IPizzaRepository
{
    Task<List<Pizza>> GetAll();

    Task<Pizza?> Get(int id);

    Task Add(Pizza pizza);

    Task Update(Pizza pizza);

    Task Delete(Pizza pizza);
}