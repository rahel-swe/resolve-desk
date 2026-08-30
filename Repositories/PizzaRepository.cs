using ContosoPizza.Data;
using ContosoPizza.Models;
using Microsoft.EntityFrameworkCore;

namespace ContosoPizza.Repositories;

public class PizzaRepository : IPizzaRepository
{
    private readonly AppDbContext _db;

    public PizzaRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Pizza>> GetAll()
    {
        return await _db.Pizzas.ToListAsync();
    }

    public async Task<Pizza?> Get(int id)
    {
        return await _db.Pizzas.FindAsync(id);
    }

    public async Task Add(Pizza pizza)
    {
        _db.Pizzas.Add(pizza);
        await _db.SaveChangesAsync();
    }

    public async Task Update(Pizza pizza)
    {
        _db.Pizzas.Update(pizza);
        await _db.SaveChangesAsync();
    }

    public async Task Delete(Pizza pizza)
    {
        _db.Pizzas.Remove(pizza);
        await _db.SaveChangesAsync();
    }


}