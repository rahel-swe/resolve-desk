using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;


public interface IPizzaService
{
    Task<PageResultDto<Pizza>> GetAll(string? search, int page, int pageSize);

    Task<Pizza> Get(int id);

    Task<Pizza> Create(CreatePizzaDto request);

    Task Update(int id, UpdatePizzaDto request);

    Task Delete(int id);

}