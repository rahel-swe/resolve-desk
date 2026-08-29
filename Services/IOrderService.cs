
using ContosoPizza.Models;

namespace ContosoPizza.Services;

public interface IOrderService
{
    List<Order> GetAll();

    Order? Get(int id);

    void Add(Order order);
}