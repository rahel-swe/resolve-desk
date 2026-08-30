using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IOrderRepository
{
    Task<List<Order>> GetAll();

    Task<Order?> Get(int id);

    Task Add(Order order);
}