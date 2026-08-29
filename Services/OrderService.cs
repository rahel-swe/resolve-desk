using ContosoPizza.Models;

namespace ContosoPizza.Services;

public class OrderService : IOrderService
{
    List<Order> Orders { get; }
    int nextId = 3;


    public OrderService()
    {
        Orders = [
            new Order {  Id = 1, CustomerName = "Rahel", Items = [
                new OrderItem {
                     Id = 3,
                     PizzaId =1 ,
                     Quantity = 3,
                     UnitPrice = 5.38m
                }
            ], TotalPrice = 15.67m },

            new Order {  Id = 2, CustomerName = "Anas", Items = [
                new OrderItem {
                     Id = 2,
                     PizzaId = 2 ,
                     Quantity = 2,
                     UnitPrice = 3.82m
                }
            ], TotalPrice = 12.34m },
    ];
    }


    public List<Order> GetAll() => Orders;


    public Order? Get(int id) => Orders.FirstOrDefault((o) => o.Id == id);


    public void Add(Order order)
    {
        order.Id = nextId++;
        order.CreatedAt = DateTime.UtcNow;

        Orders.Add(order);
    }
}