package comun;

import java.util.ArrayList;
import java.util.List;

public class Pedido {
    private final String id;
    private final String cliente;
    private final String tipoCliente;
    private final List<Item> items = new ArrayList<>();
    private double total;

    public Pedido(String id, String cliente, String tipoCliente) {
        this.id = id;
        this.cliente = cliente;
        this.tipoCliente = tipoCliente;
    }

    public void agregarItem(Item item) { items.add(item); }

    public String getId() { return id; }
    public String getCliente() { return cliente; }
    public String getTipoCliente() { return tipoCliente; }
    public List<Item> getItems() { return items; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}
